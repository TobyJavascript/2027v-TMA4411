// qpyodide-cell-classes.js – cell classes of the `pyodide-interaktiv` extension
//
// Structure (clear separation, no duplication):
//   qpyodideExecutePython()  – shared execution layer (one place!)
//   EditorUnit               – ONE Monaco editor with toolbar + output areas;
//                              used both for the main cell and for extra
//                              editors added via "+ Code block"
//   InteractiveCell          – <details> wrapper around one (or more) EditorUnit(s)
//   OutputCell               – runs code and shows only the output
//   SetupCell                – runs code invisibly (setup context)
//   CellContainer            – collection of all cells, starts setup/output/autorun
//
// AI feedback lives entirely in qpyodide-feedback.js and is only wired up
// here via qpyodideFeedback.attach(unit).

// ---------------------------------------------------------------------------
// Theme coupling (Quarto dark mode <-> Monaco & Bootstrap variables)
// ---------------------------------------------------------------------------

function qpyodideIsDarkMode() {
  const cls = document.body.classList;
  if (cls.contains("quarto-dark")) return true;
  if (cls.contains("quarto-light")) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function qpyodideMonacoTheme() {
  return qpyodideIsDarkMode() ? "vs-dark" : "vs";
}

function qpyodideSyncMonacoTheme() {
  if (globalThis.monaco) {
    monaco.editor.setTheme(qpyodideMonacoTheme());
  }
}

// Bootstrap only sets its dark-mode variables (--bs-body-bg,
// --bs-border-color, ...) under [data-bs-theme=dark], but Quarto only
// toggles body.quarto-dark/-light. Without this sync, var(--bs-*)
// references in dark mode would resolve to generic, light fallback
// values instead of the active theme's colors (e.g. slate). Scope is
// deliberately <body>, not <html>, so only the page content is affected,
// not Quarto's own navbar (which already has data-bs-theme="dark" fixed).
function qpyodideSyncBsTheme() {
  document.body.setAttribute("data-bs-theme", qpyodideIsDarkMode() ? "dark" : "light");
}

function qpyodideSyncTheme() {
  qpyodideSyncMonacoTheme();
  qpyodideSyncBsTheme();
}

// React live to theme changes (Quarto toggles classes on <body>)
new MutationObserver(qpyodideSyncTheme)
  .observe(document.body, { attributes: true, attributeFilter: ["class"] });
window.matchMedia?.("(prefers-color-scheme: dark)")
  .addEventListener?.("change", qpyodideSyncTheme);
qpyodideSyncBsTheme();

// ---------------------------------------------------------------------------
// Shared execution layer
// ---------------------------------------------------------------------------

// UI lock: one cell computes per click; the page itself stays free,
// because Python runs in the Web Worker.
let qpyodideExecutionBusy = false;

// Every EditorUnit capable of local-storage autosave registers itself here
// so the settings gear (qpyodide-storage-settings.js) can refresh their save-button/
// autosave-mode UI live, without a page reload, after the reader flips the
// "autosave to this browser" or "manual save per cell" checkbox.
const qpyodideStorageUnits = [];
globalThis.qpyodideRefreshStorageUI = function () {
  qpyodideStorageUnits.forEach((unit) => unit.refreshStorageUI());
};
// Called by both delete buttons in the settings gear (this page's saves via
// qpyodideStorage.clearPage(), or the whole project's via .clearAll()):
// puts every currently mounted, storage-capable cell's editor back to its
// original code (otherwise an already-restored or already-edited editor
// would keep showing the now-deleted content, and the very next keystroke
// would just save it right back -- see EditorUnit.resetEditorToOriginal())
// and re-derives each cell's status label/clear button from (now-empty)
// storage. Both scopes always include every cell mounted on the current
// page, so the same reset applies after either one.
globalThis.qpyodideResetAllStorageUnits = function () {
  qpyodideStorageUnits.forEach((unit) => {
    unit.feedbackHandle?.reset();
    unit.invalidateFeedback();
    unit.resetEditorToOriginal();
    unit.updateStorageStatus(false);
  });
};

// Detects input() calls in the code (same heuristic as runForOutput()).
function qpyodideCodeHasInput(code) {
  return /\binput\s*\(/.test(code || "");
}

// Enabling never runs ahead of the cells' readiness: after a restart, Run
// waits for the new start (qpyodideCellsReady), like on the first load.
function qpyodideSetRunButtonsEnabled(enabled) {
  document.querySelectorAll(".qpyodide-button-run").forEach((btn) => {
    // input() cells stay locked as long as input() is unavailable
    btn.disabled = !enabled || !globalThis.qpyodideCellsReady || btn.dataset.queued === "1" ||
      (btn.dataset.needsInput === "1" && !globalThis.qpyodideInputAvailable());
  });
}

// Restarts so far. One start of the worker runs the startup cells once; a
// restart stops a startup run that is still going (the new start runs them
// again, setup cells first).
let qpyodideRuntimeEpoch = 0;
// The runs clicked during a startup phase, in click order (runCode).
let qpyodideQueuedRuns = Promise.resolve();
window.addEventListener("qpyodide-runtime-restart", () => { qpyodideRuntimeEpoch++; globalThis.qpyodideStartupPhaseDone = false; });
// True once the current start's startup phase (setup, output and autorun
// cells) is over; event "qpyodide-startup-done". For tools and tests.
globalThis.qpyodideStartupPhaseDone = false;

/**
 * Runs Python code in the Pyodide worker.
 * @param {string}  code       Python code to run
 * @param {boolean} wantPickle also deliver figures as pickle
 *                             (only needed when switching to canvas)
 * @returns {Promise<{entries: Array, text: string, html: ?string, images: string[],
 *                    pickles: string[], pickleErrors: string[],
 *                    animations: string[], animationErrors: string[]}>}
 *   entries    – stdout/stderr lines, text – joined as plain text,
 *   html       – HTML return value of the last statement (or null),
 *   animations – automatically detected animations as ready-made player HTML,
 *   images     – the remaining matplotlib figures as base64 PNGs,
 *   pickles    – the same figures as base64 pickle (empty without wantPickle)
 */
async function qpyodideExecutePython(code, wantPickle) {
  const pyodide = await qpyodideReady;
  // This extension's cells run once the extra packages are there (D2), or
  // without them when they failed; they wait here, before the worker's
  // queue, so the queue never waits for them. A restart ends the wait: its
  // error is the run's outcome, as for a call the restart rejects.
  try {
    await pyodide.whenSetup;
  } catch (err) {
    if (err && err.restarted) throw err;
  }
  const result = await pyodide.runCell(code, wantPickle);
  result.text = result.entries.map((entry) => entry.message).join("\n");
  return result;
}

/**
 * Safely render text output (stdout/stderr) into a container.
 * @returns {boolean} true if visible content was produced.
 */
function qpyodideRenderTextOutput(targetDiv, entries) {
  const pre = document.createElement("pre");
  let hasContent = false;

  entries.forEach((entry) => {
    if (!/\S/.test(entry.message)) return;
    const line = document.createElement("code");
    line.className = (entry.type === "stderr")
      ? "qpyodide-output-code-stderr"
      : "qpyodide-output-code-stdout";
    line.textContent = entry.message;
    pre.appendChild(line);
    pre.appendChild(document.createTextNode("\n"));
    hasContent = true;
  });

  if (!hasContent) {
    pre.style.visibility = "hidden";
  }
  targetDiv.appendChild(pre);
  return hasContent;
}

/**
 * Renders matplotlib figures (base64 PNGs from the worker) as a <figure>.
 * @returns {boolean} true if a figure was inserted.
 */
function qpyodideRenderImages(targetDiv, images, figCap) {
  if (!images || images.length === 0) return false;
  const figure = document.createElement("figure");
  images.forEach((base64Png) => {
    const img = document.createElement("img");
    img.src = "data:image/png;base64," + base64Png;
    img.alt = figCap || "Plot";
    figure.appendChild(img);
  });
  if (figCap) {
    const figcaption = document.createElement("figcaption");
    figcaption.innerText = figCap;
    figure.appendChild(figcaption);
  }
  targetDiv.appendChild(figure);
  return true;
}

/**
 * Renders the plot output of a run.
 *
 * Animations first: they come as ready-made player HTML from the worker
 * (matplotlib `to_jshtml`) and already stand in there instead of the
 * figure, which would otherwise arrive as a frozen still image. Then the
 * PNGs of the remaining figures – those are available immediately. If
 * interactive plots are wanted for the cell, it then switches to canvas
 * in the background (second Pyodide instance, see
 * qpyodide-canvas-plots.js). No switch happens for an HTML return value
 * (Plotly, zeige_svg) and when not every figure has a usable pickle.
 */
function qpyodideRenderPlots(targetDiv, result, options) {
  const animations = result.animations || [];
  animations.forEach((animHtml) => qpyodideRenderHtmlOutput(targetDiv, animHtml));
  (result.animationErrors || []).forEach((msg) => {
    // The figure stays as PNG in this case – expected fallback.
    if (msg) console.warn("qpyodide: animation could not be rendered –", msg);
  });

  const hasImages = qpyodideRenderImages(targetDiv, result.images, options["fig-cap"]);
  targetDiv.classList.toggle("has-content", hasImages || animations.length > 0);

  const images  = result.images  || [];
  const pickles = result.pickles || [];
  if (images.length === 0) return;
  if (result.html) return;
  if (!globalThis.qpyodideCanvasWanted?.(options)) return;

  if (pickles.length !== images.length || pickles.some((p) => !p)) {
    // At least one figure couldn't be pickled -> stick with the image,
    // otherwise canvas and PNG would end up mixed together.
    (result.pickleErrors || []).forEach((msg) => {
      if (msg) console.warn("qpyodide: figure could not be pickled –", msg);
    });
    return;
  }

  // Deliberately without await: the cell is done, loading the second
  // instance may run in the background.
  globalThis.qpyodideCanvasUpgrade(targetDiv, pickles, options);
}

/**
 * Renders rich HTML output – including execution of embedded <script>
 * tags (needed for the matplotlib to_jshtml player). The container must
 * already be attached to the document for this.
 */
async function qpyodideRenderHtmlOutput(targetDiv, html) {
  const wrapper = document.createElement("div");
  wrapper.className = "qpyodide-html-output";
  targetDiv.appendChild(wrapper);
  wrapper.innerHTML = html;

  // innerHTML doesn't execute scripts -> replace with executable clones.
  // Order matters: a library loaded via src (e.g. d3) must finish loading
  // before a following inline script uses it. So we go through them in
  // order and wait for external scripts (errors don't block).
  const scripts = Array.from(wrapper.querySelectorAll("script"));
  for (const oldScript of scripts) {
    const newScript = document.createElement("script");
    for (const attr of oldScript.attributes) {
      newScript.setAttribute(attr.name, attr.value);
    }
    newScript.textContent = oldScript.textContent;
    const loaded = newScript.src
      ? new Promise((resolve) => {
          newScript.addEventListener("load", resolve, { once: true });
          newScript.addEventListener("error", resolve, { once: true });
        })
      : null;
    oldScript.replaceWith(newScript);
    if (loaded) await loaded;
  }
}

// ---------------------------------------------------------------------------
// EditorUnit – a Monaco editor with toolbar and output areas
// ---------------------------------------------------------------------------

class EditorUnit {
  /**
   * @param {Object} config
   * @param {string}  config.uid       unique ID (e.g. "3" or "3.2")
   * @param {string}  config.code      initial code of the editor
   * @param {Object}  config.options   cell options (read-only, fig-cap, …)
   * @param {Element} config.hostDiv   container the unit is built into
   */
  constructor({ uid, code, options, hostDiv }) {
    this.uid = uid;
    this.code = code;
    this.options = options;
    this.hostDiv = hostDiv;
    this.editor = null;
    this.isReadOnly = options["read-only"] === "true";
    this.lastRunCode = null;   // code state of the last run
    this.lastOutput = null;    // retained execution result for existing callers
    this.feedbackRevision = 0;
    this.outputRevision = 0;
    this.feedbackEvidence = null;
    this.feedbackHandle = null;

    // Local-storage autosave: whether this cell could EVER use storage at
    // all -- editable, and not permanently opted out via the course
    // author's own `#| local-storage: false`. This is fixed for the cell's
    // lifetime and gates whether any storage DOM/listeners get built at
    // all. It's deliberately independent of the document default, the
    // reader's device-wide toggle, and manual-save mode -- those can all
    // change live (see cellEnabled()/isManualMode(), always re-read fresh,
    // never cached) without needing a page reload; see refreshStorageUI().
    this.storageCapable = !this.isReadOnly && !!globalThis.qpyodideStorage &&
      this.options["local-storage"] !== "false";
    // Restoring previously saved code is NOT gated by whether saving is
    // CURRENTLY allowed (doc default / reader toggle can be off right now)
    // -- if something was saved while it WAS allowed, it must still show up
    // here; otherwise turning the reader toggle off would look like it
    // silently deleted the student's own code.
    this.savedCode = this.storageCapable ? globalThis.qpyodideStorage.load(this.uid) : null;
    this.saveTimer = null;

    this.buildDom();
    this.initMonaco();
    this.wireButtons();
  }

  /** Builds the toolbar + editor and output areas. */
  buildDom() {
    const uid = this.uid;

    // Toolbar
    this.toolbarDiv = document.createElement("div");
    this.toolbarDiv.className = "qpyodide-editor-toolbar " +
      (this.isReadOnly ? "qpyodide-toolbar-readonly" : "qpyodide-toolbar-editable");
    this.toolbarDiv.id = `qpyodide-editor-toolbar-${uid}`;

    const leftButtonsDiv = document.createElement("div");
    leftButtonsDiv.className = "qpyodide-editor-toolbar-left-buttons";

    const rightButtonsDiv = document.createElement("div");
    rightButtonsDiv.className = "qpyodide-editor-toolbar-right-buttons";

    // Run button
    this.runButton = document.createElement("button");
    this.runButton.className = "btn btn-default qpyodide-button qpyodide-button-run";
    this.runButton.type = "button";
    this.runButton.id = `qpyodide-button-run-${uid}`;
    this.runButton.title = QP_L.runTitle;
    if (globalThis.qpyodideCellsReady) {
      this.runButton.innerHTML = QP_L.runLabel;
      this.runButton.disabled = false;
    } else {
      this.runButton.textContent = QP_L.runLoading;
      this.runButton.disabled = true;
    }
    leftButtonsDiv.appendChild(this.runButton);

    // Editable/read-only label -- left-oriented, next to the Run button.
    const readOnlyLabel = document.createElement("label");
    readOnlyLabel.className = "qpyodide-label qpyodide-readonly-label";
    readOnlyLabel.id = `qpyodide-readonly-label-${uid}`;
    readOnlyLabel.textContent = this.isReadOnly ? QP_L.labelReadOnly : QP_L.labelEditable;
    leftButtonsDiv.appendChild(readOnlyLabel);

    // Local-storage status label + "save now"/"clear saved code" controls
    // (only for cells that could ever use storage -- see storageCapable).
    // Visibility of each is refreshed live (refreshStorageUI()), never
    // fixed at construction time. Status label is right-oriented, ahead of
    // the action buttons it describes.
    this.storageStatusLabel = null;
    this.saveButton = null;
    this.clearSavedButton = null;
    if (this.storageCapable) {
      this.storageStatusLabel = document.createElement("span");
      this.storageStatusLabel.className = "qpyodide-label qpyodide-storage-status";
      this.storageStatusLabel.hidden = true;
      rightButtonsDiv.appendChild(this.storageStatusLabel);

      // Manual-save mode only (see refreshStorageUI): the reader has to
      // click this explicitly instead of autosave saving as they type.
      this.saveButton = document.createElement("button");
      this.saveButton.className = "btn btn-light btn-xs qpyodide-button qpyodide-button-save-cell";
      this.saveButton.type = "button";
      this.saveButton.id = `qpyodide-button-save-cell-${uid}`;
      this.saveButton.title = QP_L.saveCellTitle;
      this.saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
      this.saveButton.hidden = true;
      rightButtonsDiv.appendChild(this.saveButton);

      this.clearSavedButton = document.createElement("button");
      this.clearSavedButton.className = "btn btn-light btn-xs qpyodide-button qpyodide-button-clear-saved";
      this.clearSavedButton.type = "button";
      this.clearSavedButton.id = `qpyodide-button-clear-saved-${uid}`;
      this.clearSavedButton.title = QP_L.clearSavedTitle;
      this.clearSavedButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      this.clearSavedButton.hidden = true;
      rightButtonsDiv.appendChild(this.clearSavedButton);

      qpyodideStorageUnits.push(this);
    }

    // Reset button
    this.resetButton = document.createElement("button");
    this.resetButton.className = "btn btn-light btn-xs qpyodide-button qpyodide-button-reset";
    this.resetButton.type = "button";
    this.resetButton.id = `qpyodide-button-reset-${uid}`;
    this.resetButton.title = QP_L.resetTitle;
    this.resetButton.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i>';
    rightButtonsDiv.appendChild(this.resetButton);

    // Copy button
    this.copyButton = document.createElement("button");
    this.copyButton.className = "btn btn-light btn-xs qpyodide-button qpyodide-button-copy";
    this.copyButton.type = "button";
    this.copyButton.id = `qpyodide-button-copy-${uid}`;
    this.copyButton.title = QP_L.copyTitle;
    this.copyButton.innerHTML = '<i class="fa-regular fa-copy"></i>';
    rightButtonsDiv.appendChild(this.copyButton);

    // Feedback button (only when the feature is enabled and the cell is editable)
    this.feedbackButton = null;
    if (globalThis.qpyodideFeedback?.enabled && !this.isReadOnly) {
      this.feedbackButton = document.createElement("button");
      this.feedbackButton.className = "btn btn-default qpyodide-button qpyodide-button-feedback";
      this.feedbackButton.type = "button";
      this.feedbackButton.id = `qpyodide-button-feedback-${uid}`;
      this.feedbackButton.title = QP_L.feedbackTitle;
      this.feedbackButton.innerHTML = QP_L.feedbackLabel;
      this.feedbackButton.disabled = false;
      rightButtonsDiv.appendChild(this.feedbackButton);
    }

    this.toolbarDiv.appendChild(leftButtonsDiv);
    this.toolbarDiv.appendChild(rightButtonsDiv);

    // Console: editor + text output + feedback output
    const consoleAreaDiv = document.createElement("div");
    consoleAreaDiv.id = `qpyodide-console-area-${this.uid}`;
    consoleAreaDiv.className = "qpyodide-console-area";

    this.editorDiv = document.createElement("div");
    this.editorDiv.id = `qpyodide-editor-${uid}`;
    this.editorDiv.className = "qpyodide-editor";

    this.outputCodeDiv = document.createElement("div");
    this.outputCodeDiv.id = `qpyodide-output-code-area-${uid}`;
    this.outputCodeDiv.className = "qpyodide-output-code-area";
    this.outputCodeDiv.setAttribute("aria-live", "assertive");
    const placeholderPre = document.createElement("pre");
    placeholderPre.style.visibility = "hidden";
    this.outputCodeDiv.appendChild(placeholderPre);

    this.outputFeedbackDiv = document.createElement("div");
    this.outputFeedbackDiv.id = `qpyodide-output-feedback-area-${uid}`;
    this.outputFeedbackDiv.className = "qpyodide-output-feedback-area";
    this.outputFeedbackDiv.setAttribute("aria-live", "assertive");

    consoleAreaDiv.appendChild(this.editorDiv);
    consoleAreaDiv.appendChild(this.outputCodeDiv);
    if (this.feedbackButton) {
      consoleAreaDiv.appendChild(this.outputFeedbackDiv);
    }

    // Graphics output (matplotlib)
    this.outputGraphDiv = document.createElement("div");
    this.outputGraphDiv.id = `qpyodide-output-graph-area-${uid}`;
    this.outputGraphDiv.className = "qpyodide-output-graph-area";

    // Hint for input() cells when input() is (not yet) available.
    // Hidden by default; updateInputGate() shows it when needed.
    this.inputHintDiv = document.createElement("div");
    this.inputHintDiv.className = "qpyodide-cell-input-hint";
    this.inputHintDiv.hidden = true;

    this.hostDiv.appendChild(this.toolbarDiv);
    this.hostDiv.appendChild(this.inputHintDiv);
    this.hostDiv.appendChild(consoleAreaDiv);
    this.hostDiv.appendChild(this.outputGraphDiv);

    // First gate check based on the initial code (the editor doesn't exist
    // yet; getCode() falls back to this.code).
    this.updateInputGate();

    // Reflect whether restored/saved code already exists for this cell, and
    // set the save/clear buttons' initial visibility (autosave vs. manual
    // mode, current enablement).
    this.updateStorageStatus(this.savedCode != null);
    this.refreshStorageUI();
  }

  /** Updates the "saved"/"restored"/"savable" status label. Pass
   *  justRestored=true right after a fresh page load that restored
   *  previously saved code, to show that fact once instead of the generic
   *  "saved" wording. Sets `display` directly (not just the `hidden`
   *  attribute) so this can never be left visible by a stray CSS rule
   *  elsewhere overriding `[hidden]`.
   *
   *  A cell with nothing saved YET still gets a faint "Savable" marker
   *  whenever it actually would persist if the student typed right now
   *  (live cascading precedence: doc default + this cell's own override +
   *  the reader's own toggle, via cellEnabled()) -- otherwise cascading
   *  options were only ever visible after the fact, once something had
   *  already been saved, which made it impossible to tell which cells on
   *  an untouched page were live vs. structurally incapable (read-only /
   *  `#| local-storage: false`) vs. capable-but-currently-disabled (doc
   *  default off, no cell override). This is the ONE label state that
   *  depends on cellEnabled() (live) rather than meaningfullySaved
   *  (persisted) -- so, unlike the other two, it must disappear/reappear
   *  live whenever the reader's own toggle changes, even with nothing ever
   *  saved.
   *
   *  A stored entry that's byte-identical to the original code (the
   *  student saved, then edited back to exactly the original -- or a
   *  reload just re-loaded a save that never actually differed) is treated
   *  as NOT meaningfully saved: "Restored"/"Saved" would be describing a
   *  distinction that doesn't exist, and previously the only way to clear
   *  that stuck label was the per-cell trash-can button even though
   *  nothing was actually being restored differently from the original.
   *  Checked against both the live editor content and the raw stored
   *  string, since the editor may not exist yet (this runs once
   *  synchronously before Monaco's async `require()` resolves) and manual-
   *  save mode can leave them out of sync. */
  updateStorageStatus(justRestored) {
    if (!this.storageStatusLabel) return;
    const stored = globalThis.qpyodideStorage.load(this.uid);
    const live = this.editor ? this.editor.getValue() : stored;
    const original = this.code;
    const meaningfullySaved = stored !== null && stored !== original && live !== original;
    const savableNow = !meaningfullySaved && globalThis.qpyodideStorage.cellEnabled(this.options);
    const visible = meaningfullySaved || savableNow;
    this.storageStatusLabel.hidden = !visible;
    this.storageStatusLabel.style.display = visible ? "" : "none";
    this.storageStatusLabel.classList.toggle("qpyodide-storage-status-savable", savableNow);
    this.storageStatusLabel.title = savableNow ? QP_L.storageSavableTitle : "";
    this.storageStatusLabel.textContent = meaningfullySaved
      ? (justRestored ? QP_L.storageRestoredStatus : QP_L.storageSavedStatus)
      : (savableNow ? QP_L.storageSavableStatus : "");
    if (this.clearSavedButton) this.clearSavedButton.hidden = !meaningfullySaved;
    // Tracks whether the label is currently showing "Restored" specifically
    // -- onFirstEditAfterRestore() below watches this to flip it to
    // "Saved" the moment the restored text gets overwritten, since
    // "Restored" would otherwise keep describing content that no longer
    // matches what was actually restored.
    this.showingRestored = meaningfullySaved && !!justRestored;
  }

  /** Called on every editor content change. The "Restored" status only
   *  ever describes the code exactly as it was loaded from storage; once
   *  the student changes so much as one character, it stops being
   *  accurate and must switch to the generic "Saved" wording right away --
   *  independent of whether an actual write has happened yet (autosave is
   *  debounced, and manual-save mode may not write until much later). The
   *  underlying saved copy is untouched either way; only the label. */
  onFirstEditAfterRestore() {
    if (!this.showingRestored) return;
    this.updateStorageStatus(false);
  }

  /** Puts the editor's content back to the cell's original code and clears
   *  run state -- everything the Reset button does EXCEPT touching
   *  localStorage or asking for confirmation (callers decide both: the
   *  Reset button confirms per-cell and clears its own storage entry; the
   *  "delete all local saves" bulk action in the settings gear already
   *  confirmed once and clears storage for every cell in one call, then
   *  uses this to also put every currently open editor back in sync --
   *  otherwise the (now storage-less) edited text would just get saved
   *  right back on the next keystroke, silently undoing the deletion. */
  resetEditorToOriginal() {
    if (this.editor) {
      this.editor.setValue(this.editor.__qpyodideinitialCode);
      // setValue() above fires onDidChangeModelContent synchronously, which
      // includes scheduleSave() -- left alone, that would debounce-save the
      // (unchanged) original code right back ~500ms later, silently
      // reviving the "Saved"/🗑 UI on a cell nothing actually changed in.
      // Both callers (Reset button, "delete all local saves") already
      // handle storage themselves right after this returns, so that
      // scheduled write must never be allowed to fire.
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.lastRunCode = null;
    this.lastOutput = null;
    [this.outputCodeDiv, this.outputFeedbackDiv, this.outputGraphDiv].forEach((div) => {
      if (div.classList.contains("has-content")) {
        div.innerHTML = "";
        div.classList.remove("has-content");
      }
    });
  }

  /** Re-derives everything that can change live without a page reload: the
   *  manual Save button's visibility, and (via updateStorageStatus()) the
   *  "Savable" indicator, from the reader's device-wide autosave toggle and
   *  manual-save mode. Called once at construction and again by
   *  qpyodideRefreshStorageUI() (wired to both settings-gear checkboxes in
   *  qpyodide-feedback.js). Passes through the CURRENT showingRestored
   *  rather than recomputing it, so merely flipping a setting can never by
   *  itself turn a "Restored" label into "Saved" -- only actually editing
   *  the cell does that (see onFirstEditAfterRestore()). */
  refreshStorageUI() {
    if (!this.storageCapable) return;
    if (this.saveButton) {
      const manual = globalThis.qpyodideStorage.isManualMode();
      const persistable = globalThis.qpyodideStorage.cellEnabled(this.options);
      this.saveButton.hidden = !(manual && persistable);
    }
    this.updateStorageStatus(this.showingRestored);
  }

  /** Debounced autosave: schedules a save a moment after the last
   *  keystroke instead of on every single content change. Re-checks live
   *  state right before actually writing (not just when scheduled), and
   *  never fires at all in manual-save mode -- there, only the Save button
   *  (see wireButtons()) writes. */
  scheduleSave() {
    if (!this.storageCapable) return;
    if (globalThis.qpyodideStorage.isManualMode()) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      if (!globalThis.qpyodideStorage.cellEnabled(this.options)) return;
      globalThis.qpyodideStorage.save(this.uid, this.getCode());
      this.updateStorageStatus(false);
    }, 500);
  }

  /** Creates the Monaco editor (height, EOL, keyboard shortcuts). */
  initMonaco() {
    const thiz = this;

    require(["vs/editor/editor.main"], function () {
      thiz.editor = monaco.editor.create(thiz.editorDiv, {
        // Restored, saved code (if any) takes the editor's initial value --
        // the original course code stays available via __qpyodideinitialCode
        // below for the Reset button. Never auto-run either way.
        value: thiz.savedCode != null ? thiz.savedCode : thiz.code,
        language: "python",
        theme: qpyodideMonacoTheme(),
        automaticLayout: true,           // Works wonderfully with RevealJS
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        fontSize: "17.5pt",              // Bootstrap is 1 rem
        renderLineHighlight: "none",     // Disable current line highlighting
        hideCursorInOverviewRuler: true, // Remove cursor indicator in scroll bar
        readOnly: thiz.isReadOnly
      });

      // Store metadata on the editor (e.g. for other extensions)
      thiz.editor.__qpyodideCounter = thiz.uid;
      thiz.editor.__qpyodideEditorId = `qpyodide-editor-${thiz.uid}`;
      thiz.editor.__qpyodideinitialCode = thiz.code;
      thiz.editor.__qpyodideOptions = thiz.options;

      // Set at the model level the preferred end of line (EOL) character to LF.
      // This prevents `\r\n` from being given to the Pyodide engine on Windows.
      // See details in: https://github.com/coatless/quarto-Pyodide/issues/94
      const model = thiz.editor.getModel();
      model.setEOL(monaco.editor.EndOfLineSequence.LF);

      // Dynamically adjust editor height to fit the content
      const updateHeight = () => {
        const contentHeight = thiz.editor.getContentHeight();
        thiz.editorDiv.style.height = `${contentHeight}px`;
        thiz.editor.layout();
      };

      const isEmptyCodeText = (selected) =>
        (selected === null || selected === undefined || selected === "");

      // Keyboard shortcuts must be re-registered per editor on focus change
      // (Monaco regression since 0.32.0):
      // https://github.com/microsoft/monaco-editor/issues/2947
      // addCommand registers a page-wide keybinding; the context key limits it
      // to this extension's editors, so other Monaco editors on the page (for
      // example py-exercise) keep their own keys.
      const shortcutContext = typeof thiz.editor.createContextKey === 'function'
        ? (thiz.editor.createContextKey('qpyodideCellEditor', true), 'qpyodideCellEditor') : undefined;
      const addPyodideKeyboardShortCutCommands = () => {
        // Shift+Enter: run the entire cell content
        thiz.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
          thiz.runCode(thiz.editor.getValue());
        }, shortcutContext);

        // Ctrl/Cmd+Enter: run the selection (or the current line)
        thiz.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          const selectedText = thiz.editor.getModel()
            .getValueInRange(thiz.editor.getSelection());

          if (isEmptyCodeText(selectedText)) {
            const currentPosition = thiz.editor.getPosition();
            const currentLine = thiz.editor.getModel()
              .getLineContent(currentPosition.lineNumber);

            const newPosition = new monaco.Position(currentPosition.lineNumber + 1, 1);
            if (newPosition.lineNumber > thiz.editor.getModel().getLineCount()) {
              thiz.editor.executeEdits("addNewLine", [{
                range: new monaco.Range(newPosition.lineNumber, 1, newPosition.lineNumber, 1),
                text: "\n",
                forceMoveMarkers: true,
              }]);
            }

            thiz.runCode(currentLine);
            thiz.editor.setPosition(newPosition);
          } else {
            thiz.runCode(selectedText);
          }
        }, shortcutContext);
      };

      thiz.editor.onDidFocusEditorText(addPyodideKeyboardShortCutCommands);
      thiz.editor.onDidContentSizeChange(updateHeight);
      // Code changes can add/remove input() -> re-evaluate the gate
      thiz.editor.onDidChangeModelContent(() => { thiz.invalidateFeedback({preserveRunOutput: true}); thiz.updateInputGate(); });
      // Autosave to localStorage (debounced), only for opted-in cells
      thiz.editor.onDidChangeModelContent(() => thiz.scheduleSave());
      // "Restored" must stop describing the content the instant it's edited
      thiz.editor.onDidChangeModelContent(() => thiz.onFirstEditAfterRestore());
      updateHeight();
      thiz.updateInputGate();
    });
  }

  /** Wires up button clicks (Run/Reset/Copy/Feedback). */
  wireButtons() {
    const thiz = this;

    this.runButton.onclick = () => thiz.runCode(thiz.getCode());

    this.copyButton.onclick = () => {
      navigator.clipboard.writeText(thiz.getCode() || "");
    };

    this.resetButton.onclick = () => {
      if (thiz.editor) {
        // Only nag with a confirmation when Reset would actually discard
        // something -- code already matching the original is a no-op.
        if (thiz.getCode() !== thiz.editor.__qpyodideinitialCode &&
            !window.confirm(QP_L.resetConfirm)) {
          return;
        }
      }
      thiz.feedbackHandle?.reset();
      thiz.invalidateFeedback();
      thiz.resetEditorToOriginal();
      if (thiz.storageCapable) {
        globalThis.qpyodideStorage.clear(thiz.uid);
        thiz.updateStorageStatus(false);
      }
    };

    // Manual-save mode only: writes immediately, bypassing the debounce
    // (and bypassing manual-mode's own "autosave never fires" rule in
    // scheduleSave() -- this button IS the save action in that mode).
    if (this.saveButton) {
      this.saveButton.onclick = () => {
        globalThis.qpyodideStorage.save(thiz.uid, thiz.getCode());
        thiz.updateStorageStatus(false);
      };
    }

    // "Clear saved code": drops the localStorage backup without touching
    // whatever is currently in the editor (e.g. before leaving a shared
    // computer, without losing the in-progress edit view).
    if (this.clearSavedButton) {
      this.clearSavedButton.onclick = () => {
        globalThis.qpyodideStorage.clear(thiz.uid);
        thiz.updateStorageStatus(false);
      };
    }

    // AI feedback: all of its logic lives in qpyodide-feedback.js
    if (this.feedbackButton) {
      this.feedbackHandle = qpyodideFeedback.attach({
        uid: this.uid,
        feedbackButton: this.feedbackButton,
        feedbackDiv: this.outputFeedbackDiv,
        getCode: () => thiz.getCode(),
        options: this.options,
        getEvidence: () => thiz.getFeedbackEvidence(),
        getRevision: () => thiz.feedbackRevision
      });
    }

    // Keep the input() gate current: on state changes (input() checked/enabled)
    // and as soon as this extension's cells may run.
    window.addEventListener("qpyodide-runtime-restart", () => thiz.invalidateFeedback({preserveRunOutput: true}));
    window.addEventListener("qpyodide-input-state", () => thiz.updateInputGate());
    window.addEventListener("qpyodide-cells-ready", () => thiz.updateInputGate());
    if (globalThis.qpyodideCellsReady) thiz.updateInputGate();
  }

  invalidateFeedback({preserveRunOutput = false} = {}) {
    this.feedbackRevision++;
    if (!preserveRunOutput) this.outputRevision++;
    this.lastRunCode = null;
    this.lastOutput = null;
    this.feedbackEvidence = null;
    this.feedbackHandle?.cancel({clearOutput: true});
  }

  getFeedbackEvidence() {
    const cached = this.feedbackEvidence;
    return cached && cached.revision === this.feedbackRevision && cached.code === this.getCode()
      ? cached.evidence.map(item => ({...item})) : [];
  }

  /** Gets the editor's current code (fallback: initial code). */
  getCode() {
    return this.editor ? this.editor.getValue() : this.code;
  }

  /**
   * Locks/unlocks the Run button depending on whether the cell uses
   * input() and whether input() is available on this page. Shows an
   * inline hint with a link to the input() panel above when needed.
   */
  updateInputGate() {
    if (!this.runButton) return;

    const needsInput = qpyodideCodeHasInput(this.getCode());
    const available  = globalThis.qpyodideInputAvailable
      ? globalThis.qpyodideInputAvailable() : true;

    // Marker for the global togglers (qpyodideSetRunButtonsEnabled,
    // qpyodideSetInteractiveButtonState), so they respect the lock.
    if (needsInput) {
      this.runButton.dataset.needsInput = "1";
    } else {
      delete this.runButton.dataset.needsInput;
    }

    const blocked = needsInput && !available;

    // Only touch the Run button when the cells may run and nothing is
    // currently running – otherwise we'd overwrite the loading or stop state.
    if (globalThis.qpyodideCellsReady && !qpyodideExecutionBusy) {
      this.runButton.disabled = blocked;
      this.runButton.title = blocked
        ? QP_L.runTitleBlocked
        : QP_L.runTitle;
    }

    // Expand/collapse the inline hint
    if (!this.inputHintDiv) return;
    if (!blocked) {
      this.inputHintDiv.hidden = true;
      this.inputHintDiv.innerHTML = "";
      return;
    }

    const hints = {
      "unavailable":  QP_L.cellInputHintUnavailable,
      "needs-reload": QP_L.cellInputHintNeedsReload,
    };
    this.inputHintDiv.innerHTML =
      hints[globalThis.qpyodideInputState] || QP_L.cellInputHintCheck;
    this.inputHintDiv.hidden = false;
  }

  /**
   * Runs code in the worker and displays the result (text/HTML/plots)
   * below the editor. While running, this cell's Run button turns into a
   * Stop button (graceful abort via interrupt, otherwise a hard worker
   * restart) – the page stays fully usable throughout.
   * @returns {Promise<string>} the interpreter's text output
   */
  async runCode(code, { queued = false } = {}) {
    if (qpyodideExecutionBusy) return "";
    // A run clicked during this start's startup phase waits for it: setup
    // and output cells run outside the Run lock, and a cell that uses their
    // names would fail before them (Run is enabled when the cells may run,
    // and the startup phase starts then). Runs clicked meanwhile run after
    // it, one by one, in click order; each button says it is waiting.
    const epoch = qpyodideRuntimeEpoch;
    const starting = queued ? null : globalThis.qpyodideCellContainer?.starting(epoch);
    if (starting) {
      if (this.runButton.dataset.queued === "1") return "";
      const label = this.runButton.innerHTML;
      this.runButton.innerHTML = QP_L.runLoading;
      this.runButton.dataset.queued = "1";
      this.runButton.disabled = true;
      const previous = qpyodideQueuedRuns;
      let release;
      qpyodideQueuedRuns = new Promise((resolve) => { release = resolve; });
      try {
        await starting;
        await previous;
        this.runButton.innerHTML = label;
        delete this.runButton.dataset.queued;
        // A restart meanwhile: the new start runs its startup cells first.
        if (epoch !== qpyodideRuntimeEpoch) {
          qpyodideSetRunButtonsEnabled(!qpyodideExecutionBusy);
          return "";
        }
        return await this.runCode(code, { queued: true });
      } finally {
        release();
      }
    }
    this.feedbackHandle?.reset('run');
    this.invalidateFeedback();
    const revision = this.feedbackRevision;
    const outputRevision = this.outputRevision;
    let evidence = [];
    qpyodideExecutionBusy = true;
    qpyodideSetRunButtonsEnabled(false);

    const proxy = await qpyodideReady;

    // Create the streaming terminal (runs for all cells, not only with input())
    this.outputCodeDiv.innerHTML = "";
    const terminalDiv = document.createElement("div");
    terminalDiv.className = "qpyodide-terminal";
    this.outputCodeDiv.appendChild(terminalDiv);
    this.outputCodeDiv.classList.add("has-content");

    // Streamed stdout/stderr: each line appears immediately in the terminal
    proxy.onStream = (text, type) => {
      const line = document.createElement("code");
      line.className = type === "stderr"
        ? "qpyodide-output-code-stderr"
        : "qpyodide-output-code-stdout";
      line.textContent = text;
      terminalDiv.appendChild(line);
      terminalDiv.appendChild(document.createTextNode("\n"));
    };

    // Python input(): insert an input field inline into the terminal and
    // then block (only works if the page is cross-origin isolated).
    // The prompt comes directly from the worker (via _qpyodide_set_prompt
    // from Python), since Pyodide only flushes stdout on complete lines
    // (with \n) – input() prompts without \n would otherwise never reach
    // the main thread.
    proxy.onInputRequired = (prompt) => {
      const row = document.createElement("div");
      row.className = "qpyodide-input-row";

      if (prompt) {
        const promptSpan = document.createElement("span");
        promptSpan.className = "qpyodide-input-prompt";
        promptSpan.textContent = prompt;
        row.appendChild(promptSpan);
      }

      const inp = document.createElement("input");
      inp.type = "text";
      inp.className = "qpyodide-terminal-input";
      inp.setAttribute("autocomplete", "off");
      inp.setAttribute("spellcheck", "false");
      row.appendChild(inp);
      terminalDiv.appendChild(row);
      inp.focus();

      inp.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const val = inp.value;
        // Replace the input field with the echo (the prompt label stays)
        const echo = document.createElement("code");
        echo.className = "qpyodide-output-code-stdout qpyodide-input-echo";
        echo.textContent = val;
        inp.replaceWith(echo);
        terminalDiv.appendChild(document.createTextNode("\n"));
        // Hand the value to the worker (wakes Atomics.wait in stdin())
        proxy.provideInput(val);
      });
    };

    // Turn the Run button into a Stop button
    const runButtonHtml = this.runButton.innerHTML;
    this.runButton.innerHTML = QP_L.stopLabel;
    this.runButton.title = proxy.interruptBuffer
      ? QP_L.stopTitle
      : QP_L.stopTitleRestart;
    this.runButton.disabled = false;
    this.runButton.onclick = () => {
      // Mark an open input field as "[Aborted]"
      terminalDiv.querySelectorAll(".qpyodide-input-row").forEach((row) => {
        const aborted = document.createElement("code");
        aborted.className = "qpyodide-output-code-stderr";
        aborted.textContent = QP_L.aborted;
        row.replaceChildren(aborted);
      });
      if (proxy.interruptBuffer) {
        proxy.interrupt();
      } else {
        proxy.restart(QP_L.abortedRestart);
      }
    };

    let text = "";
    try {
      const result = await qpyodideExecutePython(
        code, globalThis.qpyodideCanvasWanted?.(this.options)
      );
      text = result.text;
      if (outputRevision !== this.outputRevision) return text;
      const stdout = result.entries.filter(entry => entry.type === 'stdout').map(entry => entry.message).join('\n');
      const hasError = result.entries.some(entry => entry.type === 'stderr');
      evidence = [{label: 'Prior execution', text: hasError ? 'The run reported an error. Raw error details are omitted.' : 'The run completed.'}];
      if (stdout) evidence.push({label: 'Learner stdout', text: stdout.length > 8000 ? stdout.slice(0, 8000) + '\n[Output truncated]' : stdout});

      // Append HTML return value (e.g. animation) and graphics
      if (result.html) qpyodideRenderHtmlOutput(this.outputCodeDiv, result.html);
      this.outputGraphDiv.innerHTML = "";
      qpyodideRenderPlots(this.outputGraphDiv, result, this.options);

      // Terminal empty + no HTML → remove has-content (don't waste space)
      if (!terminalDiv.hasChildNodes() && !result.html) {
        this.outputCodeDiv.classList.remove("has-content");
      }
    } catch (err) {
      // Hard abort (worker restart) or worker crash
      evidence = [];
      if (outputRevision !== this.outputRevision) return '';
      text = String((err && err.message) || err);
      terminalDiv.querySelectorAll(".qpyodide-input-row").forEach((r) => r.remove());
      const errCode = document.createElement("code");
      errCode.className = "qpyodide-output-code-stderr";
      errCode.textContent = text;
      terminalDiv.appendChild(errCode);
    } finally {
      proxy.onStream = null;
      proxy.onInputRequired = null;
      proxy.clearInterrupt();
      // After a restart the cells wait for the new start (qpyodideCellsReady).
      this.runButton.innerHTML = globalThis.qpyodideCellsReady ? runButtonHtml : QP_L.runLoading;
      this.runButton.title = QP_L.runTitle;
      this.runButton.onclick = () => this.runCode(this.getCode());
      qpyodideExecutionBusy = false;
      qpyodideSetRunButtonsEnabled(true);
    }
    if (revision === this.feedbackRevision && code === this.getCode()) {
      this.lastRunCode = code;
      this.lastOutput = text;
      this.feedbackEvidence = {code, revision, evidence};
    }
    return text;
  }

  /** For feedback: delivers the interpreter output of the last run.
   *  Feedback NEVER runs the code itself – that is always left to the user.
   *  This way, AI feedback always sees exactly what the user also saw. */
  async runForOutput() {
    const currentCode = this.getCode();
    if (this.lastOutput !== null && this.lastRunCode === currentCode) {
      return this.lastOutput;
    }
    if (this.lastOutput !== null) {
      // Code was changed since the last run
      return QP_L.outputChanged;
    }
    // Code has never been run
    const hasInput = qpyodideCodeHasInput(currentCode);
    if (hasInput) {
      return QP_L.outputNeedsInput;
    }
    return QP_L.outputNotRun;
  }
}

// ---------------------------------------------------------------------------
// Cell classes
// ---------------------------------------------------------------------------

/**
 * BaseCell – shared base for all cell types.
 */
class BaseCell {
  constructor(cellData) {
    this.code = cellData.code;
    this.id = cellData.id;
    this.options = cellData.options;
    this.insertionLocation = document.getElementById(
      `qpyodide-insertion-location-${this.id}`
    );
  }

  /** Called by CellContainer after Pyodide has started. */
  async runStartup() { /* default: nothing to do */ }
}

// ---------------------------------------------------------------------------
// Fold nudge: shown once, under a cell the reader just expanded by hand,
// offering to reveal every other still-folded cell in one click.
// ---------------------------------------------------------------------------

// Sets a fold <details>'s open state programmatically, marking it via the
// data attribute ONLY when the state actually changes. A same-state
// assignment (e.g. `.open = false` on a <details> that's already closed,
// the common case for a cell that starts folded) never fires a `toggle`
// event at all - flagging it anyway would leave the flag stuck forever,
// silently swallowing that cell's next *real* user click instead of the
// (nonexistent) programmatic event it was meant for. Used everywhere a
// fold state is set from code: initial cell construction, "Show/Hide All
// Code", and this nudge's own "show all" button.
function qpyodideSetFoldOpen(details, open) {
  if (details.open === open) return;
  details.dataset.qpyodideProgrammatic = "1";
  details.open = open;
}
globalThis.qpyodideSetFoldOpen = qpyodideSetFoldOpen;

let qpyodideFoldNudgeShown = false;

function qpyodideShowFoldNudge(cellDetails) {
  if (qpyodideFoldNudgeShown) return;
  // Only worth offering the shortcut when there's a real batch left to
  // reveal. If a single other cell is still folded, clicking it directly
  // is no more effort than clicking the nudge's own button, so it would
  // just be a nag for no benefit.
  const otherFoldedCount = Array.from(document.querySelectorAll(".qpyodide-code-fold"))
    .filter((details) => details !== cellDetails && !details.open).length;
  if (otherFoldedCount < 2) return;

  qpyodideFoldNudgeShown = true;

  const banner = document.createElement("div");
  banner.className = "qpyodide-fold-nudge";

  const text = document.createElement("span");
  text.textContent = QP_L.foldNudgeQuestion;
  banner.appendChild(text);

  const showAllBtn = document.createElement("button");
  showAllBtn.type = "button";
  showAllBtn.className = "btn btn-light btn-sm qpyodide-button";
  showAllBtn.textContent = QP_L.foldNudgeShowAll;
  showAllBtn.onclick = () => {
    document.querySelectorAll(".qpyodide-code-fold").forEach((details) => {
      qpyodideSetFoldOpen(details, true);
    });
    banner.remove();
  };
  banner.appendChild(showAllBtn);

  const dismissBtn = document.createElement("button");
  dismissBtn.type = "button";
  dismissBtn.className = "btn btn-light btn-sm qpyodide-button";
  dismissBtn.textContent = QP_L.foldNudgeDismiss;
  dismissBtn.onclick = () => banner.remove();
  banner.appendChild(dismissBtn);

  // Appended *inside* the <details> (not as a sibling after it): a closed
  // <details> natively hides its children, so folding this cell back up
  // hides the banner along with it instead of leaving it stranded on the
  // page for a reader who never clicks either button.
  cellDetails.appendChild(banner);
}

/**
 * InteractiveCell – collapsible cell with one (or, via "+ Code block",
 * two) EditorUnit(s).
 */
class InteractiveCell extends BaseCell {
  constructor(cellData) {
    super(cellData);
    this.units = [];
    this.setupElement();
  }

  setupElement() {
    const mainDiv = document.createElement("div");
    mainDiv.id = `qpyodide-interactive-area-${this.id}`;
    mainDiv.className = "qpyodide-interactive-area";
    if (this.options.classes) {
      mainDiv.className += " " + this.options.classes;
    }
    if (this.options.label) {
      mainDiv.setAttribute("data-id", this.options.label);
    }

    // Collapsible frame around the whole cell. Initial open/closed state
    // follows Quarto's `code-fold` (document/project default or this
    // cell's own `#| code-fold:` override), resolved ahead of time by the
    // Lua filter into this.options["code-fold"] ("hide" or "show").
    const details = document.createElement("details");
    details.className = "qpyodide-code-fold";
    qpyodideSetFoldOpen(details, this.options["code-fold"] !== "hide");
    // Distinguishes a reader manually opening this cell from any
    // programmatic change (initial state above, "Show/Hide All Code",
    // or the nudge's own "show all" button) via the flag those set.
    details.addEventListener("toggle", () => {
      if (details.dataset.qpyodideProgrammatic) {
        delete details.dataset.qpyodideProgrammatic;
        return;
      }
      if (details.open) {
        qpyodideShowFoldNudge(details);
      }
    });
    const summary = document.createElement("summary");
    summary.textContent = QP_L.showPythonCode;
    details.appendChild(summary);

    // Main editor
    const unitHost = document.createElement("div");
    details.appendChild(unitHost);
    this.primaryUnit = new EditorUnit({
      uid: String(this.id),
      code: this.code,
      options: this.options,
      hostDiv: unitHost
    });
    this.units.push(this.primaryUnit);

    // "+ Code block" button: appends ONE additional, empty, editable
    // editor below the cell (useful e.g. under read-only examples). Uses
    // the same EditorUnit class – no duplicates.
    const addCodeBlockButton = document.createElement("button");
    addCodeBlockButton.className = "btn btn-default qpyodide-button qpyodide-button-codeblock";
    addCodeBlockButton.type = "button";
    addCodeBlockButton.id = `qpyodide-button-codeblock-${this.id}`;
    addCodeBlockButton.title = QP_L.addCodeBlockTitle;
    addCodeBlockButton.innerHTML = QP_L.addCodeBlockLabel;
    this.primaryUnit.toolbarDiv
      .querySelector(".qpyodide-editor-toolbar-right-buttons")
      .appendChild(addCodeBlockButton);

    const thiz = this;
    // At most one extra block ever exists per cell (the button disables
    // itself below after first use), so its identity can be a fixed
    // "extra:<parent identity>" -- no occurrence counter needed, unlike
    // computeIdentities()'s handling of duplicate original code. Registered
    // up front (before the block itself exists) so it's available both to
    // the click handler below and to the auto-restore check right after.
    const storage = globalThis.qpyodideStorage;
    const extraUid = `${this.id}.2`;
    const parentIdentity = storage?.identityFor(this.primaryUnit.uid);
    if (parentIdentity) {
      storage.registerIdentity(extraUid, "extra:" + parentIdentity);
    }

    function addExtraCodeBlock() {
      const extraHost = document.createElement("div");
      extraHost.className = "qpyodide-extra-codeblock";
      details.appendChild(extraHost);

      const extraOptions = { ...thiz.options, "read-only": "false", "autorun": "" };
      thiz.units.push(new EditorUnit({
        uid: extraUid,
        code: "",   // the extra block's "original" is always empty
        options: extraOptions,
        hostDiv: extraHost
      }));

      addCodeBlockButton.disabled = true;
    }

    addCodeBlockButton.onclick = addExtraCodeBlock;

    // A previous visit may have saved code into this cell's extra block --
    // recreate it right away with that code showing, same "restored, never
    // auto-run" rule as every other cell (EditorUnit's own constructor
    // does the actual restore, via the identity registered above). Guarded
    // by the same condition EditorUnit itself uses for storageCapable, so
    // a cell later opted out via `#| local-storage: false` never grows a
    // phantom empty block just because an old save still exists for it.
    if (parentIdentity && this.options["local-storage"] !== "false" &&
        storage.hasSaved(extraUid)) {
      addExtraCodeBlock();
    }

    mainDiv.appendChild(details);
    this.insertionLocation.appendChild(mainDiv);
  }

  /** autorun option: run the code once after Pyodide has started. */
  async runStartup() {
    if (this.options.autorun === "true") {
      await this.primaryUnit.runCode(this.code, { queued: true });
    }
  }
}

/**
 * OutputCell – runs the code at startup and shows only the output.
 */
class OutputCell extends BaseCell {
  constructor(cellData) {
    super(cellData);
    this.setupElement();
  }

  setupElement() {
    const mainDiv = document.createElement("div");
    mainDiv.id = `qpyodide-noninteractive-area-${this.id}`;
    mainDiv.className = "qpyodide-non-interactive-area";
    if (this.options.classes) {
      mainDiv.className += " " + this.options.classes;
    }
    if (this.options.label) {
      mainDiv.setAttribute("data-id", this.options.label);
    }

    // Loading indicator until the code has run at startup
    this.loadingContainer = document.createElement("div");
    this.loadingContainer.className =
      "qpyodide-non-interactive-loading-container qpyodide-cell-needs-evaluation";
    const statusText = document.createElement("p");
    statusText.className = "qpyodide-status-text qpyodide-cell-needs-evaluation";
    statusText.innerText = QP_L.runAtStartup;
    this.loadingContainer.appendChild(statusText);
    mainDiv.appendChild(this.loadingContainer);

    this.outputCodeDiv = document.createElement("div");
    this.outputCodeDiv.className = "qpyodide-output-code-area";
    this.outputCodeDiv.setAttribute("aria-live", "assertive");
    mainDiv.appendChild(this.outputCodeDiv);

    this.outputGraphDiv = document.createElement("div");
    this.outputGraphDiv.className = "qpyodide-output-graph-area";
    mainDiv.appendChild(this.outputGraphDiv);

    this.insertionLocation.appendChild(mainDiv);
  }

  // Idempotent: runs again after a hard worker restart without
  // duplicating output.
  async runStartup() {
    const result = await qpyodideExecutePython(
      this.code, globalThis.qpyodideCanvasWanted?.(this.options)
    );

    this.loadingContainer.remove();
    this.outputCodeDiv.innerHTML = "";
    this.outputGraphDiv.innerHTML = "";

    const hasText = qpyodideRenderTextOutput(this.outputCodeDiv, result.entries);
    if (result.html) {
      qpyodideRenderHtmlOutput(this.outputCodeDiv, result.html);
    }
    this.outputCodeDiv.classList.toggle("has-content", hasText || !!result.html);

    qpyodideRenderPlots(this.outputGraphDiv, result, this.options);
  }
}

/**
 * SetupCell – runs the code invisibly at startup.
 */
class SetupCell extends BaseCell {
  async runStartup() {
    // Output and any plots are deliberately discarded
    await qpyodideExecutePython(this.code);
  }
}

// ---------------------------------------------------------------------------
// Container + factory
// ---------------------------------------------------------------------------

/**
 * CellContainer – manages all cells in document order.
 */
class CellContainer {
  constructor() {
    this.cells = [];
  }

  addCell(cell) {
    this.cells.push(cell);
  }

  /**
   * Startup phase after Pyodide boots: first all setup cells, then
   * output cells, finally interactive cells with autorun. Once per start of
   * the worker; a restart stops it (the new start runs it from the top).
   */
  async runStartupCells() {
    const epoch = qpyodideRuntimeEpoch;
    if (this.startupEpoch === epoch) return this.startup;
    this.startupEpoch = epoch;
    const order = { setup: 0, output: 1, interactive: 2 };
    const sorted = this.cells.slice().sort((a, b) =>
      (order[a.options.context] ?? 2) - (order[b.options.context] ?? 2)
    );
    // Until the startup phase is over, starting(epoch) is a promise that a
    // clicked run waits for (runCode).
    let started;
    this.phase = { epoch, promise: new Promise((resolve) => { started = resolve; }), done: false };
    const phase = this.phase;
    const finishPreparing = () => { phase.done = true; started(); };
    this.startup = (async () => {
      try {
        for (const cell of sorted) {
          if (epoch !== qpyodideRuntimeEpoch) return;
          try {
            await cell.runStartup();
          } catch (err) {
            // A restart ends this run; the new start runs the cells again.
            if (err && err.restarted) return;
            console.error(`qpyodide: startup phase of cell ${cell.id} failed`, err);
          }
        }
      } finally {
        finishPreparing();
        if (epoch === qpyodideRuntimeEpoch) {
          globalThis.qpyodideStartupPhaseDone = true;
          window.dispatchEvent(new Event("qpyodide-startup-done"));
        }
      }
    })();
    return this.startup;
  }

  /** The promise a run clicked during start `epoch`'s startup phase waits for, or null. */
  starting(epoch) {
    const phase = this.phase;
    return phase && phase.epoch === epoch && !phase.done ? phase.promise : null;
  }
}

/**
 * Factory function to create different types of cells based on options.
 * @param {Object} cellData - JSON object containing code, id, and options.
 * @returns {BaseCell} Instance of the appropriate cell class.
 */
globalThis.qpyodideCreateCell = function(cellData) {
  switch (cellData.options.context) {
    case "interactive":
      return new InteractiveCell(cellData);
    case "output":
      return new OutputCell(cellData);
    case "setup":
      return new SetupCell(cellData);
    default:
      return new InteractiveCell(cellData);
  }
}

// Global container that qpyodide-cell-initialization.js populates
globalThis.qpyodideCellContainer = new CellContainer();
