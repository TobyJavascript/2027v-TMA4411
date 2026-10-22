// qpyodide-canvas-plots.js – interactive matplotlib plots via a second Pyodide instance
//
// Starting point: in this extension, Python runs in a Web Worker. There is no
// DOM there, so matplotlib can only render with the AGG backend, i.e. it can
// only deliver PNG images. WebAgg (toolbar with zoom, pan, reset and save),
// by contrast, needs the browser DOM and therefore runs in a second Pyodide
// instance on the main thread.
//
// WebAgg needs Pyodide 0.28 or later (the default). A project that pins an
// older Pyodide via `pyodide: base-url:` keeps the html5_canvas_backend path
// of pyodide-interaktiv 1.6/1.7 instead; see QPC_PY_BACKEND_HTML5_CANVAS.
//
// The interactive plot pipeline:
//   1. The worker computes as before and additionally sends each open
//      figure along as `pickle` bytes (Base64) with the PNG.
//   2. The PNG is displayed immediately – the page therefore doesn't feel
//      slower.
//   3. On the page's first plot, a second, lightweight Pyodide instance
//      (matplotlib only) is loaded in the background on the main thread.
//   4. Once it's ready, the figure is restored there from the pickle,
//      drawn as canvas, and replaces the PNG. From the second plot onward
//      this happens without any wait.
//
// If any step fails (pickling not possible, second instance doesn't load,
// restoration fails), the PNG stays as is – the page then works exactly as
// before.
//
// Deliberately NOT affected:
//   * Animations: plt.show() outputs an animated figure as a JS player and
//     closes it in the process - so no pickle is created for it at all. An
//     additional static plot in the same cell is still switched to canvas
//     completely normally.
//   * The rich HTML path (Plotly, `zeige_svg()`, `zeige_animation()`): these
//     cells return HTML and close their figure themselves; with an HTML
//     return value, there is never a switch to canvas.
//   * Cells with the option `#| canvas: false`.
//
// Global interfaces:
//   qpyodideCanvasPlots        – state + switches (enabled, status, bootSeconds)
//   qpyodideCanvasWanted(opts) – should canvas be attempted for this cell?
//   qpyodideCanvasUpgrade(...) – retroactively switch a PNG output to canvas

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

globalThis.qpyodideCanvasPlots = {
  // Main switch. Might later become a document option or a checkbox in the
  // settings panel; toggleable for testing in the browser console:
  //   qpyodideCanvasPlots.enabled = false
  enabled: true,

  // Snapping cursor on curves and points (point display with values).
  // Can be disabled per cell via "#| snap: false".
  snapCursor: true,

  // "idle" | "booting" | "ready" | "failed"
  status: "idle",

  // Plot backend: "webagg" (Pyodide 0.28+) or "html5-canvas" (older Pyodide,
  // pinned via `pyodide: base-url:`). Starts as what the Lua filter derived
  // from the base URL ("auto" if the URL names no version) and is settled
  // from the loaded Pyodide's own version once the instance is up.
  backend: globalThis.qpyodideCanvasBackend || "auto",

  // Timing measurements for diagnostics in the browser console
  bootSeconds: null,
  renderSeconds: [],

  // The second Pyodide instance, or the promise for it
  pyodide: null,
  bootPromise: null
};

// Python side of the second instance: enable the interactive backend and
// define a restorer for the pickle bytes coming from the worker. Assembled by
// qpyodideCanvasSetup() from a header, one backend prelude and a shared part.
const QPC_PY_HEADER = [
  "import base64, pickle",
  "import numpy as np",
  "import matplotlib",
  ""
];

// Pyodide 0.28 or later: Matplotlib's own WebAgg backend, patched by Pyodide.
const QPC_PY_BACKEND_WEBAGG = [
  "# Pyodide 0.28+ patches Matplotlib's maintained WebAgg backend so it talks",
  "# directly to an in-page JavaScript client instead of a Tornado server.",
  "# It also honours document.pyodideMplTarget, which the JavaScript side sets",
  "# to the output element belonging to the cell currently being upgraded.",
  "matplotlib.use('webagg', force=True)",
  "import matplotlib.backends.backend_webagg as _qpc_webagg",
  "",
  "def _qpc_new_manager(num, fig):",
  "    return _qpc_webagg.new_figure_manager_given_figure(num, fig)",
  "",
  "def _qpc_after_show(fig):",
  "    pass      # WebAgg owns its event wiring and toolbar lifecycle",
  ""
];

// Pyodide below 0.28 (pyodide-interaktiv 1.6/1.7 behaviour, kept unchanged for
// projects that pin such a version via `pyodide: base-url:`). Without Pyodide
// 0.28's patch, WebAgg needs a Tornado server, which Pyodide does not ship, so
// these versions use matplotlib-pyodide's html5_canvas_backend instead.
// In matplotlib-pyodide 0.2.3 (what Pyodide 0.27.2 ships), its interactive
// layer is disabled upstream: the canvas classes are commented out of the
// export block, canvas.manager_class is never set (which decides the manager
// since matplotlib 3.6), and the mouse/keyboard listeners are commented out
// because they call event methods matplotlib 3.8 removed. This prelude
// restores all three, and builds a toolbar that survives Font Awesome's JS kit.
// Frozen: new plot features go to the WebAgg path.
const QPC_PY_BACKEND_HTML5_CANVAS = [
  "# --- 1. Re-enable the HTML5 canvas backend --------------------------------",
  "# In matplotlib-pyodide 0.2.3 (Pyodide 0.27.2), the HTML5 classes are",
  "# commented out in the export block of html5_canvas_backend.py:",
  "#     # FigureCanvas = FigureCanvasHTMLCanvas",
  "#     FigureCanvas = FigureCanvasAggWasm",
  "# Active is therefore the Agg variant, which only blits finished Agg pixels",
  "# onto the canvas - i.e. exactly the same pixels as our worker PNG. The",
  "# actual vector renderer (RendererHTMLCanvas) is never used. It was active",
  "# in v0.2.0; the changelog says nothing about the removal. We reset it.",
  "import matplotlib_pyodide.html5_canvas_backend as _qpc_h5",
  "_qpc_h5._BackendHTMLCanvas.FigureCanvas  = _qpc_h5.FigureCanvasHTMLCanvas",
  "_qpc_h5._BackendHTMLCanvas.FigureManager = _qpc_h5.FigureManagerHTMLCanvas",
  "_qpc_h5.FigureCanvas  = _qpc_h5.FigureCanvasHTMLCanvas",
  "_qpc_h5.FigureManager = _qpc_h5.FigureManagerHTMLCanvas",
  "# Since matplotlib 3.6, canvas.manager_class decides which manager gets",
  "# created; _Backend.FigureManager is no longer used. matplotlib-pyodide",
  "# never sets manager_class - so otherwise only a bare FigureManagerBase is",
  "# created, which doesn't build a toolbar, canvas.toolbar stays None, and",
  "# show() silently skips the toolbar. The coordinate display also depends",
  "# on this: NavigationToolbar2.__init__ sets canvas.toolbar and connects",
  "# mouse_move, which writes the x/y values into the toolbar.",
  "_qpc_h5.FigureCanvasHTMLCanvas.manager_class = _qpc_h5.FigureManagerHTMLCanvas",
  "matplotlib.use('module://matplotlib_pyodide.html5_canvas_backend', force=True)",
  "",
  "# --- 2. Reconnect mouse and keyboard events --------------------------------",
  "# In browser_backend.py, the add_event_listener lines for the rubberband",
  "# canvas are commented out. The handlers that are there call",
  "# canvas.motion_notify_event() / button_press_event() - methods that",
  "# matplotlib removed in 3.8 (Pyodide 0.27.2 ships 3.8.4). That's presumably",
  "# why they got commented out. So here are our own handlers using the",
  "# current event API: Event(...)._process().",
  "from matplotlib.backend_bases import KeyEvent, MouseEvent",
  "from pyodide.ffi import create_proxy",
  "",
  "# Convert mouse coordinates ourselves. The original takes event.offsetX",
  "# against the logical figure size and ignores devicePixelRatio as well as",
  "# any CSS scaling of the canvas - the displayed x/y values would then be",
  "# wrong under Windows scaling != 100% or when shrunk via max-width.",
  "# Using getBoundingClientRect, it's correct in every case.",
  "def _qpc_convert_mouse_event(self, event):",
  "    width, height = self.get_width_height()",
  "    rect = self.get_element('rubberband').getBoundingClientRect()",
  "    sx = width / rect.width if rect.width else 1.0",
  "    sy = height / rect.height if rect.height else 1.0",
  "    x = (event.clientX - rect.left) * sx",
  "    y = height - (event.clientY - rect.top) * sy",
  "    button = event.button + 1",
  "    if button == 3:",
  "        event.preventDefault()",
  "        event.stopPropagation()",
  "    if button == 2:",
  "        button = 3",
  "    return x, y, button",
  "",
  "_qpc_h5.FigureCanvasHTMLCanvas._convert_mouse_event = _qpc_convert_mouse_event",
  "",
  "# Keep the event proxies alive: otherwise Pyodide frees them and the",
  "# listener calls into nothing. Figures are kept alive in _qpc_keep (shared",
  "# part): this backend's DOM ids are hex(id(canvas)), and CPython reuses the",
  "# id() of a freed object - a new figure could otherwise get the id of an",
  "# older, still-visible one and draw into its canvas.",
  "_qpc_proxies = []",
  "",
  "def _qpc_wire_events(canvas):",
  "    # The rubberband canvas sits on top and receives the events.",
  "    rb = canvas.get_element('rubberband')",
  "    if rb is None:",
  "        return",
  "",
  "    def on_move(event):",
  "        x, y, button = canvas._convert_mouse_event(event)",
  "        MouseEvent('motion_notify_event', canvas, x, y, guiEvent=event)._process()",
  "",
  "    def on_down(event):",
  "        x, y, button = canvas._convert_mouse_event(event)",
  "        MouseEvent('button_press_event', canvas, x, y, button, guiEvent=event)._process()",
  "",
  "    def on_up(event):",
  "        x, y, button = canvas._convert_mouse_event(event)",
  "        MouseEvent('button_release_event', canvas, x, y, button, guiEvent=event)._process()",
  "",
  "    def on_enter(event):",
  "        rb.focus()   # keyboard focus, so shortcuts like 'p' and 'o' work",
  "",
  "    def on_leave(event):",
  "        rb.blur()",
  "",
  "    def on_keydown(event):",
  "        KeyEvent('key_press_event', canvas,",
  "                 canvas._convert_key_event(event), guiEvent=event)._process()",
  "",
  "    def on_keyup(event):",
  "        KeyEvent('key_release_event', canvas,",
  "                 canvas._convert_key_event(event), guiEvent=event)._process()",
  "",
  "    for name, handler in (('mousemove', on_move), ('mousedown', on_down),",
  "                          ('mouseup', on_up), ('mouseenter', on_enter),",
  "                          ('mouseleave', on_leave), ('keydown', on_keydown),",
  "                          ('keyup', on_keyup)):",
  "        proxy = create_proxy(handler)",
  "        _qpc_proxies.append(proxy)",
  "        rb.addEventListener(name, proxy)",
  "",
  "# --- 3. Font Awesome-safe toolbar buttons ----------------------------------",
  "# matplotlib-pyodide puts the `fa`/`fa-<name>` icon classes directly onto the",
  "# toolbar's <button> elements. This extension loads Font Awesome's JS build",
  "# (the CSS build pulls webfonts that no `embed-resources` pass can inline),",
  "# and that build REPLACES every element carrying an `fa` class with an inline",
  "# <svg>, keeping the original only as an HTML comment. The icon still shows,",
  "# but the button - and with it the click listener and the `:hover` rule - is",
  "# gone: a toolbar that looks right and does nothing at all.",
  "# So build the same toolbar here with the icon classes on a nested <i>:",
  "# Font Awesome swaps that <i> for its <svg> and leaves the <button> alone.",
  "from js import document as _qpc_document",
  "from matplotlib_pyodide.browser_backend import _FONTAWESOME_ICONS, FILE_TYPES",
  "from pyodide.ffi.wrappers import add_event_listener",
  "",
  "def _qpc_toolbar_get_element(self):",
  "    div = _qpc_document.createElement('span')",
  "    self._qpc_mode_buttons = {}",
  "",
  "    def add_spacer():",
  "        span = _qpc_document.createElement('span')",
  "        span.style.minWidth = '16px'",
  "        span.textContent = chr(160)",
  "        div.appendChild(span)",
  "",
  "    for _text, _tooltip, image_file, name_of_method in self.toolitems:",
  "        if image_file not in _FONTAWESOME_ICONS:",
  "            continue",
  "        if image_file is None:",
  "            add_spacer()",
  "            continue",
  "        button = _qpc_document.createElement('button')",
  "        button.classList.add('matplotlib-toolbar-button')",
  "        icon = _qpc_document.createElement('i')",
  "        icon.classList.add('fa')",
  "        icon.classList.add(_FONTAWESOME_ICONS[image_file])",
  "        button.appendChild(icon)",
  "        add_event_listener(button, 'click', getattr(self, name_of_method))",
  "        if name_of_method in ('pan', 'zoom'):",
  "            self._qpc_mode_buttons[name_of_method] = button",
  "        div.appendChild(button)",
  "",
  "    # The download buttons show their format as text, no icon - the bare",
  "    # `fa` class upstream also puts on them would only make Font Awesome",
  "    # try to convert them too.",
  "    for _fmt, _mimetype in sorted(FILE_TYPES.items()):",
  "        button = _qpc_document.createElement('button')",
  "        button.classList.add('matplotlib-toolbar-button')",
  "        button.textContent = _fmt",
  "        button.id = 'text'",
  "        add_event_listener(button, 'click', self.ondownload)",
  "        div.appendChild(button)",
  "",
  "    return div",
  "",
  "_qpc_h5.NavigationToolbar2HTMLCanvas.get_element = _qpc_toolbar_get_element",
  "",
  "# Pan and zoom are toggles, but no browser backend renders that state, so",
  "# both buttons look the same whether the mode is on or off - there is no",
  "# way to see whether dragging will move the plot or do nothing. Mark the",
  "# active one with a class and let the stylesheet colour it. Wrapping the",
  "# two methods (rather than the click handlers) also covers matplotlib's",
  "# own 'p'/'o' keyboard shortcuts, which toggle the very same modes.",
  "_QPC_ACTIVE_CLASS = 'qpyodide-toolbar-button-active'",
  "_QPC_MODE_OWNER = {'pan/zoom': 'pan', 'zoom rect': 'zoom'}",
  "",
  "def _qpc_sync_mode_buttons(self):",
  "    buttons = getattr(self, '_qpc_mode_buttons', None)",
  "    if not buttons:",
  "        return",
  "    active = _QPC_MODE_OWNER.get(self.mode.value)",
  "    for name, button in buttons.items():",
  "        if name == active:",
  "            button.classList.add(_QPC_ACTIVE_CLASS)",
  "        else:",
  "            button.classList.remove(_QPC_ACTIVE_CLASS)",
  "",
  "def _qpc_mode_toggle(method_name):",
  "    original = getattr(_qpc_h5.NavigationToolbar2HTMLCanvas, method_name)",
  "    def toggle(self, *args):",
  "        original(self, *args)",
  "        _qpc_sync_mode_buttons(self)",
  "    setattr(_qpc_h5.NavigationToolbar2HTMLCanvas, method_name, toggle)",
  "",
  "for _qpc_name in ('pan', 'zoom'):",
  "    _qpc_mode_toggle(_qpc_name)",
  "",
  "def _qpc_new_manager(num, fig):",
  "    return plt._backend_mod.new_figure_manager_given_figure(num, fig)",
  "",
  "def _qpc_after_show(fig):",
  "    _qpc_wire_events(fig.canvas)",
  ""
];

// Shared by both backends. Each backend prelude defines _qpc_new_manager()
// and _qpc_after_show().
const QPC_PY_COMMON = [
  "from matplotlib import pyplot as plt",
  "import matplotlib._pylab_helpers as _qpc_helpers",
  "",
  "# Keep figures and cursor callbacks alive after they leave pyplot's global",
  "# registry.",
  "_qpc_keep = []",
  "",
  "# --- Snapping cursor -------------------------------------------------------",
  "# matplotlib doesn't come with this: matplotlib.widgets.Cursor only draws a",
  "# free-floating crosshair and doesn't snap. Hence our own small class. The",
  "# nearest point is searched for in pixel distance, not in data values -",
  "# otherwise differently scaled axes would distort the result.",
  "",
  "_QPC_SNAP_RADIUS = 45      # pixels; nothing is shown further away than this",
  "",
  "class _QpcSnapCursor:",
  "    def __init__(self, ax, sources, bars):",
  "        self.ax = ax",
  "        self.sources = sources",
  "        self.bars = bars       # list of (patch, orientation, value, label)",
  "        self._last = None",
  "        # Preserve limits: axvline/axhline participate in autoscaling and",
  "        # would otherwise shift the axes.",
  "        xlim, ylim = ax.get_xlim(), ax.get_ylim()",
  "        self.vline = ax.axvline(0, color='0.45', lw=0.8, ls=':', visible=False)",
  "        self.hline = ax.axhline(0, color='0.45', lw=0.8, ls=':', visible=False)",
  "        self.marker, = ax.plot([], [], 'o', ms=8, mfc='none', mec='#cc0000',",
  "                               mew=1.6, visible=False)",
  "        self.label = ax.annotate(",
  "            '', xy=(0, 0), xytext=(9, 9), textcoords='offset points',",
  "            fontsize=9, visible=False, zorder=10,",
  "            bbox=dict(boxstyle='round,pad=0.35', fc='#ffffe0', ec='0.6', alpha=0.95))",
  "        ax.set_xlim(xlim)",
  "        ax.set_ylim(ylim)",
  "",
  "    def on_move(self, event):",
  "        if event.inaxes is not self.ax:",
  "            self._hide()",
  "            return",
  "        if self._hit_bar(event):",
  "            return",
  "        best = None",
  "        for artist, xy, trans in self.sources:",
  "            pix = trans.transform(xy)",
  "            dist = np.hypot(pix[:, 0] - event.x, pix[:, 1] - event.y)",
  "            i = int(np.argmin(dist))",
  "            if best is None or dist[i] < best[0]:",
  "                best = (float(dist[i]), artist, xy[i])",
  "        if best is None or best[0] > _QPC_SNAP_RADIUS:",
  "            self._hide()",
  "            return",
  "        x, y = float(best[2][0]), float(best[2][1])",
  "        key = (id(best[1]), x, y)",
  "        if key == self._last:",
  "            return          # same point -> no redraw (that's expensive)",
  "        self._last = key",
  "        self.vline.set_xdata([x, x])",
  "        self.hline.set_ydata([y, y])",
  "        self.marker.set_data([x], [y])",
  "        name = best[1].get_label()",
  "        head = (name + '\\n') if name and not name.startswith('_') else ''",
  "        self.label.set_text(head + 'x = %.6g\\ny = %.6g' % (x, y))",
  "        self.label.xy = (x, y)",
  "        for artist in (self.vline, self.hline, self.marker, self.label):",
  "            artist.set_visible(True)",
  "        self.ax.figure.canvas.draw_idle()",
  "",
  "    def _hit_bar(self, event):",
  "        # Area hit instead of point distance: the bbox comes live from",
  "        # get_window_extent(), which already uses the current (possibly",
  "        # zoomed) transform - unlike lines/points, we therefore don't cache",
  "        # the pixel position here, only the patch object.",
  "        for patch, orientation, value, label in self.bars:",
  "            bbox = patch.get_window_extent()",
  "            pad = 2  # a bit of tolerance at the edge",
  "            if not (bbox.x0 - pad <= event.x <= bbox.x1 + pad",
  "                    and bbox.y0 - pad <= event.y <= bbox.y1 + pad):",
  "                continue",
  "            if orientation == \"horizontal\":",
  "                edge_x = bbox.x1 if value >= 0 else bbox.x0",
  "                point_px = (edge_x, (bbox.y0 + bbox.y1) / 2)",
  "            else:",
  "                edge_y = bbox.y1 if value >= 0 else bbox.y0",
  "                point_px = ((bbox.x0 + bbox.x1) / 2, edge_y)",
  "            inv = self.ax.transData.inverted()",
  "            x, y = inv.transform(point_px)",
  "            key = (id(patch), \"bar\")",
  "            if key != self._last:",
  "                self._last = key",
  "                self.vline.set_xdata([x, x])",
  "                self.hline.set_ydata([y, y])",
  "                self.marker.set_data([x], [y])",
  "                head = (label + \"\\n\") if label and not label.startswith(\"_\") else \"\"",
  `                self.label.set_text(head + "${QP_L.canvasBarValueLabel} = %.6g" % value)`,
  "                self.label.xy = (x, y)",
  "                for artist in (self.vline, self.hline, self.marker, self.label):",
  "                    artist.set_visible(True)",
  "                self.ax.figure.canvas.draw_idle()",
  "            return True",
  "        return False",
  "",
  "    def _hide(self):",
  "        if self._last is None:",
  "            return",
  "        self._last = None",
  "        for artist in (self.vline, self.hline, self.marker, self.label):",
  "            artist.set_visible(False)",
  "        self.ax.figure.canvas.draw_idle()",
  "",
  "",
  "def _qpc_snap_sources(ax):",
  "    # Collect data sources BEFORE the cursor creates its own helper lines -",
  "    # otherwise it would snap to itself.",
  "    sources = []",
  "    for line in ax.get_lines():",
  "        xdata = np.asarray(line.get_xdata(), dtype=float)",
  "        ydata = np.asarray(line.get_ydata(), dtype=float)",
  "        if xdata.size and xdata.size == ydata.size:",
  "            sources.append((line, np.column_stack([xdata, ydata]),",
  "                            line.get_transform()))",
  "    for coll in ax.collections:",
  "        if not hasattr(coll, 'get_offsets'):",
  "            continue",
  "        offsets = np.asarray(coll.get_offsets(), dtype=float)",
  "        if offsets.ndim == 2 and offsets.shape[0]:",
  "            sources.append((coll, offsets, coll.get_offset_transform()))",
  "    return sources",
  "",
  "",
  "def _qpc_bar_sources(ax):",
  "    # Bar charts AND histograms: Axes.bar()/Axes.hist() attach their",
  "    # rectangles as a BarContainer to ax.containers. datavalues carries the",
  "    # actual value (!= get_height() for stacked bars); get_window_extent()",
  "    # comes in fig.get_axes() order already in pixel coordinates.",
  "    import matplotlib.container as mcontainer",
  "    bars = []",
  "    for container in getattr(ax, 'containers', []):",
  "        if not isinstance(container, mcontainer.BarContainer):",
  "            continue",
  "        orientation = container.orientation or 'vertical'",
  "        values = container.datavalues",
  "        label = container.get_label()",
  "        for i, patch in enumerate(container.patches):",
  "            value = float(values[i]) if values is not None else (",
  "                patch.get_height() if orientation == 'vertical' else patch.get_width())",
  "            bars.append((patch, orientation, value, label))",
  "    return bars",
  "",
  "",
  "def _qpc_attach_snap(fig):",
  "    for ax in fig.get_axes():",
  "        sources = _qpc_snap_sources(ax)",
  "        bars = _qpc_bar_sources(ax)",
  "        if not sources and not bars:",
  "            continue      # e.g. pure image axes (imshow) or colorbars",
  "        cursor = _QpcSnapCursor(ax, sources, bars)",
  "        fig.canvas.mpl_connect('motion_notify_event', cursor.on_move)",
  "        _qpc_keep.append(cursor)",
  "",
  "# --- Restore and show the figure from the worker ---------------------------",
  "",
  "def _qpc_show(payload, snap=True):",
  "    # Clear the figure registry so plt.show() only shows the new figure.",
  "    # Deliberately .clear() instead of plt.close('all'): close() would",
  "    # destroy the manager and thereby remove the already-drawn canvases",
  "    # from the DOM. Here, only the registry should be forgotten.",
  "    _qpc_helpers.Gcf.figs.clear()",
  "    fig = pickle.loads(base64.b64decode(payload))",
  "    if not _qpc_helpers.Gcf.figs:",
  "        # The figure wasn't registered with pyplot in the worker (e.g.",
  "        # created directly via Figure()) -> create the manager ourselves.",
  "        mgr = _qpc_new_manager(len(_qpc_keep) + 1, fig)",
  "        _qpc_helpers.Gcf._set_new_active_manager(mgr)",
  "    # The worker PNG is created with bbox_inches='tight' - there, the image",
  "    # area grows around the labels. The canvas, by contrast, renders exactly",
  "    # the figure area and clips everything beyond it (visible e.g. as a",
  "    # half-cut-off axis label with df.plot()). The tight layout instead",
  "    # rearranges within the area.",
  "    # tight_layout() computes once and then resets the layout engine to",
  "    # 'none' itself. Important: set_layout_engine('tight') would re-layout",
  "    # on EVERY redraw - and the snapping cursor redraws a lot.",
  "    try:",
  "        fig.tight_layout()",
  "    except Exception as exc:",
  "        print('qpyodide: tight_layout skipped:', exc)",
  "    if snap:",
  "        _qpc_attach_snap(fig)",
  "    plt.show()",
  "    _qpc_keep.append(fig)",
  "    _qpc_after_show(fig)",
  "    return True",
  "",
  "def _qpc_redraw(count):",
  "    # Redraw once more after the hidden target becomes visible.",
  "    for item in _qpc_keep[-count:]:",
  "        if hasattr(item, 'canvas'):",
  "            item.canvas.draw()",
  "    return True"
];

const QPC_PY_BACKENDS = {
  "webagg": QPC_PY_BACKEND_WEBAGG,
  "html5-canvas": QPC_PY_BACKEND_HTML5_CANVAS
};

/**
 * Picks the plot backend for the Pyodide that actually loaded. WebAgg needs
 * the browser patch that Pyodide ships from 0.28 on; older releases get the
 * html5_canvas_backend path of pyodide-interaktiv 1.6/1.7. `configured` is
 * what the Lua filter derived from `pyodide: base-url:` (globalThis.
 * qpyodideCanvasBackend); it only decides when the version is unknown.
 */
function qpyodideCanvasBackendFor(version, configured) {
  const m = /^(\d+)\.(\d+)/.exec(String(version || ""));
  if (m) return (Number(m[1]) === 0 && Number(m[2]) < 28) ? "html5-canvas" : "webagg";
  return Object.hasOwn(QPC_PY_BACKENDS, configured) ? configured : "webagg";
}

function qpyodideCanvasSetup(backend) {
  return [...QPC_PY_HEADER, ...QPC_PY_BACKENDS[backend], ...QPC_PY_COMMON].join("\n");
}

// ---------------------------------------------------------------------------
// Load the second Pyodide instance (main thread)
// ---------------------------------------------------------------------------

/**
 * Loads the canvas instance on first call and always returns the same one
 * afterward. The download comes almost entirely from the HTTP cache,
 * because the worker has already fetched the same files; the time is spent
 * on WebAssembly instantiation and unpacking matplotlib.
 */
function qpyodideCanvasEngine() {
  const state = globalThis.qpyodideCanvasPlots;
  if (state.bootPromise) return state.bootPromise;

  state.status = "booting";
  state.bootPromise = (async () => {
    const started = performance.now();
    const indexURL = qpyodideCustomizedPyodideOptions.indexURL;
    const mod = await import(indexURL + "pyodide.mjs");

    const py = await mod.loadPyodide({
      indexURL: indexURL,
      // Match the worker and preserve compatibility with pre-0.28 lessons.
      convertNullToNone: true,
      env: qpyodideCustomizedPyodideOptions.env,
      // This instance only draws; its output doesn't belong in the cell terminal.
      stdout: (text) => console.debug("qpyodide/canvas:", text),
      stderr: (text) => console.warn("qpyodide/canvas:", text)
    });

    await py.loadPackage("matplotlib");
    state.backend = qpyodideCanvasBackendFor(py.version, state.backend);
    await py.runPythonAsync(qpyodideCanvasSetup(state.backend));

    state.pyodide = py;
    state.status = "ready";
    state.bootSeconds = (performance.now() - started) / 1000;
    console.log(
      "qpyodide: second Pyodide instance (canvas plots, " + state.backend +
      " on Pyodide " + py.version + ") ready after " +
      state.bootSeconds.toFixed(1) + "s" + qpyodideCanvasMemoryNote()
    );
    return py;
  })();

  state.bootPromise.catch(() => {
    state.status = "failed";
  });

  return state.bootPromise;
}

/** Memory usage, if the browser reveals it (Chromium only). */
function qpyodideCanvasMemoryNote() {
  const mem = performance.memory;
  if (!mem) return "";
  const mb = (bytes) => (bytes / 1048576).toFixed(0) + " MB";
  return " (JS heap " + mb(mem.usedJSHeapSize) + " of " + mb(mem.jsHeapSizeLimit) + ")";
}

// ---------------------------------------------------------------------------
// Drawing: pickle -> canvas
// ---------------------------------------------------------------------------

// The canvas instance only knows one global target (document.pyodideMplTarget).
// Therefore two cells must never draw at the same time.
let qpyodideCanvasQueue = Promise.resolve();

function qpyodideCanvasSerialize(task) {
  const run = qpyodideCanvasQueue.then(task, task);
  qpyodideCanvasQueue = run.catch(() => {});
  return run;
}

/**
 * Sets the hint line's text. While waiting, with a spinner in front so it's
 * unmistakable that something is loading; error messages without one.
 */
function qpyodideCanvasHintText(hint, text, spinning) {
  hint.textContent = "";
  if (spinning) {
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-notch fa-spin";
    hint.appendChild(icon);
    hint.appendChild(document.createTextNode(" "));
  }
  hint.appendChild(document.createTextNode(text));
}

/**
 * Should the snapping cursor be attached to the figure? Can be disabled
 * globally via qpyodideCanvasPlots.snapCursor or per cell via the option
 * "#| snap: false".
 */
function qpyodideCanvasSnapWanted(options) {
  if (globalThis.qpyodideCanvasPlots.snapCursor === false) return false;
  return (options || {})["snap"] !== "false";
}

/** Should canvas be attempted for this cell at all? */
globalThis.qpyodideCanvasWanted = function (options) {
  const state = globalThis.qpyodideCanvasPlots;
  if (!state || !state.enabled || state.status === "failed") return false;
  return (options || {})["canvas"] !== "false";
};

/**
 * Replaces a run's already-visible PNG output with interactive canvas
 * figures. Deliberately runs without await in the caller: the cell is done,
 * loading the rest may happen in the background.
 *
 * @param {Element}  targetDiv output container of the cell (outputGraphDiv)
 * @param {string[]} pickles   base64 pickles of the figures, in order
 * @param {Object}   options   cell options (for fig-cap)
 */
globalThis.qpyodideCanvasUpgrade = async function (targetDiv, pickles, options) {
  // Only target our own PNG output: in the same cell, an animation player
  // (.qpyodide-html-output) may sit above it, whose markup must not be
  // touched. The PNG <figure> is always a direct child.
  const pngFigure = targetDiv.querySelector(":scope > figure");

  const hint = document.createElement("div");
  hint.className = "qpyodide-canvas-hint";
  qpyodideCanvasHintText(
    hint,
    (globalThis.qpyodideCanvasPlots.status === "ready")
      ? QP_L.canvasRendering
      : QP_L.canvasPreparing,
    true
  );
  targetDiv.appendChild(hint);

  let py;
  try {
    py = await qpyodideCanvasEngine();
  } catch (err) {
    qpyodideCanvasHintText(hint, QP_L.canvasEngineFailed, false);
    console.error("qpyodide: second Pyodide instance could not be loaded", err);
    return;
  }

  // The cell was run again while loading -> discard the result
  if (!hint.isConnected) return;

  // IMPORTANT: the target element must be attached to the document while
  // drawing. The canvas backend looks up its own canvas via
  // document.getElementById (FigureCanvasWasm.get_element); in a detached
  // element it finds nothing and FigureCanvasHTMLCanvas.draw() aborts
  // without an error -> an empty, white canvas. Hidden (display:none) is,
  // by contrast, unproblematic: getElementById needs document membership,
  // not layout.
  const figure = document.createElement("figure");
  figure.className = "qpyodide-canvas-figure";
  if (globalThis.qpyodideCanvasPlots.backend === "html5-canvas") {
    figure.classList.add("qpyodide-canvas-legacy");
  }
  figure.hidden = true;
  targetDiv.appendChild(figure);

  const started = performance.now();
  try {
    await qpyodideCanvasSerialize(async () => {
      document.pyodideMplTarget = figure;
      const snap = qpyodideCanvasSnapWanted(options) ? "True" : "False";
      for (const payload of pickles) {
        py.globals.set("_qpc_payload", payload);
        await py.runPythonAsync("_qpc_show(_qpc_payload, " + snap + ")");
      }
    });
  } catch (err) {
    // Restoration failed (e.g. a module missing from the pickle) -> the
    // PNG stays as the output.
    figure.remove();
    if (hint.isConnected) qpyodideCanvasHintText(hint, QP_L.canvasRenderFailed, false);
    console.warn("qpyodide: figure could not be rendered as canvas", err);
    return;
  }

  // The cell ran again while drawing -> discard the result
  if (!hint.isConnected) return;

  if (options && options["fig-cap"]) {
    const figcaption = document.createElement("figcaption");
    figcaption.innerText = options["fig-cap"];
    figure.appendChild(figcaption);
  }

  // Show and remove the PNG without a rebuild in between (same task).
  figure.hidden = false;
  if (pngFigure) pngFigure.remove();
  hint.remove();
  targetDiv.classList.add("has-content");

  // Now visible -> redraw, to make sure fonts and layout are settled.
  try {
    await qpyodideCanvasSerialize(() => py.runPythonAsync("_qpc_redraw(" + pickles.length + ")"));
  } catch (err) {
    console.warn("qpyodide: redraw failed", err);
  }

  const seconds = (performance.now() - started) / 1000;
  globalThis.qpyodideCanvasPlots.renderSeconds.push(seconds);
  console.log("qpyodide: canvas figure(s) drawn in " + seconds.toFixed(2) + "s");
};
