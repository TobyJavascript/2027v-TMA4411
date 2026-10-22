// qpyodide-worker-plugin.js – pyodide-interaktiv's part of the Python worker
//
// Python runs in ctm-libs' worker (runtime/pyodide-worker.js, CTMWorker);
// qpyodide-document-engine-initialization.js starts it with this source as
// its plugin. The worker evaluates it and calls registerPlugin (see ctm-libs'
// docs/api.md): the command runCell (a document cell: output capture, an HTML
// return value, the matplotlib figures and animations), the input() prompt
// hook (stage 1, needs no matplotlib) and the plot setup, which runs with the
// first cell run (startup cells included), not before Run is enabled (D2).
//
// Important: String.raw, so escape sequences arrive in the worker unchanged.
// Don't use backticks or "dollar-curly-brace" in the worker source!

globalThis.QPYODIDE_WORKER_PLUGIN = String.raw`
registerPlugin(function (api) {
  // Prompt text of the next input() call: set by Python via _qpyodide_set_prompt.
  self._qpyodide_set_prompt = (p) => { api.setPrompt(p); };

  // Stage 1: intercept the input() prompt (needs no matplotlib).
  const INPUT_HOOK = [
    "# Intercept the input() prompt: Pyodide buffers stdout line by line, so",
    "# the prompt (no \\n) would never reach the main thread. Instead we write",
    "# it via js._qpyodide_set_prompt into a JS variable, which stdin() reads",
    "# on the next call and sends along with inputRequired.",
    "# _orig is bound via a default argument at definition time (stays intact",
    "# even after the helper names are deleted from the namespace).",
    "import builtins as _qbt",
    "def _qpyodide_input(prompt='', _orig=_qbt.input):",
    "    import js",
    "    js._qpyodide_set_prompt(str(prompt))",
    "    return _orig('')",
    "_qbt.input = _qpyodide_input",
    "del _qbt, _qpyodide_input"
  ].join("\n");

  // Python setup: matplotlib on AGG (PNG rendering without DOM), plt.show() as
  // the output trigger like in a local script, a figure collector, and the
  // zeige_animation() helper for special cases like GIF output. Run with the
  // first cell, inside that cell's run (MPLBACKEND=AGG is set for the worker).
  const PY_SETUP = [
    "import matplotlib",
    "matplotlib.use('AGG')",
    "from matplotlib import pyplot as plt",
    "",
    "# Track animations. Without a GUI there is no timer driving a",
    "# FuncAnimation - when shown it therefore has to become a JS player",
    "# instead of a still image. For that, the animation belonging to a",
    "# figure needs to be findable, and matplotlib keeps no registry for it.",
    "# We hook into Animation.__init__ so that FuncAnimation and",
    "# ArtistAnimation are captured alike (both call it via super()). The",
    "# entry also keeps the animation alive - otherwise matplotlib warns",
    "# 'Animation was deleted without rendering anything' if nobody assigns",
    "# it to a variable.",
    "import matplotlib.animation as _qanim",
    "_qpyodide_animations = []",
    "def _qpyodide_anim_init(self, *args, _orig=_qanim.Animation.__init__, **kwargs):",
    "    _orig(self, *args, **kwargs)",
    "    _qpyodide_animations.append(self)",
    "_qanim.Animation.__init__ = _qpyodide_anim_init",
    "del _qanim, _qpyodide_anim_init",
    "",
    "# Display exactly like in a local script: plt.show() is the trigger.",
    "# Without a call, nothing is output; with a call, everything currently",
    "# open appears. The shown figures are closed in the process - locally,",
    "# closing the windows is exactly what ends a blocking show(), and a",
    "# following plt.plot() starts a new figure instead of drawing into the",
    "# old one.",
    "# A custom show() replacement is necessary anyway: AGG isn't",
    "# interactive, the real plt.show() would do nothing except warn.",
    "_qpyodide_shown       = []   # figures that get output as PNG",
    "_qpyodide_shown_anims = []   # already-rendered animation players (HTML)",
    "_qpyodide_anim_errors = []",
    "",
    "def _qpyodide_show_figure(fig):",
    "    # If an animation is attached to the figure, it becomes a JS player.",
    "    # If that fails, the figure falls back to the normal PNG path - the",
    "    # same fallback pattern as for the pickles.",
    "    for ani in _qpyodide_animations:",
    "        if getattr(ani, '_fig', None) is not fig:",
    "            continue",
    "        try:",
    "            _qpyodide_shown_anims.append(ani.to_jshtml())",
    "            plt.close(fig)",
    "            return",
    "        except Exception as exc:",
    "            _qpyodide_anim_errors.append(type(exc).__name__ + ': ' + str(exc))",
    "            break",
    "    _qpyodide_shown.append(fig)",
    "    plt.close(fig)",
    "",
    "def _qpyodide_show(*args, **kwargs):",
    "    # get_fignums() returns a copy, so closing inside the loop is fine.",
    "    for num in plt.get_fignums():",
    "        _qpyodide_show_figure(plt.figure(num))",
    "plt.show = _qpyodide_show",
    "",
    "# fig.show() shows only that one figure (non-blocking in a script).",
    "import matplotlib.figure as _qfigmod",
    "def _qpyodide_figure_show(self, *args, **kwargs):",
    "    _qpyodide_show_figure(self)",
    "_qfigmod.Figure.show = _qpyodide_figure_show",
    "del _qfigmod, _qpyodide_figure_show",
    "",
    "def _qpyodide_collect_figures(want_pickle=False):",
    "    # Outputs what plt.show() released. Always as PNG; additionally as",
    "    # pickle if the main thread wants to redraw the figure interactively",
    "    # (see qpyodide-canvas-plots.js). Order: pickle first, then save -",
    "    # savefig attaches a renderer to the figure that shouldn't be",
    "    # pickled along with it.",
    "    import base64, io, pickle, warnings",
    "    animations  = list(_qpyodide_shown_anims)",
    "    anim_errors = list(_qpyodide_anim_errors)",
    "    images, pickles, errors = [], [], []",
    "    for fig in _qpyodide_shown:",
    "        if want_pickle:",
    "            try:",
    "                # Matplotlib internally stores an itertools color cycle when",
    "                # pickling; Python 3.14 warns about this (pickle support is",
    "                # going away) - pure library noise, so deliberately silenced.",
    "                with warnings.catch_warnings():",
    "                    warnings.filterwarnings('ignore', category=DeprecationWarning, message='.*itertools.*')",
    "                    pickles.append(base64.b64encode(pickle.dumps(fig)).decode('ascii'))",
    "                errors.append('')",
    "            except Exception as exc:",
    "                pickles.append('')",
    "                errors.append(type(exc).__name__ + ': ' + str(exc))",
    "        buf = io.BytesIO()",
    "        fig.savefig(buf, format='png', bbox_inches='tight')",
    "        images.append(base64.b64encode(buf.getvalue()).decode('ascii'))",
    "    _qpyodide_shown.clear()",
    "    _qpyodide_shown_anims.clear()",
    "    _qpyodide_anim_errors.clear()",
    "    _qpyodide_animations.clear()",
    "    # Discard figures that were never shown: a cell run corresponds to a",
    "    # script run, after which the figure state is empty again. Otherwise",
    "    # figures would pile up across repeated runs of the same cell, and a",
    "    # later plt.show() would output all of them at once.",
    "    plt.close('all')",
    "    return images, pickles, errors, animations, anim_errors",
    "",
    "",
    "def zeige_animation(ani, format='jshtml', fps=None):",
    "    # Returns a matplotlib animation as embeddable HTML.",
    "    # Not needed for normal display - plt.show() already outputs an",
    "    # animation as a player on its own (see _qpyodide_show_figure). This",
    "    # call remains useful when you want to control the format or frame",
    "    # rate.",
    "    # format='jshtml': interactive JS player (default)",
    "    # format='gif'   : animated GIF as <img> (requires the 'Pillow' package)",
    "    from matplotlib import pyplot as plt",
    "    if format == 'gif':",
    "        import base64, os, tempfile",
    "        from matplotlib.animation import PillowWriter",
    "        writer = PillowWriter(fps=fps or 10)",
    "        with tempfile.NamedTemporaryFile(suffix='.gif', delete=False) as tmp:",
    "            path = tmp.name",
    "        try:",
    "            ani.save(path, writer=writer)",
    "            with open(path, 'rb') as fh:",
    "                data = base64.b64encode(fh.read()).decode('ascii')",
    "        finally:",
    "            os.remove(path)",
    "        html = '<img src=\"data:image/gif;base64,' + data + '\" alt=\"Animation\"/>'",
    "    else:",
    "        html = ani.to_jshtml(fps=fps) if fps else ani.to_jshtml()",
    "    plt.close(ani._fig)",
    "    return html"
  ].join("\n");

  // null: not tried yet; true: done; otherwise the error. Tried again once
  // matplotlib is loaded (stage 2 may finish, or a Retry may load it, later).
  let plotSetup = null;
  async function ensurePlotSetup(pyodide) {
    if (plotSetup === true) return;
    if (plotSetup !== null && !(pyodide.loadedPackages && pyodide.loadedPackages.matplotlib)) return;
    try {
      await pyodide.runPythonAsync(PY_SETUP);
      plotSetup = true;
    } catch (err) {
      plotSetup = String(err);
      console.warn("qpyodide: plot setup failed; cells run without figure collection", err);
    }
  }

  // Does a return value look like (whole) HTML?
  function looksLikeHtml(text) {
    const trimmed = text.trim();
    return trimmed.startsWith("<") && /<\/?[a-zA-Z][^>]*>/.test(trimmed) && trimmed.endsWith(">");
  }

  // Run one document cell: collect output, detect an HTML return value,
  // collect animated figures as a JS player and the remaining open
  // matplotlib figures as PNG (base64). With wantPickle, the PNG figures
  // additionally come along as pickle, so a second Pyodide instance on the
  // main thread can redraw them interactively.
  async function runCell(code, wantPickle) {
    api.capture.start();
    const pyodide = api.pyodide();
    let resultValue;
    try {
      await pyodide.loadPackagesFromImports(code);
      await ensurePlotSetup(pyodide);
      resultValue = await pyodide.runPythonAsync(code);
    } catch (err) {
      // An uncaught Python exception never goes through the stdout/stderr
      // callbacks above (those only see explicit prints); runPythonAsync
      // instead rejects with the formatted traceback as its message. Stream
      // it live too - interactive cells only render stdout/stderr via the
      // live stream (see runCode() in qpyodide-cell-classes.js), not from
      // this function's return value, so without this an uncaught exception
      // would silently show nothing at all in the terminal.
      const message = String(err);
      api.capture.push({ message: message, type: "stderr" });
      self.postMessage({ type: "streamStderr", text: message });
    }

    let html = null;
    if (resultValue !== undefined && resultValue !== null) {
      const asText = String(resultValue);
      if (typeof resultValue === "object" && typeof resultValue.destroy === "function") {
        resultValue.destroy();
      }
      if (looksLikeHtml(asText)) {
        html = asText;
      } else {
        api.capture.push({ message: asText, type: "stdout" });
      }
    }

    let images = [];
    let pickles = [];
    let pickleErrors = [];
    let animations = [];
    let animationErrors = [];
    // Without the plot setup there is nothing to collect (N4).
    if (plotSetup === true) try {
      const collect = pyodide.globals.get("_qpyodide_collect_figures");
      const proxy = collect(!!wantPickle);
      const collected = proxy.toJs();
      images      = collected[0];
      pickles     = collected[1];
      pickleErrors = collected[2];
      animations  = collected[3];
      animationErrors = collected[4];
      proxy.destroy();
      collect.destroy();
    } catch (err) {
      api.capture.push({ message: "Plot export failed: " + String(err), type: "stderr" });
    }

    return {
      entries: api.capture.entries(),
      html: html,
      images: images,
      pickles: pickles,
      pickleErrors: pickleErrors,
      animations: animations,
      animationErrors: animationErrors
    };
  }

  return {
    stage1: INPUT_HOOK,
    commands: {
      runCell: (msg) => runCell(msg.code, msg.wantPickle)
    }
  };
});
`;
