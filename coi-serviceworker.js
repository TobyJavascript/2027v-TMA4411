// coi-serviceworker.js – cross-origin isolation via a service worker
//
// Enables SharedArrayBuffer on HTTPS hosts without server-side COOP/COEP
// headers (e.g. GitHub Pages). The service worker intercepts all requests
// and attaches the required headers to the responses.
//
// Based on: https://github.com/gzuidhof/coi-serviceworker (MIT license)
//
// Flow:
//   1. The Lua filter copies this file into the project root during render.
//   2. The filter injects <script src="/coi-serviceworker.js"> into the HTML.
//   3. On the first page, the script registers the service worker and
//      waits for navigator.serviceWorker.ready (SW actually active, not
//      just registered).
//   4. qpyodide-document-status.js automatically reloads the page once the
//      SW is ready (event "coi-sw-ready") – unless the user is already
//      typing/clicking somewhere, in which case the reload is skipped for
//      this session → the SW intercepts the navigation →
//      crossOriginIsolated === true → input() available.
//
// Events sent to qpyodide-document-status.js:
//   "coi-sw-ready"    – SW registered AND active, triggers the automatic
//                       reload
//   "coi-unavailable" – COI unreachable on this origin (no SW support,
//                       registration failed, or a reload didn't help)
//
// Persistence:
//   sessionStorage "qpyodide-coi-reload-pending" – set before the check
//     reload; together with navigation.type "reload" we detect whether
//     the reload achieved COI or not.
//   localStorage "qpyodide-coi-unavailable-<origin>" – permanent verdict
//     once a reload has demonstrably not achieved COI. Prevents a repeated
//     "check" loop on later visits. Cleared once crossOriginIsolated ===
//     true (e.g. after a server configuration change).

if (typeof window === "undefined") {
  // ── Service worker context ──────────────────────────────────────────────
  // Attach COOP/COEP headers to every response

  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

  self.addEventListener("fetch", event => {
    const req = event.request;
    // Skip opaque requests (e.g. no-cors cross-origin)
    if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;

    // Cross-origin resources without CORS (e.g. <img src="https://…">) have to be
    // fetched WITHOUT credentials, otherwise COEP "credentialless" blocks the opaque
    // response (net::ERR_FAILED). Same as upstream coi-serviceworker.
    const request = req.mode === "no-cors"
      ? new Request(req, { credentials: "omit" })
      : req;

    event.respondWith(
      fetch(request).then(resp => {
        if (resp.status === 0) return resp;
        const headers = new Headers(resp.headers);
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        headers.set("Cross-Origin-Embedder-Policy", "credentialless");
        return new Response(resp.body, {
          status: resp.status,
          statusText: resp.statusText,
          headers,
        });
      })
    );
  });

} else {
  // ── Page context ─────────────────────────────────────────────────────────

  (function () {
    var RELOAD_FLAG = "qpyodide-coi-reload-pending";
    var LS_UNAVAIL  = "qpyodide-coi-unavailable-" + location.origin;

    function lsGet(k)    { try { return localStorage.getItem(k);      } catch (e) { return null; } }
    function lsSet(k, v) { try {   localStorage.setItem(k, v);        } catch (e) { /* blocked */ } }
    function lsDel(k)    { try {   localStorage.removeItem(k);         } catch (e) { /* blocked */ } }
    function ssGet(k)    { try { return sessionStorage.getItem(k);    } catch (e) { return null; } }
    function ssDel(k)    { try {   sessionStorage.removeItem(k);       } catch (e) { /* blocked */ } }
    function log(msg)    { console.log("[qpyodide-coi] " + msg); }

    // Also store the result synchronously in addition to the event
    // (globalThis.qpyodideCoiOutcome = "ready" | "unavailable"). Reason:
    // this script can finish faster than qpyodide-document-status.js has
    // registered its event listener – e.g. if the SW is already active
    // from an earlier reload. A CustomEvent fired only once would then go
    // unheard. Anyone who queries the state later (instead of only waiting
    // for the event) still gets it.
    function emit(kind) {
      globalThis.qpyodideCoiOutcome = kind;
      window.dispatchEvent(new CustomEvent(
        kind === "ready" ? "coi-sw-ready" : "coi-unavailable"));
    }

    // Already isolated: input() works. Revoke any earlier "unavailable" verdict.
    if (globalThis.crossOriginIsolated) {
      log("already crossOriginIsolated – nothing to do.");
      lsDel(LS_UNAVAIL);
      ssDel(RELOAD_FLAG);
      return;
    }

    // Service worker not supported (file://, very old browser).
    if (!("serviceWorker" in navigator)) {
      log("navigator.serviceWorker not available (file:// or old browser).");
      emit("unavailable");
      return;
    }

    // COI has already been permanently marked unavailable for this origin.
    if (lsGet(LS_UNAVAIL)) {
      log("already permanently marked unavailable per localStorage (" + LS_UNAVAIL + ").");
      emit("unavailable");
      return;
    }

    // Was this page load the user-triggered check reload?
    // If so and COI is still missing → permanently unavailable.
    var hadFlag = !!ssGet(RELOAD_FLAG);
    ssDel(RELOAD_FLAG);
    if (hadFlag) {
      var isReload = false;
      try { isReload = performance.getEntriesByType("navigation")[0].type === "reload"; } catch (e) { /* not available */ }
      log("reload flag was set, navigation.type=" +
        (performance.getEntriesByType("navigation")[0] || {}).type + ", isReload=" + isReload);
      if (isReload) {
        log("reload did not achieve COI – marking permanently unavailable.");
        lsSet(LS_UNAVAIL, "1");
        emit("unavailable");
        return;
      }
    }

    // Register the SW and wait for "ready" (= SW has completed activate()
    // including clients.claim()). register() alone is NOT enough: the
    // promise already resolves once the registration is created – often
    // milliseconds before the SW is actually active. An immediate reload
    // at that point (see qpyodide-document-status.js) would then miss the
    // navigation, crossOriginIsolated would stay false, and the reload
    // check above (hadFlag + isReload) would falsely mark the page as
    // permanently "unavailable".
    var swUrl = document.currentScript ? document.currentScript.src : "/coi-serviceworker.js";
    log("registering service worker: " + swUrl);
    navigator.serviceWorker.register(swUrl).then(function (reg) {
      log("register() resolved (scope=" + reg.scope + "), waiting for serviceWorker.ready …");
      return navigator.serviceWorker.ready;
    }).then(function () {
      log("serviceWorker.ready – firing coi-sw-ready.");
      emit("ready");
    }).catch(function (err) {
      log("register()/ready failed: " + err);
      lsSet(LS_UNAVAIL, "1");
      emit("unavailable");
    });
  }());
}
