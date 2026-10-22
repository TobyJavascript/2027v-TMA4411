// qpyodide-cell-initialization.js – build cells and kick off the startup phase
//
// Builds the matching cell for every code block collected by the Lua filter
// (see qpyodide-cell-classes.js) and runs the setup/output/autorun cells
// once the cells may run.

qpyodideCellDetails.forEach((entry) => {
  qpyodideCellContainer.addCell(qpyodideCreateCell(entry));
});

// Hook up Quarto's global "Code" tools (Show All Code / Hide All Code,
// rendered when `code-tools: true`). Quarto's own handler (in
// quarto-html-after-body.ejs) only toggles `.cell > details > .sourceCode`,
// which never matches our Monaco-based cells, so this adds an equivalent
// listener for every `.qpyodide-code-fold` <details> created above.
function qpyodideToggleAllFolds(open) {
  document.querySelectorAll(".qpyodide-code-fold").forEach((details) => {
    qpyodideSetFoldOpen(details, open);
  });
}
document.getElementById("quarto-show-all-code")
  ?.addEventListener("click", () => qpyodideToggleAllFolds(true));
document.getElementById("quarto-hide-all-code")
  ?.addEventListener("click", () => qpyodideToggleAllFolds(false));

// The startup cells run once this extension's cells may run (after the
// extra packages, D2; qpyodide-document-engine-initialization.js).
new Promise((resolve) => {
  if (globalThis.qpyodideCellsReady) resolve();
  else window.addEventListener("qpyodide-cells-ready", resolve, { once: true });
})
  .then(() => qpyodideCellContainer.runStartupCells())
  .catch((err) => console.error("qpyodide: startup phase failed", err));
