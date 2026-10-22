// qpyodide-document-status.js – document status display
//
// Builds the "Loading Python …" status line into the title block and
// provides global helpers that other modules (engine init, cell classes,
// feedback) use to update the status and the buttons.
//
// The settings panel for AI feedback does NOT live here, but in its own
// module qpyodide-feedback.js – it attaches to the anchor created here,
// `#qpyodide-status-message-area`.

// Declare startup message element globally
globalThis.qpyodideStartupMessage = document.createElement("p");

// input() availability as global state (single source of truth for the
// Run button lock in qpyodide-cell-classes.js). input() needs cross-origin
// isolation; that doesn't change within a single page load (only a reload
// can enable it). States: "ok" | "check" (not yet checked) |
// "needs-reload" (auto-reload skipped, user must reload manually) |
// "unavailable" (checked, not possible). There's no visible UI for this
// anymore – the check reload below runs automatically and unnoticed in the
// background; only if input() is truly unavailable does the affected cell
// itself show a quiet notice (see updateInputGate() in
// qpyodide-cell-classes.js).
function qpyodideSetInputState(kind) {
  globalThis.qpyodideInputState = kind;
  window.dispatchEvent(new CustomEvent("qpyodide-input-state", { detail: kind }));
}
globalThis.qpyodideInputAvailable = () => globalThis.qpyodideInputState === "ok";
qpyodideSetInputState(globalThis.crossOriginIsolated ? "ok" : "check");

// Tracks whether the user has already interacted with the page
// (keyboard/mouse/touch). Prevents the automatic check reload from
// happening mid-input and discarding code already typed.
let qpyodideUserInteracted = false;
["keydown", "pointerdown", "input"].forEach((evt) =>
  window.addEventListener(evt, () => { qpyodideUserInteracted = true; },
    { capture: true, passive: true }));

// Automatic check reload: as soon as coi-serviceworker.js has registered
// the service worker (event "coi-sw-ready"), reload once automatically so
// that input() (SharedArrayBuffer) becomes available – unless the user is
// already typing somewhere at that moment, in which case it's skipped for
// this session (no loss of unsaved code). Runs independently of the
// startup message panel, so it also works with
// `show-startup-message: false` – which is why this is at module level
// and not in qpyodideDisplayStartupMessage().
console.log("[qpyodide-coi] initial state: " + globalThis.qpyodideInputState +
  " (crossOriginIsolated=" + globalThis.crossOriginIsolated + ")");

// The check reload, and what the page concludes when it did not help. The
// rules, in one place:
//  - A reload of this tab within 2 minutes of the check reload is recorded in
//    sessionStorage (qpyodide-coi-reload-sent, with a count).
//  - coi-serviceworker.js (ctm-libs, unchanged) ends the check from the
//    navigation type "reload". WebKit reports a reload by location.reload()
//    as "navigate" (seen in Playwright's WebKit, which cannot isolate with
//    COEP credentialless either): the page was not marked unavailable,
//    registered the worker again, got "ready" again and reloaded again,
//    every two seconds for as long as the tab stayed open.
//  - So a page that is ready, not isolated, and finds the record fresh
//    concludes itself: if the worker controls it, the check failed and
//    input() is unavailable here. If the worker does not control it (a hard
//    reload, Ctrl+Shift+R, bypasses the worker) the check has not failed: it
//    reloads once more (never more than two reloads within the 2 minutes).
//  - The conclusion is kept in localStorage (qpyodide-coi-check-failed, the
//    time) for 24 hours, then the check reload is made once more: one failure
//    on a first visit must not switch input() and Stop off for good. The
//    permanent verdict of coi-serviceworker.js (qpyodide-coi-unavailable-
//    <origin>) is left alone. A page that is isolated (the server's COOP/COEP
//    headers, as in an exam build, or the worker) deletes the conclusion.
const QPYODIDE_COI_SENT = "qpyodide-coi-reload-sent";
const QPYODIDE_COI_COUNT = "qpyodide-coi-reload-count";
const QPYODIDE_COI_FAILED = "qpyodide-coi-check-failed";
const QPYODIDE_COI_RECENT_MS = 120000;
const QPYODIDE_COI_FAILED_MS = 24 * 60 * 60 * 1000;

if (globalThis.crossOriginIsolated) {
  try { localStorage.removeItem(QPYODIDE_COI_FAILED); } catch (ex) { /* blocked */ }
} else {
  function qpyodideReloadsRecently() {
    try {
      const sent = Number(sessionStorage.getItem(QPYODIDE_COI_SENT));
      if (!(sent > 0 && Date.now() - sent < QPYODIDE_COI_RECENT_MS)) return 0;
      return Math.max(1, Number(sessionStorage.getItem(QPYODIDE_COI_COUNT)) || 1);
    } catch (ex) { return 0; /* blocked */ }
  }
  function qpyodideCheckFailedRecently() {
    try {
      const failed = Number(localStorage.getItem(QPYODIDE_COI_FAILED));
      return failed > 0 && Date.now() - failed < QPYODIDE_COI_FAILED_MS;
    } catch (ex) { return false; /* blocked */ }
  }
  function qpyodideHandleCoiReady() {
    if (qpyodideUserInteracted) {
      console.log("[qpyodide-coi] ready, but the user has already interacted – reload skipped.");
      qpyodideSetInputState("needs-reload");
      return;
    }
    if (qpyodideCheckFailedRecently()) {
      console.log("[qpyodide-coi] the check reload did not isolate this origin within the last 24 hours – input() is unavailable here.");
      qpyodideSetInputState("unavailable");
      return;
    }
    const reloads = qpyodideReloadsRecently();
    const controlled = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    if (reloads && (controlled || reloads >= 2)) {
      console.log("[qpyodide-coi] reloaded a moment ago and still not isolated – input() is unavailable here.");
      try { localStorage.setItem(QPYODIDE_COI_FAILED, String(Date.now())); } catch (ex) { /* blocked */ }
      qpyodideSetInputState("unavailable");
      return;
    }
    console.log("[qpyodide-coi] ready – triggering reload.");
    try {
      sessionStorage.setItem("qpyodide-coi-reload-pending", "1");
      sessionStorage.setItem(QPYODIDE_COI_SENT, String(Date.now()));
      sessionStorage.setItem(QPYODIDE_COI_COUNT, String(reloads + 1));
    } catch (ex) { /* blocked */ }
    location.reload();
  }
  function qpyodideHandleCoiUnavailable() {
    console.log("[qpyodide-coi] unavailable.");
    qpyodideSetInputState("unavailable");
  }

  // coi-serviceworker.js also stores its result synchronously in
  // globalThis.qpyodideCoiOutcome in addition to the event (see there).
  // Reason: this script can finish faster than coi-serviceworker.js fires
  // its event – e.g. if the SW is already active from an earlier reload –
  // a plain event listener would then miss it. First check the state
  // synchronously if it's already available, and only wait for the event
  // if it's still missing.
  if (globalThis.qpyodideCoiOutcome === "ready") {
    qpyodideHandleCoiReady();
  } else if (globalThis.qpyodideCoiOutcome === "unavailable") {
    qpyodideHandleCoiUnavailable();
  } else {
    window.addEventListener("coi-sw-ready", qpyodideHandleCoiReady, { once: true });
    window.addEventListener("coi-unavailable", qpyodideHandleCoiUnavailable, { once: true });

    // Fallback: if coi-serviceworker.js doesn't load at all (e.g. the page
    // opened directly as a file instead of via a web server – in which
    // case the absolute script path "/coi-serviceworker.js" points nowhere
    // under file://), neither "coi-sw-ready" nor "coi-unavailable" fires.
    // Without this fallback, cells with input() would hang forever in the
    // "activating" intermediate state.
    const qpyodideCoiFallback = setTimeout(() => {
      console.log("[qpyodide-coi] 5s fallback triggered (neither coi-sw-ready nor coi-unavailable arrived).");
      qpyodideSetInputState("unavailable");
    }, 5000);
    window.addEventListener("coi-sw-ready",    () => clearTimeout(qpyodideCoiFallback), { once: true });
    window.addEventListener("coi-unavailable", () => clearTimeout(qpyodideCoiFallback), { once: true });
  }
}

// Set the text/state of every Run- and Feedback-button on the page
globalThis.qpyodideSetInteractiveButtonState = function(buttonText, enableCodeButton = true) {
  document.querySelectorAll(".qpyodide-button-run").forEach((btn) => {
    btn.innerHTML = buttonText;
    // input() cells stay locked as long as input() is unavailable
    btn.disabled = !enableCodeButton ||
      (btn.dataset.needsInput === "1" && !globalThis.qpyodideInputAvailable());
  });
  // Feedback and its cancellation lifecycle are independent of Python startup.
}

// Update the status message in non-interactive (output/setup) cells
globalThis.qpyodideUpdateStatusMessage = function(message) {
  document.querySelectorAll(".qpyodide-status-text.qpyodide-cell-needs-evaluation").forEach((elem) => {
    elem.innerText = message;
  });
}

// Update the document status header with a spinner (loading phases)
globalThis.qpyodideUpdateStatusHeaderSpinner = function(message) {
  qpyodideStartupMessage.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin qpyodide-icon-status-spinner"></i>
    <span>${message}</span>`;
}

// Update the document status header with plain text (final states)
globalThis.qpyodideUpdateStatusHeader = function(message) {
  qpyodideStartupMessage.innerHTML = `<span>${message}</span>`;
}

// Attach the document status message to the title block (or create one)
function qpyodideDisplayStartupMessage(showStartupMessage) {
  if (!showStartupMessage) {
    return;
  }

  // Get references to header elements
  const headerHTML = document.getElementById("title-block-header");
  const headerRevealJS = document.getElementById("title-slide");

  // Create the outermost div element for metadata
  const quartoTitleMeta = document.createElement("div");
  quartoTitleMeta.classList.add("quarto-title-meta");

  // Create the status area; qpyodide-feedback.js appends its settings panel here
  const statusArea = document.createElement("div");
  statusArea.setAttribute("id", "qpyodide-status-message-area");

  // Create the heading div
  const statusTitle = document.createElement("div");
  statusTitle.setAttribute("id", "qpyodide-status-message-title");
  statusTitle.classList.add("quarto-title-meta-heading");
  statusTitle.innerText = "";

  // Create the contents div holding the live status text
  const statusContents = document.createElement("div");
  statusContents.setAttribute("id", "qpyodide-status-message-body");
  statusContents.classList.add("quarto-title-meta-contents");

  // Describe the Pyodide state
  qpyodideStartupMessage.innerText = QP_L.loadingPython;
  qpyodideStartupMessage.setAttribute("id", "qpyodide-status-message-text");
  // Add `aria-live` to auto-announce the startup status to screen readers
  qpyodideStartupMessage.setAttribute("aria-live", "assertive");

  // Status row: loading text on the left, buttons on the right – one compact row
  const statusRow = document.createElement("div");
  statusRow.style.cssText = "display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap";
  qpyodideStartupMessage.style.cssText = "flex:1; margin:0";
  statusRow.appendChild(qpyodideStartupMessage);

  // Right side: AI feedback button
  // qpyodide-feedback.js attaches its toggle button here (id: qpyodide-status-right)
  const statusRight = document.createElement("div");
  statusRight.id = "qpyodide-status-right";
  statusRight.style.cssText = "display:flex; align-items:center; gap:0.5rem; flex-shrink:0";
  statusRow.appendChild(statusRight);

  statusContents.appendChild(statusRow);

  // Collapsible panels below the status row
  // qpyodide-feedback.js attaches its settings panel here (id: qpyodide-status-panels)
  const statusPanels = document.createElement("div");
  statusPanels.id = "qpyodide-status-panels";
  statusContents.appendChild(statusPanels);

  // Combine the inner divs and contents
  statusArea.appendChild(statusTitle);
  statusArea.appendChild(statusContents);
  quartoTitleMeta.appendChild(statusArea);

  // Determine where to insert the quartoTitleMeta element
  if (headerHTML || headerRevealJS) {
    // Append to the existing "title-block-header" element or "title-slide" div
    (headerHTML || headerRevealJS).appendChild(quartoTitleMeta);
  } else {
    // If neither headerHTML nor headerRevealJS is found, insert after the
    // "qpyodide-monaco-editor-init" script
    const monacoScript = document.getElementById("qpyodide-monaco-editor-init");
    const header = document.createElement("header");
    header.setAttribute("id", "title-block-header");
    header.appendChild(quartoTitleMeta);
    monacoScript.after(header);
  }
}

qpyodideDisplayStartupMessage(qpyodideShowStartupMessage);
