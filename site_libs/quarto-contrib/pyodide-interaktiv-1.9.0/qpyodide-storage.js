// qpyodide-storage.js – localStorage autosave for editable Pyodide cells
//
// Opt-in via `pyodide: local-storage: true` (document YAML, see
// globalThis.qpyodideLocalStorageOptions in qpyodide-document-settings.js)
// or a per-cell `#| local-storage: true/false` override. When enabled for a
// cell:
//   - code typed into its editor is autosaved to localStorage (debounced),
//     keyed by page path + a stable cell identity
//   - on page load, saved code (if any) replaces the cell's original code
//     in the editor -- but is NEVER executed automatically
// Only source code is persisted -- never output or Python state, so nothing
// here needs to serialize arbitrary interpreter state.
//
// Cell identity (stable across reorders where possible), resolved once per
// page load from the full cellDetails list (document order):
//   1. explicit `#| label: ...`          -- stable across content edits
//   2. hash of the cell's original code  -- stable when cells move, not
//                                           when their original code changes
//   3. occurrence number appended to #2 when identical original code
//      appears more than once on the page (last-resort disambiguation)
// Numeric position is deliberately never used alone: inserting a cell
// earlier on the page would shift every later position and restore code
// into the wrong editor.
//
// Independent of the document/cell settings above, a student can switch
// autosave off for themselves on this device -- a checkbox built by
// qpyodide-storage-settings.js into its settings gear (isUserDisabled/setUserDisabled
// below; this module owns no UI of its own). That preference is a hard
// override: it wins even over a cell's own `#| local-storage: true`, applies
// to every page on this site (not namespaced by path, unlike the saved code
// itself -- it's a device-wide "leave nothing behind here" switch), and
// persists until the student flips it back on.
//
// Turning it off never discards code already saved, and turning it back on
// never needs a reload: cellEnabled() re-reads the preference fresh on every
// call (see EditorUnit.scheduleSave() in qpyodide-cell-classes.js, which
// re-checks right before it actually writes), and restoring previously
// saved code into an editor never depended on this preference in the first
// place -- only load() below, which only depends on the identity resolved.

globalThis.qpyodideStorage = (function () {
  const STORAGE_PREFIX = "qpyodide:code:";
  // Deliberately NOT namespaced by page path: device-wide preferences, so
  // setting them on one page carries over to every other page of the course.
  const USER_DISABLED_KEY = "qpyodide:local-storage-user-disabled";
  // Manual-save mode: off (autosave-as-you-type) by default; when on, each
  // cell shows an explicit Save button instead and autosave never fires
  // (see EditorUnit.scheduleSave() in qpyodide-cell-classes.js).
  const MANUAL_MODE_KEY = "qpyodide:local-storage-manual-mode";

  // Small, fast, non-cryptographic string hash (djb2) -- collisions are
  // harmless here (worst case: two cells briefly share a save slot until
  // one gets a `#| label:`), so this doesn't need to be cryptographically
  // strong, just stable and cheap.
  function djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36);
  }

  // Same rule as qpyodideCreateCell() in qpyodide-cell-classes.js: every
  // context except "output"/"setup" -- including the empty default that
  // `main` uses since the echo/include mapping -- becomes an InteractiveCell.
  function isInteractive(options) {
    const context = (options && options.context) || "";
    return context !== "output" && context !== "setup";
  }

  function computeIdentities(cellDetails) {
    const seenHashes = Object.create(null);
    const identities = Object.create(null);

    (cellDetails || []).forEach((entry) => {
      // Only editable, interactive cells ever get a code editor a student
      // can type into -- output/setup cells have nothing to restore.
      if (!isInteractive(entry.options)) return;

      const label = (entry.options.label || "").trim();
      if (label) {
        identities[entry.id] = "label:" + label;
        return;
      }

      const hash = djb2(entry.code || "");
      const occurrence = (seenHashes[hash] = (seenHashes[hash] || 0) + 1);
      identities[entry.id] = occurrence === 1
        ? "hash:" + hash
        : "hash:" + hash + ":" + occurrence;
    });

    return identities;
  }

  function storageKey(identity) {
    // Keeps Week 1 / Week 2 / IDE page etc. separate: each lives at its own
    // path, so each gets its own slice of localStorage.
    //
    // The epoch (off by default -- see `pyodide: local-storage-epoch:` in
    // qpyodide.lua) is folded in first: when set, a key built under the
    // current epoch can never match anything saved under a previous one, so
    // load()/hasSaved() simply find nothing -- functionally identical to
    // the old save having been cleared, without this module ever having to
    // find and delete the actual old entries (they just become permanently
    // unreachable bytes; harmless, and never surfaced back to a reader).
    const epoch = globalThis.qpyodideLocalStorageOptions?.epoch || "";
    const epochPart = epoch ? "epoch:" + epoch + ":" : "";
    return STORAGE_PREFIX + epochPart + location.pathname + ":" + identity;
  }

  // localStorage can throw (private browsing, disabled storage, quota) --
  // that must never break the page, only silently skip persistence.
  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function safeRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function isUserDisabled() {
    return safeGet(USER_DISABLED_KEY) === "1";
  }
  function setUserDisabled(disabled) {
    if (disabled) safeSet(USER_DISABLED_KEY, "1");
    else safeRemove(USER_DISABLED_KEY);
  }

  function isManualMode() {
    return safeGet(MANUAL_MODE_KEY) === "1";
  }
  function setManualMode(manual) {
    if (manual) safeSet(MANUAL_MODE_KEY, "1");
    else safeRemove(MANUAL_MODE_KEY);
  }

  const docEnabled = !!globalThis.qpyodideLocalStorageOptions?.enabled;
  const identities = computeIdentities(globalThis.qpyodideCellDetails);

  // Whether the toggle is worth showing at all: only if the feature could
  // possibly apply to some cell on this page (document default, or at least
  // one cell opting in on its own even though the document default is off).
  const anyEnabled = docEnabled || (globalThis.qpyodideCellDetails || []).some(
    (entry) => isInteractive(entry.options) &&
      entry.options["local-storage"] === "true"
  );

  return {
    // Whether ANY cell can use local storage at all this document. Individual
    // cells still need cellEnabled() -- a cell's own `#| local-storage:`
    // overrides this document default either way.
    docEnabled,

    // Identities are normally all resolved up front from the document's
    // static cellDetails (see computeIdentities() above) -- but a "+ Code
    // block" editor doesn't exist yet at that point (it's created later, in
    // the browser). registerIdentity() lets qpyodide-cell-classes.js give
    // such a dynamically-created cell an identity of its own on the fly, so
    // it can use load()/save()/clear()/hasSaved() below exactly like any
    // other cell. identityFor() looks up an already-resolved identity (e.g.
    // a "+ Code block" button asking for its own parent cell's identity, to
    // derive a stable "extra:<parent identity>" identity for itself).
    registerIdentity(cellId, identity) {
      identities[cellId] = identity;
    },
    identityFor(cellId) {
      return identities[cellId] || null;
    },

    // Whether the settings gear needs an autosave section at all: only if
    // the feature could possibly apply to some cell on this page (document
    // default, or at least one cell opting in on its own even though the
    // document default is off). Read by qpyodide-feedback.js to decide
    // whether to build the gear even when AI feedback itself is disabled.
    anyEnabled,

    // The student's own device-wide preferences (see the file header
    // comment and MANUAL_MODE_KEY above). Read/written by the checkboxes
    // qpyodide-feedback.js builds into its settings panel.
    isUserDisabled,
    setUserDisabled,
    isManualMode,
    setManualMode,

    // Cascading precedence, same pattern as `pdf-fallback`/`*-autoexec`,
    // with the student's own device-wide preference as the final override.
    // Re-reads isUserDisabled() fresh every call -- never cache this.
    cellEnabled(options) {
      if (isUserDisabled()) return false;
      const override = options["local-storage"];
      if (override === "true") return true;
      if (override === "false") return false;
      return docEnabled;
    },

    load(cellId) {
      const identity = identities[cellId];
      if (!identity) return null;
      return safeGet(storageKey(identity));
    },

    save(cellId, code) {
      const identity = identities[cellId];
      if (!identity) return false;
      return safeSet(storageKey(identity), code);
    },

    clear(cellId) {
      const identity = identities[cellId];
      if (!identity) return;
      safeRemove(storageKey(identity));
    },

    hasSaved(cellId) {
      const identity = identities[cellId];
      if (!identity) return false;
      return safeGet(storageKey(identity)) !== null;
    },

    // Wipes every locally-saved cell across every page on this site (not
    // just the current page/epoch) -- the device-wide cleanup a student
    // uses e.g. before handing back a shared/loaner machine. Never touches
    // the two device-wide preference keys above (those are settings, not
    // saved code). Returns the number of entries removed.
    clearAll() {
      let keys;
      try {
        keys = Object.keys(window.localStorage);
      } catch (e) {
        return 0;
      }
      const toRemove = keys.filter((key) => key.indexOf(STORAGE_PREFIX) === 0);
      toRemove.forEach(safeRemove);
      return toRemove.length;
    },

    // Wipes only the entries saved for the current page (any epoch), for a
    // reader who wants a fresh start here without touching their saved code
    // on other pages of the same project. Matches on ":" + pathname + ":"
    // rather than parsing the key apart -- storageKey() deliberately keeps
    // epoch and identity unparsed since either can itself contain colons
    // (see storageKey() above), but a URL pathname does not, so it can
    // still be found as an exact colon-delimited segment. Returns the
    // number of entries removed.
    clearPage() {
      let keys;
      try {
        keys = Object.keys(window.localStorage);
      } catch (e) {
        return 0;
      }
      const marker = ":" + location.pathname + ":";
      const toRemove = keys.filter((key) =>
        key.indexOf(STORAGE_PREFIX) === 0 && key.indexOf(marker) !== -1
      );
      toRemove.forEach(safeRemove);
      return toRemove.length;
    }
  };
})();
