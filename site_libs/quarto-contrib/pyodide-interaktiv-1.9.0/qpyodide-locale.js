// qpyodide-locale.js – the UI text of this extension, in the page's language
//
// The strings are ctm-libs' catalogue pyodide-interaktiv (a classic head
// script, CTMLocales); globalThis.qpyodideLang comes from the settings
// script. The first module of the page: every later module reads QP_L.<key>
// and QP_L.engineFailed(message), QP_L.setupFailed(message).
globalThis.QP_L = CTMLocales.table("pyodide-interaktiv", globalThis.qpyodideLang);
