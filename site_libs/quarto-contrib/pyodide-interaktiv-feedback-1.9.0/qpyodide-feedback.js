// Pyodide domain adapter. Shared runtime owns settings, transport and rendering.
(function (root) {
  'use strict';
  const options = root.qpyodideFeedbackOptions || {enabled: false, hints: true};
  // Legacy document storage is a default only; explicit shared settings win.
  root.__aiFeedbackConfig = {storage: options.storage || 'local', ...root.__aiFeedbackConfig};
  const F = root.AIFeedback;
  // The interface language resolved at render time (ctm.locale), also the
  // feedback's language, as before.
  const uiLanguage = options.uiLanguage || root.qpyodideLang || 'en';
  root.qpyodideFeedback = {
    enabled: !!options.enabled,
    openSettings: () => F?.openSettings(),
    attach(unit) {
      if (!this.enabled || !unit.feedbackButton) return null;
      const output = unit.feedbackDiv;
      output.classList.add('ai-feedback-output');
      output.setAttribute('aria-live', 'polite');
      unit.feedbackButton.disabled = false; // Feedback needs no Python runtime.
      const gear = F.settingsButton(uiLanguage);
      gear.classList.add('qpyodide-feedback-gear');
      unit.feedbackButton.after(gear);
      return F.attach({integration: 'pyodide-interaktiv', policySelection: unit.options?.policySelection, policyDefaults: options.hints ? {} : {steps: []}, id: 'pyodide-' + unit.uid, button: unit.feedbackButton, output,
        uiLanguage,
        getRequest() {
          const code = unit.getCode();
          const materials = F.contextMaterials(unit.options?.feedbackContext || {
            mode: unit.options?.['feedback-context'] === 'none' ? 'none' : unit.options?.['feedback-context'] ? 'explicit' : 'auto',
            refs: unit.options?.['feedback-context'] || ''
          });
          return {profile: 'python',
            task: unit.options?.task || 'Review the learner’s current Python program against its visible code and comments. No separate assignment was supplied; do not invent requirements.',
            materials, responses: [{id: 'code', format: 'code', language: 'python', value: code}],
            evidence: unit.getEvidence(), _revision: unit.getRevision(),

            feedback: {language: uiLanguage,
              mode: 'review'}
          };
        }
      });
    }
  };
})(globalThis);
