// Preserve upstream local autosave controls alongside the shared feedback dialog.
(function(root) {
  'use strict';
  if (!root.qpyodideStorage?.anyEnabled) return;
  const QP_L=root.QP_L;
function buildStorageSection() {
  const section = document.createElement("div");
  section.className = "qpyodide-storage-settings-section";

  const enableLabel = document.createElement("label");
  enableLabel.className = "qpyodide-storage-toggle-label";
  enableLabel.title = QP_L.storageToggleTitle;
  const enableCheckbox = document.createElement("input");
  enableCheckbox.type = "checkbox";
  enableCheckbox.checked = !globalThis.qpyodideStorage.isUserDisabled();
  enableLabel.appendChild(enableCheckbox);
  enableLabel.appendChild(document.createTextNode(QP_L.storageToggleLabel));
  section.appendChild(enableLabel);

  // Nested under the master checkbox: which cells actually get saved while
  // it's on. Disabled (not hidden) while the master is off, so the reader's
  // last choice stays visible instead of disappearing.
  const modeGroup = document.createElement("div");
  modeGroup.className = "qpyodide-storage-mode-group";

  const autoLabel = document.createElement("label");
  autoLabel.className = "qpyodide-storage-toggle-label";
  autoLabel.title = QP_L.storageModeAutoTitle;
  const autoRadio = document.createElement("input");
  autoRadio.type = "radio";
  autoRadio.name = "qpyodide-storage-mode";
  autoRadio.checked = !globalThis.qpyodideStorage.isManualMode();
  autoLabel.appendChild(autoRadio);
  autoLabel.appendChild(document.createTextNode(QP_L.storageModeAutoLabel));
  modeGroup.appendChild(autoLabel);

  const manualLabel = document.createElement("label");
  manualLabel.className = "qpyodide-storage-toggle-label";
  manualLabel.title = QP_L.storageModeManualTitle;
  const manualRadio = document.createElement("input");
  manualRadio.type = "radio";
  manualRadio.name = "qpyodide-storage-mode";
  manualRadio.checked = globalThis.qpyodideStorage.isManualMode();
  manualLabel.appendChild(manualRadio);
  manualLabel.appendChild(document.createTextNode(QP_L.storageModeManualLabel));
  modeGroup.appendChild(manualLabel);

  section.appendChild(modeGroup);

  function applyEnabledState() {
    const enabled = enableCheckbox.checked;
    autoRadio.disabled = !enabled;
    manualRadio.disabled = !enabled;
    modeGroup.classList.toggle("qpyodide-storage-mode-group-disabled", !enabled);
  }
  applyEnabledState();

  enableCheckbox.addEventListener("change", () => {
    globalThis.qpyodideStorage.setUserDisabled(!enableCheckbox.checked);
    applyEnabledState();
    globalThis.qpyodideRefreshStorageUI?.();
  });
  autoRadio.addEventListener("change", () => {
    if (!autoRadio.checked) return;
    globalThis.qpyodideStorage.setManualMode(false);
    globalThis.qpyodideRefreshStorageUI?.();
  });
  manualRadio.addEventListener("change", () => {
    if (!manualRadio.checked) return;
    globalThis.qpyodideStorage.setManualMode(true);
    globalThis.qpyodideRefreshStorageUI?.();
  });

  // Two delete scopes, least-destructive first: this page only, then the
  // whole project (every page on this site). Both reset every currently
  // open cell's editor back to its original code afterward -- otherwise the
  // edited-but-now-unsaved text would just get saved right back on the next
  // keystroke. See qpyodide-cell-classes.js.
  const deletePageBtn = document.createElement("button");
  deletePageBtn.type = "button";
  deletePageBtn.className = "btn btn-light btn-sm qpyodide-button qpyodide-storage-delete-btn";
  deletePageBtn.title = QP_L.deleteThisPageSavesTitle;
  deletePageBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> ' + QP_L.deleteThisPageSavesLabel;
  deletePageBtn.onclick = () => {
    if (!window.confirm(QP_L.deleteThisPageSavesConfirm)) return;
    globalThis.qpyodideStorage.clearPage();
    globalThis.qpyodideResetAllStorageUnits?.();
  };
  section.appendChild(deletePageBtn);

  const deleteAllBtn = document.createElement("button");
  deleteAllBtn.type = "button";
  deleteAllBtn.className = "btn btn-light btn-sm qpyodide-button qpyodide-storage-delete-btn";
  deleteAllBtn.title = QP_L.deleteAllSavesTitle;
  deleteAllBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> ' + QP_L.deleteAllSavesLabel;
  deleteAllBtn.onclick = () => {
    if (!window.confirm(QP_L.deleteAllSavesConfirm)) return;
    globalThis.qpyodideStorage.clearAll();
    globalThis.qpyodideResetAllStorageUnits?.();
  };
  section.appendChild(deleteAllBtn);

  return section;
}

  const F=root.AIFeedback;
  let dialog,open;
  if (F?.buildSettings) {
    dialog=F.buildSettings();
    open=()=>F.openSettings();
  } else {
    dialog=document.createElement('dialog');
    dialog.className='qpyodide-storage-settings';
    const title=document.createElement('h2');title.textContent=QP_L.settingsTitleStorageOnly;
    const close=document.createElement('button');close.type='button';close.textContent='×';
    close.setAttribute('aria-label',QP_L.closeBtn || 'Close');close.onclick=()=>dialog.close ? dialog.close() : dialog.removeAttribute('open');
    dialog.append(title,close);document.body.append(dialog);
    open=()=>dialog.showModal ? dialog.showModal() : dialog.setAttribute('open','');
  }
  const section=buildStorageSection();
  const heading=document.createElement('h3');heading.textContent=QP_L.settingsTitleStorageOnly;
  section.prepend(heading);dialog.append(document.createElement('hr'),section);
  const gear=document.createElement('button');gear.type='button';
  gear.className='btn btn-light btn-sm qpyodide-button qpyodide-storage-gear';
  gear.textContent='⚙';gear.title=QP_L.settingsTitleStorageOnly;gear.setAttribute('aria-label',gear.title);
  gear.onclick=open;
  const anchor=document.getElementById('qpyodide-status-right');
  if(anchor) anchor.append(gear);
  else {
    const first=document.querySelector('[id^="qpyodide-insertion-location-"]');
    if(first) first.before(gear);else document.body.prepend(gear);
  }
})(globalThis);
