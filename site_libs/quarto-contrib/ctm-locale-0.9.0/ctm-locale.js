/* CTM Assessment languages (ctm-libs) — AGPL-3.0-or-later.
 * One resolver and one message catalogue for every component: the global
 * CTMLocales. Each catalogue file (locales/<namespace>.js) calls
 * CTMLocales.add(namespace, catalogue); lua/locale.lua reads the same JSON.
 *
 * Entries: a string (may hold HTML); data (arrays, objects without $ keys);
 * {"$ref": "<ns>.<key>"} (same language); {"$t": "... {arg} ...", "$args": [...]}
 * (a function of its positional arguments, "$lookup": {arg: dataKey} maps an
 * argument through a data entry with a "*" default); and plurals
 * {"$args": [...], "$plural": arg, "one": ..., "other": ...} ("one" when the
 * argument is exactly 1). */
(function (root) {
  'use strict';
  if (root.CTMLocales && typeof root.CTMLocales.add === 'function') return;

  var catalogues = Object.create(null);
  var tables = Object.create(null);
  var has = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };

  function add(namespace, catalogue) {
    catalogues[namespace] = catalogue;
    for (var key in tables) if (key.indexOf(namespace + '|') === 0) delete tables[key];
  }

  // Lowercase primary subtag; no -> nb.
  function normalize(tag) {
    var primary = String(tag == null ? '' : tag).trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    return primary === 'no' ? 'nb' : primary;
  }

  // Languages to try, in order: nb-NO -> nb, en; nn -> nn, nb, en; de-CH -> de, en.
  function chain(tag) {
    var primary = normalize(tag), list = [];
    if (primary) list.push(primary);
    if (primary === 'nn') list.push('nb');
    if (list.indexOf('en') < 0) list.push('en');
    return list;
  }

  function languages(namespace) {
    var catalogue = catalogues[namespace];
    return catalogue && Array.isArray(catalogue.$languages) ? catalogue.$languages.slice() : [];
  }

  // The first language of the tag's chain that the namespace supports.
  function resolve(namespace, tag) {
    var supported = languages(namespace), list = chain(tag);
    for (var i = 0; i < list.length; i++) if (supported.indexOf(list[i]) >= 0) return list[i];
    return 'en';
  }

  function raw(namespace, lang, key) {
    var catalogue = catalogues[namespace];
    if (!catalogue) throw new Error('CTMLocales: no catalogue ' + namespace);
    if (catalogue[lang] && has(catalogue[lang], key)) return {entry: catalogue[lang][key], lang: lang};
    if (catalogue.en && has(catalogue.en, key)) return {entry: catalogue.en[key], lang: 'en'};
    throw new Error('CTMLocales: ' + namespace + ' has no message ' + key);
  }

  function special(entry) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    return Object.keys(entry).some(function (key) { return key.charAt(0) === '$'; });
  }

  function fill(text, values) {
    return String(text).replace(/\{([A-Za-z_][\w-]*)\}/g, function (match, name) {
      return has(values, name) ? String(values[name]) : match;
    });
  }

  function compile(namespace, lang, entry, seen) {
    if (!special(entry)) return entry;
    if (has(entry, '$ref')) {
      var target = String(entry.$ref), dot = target.indexOf('.');
      if (seen.indexOf(target) >= 0) throw new Error('CTMLocales: circular $ref ' + target);
      var found = raw(target.slice(0, dot), lang, target.slice(dot + 1));
      return compile(target.slice(0, dot), found.lang, found.entry, seen.concat([target]));
    }
    var names = entry.$args || [];
    var lookups = entry.$lookup || {};
    return function () {
      var values = Object.create(null);
      for (var i = 0; i < names.length; i++) values[names[i]] = arguments[i];
      for (var name in lookups) {
        var data = raw(namespace, lang, lookups[name]).entry;
        values[name] = has(data, values[name]) ? data[values[name]] : data['*'];
      }
      if (has(entry, '$plural')) return fill(values[entry.$plural] === 1 ? entry.one : entry.other, values);
      return fill(entry.$t, values);
    };
  }

  // The namespace's messages in the tag's language: strings, data and
  // functions, with English for any key the language lacks (one console warning).
  function table(namespace, tag) {
    var lang = resolve(namespace, tag), cacheKey = namespace + '|' + lang;
    if (tables[cacheKey]) return tables[cacheKey];
    var catalogue = catalogues[namespace];
    if (!catalogue) throw new Error('CTMLocales: no catalogue ' + namespace);
    var english = catalogue.en || {}, own = catalogue[lang] || {}, out = {}, missing = [];
    for (var key in english) {
      if (!has(english, key)) continue;
      var mine = has(own, key);
      if (!mine && lang !== 'en') missing.push(key);
      out[key] = compile(namespace, mine ? lang : 'en', mine ? own[key] : english[key], []);
    }
    if (missing.length && typeof console !== 'undefined') {
      console.warn('CTMLocales: ' + namespace + ' has no ' + lang + ' text for ' + missing.join(', ') + '; using English.');
    }
    tables[cacheKey] = out;
    return out;
  }

  // One message: t('math-exercise', 'resPartial', 'nb', 50).
  function t(namespace, key, tag) {
    var value = table(namespace, tag)[key];
    return typeof value === 'function' ? value.apply(null, Array.prototype.slice.call(arguments, 3)) : value;
  }

  root.CTMLocales = {add: add, normalize: normalize, chain: chain, languages: languages, resolve: resolve, table: table, t: t};
})(globalThis);
