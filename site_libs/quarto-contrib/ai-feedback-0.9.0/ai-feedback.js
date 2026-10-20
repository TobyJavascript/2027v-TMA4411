/* Browser interface for AI Feedback — AGPL-3.0-or-later. */
(function (root) {
  'use strict';
  const F = root.AIFeedback;
  if (!F || F.attach) return;
  const CONFIG_KEY = 'ai-feedback-config-v1';
  // BEGIN GENERATED FEEDBACK STRINGS (locales/feedback.js; python scripts/sync-feedback-defaults.py)
  const locale = {"en": {"button": "Feedback", "settings": "Feedback settings", "response": "Your response", "busy": "Getting feedback…", "cancelled": "Feedback cancelled.", "stale": "Your response changed. Request feedback again for the current version.", "copy": "Copy prompt", "copied": "Copied", "save": "Save settings", "saved": "Settings saved.", "cancel": "Cancel", "images": "Upload images", "clear": "Remove images", "storage": "Storage", "session": "This tab", "local": "Remember on this device", "mode": "Mode", "api": "Direct API", "url": "API base URL", "key": "Personal API key", "model": "Model", "models": "Fetch models", "privacy": "Direct feedback sends your response, selected context and images to the chosen provider.", "imageNote": "PNG, JPEG or WebP; up to three images, 8 MiB each and 12 MiB total. Images are not saved in browser storage.", "prompt": "Paste this prompt into your chosen AI chat.", "choose": "Choose a model", "legacy": "Use saved settings from", "invalidImage": "Use PNG, JPEG or WebP images within the size limit.", "hint": "Hint", "attachImages": "Attach these images in your AI chat as well."}, "de": {"button": "Feedback", "settings": "KI-Feedback einrichten", "response": "Deine Antwort", "busy": "Feedback wird geladen…", "cancelled": "Feedback abgebrochen.", "stale": "Deine Antwort hat sich geändert. Fordere erneut Feedback an.", "copy": "Prompt kopieren", "copied": "Kopiert", "save": "Einstellungen speichern", "saved": "Einstellungen gespeichert.", "cancel": "Abbrechen", "images": "Bilder hochladen", "clear": "Bilder entfernen", "storage": "Speicherung", "session": "Dieser Tab", "local": "Auf diesem Gerät merken", "mode": "Modus", "api": "Direkte API", "url": "API-Basis-URL", "key": "Persönlicher API-Schlüssel", "model": "Modell", "models": "Modelle abrufen", "privacy": "Direktes Feedback sendet deine Antwort, Kontext und Bilder an den gewählten Anbieter.", "imageNote": "PNG, JPEG oder WebP; höchstens drei Bilder, je 8 MiB und insgesamt 12 MiB. Bilder werden nicht dauerhaft gespeichert.", "prompt": "Füge diesen Prompt in deinen KI-Chat ein.", "choose": "Modell wählen", "legacy": "Gespeicherte Einstellungen übernehmen von", "invalidImage": "Verwende PNG-, JPEG- oder WebP-Bilder innerhalb der Größenbegrenzung.", "hint": "Hinweis", "attachImages": "Füge diese Bilder ebenfalls in deinem KI-Chat an."}, "nb": {"button": "Tilbakemelding", "settings": "Innstillinger for KI", "response": "Svaret ditt", "busy": "Henter tilbakemelding…", "cancelled": "Avbrutt.", "stale": "Svaret ditt er endret. Be om ny tilbakemelding.", "copy": "Kopier instruksjon", "copied": "Kopiert", "save": "Lagre innstillinger", "saved": "Innstillinger lagret.", "cancel": "Avbryt", "images": "Last opp bilder", "clear": "Fjern bilder", "storage": "Lagring", "session": "Denne fanen", "local": "Husk på denne enheten", "mode": "Modus", "api": "Direkte API", "url": "API-adresse", "key": "Personlig API-nøkkel", "model": "Modell", "models": "Hent modeller", "privacy": "Direkte tilbakemelding sender svaret, konteksten og bildene til valgt leverandør.", "imageNote": "PNG, JPEG eller WebP; opptil tre bilder, 8 MiB hver og 12 MiB totalt. Bilder lagres ikke i nettleserlagringen.", "prompt": "Lim inn instruksjonen i din valgte KI-chat.", "choose": "Velg modell", "legacy": "Bruk lagrede innstillinger fra", "invalidImage": "Bruk PNG-, JPEG- eller WebP-bilder innenfor størrelsesgrensen.", "hint": "Hint", "attachImages": "Legg også ved disse bildene i KI-chatten."}, "es": {"button": "Comentarios", "settings": "Configurar IA", "response": "Tu respuesta", "busy": "Obteniendo comentarios…", "cancelled": "Cancelado.", "stale": "Tu respuesta ha cambiado. Solicita comentarios de nuevo.", "copy": "Copiar instrucciones", "copied": "Copiado", "save": "Guardar configuración", "saved": "Configuración guardada.", "cancel": "Cancelar", "images": "Subir imágenes", "clear": "Quitar imágenes", "storage": "Almacenamiento", "session": "Esta pestaña", "local": "Recordar en este dispositivo", "mode": "Modo", "api": "API directa", "url": "URL base de la API", "key": "Clave API personal", "model": "Modelo", "models": "Obtener modelos", "privacy": "Los comentarios directos envían tu respuesta, contexto e imágenes al proveedor elegido.", "imageNote": "PNG, JPEG o WebP; hasta tres imágenes, 8 MiB cada una y 12 MiB en total. Las imágenes no se guardan en el almacenamiento del navegador.", "prompt": "Pega estas instrucciones en tu chat de IA.", "choose": "Elegir modelo", "legacy": "Usar configuración guardada de", "invalidImage": "Usa imágenes PNG, JPEG o WebP dentro del límite de tamaño.", "hint": "Pista", "attachImages": "Adjunta también estas imágenes en tu chat de IA."}};
  // END GENERATED FEEDBACK STRINGS
  function lang(code) { const key = String(code || document.documentElement.lang || 'en').toLowerCase().replace(/_/g, '-').split('-')[0]; return locale[key === 'no' || key === 'nn' ? 'nb' : key] || locale.en; }
  function node(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
  function button(text) { const el = node('button', text, 'ai-feedback-button'); el.type = 'button'; return el; }
  function store(kind) { try { return root[kind === 'local' ? 'localStorage' : 'sessionStorage']; } catch { return null; } }
  let memoryConfig = null;
  function loadConfig() {
    for (const kind of ['local', 'session']) {
      try { const saved = JSON.parse(store(kind)?.getItem(CONFIG_KEY) || 'null'); if (saved) return { ...saved, storage: kind }; } catch {}
    }
    if (memoryConfig) return { ...memoryConfig };
    return { mode: root.__aiFeedbackConfig?.mode || 'copy', storage: root.__aiFeedbackConfig?.storage || 'local', baseUrl: root.__aiFeedbackConfig?.baseUrl || '', model: root.__aiFeedbackConfig?.model || '', apiKey: '' };
  }
  function saveConfig(config) {
    memoryConfig = { ...config };
    try { store(config.storage)?.setItem(CONFIG_KEY, JSON.stringify(config)); store(config.storage === 'local' ? 'session' : 'local')?.removeItem(CONFIG_KEY); } catch {}
  }
  let settings;
  function openSettings() {
    if (!settings) buildSettings();
    if (!settings.open) { settings.populate?.(loadConfig()); if (settings.showModal) settings.showModal(); else settings.setAttribute('open', ''); }
  }
  function closeSettings() { if (settings?.close) settings.close(); else settings?.removeAttribute('open'); }
  function settingsButton(code) { const L = lang(code); const gear = button('⚙'); gear.classList.add('ai-feedback-gear'); gear.title = L.settings; gear.setAttribute('aria-label', L.settings); gear.onclick = openSettings; return gear; }
  function buildSettings() {
    if (settings) return settings;
    const L = lang();
    settings = node('dialog', undefined, 'ai-feedback-settings');
    settings.id = 'ai-feedback-settings';
    settings.setAttribute('aria-labelledby', 'ai-feedback-settings-title');
    const title = node('h2', L.settings); title.id = 'ai-feedback-settings-title';
    const close = button(L.cancel); close.onclick = closeSettings;
    settings.append(title, close);
    const form = node('div', undefined, 'ai-feedback-settings-grid');
    const fields = {};
    function field(name, label, choices, type = 'text') {
      const wrap = node('label', label);
      const input = node(choices ? 'select' : 'input');
      if (choices) for (const [value, text] of choices) input.add(new Option(text, value));
      else input.type = type;
      input.autocomplete = 'off'; wrap.append(input); form.append(wrap); fields[name] = input;
      return input;
    }
    field('mode', L.mode, [['copy', L.copy], ['api', L.api]]);
    field('baseUrl', L.url); field('apiKey', L.key, null, 'password'); field('model', L.model);
    field('storage', L.storage, [['session', L.session], ['local', L.local]]);
    function populate(cfg) { for (const [k, v] of Object.entries(cfg)) if (fields[k]) fields[k].value = v; }
    settings.populate = populate;
    populate(loadConfig());
    const message = node('p'); message.setAttribute('role', 'status');
    // Existing configurations are offered explicitly; never silently choose among providers.
    for (const [key, label] of [['math-exercise-llm-config', 'math-exercise'], ['qpyodide-feedback-config', 'Pyodide']]) {
      let saved;
      for (const kind of ['session', 'local']) { try { saved ||= JSON.parse(store(kind)?.getItem(key) || 'null'); } catch {} }
      if (saved) { const migrate = button(L.legacy + ' ' + label); migrate.onclick = () => populate({ ...saved, mode: saved.mode || 'api' }); form.append(migrate); }
    }
    const models = button(L.models);
    const choices = node('select'); choices.setAttribute('aria-label', L.model); choices.hidden = true;
    models.onclick = async () => {
      models.disabled = true;
      try {
        const url = new URL(fields.baseUrl.value);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Use a valid API base URL.');
        const response = await fetch(url.href.replace(/\/+$/, '') + '/models', { headers: fields.apiKey.value ? { Authorization: 'Bearer ' + fields.apiKey.value } : {}, signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('API ' + response.status);
        const data = await response.json(); choices.replaceChildren();
        choices.add(new Option(L.choose, ''));
        for (const model of (data.data || []).filter(m => typeof m.id === 'string' && !F.modelPolicy(m.id).incompatible)) choices.add(new Option(model.id, model.id));
        choices.hidden = false;
      } catch (e) { message.textContent = e.message; } finally { models.disabled = false; }
    };
    choices.onchange = () => { if (choices.value) fields.model.value = choices.value; };
    const save = button(L.save);
    save.onclick = () => { const cfg = {}; for (const key of ['mode', 'baseUrl', 'apiKey', 'model', 'storage']) cfg[key] = fields[key].value.trim(); saveConfig(cfg); message.textContent = L.saved; closeSettings(); };
    form.append(models, choices, save, message, node('p', L.privacy, 'ai-feedback-notice'));
    settings.append(form);
    document.body.append(settings);
    return settings;
  }
  function getClient() { return F.createClient(loadConfig(), { storage: store(loadConfig().storage) }); }
  function signature(request) { return JSON.stringify(request); }
  function attach(options) {
    const { button: trigger, output, getRequest } = options;
    const L = lang(options.uiLanguage);
    let controller, disposed = false, quietCancellation = false;
    let count = 0;
    const counterKey = options.id ? 'ai-feedback-hints-v2|' + location.pathname + '|' + options.id : null;
    try { count = Number(store('session')?.getItem(counterKey)) || 0; } catch {}
    let policyFingerprint;
    function syncPolicy() {
      if (!options.integration) return;
      const fingerprint = JSON.stringify(F.resolvePolicy(options.integration, options.uiLanguage, options.policyDefaults, undefined, options.policySelection));
      if (fingerprint === policyFingerprint) return;
      const changed = policyFingerprint !== undefined;
      policyFingerprint = fingerprint;
      try {
        if (changed || store('session')?.getItem(counterKey + '|policy') !== fingerprint) {
          count = 0; store('session')?.removeItem(counterKey);
          store('session')?.setItem(counterKey + '|policy', fingerprint);
        }
      } catch { if (changed) count = 0; }
    }
    async function run() {
      if (controller || disposed) return;
      const original = trigger.textContent;
      trigger.disabled = true; trigger.textContent = L.busy;
      output.replaceChildren(); output.setAttribute('aria-busy', 'true');
      quietCancellation = false;
      controller = new AbortController();
      const cancel = button(L.cancel); cancel.onclick = () => controller?.abort(); output.append(cancel);
      try {
        syncPolicy();
        const hintLevel = count + 1;
        async function collect() {
          let request = await getRequest({ hintLevel });
          const refs = typeof options.contextRefs === 'function' ? options.contextRefs() : options.contextRefs;
          if (refs) {
            const visual = await F.collectVisualContexts(refs);
            request = {...request, materials:[...(request.materials || []), ...visual.materials],
              attachments:[...(request.attachments || []), ...visual.attachments]};
          }
          if (options.integration) request = F.applyPolicy(options.integration, request, hintLevel, options.policyDefaults, options.policySelection);
          if (request.feedback?.mode === 'hints') return { ...request, feedback: { ...request.feedback, level: Math.min(hintLevel, request.feedback.steps.length) } };
          return request;
        }
        const request = await collect();
        const snapshot = signature(request);
        const cfg = loadConfig();
        let reply;
        if (options.client || cfg.mode === 'api') reply = await (options.client || getClient()).request(request, { ...options.requestOptions, signal: controller.signal });
        else reply = { text: F.buildPrompt(request), format: 'prompt' };
        if (controller.signal.aborted) throw new F.FeedbackError('ABORTED', L.cancelled);
        const current = signature(await collect());
        if (controller.signal.aborted || disposed) throw new F.FeedbackError('ABORTED', L.cancelled);
        if (snapshot !== current) { output.textContent = L.stale; return; }
        output.replaceChildren();
        if (reply.format === 'prompt') {
          output.append(node('p', L.prompt));
          const pre = node('pre', reply.text, 'ai-feedback-prompt'); output.append(pre);
          const images = F.normalizeRequest(request).attachments;
          if (images.length) {
            output.append(node('p', (locale[String(options.uiLanguage || 'en').split('-')[0]] || locale.en).attachImages));
            const previews = node('div', undefined, 'ai-feedback-images');
            for (const image of images) {
              const figure = node('figure'); const preview = node('img'); preview.src = image.dataUrl; preview.alt = image.label;
              const download = node('a', image.label); download.href = image.dataUrl;
              download.download = image.id.replace(/[^a-z0-9_-]/gi, '-') + '.' + image.dataUrl.match(/^data:image\/([^;]+)/)[1];
              figure.append(preview, download); previews.append(figure);
            }
            output.append(previews);
          }
          const copy = button(L.copy); copy.onclick = async () => { try { await navigator.clipboard.writeText(reply.text); copy.textContent = L.copied; } catch { pre.setAttribute('tabindex', '0'); pre.focus(); } }; output.append(copy);
        } else {
          const body = node('div', undefined, 'ai-feedback-body');
          body.innerHTML = F.renderMarkdown(reply.text); output.append(body);
          try { await F.typesetFeedback(body); }
          catch (error) { console.warn('ai-feedback: math typesetting unavailable; keeping readable TeX.', error); }
          if (body.isConnected && !controller.signal.aborted) options.afterRender?.(body);
        }
        if (controller.signal.aborted || disposed) throw new F.FeedbackError('ABORTED', L.cancelled);
        if (request.feedback?.mode === 'hints') {
          count = Math.min(count + 1, request.feedback.steps.length); try { if (counterKey) store('session')?.setItem(counterKey, String(count)); } catch {}
          output.prepend(node('p', L.hint + ' ' + Math.min(count, request.feedback.steps.length), 'ai-feedback-hint'));
        }

      } catch (e) {
        if (controller.signal.aborted && quietCancellation) { output.replaceChildren(); return; }
        output.textContent = e.code === 'ABORTED' ? L.cancelled : e.message;
        if (e.code === 'CONFIGURATION') { const configure = button(L.settings); configure.onclick = openSettings; output.append(configure); }
      } finally { controller = null; trigger.disabled = false; trigger.textContent = original; output.setAttribute('aria-busy', 'false'); }
    }
    trigger.addEventListener('click', run);
    return { request: run, reset(reason = 'reset') {
      quietCancellation = true; controller?.abort(); output.replaceChildren();
      if (reason !== 'run' || !options.integration || F.resolvePolicy(options.integration, options.uiLanguage, options.policyDefaults, undefined, options.policySelection)['reset-on-run']) {
        count = 0; try { if (counterKey) store('session')?.removeItem(counterKey); } catch {}
      }
    }, cancel({clearOutput = false} = {}) { quietCancellation ||= clearOutput; controller?.abort(); if (clearOutput) output.replaceChildren(); }, dispose() { disposed = true; controller?.abort(); trigger.removeEventListener('click', run); } };
  }
  function readFile(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read image.')); reader.readAsDataURL(file); }); }
  function initActivity(el) {
    if (el.dataset.aiFeedbackReady) return;
    el.dataset.aiFeedbackReady = 'true';
    const data = JSON.parse(el.querySelector('script.ai-feedback-data').textContent);
    const L = lang(data.uiLanguage);
    const label = node('label', L.response);
    const input = node('textarea'); input.rows = 7; input.id = data.id + '-response'; input.value = data.starter || ''; label.htmlFor = input.id; input.lang = data.responseLanguage || '';
    el.append(label, input);
    let attachments = [], loadingImages = null;
    if (data.imageUpload) {
      const imageLabel = node('label', L.images); const upload = node('input'); upload.type = 'file'; upload.accept = 'image/png,image/jpeg,image/webp'; upload.multiple = true; imageLabel.append(upload);
      const preview = node('div', undefined, 'ai-feedback-images');
      let selectionVersion = 0;
      upload.onchange = () => {
        const files = [...upload.files]; const version = ++selectionVersion; attachments = []; preview.replaceChildren();
        loadingImages = (async () => {
          if (files.length > 3 || files.some(f => !['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 8 * 1024 * 1024) || files.reduce((n, f) => n + f.size, 0) > 12 * 1024 * 1024) throw new Error(L.invalidImage);
          const loaded = await Promise.all(files.map(async (f, i) => ({ id: 'image-' + (i + 1), role: data.imageRole || 'response', label: f.name, dataUrl: await readFile(f) })));
          if (version !== selectionVersion) return;
          attachments = loaded;
          for (const a of attachments) { const image = node('img'); image.src = a.dataUrl; image.alt = a.label; preview.append(image); }
        })().catch(e => { if (version === selectionVersion) preview.textContent = e.message; throw e; });
        loadingImages.catch(() => {});
      };
      const clear = button(L.clear); clear.onclick = () => { selectionVersion++; attachments = []; loadingImages = null; upload.value = ''; preview.replaceChildren(); };
      el.append(imageLabel, node('p', L.imageNote, 'ai-feedback-notice'), preview, clear);
    }
    const trigger = button(L.button); const output = node('div', undefined, 'ai-feedback-output'); output.setAttribute('aria-live', 'polite');
    el.append(trigger, settingsButton(data.uiLanguage), output);
    attach({ integration: 'plain-text', contextRefs: () => data.contextMode === 'none' ? '' : data.contextRefs, policySelection: data.policySelection, id: data.id, button: trigger, output, uiLanguage: data.uiLanguage, getRequest: async () => {
      if (loadingImages) await loadingImages;
      let materials = (data.materials || []).slice();
      materials.push(...F.contextMaterials({mode:data.contextMode, refs:data.contextRefs, text:data.context}));
      if (data.sourceRef) {
        const sources = F.collectExplicitContexts(data.sourceRef);
        if (!sources.length) throw new Error('The referenced source text is missing or unavailable.');
        materials.push(...sources.map(c => ({ id: c.id, role: 'source', text: c.content, language: data.sourceLanguage || '' })));
      }
      return { task: data.task, profile: data.profile, materials, responses: [{ id: 'response', value: input.value, format: 'text', language: data.responseLanguage }], attachments,
        learner: { level: data.learnerLevel || '' }, criteria: data.criteria,
        feedback: { language: data.feedbackLanguage, mode: 'review', maxIssues: data.maxIssues, allowFullRewrite: false } };
    } });
  }
  function renderPolicySummaries() {
    for (const el of document.querySelectorAll('.ai-feedback-policy-summary')) {
      try {
        const options=el.dataset.integration === 'pyodide-interaktiv' && root.qpyodideFeedbackOptions?.hints === false ? {steps:[]} : {};
        const info=F.explainPolicy(el.dataset.integration, el.dataset.language || document.documentElement.lang || 'en', undefined,
          {exercise:el.dataset.exercise || '',name:el.dataset.policy || ''},options);
        const p=info.policy;
        el.replaceChildren(node('strong','Effective policy'));
        el.append(node('p',info.scopes.length ? info.scopes.map(s => s.scope + ': ' + s.chain.join(' → ')).join('; ') : 'Integration defaults (no named selection)'));
        if (el.dataset.exercise) el.append(node('p','Exercise: ' + el.dataset.exercise));
        el.append(node('p',p.steps.length ? p.steps.length + ' feedback step(s)' : 'Review without a hint sequence'));
        const table=node('table'),head=node('tr');
        for(const label of ['Step','Word limit','Issue limit','Full solution'])head.append(node('th',label));
        table.append(head);
        for(const [i,step] of (p.steps.length?p.steps:[{}]).entries()){
          const effective={...p,...step},row=node('tr');
          for(const value of [p.steps.length?String(i+1):'Review',String(effective['max-words']),String(el.dataset.integration === 'plain-text' && el.dataset.maxIssues ? el.dataset.maxIssues : effective['max-issues']),effective['allow-full-solution']?'Allowed':'Not allowed'])row.append(node('td',value));
          table.append(row);
        }
        el.append(table,node('p','Resolved base instructions'),node('pre',p.basePrompts.join('\n\n')));
      } catch(error) { el.replaceChildren(node('p',error.message)); }
    }
  }
  function initialize() {
    if (document.querySelector('.ai-feedback-activity')) { buildSettings(); document.querySelectorAll('.ai-feedback-activity').forEach(initActivity); }
    renderPolicySummaries();
  }

  Object.assign(F, { attach, openSettings, settingsButton, buildSettings, loadConfig, saveConfig, getClient, initActivity, initialize, renderPolicySummaries, locales: locale });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize); else initialize();
})(globalThis);
