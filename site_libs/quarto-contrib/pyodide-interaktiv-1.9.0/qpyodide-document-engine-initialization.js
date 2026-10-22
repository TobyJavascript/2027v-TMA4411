// qpyodide-document-engine-initialization.js – start Python for this page
//
// Python runs in ctm-libs' worker (runtime/pyodide-worker.js, CTMWorker; one
// implementation for every CTM component), with this extension's part as its
// plugin (qpyodide-worker-plugin.js: runCell, the input() prompt, the plots).
// The page stays fully responsive during execution.
//
// Start-up in two stages (D2): the interpreter first, then the extra packages
// (pyodide_http, micropip, matplotlib) in the background, without getting in
// the way of other components' checks. This extension's cells wait for both:
// Run buttons, the "ready" status and the startup cells follow the second
// stage, so the learner sees what she saw before.
//
// Global interfaces for other modules/extensions (set by CTMWorker):
//   qpyodideReady    – Promise that resolves with the Pyodide proxy (the
//                      interpreter is ready; other components' checks run)
//   qpyodideInstance – alias for the same Promise (compatibility, used
//                      e.g. by Erasmus-CTM/py-exercise)
//   mainPyodide      – the proxy (set once the interpreter is ready);
//                      offers runPythonAsync, loadPackagesFromImports,
//                      loadPackage, globals.set, and toPy as RPC variants
// and of this extension:
//   qpyodideCellsReady – true while this extension's cells may run (the
//                      second stage is done, or failed: then cells run
//                      without the extra packages); event "qpyodide-cells-ready"

globalThis.qpyodideCellsReady = false;

// A restart replaces a start: its follower stops, the new start's takes over
// (CTMWorker rejects the old start and its whenSetup with error.restarted).
const qpyodideRestarted = (err) => !!(err && err.restarted);

// The extra packages could not be loaded: the status line says so and offers
// Retry, which repeats the missing steps without restarting Python. The
// reason is short (the package and the status); the console has the details.
// A restart during Retry is no failure: the new start's follower takes over.
function qpyodideShowSetupFailed(proxy, err) {
  const text = document.createElement("span");
  text.textContent = QP_L.setupFailed(String((err && err.message) || err));
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "btn btn-default qpyodide-button qpyodide-button-retry";
  retry.textContent = QP_L.setupRetry;
  retry.addEventListener("click", () => {
    qpyodideUpdateStatusHeaderSpinner(QP_L.workerInitPackages);
    proxy.retrySetup().then(
      () => qpyodideUpdateStatusHeader(QP_L.engineReady),
      (again) => {
        if (qpyodideRestarted(again)) return;
        console.warn("qpyodide: the extra packages could not be loaded", again);
        qpyodideShowSetupFailed(proxy, again);
      });
  });
  qpyodideStartupMessage.replaceChildren(text, " ", retry);
}

// Follows one start of the worker (the page's first, and each restart).
async function qpyodideFollowWorker(started, afterRestart) {
  globalThis.qpyodideCellsReady = false;
  // After a restart, Run waits for the new start, as on the first load.
  if (afterRestart) qpyodideSetInteractiveButtonState(QP_L.runLoading, false);
  const timerStart = performance.now();

  let proxy;
  try {
    proxy = await started;
  } catch (err) {
    if (!qpyodideRestarted(err)) qpyodideUpdateStatusHeader(QP_L.engineFailed(err.message));
    return;
  }

  let failure = null;
  try {
    await proxy.whenSetup;
  } catch (err) {
    if (qpyodideRestarted(err)) return;
    failure = err;
    console.warn("qpyodide: the extra packages could not be loaded", err);
  }

  // The cells run either way: code without matplotlib works, and a cell that
  // imports it shows the error in its output.
  globalThis.qpyodideCellsReady = true;
  qpyodideSetInteractiveButtonState(QP_L.runLabel, true);
  if (failure) {
    qpyodideShowSetupFailed(proxy, failure);
  } else {
    qpyodideUpdateStatusHeader(QP_L.engineReady);
  }

  const elapsed = (performance.now() - timerStart) / 1000;
  console.log(`qpyodide: Pyodide worker ready after ${elapsed.toFixed(1)}s`);
  window.dispatchEvent(new Event("qpyodide-cells-ready"));

  if (afterRestart) {
    await globalThis.qpyodideCellContainer?.runStartupCells();
  }
}

qpyodideFollowWorker(CTMWorker.start({
  indexURL: qpyodideCustomizedPyodideOptions.indexURL,
  // MPLBACKEND: a check that imports matplotlib before the plot setup gets
  // the backend the plot setup would set.
  env: { ...qpyodideCustomizedPyodideOptions.env, MPLBACKEND: "AGG" },
  packages: qpyodideSetupPythonPackages ? qpyodideInstallPythonPackagesList : [],
  background: {
    packages: ["pyodide_http", "micropip", "matplotlib"],
    // Shim requests/urllib3 (synchronous XHR is allowed in the worker)
    run: "import pyodide_http\npyodide_http.patch_all()"
  },
  plugin: QPYODIDE_WORKER_PLUGIN,
  commands: { runCell: ["code", "wantPickle"] },
  // Translated status texts for the worker (it doesn't know QP_L)
  messages: {
    loading:       QP_L.workerLoading,
    initPackages:  QP_L.workerInitPackages,
    extraPackages: QP_L.workerExtraPackages
  },
  onStatus: (text) => qpyodideUpdateStatusHeaderSpinner(text),
  onRestart: (again) => {
    qpyodideFollowWorker(again, true).catch((err) => console.error("qpyodide: restart failed", err));
  },
  publish: true
}), false).catch((err) => console.error("qpyodide: start-up failed", err));
