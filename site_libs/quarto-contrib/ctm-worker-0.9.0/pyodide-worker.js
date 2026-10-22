/* ctm-libs runtime/pyodide-worker.js — AGPL-3.0-or-later.
 * CTMWorker: Python (Pyodide) in a Web Worker for a page (HTML dependency
 * ctm-worker, a classic script after ctm-runtime). One implementation of the
 * worker and its RPC, moved from pyodide-interaktiv 1.8
 * (qpyodide-document-engine-initialization.js); a component adds its own
 * worker-side commands as a plugin (pyodide-interaktiv: runCell).
 *
 * Python runs in its own thread, so the page stays responsive during long
 * computations. Stopping a running computation:
 *   - cross-origin isolated page (COOP/COEP headers, or coi-serviceworker.js):
 *     a KeyboardInterrupt through a SharedArrayBuffer; variables are kept;
 *   - otherwise: the worker restarts (variables are lost).
 * input() works through Atomics.wait on a SharedArrayBuffer (isolated pages).
 *
 *   CTMWorker.start(options) -> Promise of the proxy (docs/api.md)
 *
 * The proxy is what `await qpyodideReady` and `mainPyodide` give other
 * components (publish: true): runPythonAsync, loadPackagesFromImports,
 * loadPackage, globals.set, toPy, isWorkerProxy, interrupt, clearInterrupt,
 * abortInput, provideInput, restart, the shared buffers, onStream,
 * onInputRequired, and the plugin's commands. */
(function (root) {
  'use strict';
  if (root.CTMWorker && typeof root.CTMWorker.start === 'function') return;

  // ---------------------------------------------------------------------------
  // Worker source (runs in the background thread)
  // ---------------------------------------------------------------------------
  // Important: String.raw, so escape sequences arrive in the worker unchanged.
  // Don't use backticks or "dollar-curly-brace" in the worker source!
  var WORKER_SOURCE = String.raw`
// Pyodide worker of ctm-libs (CTMWorker)
let pyodide = null;
let runEntries = [];

// Input buffer for Atomics-based stdin (null if unavailable)
let inputStatusBuf = null;   // Int32Array(SharedArrayBuffer) 0=idle 1=waiting 2=ready 3=aborted
let inputDataBuf   = null;   // Uint8Array(SharedArrayBuffer) UTF-8-encoded input (null-terminated)

// Prompt text of the next input() call (set through the plugins' setPrompt)
let pendingInputPrompt = "";

// stdin: blocks the worker thread until the user enters something.
// Called by Pyodide as the stdin handler when Python executes input().
// First sends a request to the main thread, then the worker waits via
// Atomics.wait (blocks only the worker thread, not the page).
// If no SharedArrayBuffer is available, stdin returns null (EOF).
function stdin() {
  if (!inputStatusBuf || !inputDataBuf) return null;
  const prompt = pendingInputPrompt;
  pendingInputPrompt = "";
  Atomics.store(inputStatusBuf, 0, 1);              // status: waiting
  self.postMessage({ type: "inputRequired", prompt }); // notify the main thread
  Atomics.wait(inputStatusBuf, 0, 1);               // block until status != 1
  const status = Atomics.load(inputStatusBuf, 0);
  Atomics.store(inputStatusBuf, 0, 0);              // status: idle
  if (status !== 2) return null;                    // aborted (status 3) -> EOF
  let end = 0;
  while (end < inputDataBuf.length && inputDataBuf[end] !== 0) end++;
  return new TextDecoder().decode(inputDataBuf.slice(0, end)) + "\n";
}

function postStatus(text) {
  self.postMessage({ type: "status", text: text });
}

// Plugins: a component's worker-side code calls registerPlugin(factory);
// factory(api) returns {commands: {name: async (message) => value},
// stage1: "<Python run once the interpreter is ready>"}.
// api.pyodide(): the interpreter; api.capture: the stdout/stderr evidence of
// a command (start() empties it, push(entry), entries()); api.setPrompt(text):
// the prompt of the next input() call (Pyodide's stdout is line-buffered, so
// a prompt without a newline would never reach the page otherwise).
const plugins = [];
const pluginCommands = {};
const pluginAPI = {
  pyodide: () => pyodide,
  capture: {
    start() { runEntries = []; },
    push(entry) { runEntries.push(entry); },
    entries() { return runEntries; }
  },
  setPrompt(text) { pendingInputPrompt = String(text); }
};
function registerPlugin(factory) {
  const plugin = factory(pluginAPI) || {};
  plugins.push(plugin);
  for (const name of Object.keys(plugin.commands || {})) pluginCommands[name] = plugin.commands[name];
}

// Start-up in two stages (D2, step-3 design §18.5). Stage 1 (init): the
// interpreter, the plugins' stage-1 Python and, when the page asks for them,
// micropip and its packages; then the proxy is ready and other components'
// checks run. Stage 2 (setup): the background packages (pyodide-interaktiv:
// pyodide_http, micropip, matplotlib) without ever making a check wait for
// their downloads: they are fetched in byte ranges outside Pyodide's package
// lock, paused while a command downloads, and installed one at a time, from
// the verified bytes (below), while nothing else runs.
let config = null;
async function init(cfg) {
  config = cfg;
  // Shorter limits for tests only (tests/worker.test.cjs, tests/browser/worker.mjs).
  const timing = cfg.timing || {};
  if (timing.range) RANGE = timing.range;
  if (timing.resumeAfter !== undefined) RESUME_AFTER = timing.resumeAfter;
  if (timing.stall) STALL = timing.stall;
  if (timing.retryAfter) RETRY_AFTER = timing.retryAfter;
  if (timing.slowInstall) SLOW_INSTALL = timing.slowInstall;
  if (timing.installQuiet !== undefined) INSTALL_QUIET = timing.installQuiet;
  if (timing.installCeiling !== undefined) INSTALL_CEILING = timing.installCeiling;
  // Translated status texts come along from the main thread
  const msg = config.messages || {};
  const mod = await import(config.indexURL + "pyodide.mjs");

  postStatus(msg.loading || "Loading Python (Pyodide) ...");
  pyodide = await mod.loadPyodide({
    indexURL: config.indexURL,
    // Preserve the pre-0.28 JavaScript-null behaviour for existing lessons.
    convertNullToNone: true,
    env: config.env,
    stdin: stdin,
    stdout: function(text) {
      runEntries.push({ message: text, type: "stdout" });
      self.postMessage({ type: "streamStdout", text: text });
    },
    stderr: function(text) {
      runEntries.push({ message: text, type: "stderr" });
      self.postMessage({ type: "streamStderr", text: text });
    }
  });

  // Packages requested by the page (pyodide: packages: [...]): a check may
  // import them, so they belong to stage 1.
  if (config.packages && config.packages.length > 0) {
    postStatus(msg.initPackages || "Initialising Python packages ...");
    await pyodide.loadPackage("micropip");
    postStatus(msg.extraPackages || "Installing additional packages ...");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(config.packages);
    micropip.destroy();
  }

  for (const plugin of plugins) {
    if (plugin.stage1) await pyodide.runPythonAsync(plugin.stage1);
  }
}

// --- Commands that may download, and the queue's state ---------------------
// busy: commands queued or running; downloads: those of them that may
// download (loadPackage, loadPackagesFromImports of a package not yet
// loaded); lastDownload: when the last such command ended; lastCommand: when
// the last command of any kind ended.
let RANGE = 512 * 1024;          // bytes per prefetch request
let RESUME_AFTER = 2000;         // ms of quiet after a download command
let STALL = 30000;               // ms without a byte: the range is requested again
let RETRY_AFTER = [5000, 30000]; // then a third failure ends stage 2
let SLOW_INSTALL = 60000;        // an install this long is named in the status line
let INSTALL_QUIET = 300;         // ms of quiet after any command before an install
let INSTALL_CEILING = 5000;      // ms an install waits for that quiet at most
let busy = 0, downloads = 0, lastDownload = -Infinity, lastCommand = -Infinity;
let wakers = [];
function changed() {
  const list = wakers;
  wakers = [];
  for (const wake of list) wake();
}
// Resolves once ready() returns true; ready() may return a delay in ms to be
// asked again then, or false to be asked again when the queue changes.
function until(ready) {
  return new Promise(resolve => {
    const check = () => {
      const answer = ready();
      if (answer === true) resolve();
      else if (typeof answer === "number") setTimeout(check, answer);
      else wakers.push(check);
    };
    check();
  });
}
function quiet() {
  return until(() => {
    if (downloads > 0) return false;
    const left = lastDownload + RESUME_AFTER - performance.now();
    return left <= 0 ? true : left;
  });
}
// Runs task in the command queue once nothing is queued or running and no
// command has ended for INSTALL_QUIET ms; it is queued at that very moment,
// so a command arriving later waits for it. The quiet time keeps an install
// out of the gaps between a check's calls (each call is a round trip from
// the page), so a check of k calls meets at most one install, not k.
// Ceiling: commands that never leave INSTALL_QUIET ms between them would
// postpone the installs for as long as they go on, so a task that has waited
// INSTALL_CEILING ms takes the next moment nothing is queued or running.
// Each task's wait starts when the previous one has ended, so installs are
// at least INSTALL_CEILING ms apart, and a check shorter than that still
// meets at most one.
function whenIdle(task) {
  const since = performance.now();
  return until(() => {
    if (busy > 0) return false;
    const now = performance.now();
    if (now - since >= INSTALL_CEILING) return true;
    const left = Math.min(lastCommand + INSTALL_QUIET, since + INSTALL_CEILING) - now;
    return left <= 0 ? true : left;
  }).then(() => {
    const run = commandQueue.then(task);
    commandQueue = run.catch(() => {});
    return run;
  });
}

// --- Pyodide's lock file: packages, their files and imports ----------------
const canonical = name => String(name).toLowerCase().replace(/[-_.]+/g, "-");
let lockPackages = null, lockImports = null;
async function readLock() {
  if (lockPackages) return;
  // The URL loadPyodide read it from (start-up put it in the browser's cache).
  const response = await fetch(config.indexURL + "pyodide-lock.json");
  if (!response.ok) throw new Error("HTTP " + response.status + " for pyodide-lock.json");
  const lock = await response.json();
  const packages = {}, imports = {};
  for (const [key, entry] of Object.entries(lock.packages || {})) {
    const name = canonical(entry.name || key);
    packages[name] = entry;
    for (const module of entry.imports || []) imports[module] = name;
  }
  lockPackages = packages;
  lockImports = imports;
}
function isLoaded(name) {
  const wanted = canonical(name);
  return Object.keys(pyodide.loadedPackages || {}).some(loaded => canonical(loaded) === wanted);
}
// The packages and their dependencies, dependencies first.
function closure(names) {
  const order = [], seen = new Set();
  const visit = name => {
    const key = canonical(name);
    if (seen.has(key)) return;
    seen.add(key);
    const entry = lockPackages && lockPackages[key];
    for (const dependency of (entry && entry.depends) || []) visit(dependency);
    order.push(key);
  };
  names.forEach(visit);
  return order;
}
function mayDownload(msg) {
  if (msg.type === "loadPackage") return !pyodide || [].concat(msg.name).some(name => !isLoaded(name));
  if (msg.type !== "loadPackagesFromImports") return false;
  if (!pyodide || !lockImports) return true;
  try {
    const found = pyodide.code.find_imports(msg.code);
    const modules = found.toJs();
    found.destroy();
    return modules.some(module => lockImports[module] && !isLoaded(lockImports[module]));
  } catch (err) {
    return true;
  }
}

// --- Stage 2 -----------------------------------------------------------------
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// The wheels of stage 2 are installed from the bytes the prefetch received,
// once their SHA-256 equals the lock file's: the worker answers loadPackage's
// request for such a URL itself, so an install never downloads and never
// depends on whether the browser's HTTP cache serves a full request from
// cached byte ranges. With jsDelivr's wheel responses (a weak ETag,
// Vary: Accept-Encoding, no Accept-Ranges) Chromium did not: installs
// downloaded inside Pyodide's lock again, and in CI they failed with
// "Failed to fetch". Where the bytes can be verified and kept (crypto.subtle
// and the Cache Storage, i.e. a secure context) the prefetch bypasses the
// HTTP cache, and the Cache Storage "ctm-pyodide-wheels" keeps verified
// wheels for the next page; elsewhere (a plain-HTTP origin) the prefetch
// fills the HTTP cache, as before. A wheel that does not verify is fetched
// by loadPackage as usual.
const WHEEL_CACHE = "ctm-pyodide-wheels";
const verified = new Map();   // URL -> Uint8Array, until installed
const networkFetch = globalThis.fetch;
globalThis.fetch = function(input, init) {
  const url = typeof input === "string" ? input : (input && input.href) || (input && input.url) || String(input);
  const bytes = verified.get(url);
  if (bytes) return Promise.resolve(new Response(bytes, { status: 200, headers: { "Content-Type": "application/octet-stream" } }));
  return networkFetch(input, init);
};
// Verified bytes can be kept for the next page (secure contexts).
function keepsWheels() {
  return !!(globalThis.crypto && crypto.subtle && globalThis.caches);
}
async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
// Holds bytes for url when they are the lock file's wheel; true if so.
async function holdVerified(url, bytes, sha256) {
  try {
    if (!sha256 || !globalThis.crypto || !crypto.subtle || (await sha256Hex(bytes)) !== String(sha256).toLowerCase()) return false;
  } catch (err) {
    return false;
  }
  verified.set(url, bytes);
  return true;
}
async function cachedWheel(url) {
  try {
    if (!globalThis.caches) return null;
    const response = await (await caches.open(WHEEL_CACHE)).match(url);
    return response ? new Uint8Array(await response.arrayBuffer()) : null;
  } catch (err) {
    return null;
  }
}
async function keepWheel(url, bytes) {
  try {
    if (globalThis.caches) await (await caches.open(WHEEL_CACHE)).put(url, new Response(bytes));
  } catch (err) { /* only the next page's download is lost */ }
}
function joined(chunks, length) {
  const bytes = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.byteLength; }
  return bytes;
}
// One byte range; a request without a byte for STALL ms counts as failed.
// Returns the bytes received and the file's size when the server names it.
// Errors are short (the status line shows them); the URL goes to the console.
async function fetchRange(url, start) {
  const controller = new AbortController();
  let timer = null, stalled = false;
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => { stalled = true; controller.abort(); }, STALL); };
  arm();
  try {
    const response = await networkFetch(url, { headers: { Range: "bytes=" + start + "-" + (start + RANGE - 1) }, ...(keepsWheels() ? { cache: "no-store" } : {}), signal: controller.signal });
    if (response.status === 416) return { received: 0, total: start, chunks: [] };
    if (response.status !== 206 && response.status !== 200) throw new Error("HTTP " + response.status);
    const reader = response.body.getReader();
    let received = 0;
    const chunks = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      chunks.push(value);
      arm();
    }
    if (response.status === 200) return { received, total: received, chunks, whole: true };
    const range = /\/(\d+)\s*$/.exec(response.headers.get("Content-Range") || "");
    return { received, total: range ? Number(range[1]) : (received < RANGE ? start + received : null), chunks };
  } catch (err) {
    throw stalled ? new Error("no data for " + (STALL < 1000 ? STALL + " ms" : Math.round(STALL / 1000) + " s")) : err;
  } finally {
    clearTimeout(timer);
  }
}
// The error names the package once ("matplotlib: HTTP 404"), for the
// status line; the console gets the URL.
async function fetchRangeWithRetries(file, start) {
  for (let attempt = 0; ; attempt++) {
    await quiet();
    try {
      return await fetchRange(file.url, start);
    } catch (err) {
      if (attempt < RETRY_AFTER.length) { await sleep(RETRY_AFTER[attempt]); continue; }
      const reason = String((err && err.message) || err);
      console.warn("CTMWorker: stage 2 could not download " + file.url + " (bytes from " + start + ", " + (attempt + 1) + " tries): " + reason);
      throw new Error(file.name + ": " + reason);
    }
  }
}
// Every file of the named packages, from the URLs loadPackage will request,
// one range at a time, smallest file first (sizes are learnt from the first
// range of each); a wheel the Cache Storage has (verified) is not fetched.
// Each complete file is verified and held for its install (above).
async function prefetch(names) {
  const files = names.map(name => lockPackages[name]).filter(entry => entry && entry.file_name)
    .map(entry => ({ name: entry.name || entry.file_name, url: new URL(entry.file_name, config.indexURL).href, sha256: entry.sha256, next: 0, total: null, chunks: [] }));
  const finish = async file => {
    const bytes = joined(file.chunks, file.next);
    file.chunks = [];
    if (await holdVerified(file.url, bytes, file.sha256)) await keepWheel(file.url, bytes);
  };
  const open = [];
  for (const file of files) {
    const kept = await cachedWheel(file.url);
    if (kept && await holdVerified(file.url, kept, file.sha256)) continue;
    const got = await fetchRangeWithRetries(file, 0);
    file.next = got.received;
    file.total = got.total;
    file.chunks.push(...got.chunks);
    // A whole file (200), or the server's total reached (a small wheel).
    if (got.whole || (file.total !== null && file.next >= file.total)) await finish(file);
    else open.push(file);
  }
  open.sort((a, b) => (a.total === null ? Infinity : a.total) - (b.total === null ? Infinity : b.total));
  for (const file of open) {
    while (file.total === null || file.next < file.total) {
      const got = await fetchRangeWithRetries(file, file.next);
      if (got.received === 0) break;
      file.next += got.received;
      file.chunks.push(...got.chunks);
      if (got.total !== null) file.total = got.total;
    }
    await finish(file);
  }
}
// A failed loadPackage does not reject: Pyodide reports the error through
// errorCallback and goes on. The package is then not loaded, and stage 2
// fails with a short reason that names it ("matplotlib: Failed to load
// 'matplotlib-3.8.4-cp313-cp313-pyodide_2025_0_wasm32.whl': request
// failed."), file names instead of URLs; the console gets Pyodide's text.
function shortReason(text) {
  return String(text).split("\n")[0].replace(/https?:\/\/[^\s'"]*\/([^\s'"\/]+)/g, "$1").slice(0, 200);
}
async function install(name) {
  const entry = lockPackages && lockPackages[name];
  const label = (entry && entry.name) || name;
  const started = performance.now();
  const errors = [];
  const slow = setTimeout(() => {
    postStatus(((config.messages || {}).initPackages || "Initialising Python packages ...") + " (" + label + ")");
  }, SLOW_INSTALL);
  try {
    await pyodide.loadPackage(label, { checkIntegrity: true, errorCallback: text => { errors.push(String(text)); } });
  } finally {
    clearTimeout(slow);
  }
  if (entry && entry.file_name) verified.delete(new URL(entry.file_name, config.indexURL).href);
  if (!isLoaded(name)) {
    console.warn("CTMWorker: stage 2 could not install " + label + ": " + (errors.join("\n") || "not loaded"));
    const reason = errors.find(text => !/^The following error occurred/.test(text)) || "not installed";
    throw new Error(label + ": " + shortReason(reason));
  }
  return performance.now() - started;
}
let setupRunning = null;
async function setup() {
  const steps = config.background || {};
  const packages = steps.packages || [];
  if (packages.length || steps.run) postStatus((config.messages || {}).initPackages || "Initialising Python packages ...");
  if (packages.length) {
    let lock = true;
    try { await readLock(); } catch (err) { lock = false; }
    const wanted = closure(packages).filter(name => !isLoaded(name));
    // Without the lock file there is nothing to prefetch: the installs
    // download inside Pyodide's lock, one package at a time.
    if (lock) await prefetch(wanted);
    for (const name of wanted) {
      if (!isLoaded(name)) await whenIdle(() => install(name));
    }
  }
  if (steps.run) await whenIdle(() => pyodide.runPythonAsync(steps.run));
}
function startSetup() {
  if (setupRunning) return setupRunning;
  setupRunning = setup().then(
    () => { self.postMessage({ type: "setup", ok: true }); },
    err => { setupRunning = null; self.postMessage({ type: "setup", ok: false, message: String((err && err.message) || err) }); });
  return setupRunning;
}

// Raw Python call (RPC variant of runPythonAsync, e.g. for
// py-exercise). Result must be structured-clone-capable.
async function runPythonRaw(code) {
  const result = await pyodide.runPythonAsync(code);
  if (result && typeof result.toJs === "function") {
    let value;
    try {
      value = result.toJs({ dict_converter: Object.fromEntries, create_pyproxies: false });
    } catch (err) {
      value = String(result);
    }
    result.destroy();
    return value;
  }
  return result;
}

async function handleMessage(msg) {
  try {
    let value = true;
    switch (msg.type) {
      case "init":
        await init(msg.config);
        // Stage 2 starts once the answer to init is on its way.
        setTimeout(startSetup, 0);
        break;
      case "setInterrupt":
        pyodide.setInterruptBuffer(msg.buffer);
        break;
      case "setInputBuffers":
        inputStatusBuf = msg.inputStatusBuf;
        inputDataBuf   = msg.inputDataBuf;
        break;
      case "runPython":
        value = await runPythonRaw(msg.code);
        break;
      case "loadPackagesFromImports":
        await pyodide.loadPackagesFromImports(msg.code);
        break;
      case "loadPackage":
        await pyodide.loadPackage(msg.name);
        break;
      case "setGlobal":
        pyodide.globals.set(msg.name, pyodide.toPy(msg.value));
        break;
      default:
        if (!Object.prototype.hasOwnProperty.call(pluginCommands, msg.type)) throw new Error("Unknown command: " + msg.type);
        value = await pluginCommands[msg.type](msg);
    }
    self.postMessage({ type: "result", id: msg.id, value: value });
  } catch (err) {
    self.postMessage({ type: "error", id: msg.id, message: String((err && err.message) || err) });
  }
}

// Python has one interpreter and one output capture. Serialize mutations so a
// checker from another extension cannot enter a document cell's stdout evidence.
// Input/interrupt buffers are control messages, independent of this queue.
// The queue's state (busy, downloads) lets stage 2 yield to every command.
let commandQueue = Promise.resolve();
self.onmessage = function(event) {
  const msg = event.data;
  if (msg.type === "setInterrupt" || msg.type === "setInputBuffers") {
    return handleMessage(msg);
  }
  if (msg.type === "setupRetry") {
    startSetup();
    return Promise.resolve();
  }
  const download = mayDownload(msg);
  busy++;
  if (download) downloads++;
  const pending = commandQueue.then(() => handleMessage(msg));
  commandQueue = pending.catch(() => {});
  const done = () => {
    busy--;
    lastCommand = performance.now();
    if (download) { downloads--; lastDownload = lastCommand; }
    changed();
  };
  pending.then(done, done);
  return pending;
};
`;

  // ---------------------------------------------------------------------------
  // Main thread: start the worker + provide the RPC proxy
  // ---------------------------------------------------------------------------

  // options (all optional but indexURL):
  //   indexURL      Pyodide's base URL (ctm.runtime.indexURL() or a project's base-url)
  //   env           the interpreter's environment ({HOME: ...})
  //   packages      micropip packages to install before the proxy is ready (stage 1)
  //   background    {packages: [names], run: "Python"}: stage 2, after the
  //                 proxy is ready (proxy.whenSetup); never in a check's way
  //   plugin        worker-side source that calls registerPlugin(...)
  //   commands      {name: [argument names]}: the plugin's commands on the proxy
  //   messages      {loading, initPackages, extraPackages}: status texts
  //   onStatus(text)        a status text from the worker
  //   onRestart(started)    after restart(): the new start's promise
  //   publish       true: qpyodideReady, qpyodideInstance, _qpyodideGetInstance
  //                 and mainPyodide (the globals other components use)
  // Test-only: globalThis.__ctmWorkerNoBackground = true skips stage 2 (the
  // loading measurements compare a page with and without it); options.timing
  // shortens stage 2's limits.
  function start(options = {}) {
    const started = bootPyodideWorker(options);
    if (options.publish) publish(started);
    return started;
  }

  function publish(started) {
    globalThis.mainPyodide = undefined;
    globalThis.qpyodideReady = started;

    // Compatibility alias: older extensions (e.g. py-exercise) expect
    // `qpyodideInstance` and `await` on it.
    globalThis.qpyodideInstance = started;

    // Create a function to retrieve the promise object.
    globalThis._qpyodideGetInstance = function() {
      return globalThis.qpyodideInstance;
    }

    // A failed start is the components' to report.
    started.catch(() => {});
  }

  function bootPyodideWorker(options) {
    const pending = new Map();
    let nextId = 1;

    const blobUrl = URL.createObjectURL(
      new Blob([WORKER_SOURCE + (options.plugin ? "\n" + options.plugin + "\n" : "")], { type: "text/javascript" })
    );
    const worker = new Worker(blobUrl, { type: "module" });

    // After restart(): the restart's error. The worker is gone, so calls on
    // this proxy reject at once instead of waiting for an answer that never
    // comes.
    let gone = null, replacement = null;
    function rpc(type, payload = {}) {
      if (gone) return Promise.reject(gone);
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        worker.postMessage({ type, id, ...payload });
      });
    }

    // Stage 2: proxy.whenSetup resolves (with the proxy) when the background
    // packages are installed, or rejects; proxy.retrySetup() tries the
    // missing steps again without restarting Python.
    let setup = null;
    function expectSetup() {
      setup = {};
      setup.promise = new Promise((resolve, reject) => { setup.resolve = resolve; setup.reject = reject; });
      setup.promise.catch(() => {});   // the components report it
      proxy.whenSetup = setup.promise;
      return setup.promise;
    }

    worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === "setup")        { if (msg.ok) setup.resolve(proxy); else setup.reject(new Error(msg.message)); return; }
      if (msg.type === "status")      { options.onStatus?.(msg.text); return; }
      if (msg.type === "streamStdout") { proxy.onStream?.(msg.text, "stdout"); return; }
      if (msg.type === "streamStderr") { proxy.onStream?.(msg.text, "stderr"); return; }
      if (msg.type === "inputRequired") { proxy.onInputRequired?.(msg.prompt ?? ""); return; }
      const entry = pending.get(msg.id);
      if (!entry) return;
      pending.delete(msg.id);
      if (msg.type === "error") {
        entry.reject(new Error(msg.message));
      } else {
        entry.resolve(msg.value);
      }
    };

    worker.onerror = (event) => {
      console.error("CTMWorker: error in the Pyodide worker", event);
    };

    // Proxy object: what `await qpyodideReady` / `mainPyodide` resolves to.
    // The Pyodide-like methods are RPC variants, so that extensions like
    // py-exercise keep working (postMessage guarantees ordering, so e.g.
    // globals.set may be called without await before runPythonAsync).
    const proxy = {
      isWorkerProxy: true,
      interruptBuffer: null,
      inputStatusBuf: null,     // Int32Array(SharedArrayBuffer) – input status
      inputDataBuf: null,       // Uint8Array(SharedArrayBuffer) – input data (UTF-8)
      onStream: null,           // Callback(text, type) – streamed stdout/stderr
      onInputRequired: null,    // Callback() – Python is waiting for input
      whenSetup: null,          // Promise: stage 2 done (see above)

      runPythonAsync: (code) => rpc("runPython", { code }),
      loadPackagesFromImports: (code) => rpc("loadPackagesFromImports", { code }),
      loadPackage: (name) => rpc("loadPackage", { name }),
      toPy: (value) => value,   // conversion happens worker-side
      globals: {
        set: (name, value) => rpc("setGlobal", { name, value })
      },

      /** Graceful abort (KeyboardInterrupt) – only with SharedArrayBuffer. */
      interrupt() {
        if (this.interruptBuffer) this.interruptBuffer[0] = 2;   // SIGINT
        this.abortInput();
      },
      clearInterrupt() {
        if (this.interruptBuffer) this.interruptBuffer[0] = 0;
      },

      /** Aborts a pending input() wait in the worker (status 3 = aborted). */
      abortInput() {
        if (this.inputStatusBuf && Atomics.load(this.inputStatusBuf, 0) === 1) {
          Atomics.store(this.inputStatusBuf, 0, 3);
          Atomics.notify(this.inputStatusBuf, 0, 1);
        }
      },

      /** Delivers an input value to the waiting worker (status 2 = ready). */
      provideInput(text) {
        if (!this.inputStatusBuf || !this.inputDataBuf) return;
        const encoded = new TextEncoder().encode(text);
        this.inputDataBuf.fill(0);
        this.inputDataBuf.set(encoded.slice(0, this.inputDataBuf.length - 1));
        Atomics.store(this.inputStatusBuf, 0, 2);
        Atomics.notify(this.inputStatusBuf, 0, 1);
      },

      /**
       * Hard restart: terminate the worker, reject all pending calls and
       * whenSetup (error.restarted is true), and boot a fresh runtime
       * (options.onRestart: startup cells run again). Later calls on this
       * proxy reject at once; restarting it again returns the same new start.
       */
      restart(reason) {
        if (gone) return replacement;
        window.dispatchEvent(new Event("qpyodide-runtime-restart"));
        worker.terminate();
        const error = new Error(reason || "Python was restarted.");
        error.restarted = true;
        gone = error;
        for (const entry of pending.values()) entry.reject(error);
        pending.clear();
        setup.reject(error);   // whoever waits for stage 2 stops waiting

        const again = bootPyodideWorker(options);
        replacement = again;
        if (options.publish) publish(again);
        options.onRestart?.(again);
        return again;
      },

      /** Stage 2 again, for the steps that are missing (Python keeps running). */
      retrySetup() {
        const promise = expectSetup();
        if (gone) setup.reject(gone);
        else worker.postMessage({ type: "setupRetry" });
        return promise;
      }
    };

    // The plugin's commands, e.g. runCell: (code, wantPickle) => rpc("runCell", { code, wantPickle })
    for (const [name, args] of Object.entries(options.commands || {})) {
      proxy[name] = (...values) => rpc(name, Object.fromEntries(args.map((arg, i) => [arg, values[i]])));
    }
    expectSetup();

    const started = (async () => {
      if (options.messages?.loading) options.onStatus?.(options.messages.loading);

      try {
        await rpc("init", {
          config: {
            indexURL: options.indexURL,
            env: options.env || {},
            packages: options.packages || [],
            background: globalThis.__ctmWorkerNoBackground === true ? {} : (options.background || {}),
            messages: options.messages || {},
            timing: options.timing
          }
        });
      } finally {
        URL.revokeObjectURL(blobUrl);
      }

      // Enable the shared buffer if the page is cross-origin isolated.
      // Interrupt buffer: graceful abort (KeyboardInterrupt).
      // Input buffer: Atomics-based input() (Python pauses via Atomics.wait).
      if (globalThis.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined") {
        try {
          proxy.interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
          await rpc("setInterrupt", { buffer: proxy.interruptBuffer });

          proxy.inputStatusBuf = new Int32Array(new SharedArrayBuffer(4));
          proxy.inputDataBuf   = new Uint8Array(new SharedArrayBuffer(4096));
          await rpc("setInputBuffers", {
            inputStatusBuf: proxy.inputStatusBuf,
            inputDataBuf:   proxy.inputDataBuf
          });
        } catch (err) {
          proxy.interruptBuffer = null;
          proxy.inputStatusBuf  = null;
          proxy.inputDataBuf    = null;
          console.warn("CTMWorker: shared buffer unavailable", err);
        }
      }

      if (options.publish && globalThis.qpyodideReady === started) globalThis.mainPyodide = proxy;

      return proxy;
    })();
    return started;
  }

  root.CTMWorker = { start: start, source: WORKER_SOURCE };
})(globalThis);
