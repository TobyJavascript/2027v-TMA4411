/* Reusable dynamic matrix editor extracted from math-exercise. AGPL-3.0-or-later.
 * Editing/presentation only: consumers own parsing, grading and feedback policy. */
(function (root) {
  'use strict';
  function escHtml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  var defaults = { matrixAddRow: 'Add row', matrixRemoveRow: 'Remove row', matrixAddColumn: 'Add column', matrixRemoveColumn: 'Remove column', matrixRows: 'Rows', matrixColumns: 'Columns', emptyMatrix: 'Empty matrix' };
  function factory(options) {
    options = options || {};
    var exerciseId = options.idPrefix || 'matrix', vars = options.vars || '';
    var L = Object.assign({}, defaults, options.labels || {});
    var zero = options.zeroDimensions || 'reject';
    if (zero !== 'reject' && zero !== 'canonical') throw new Error('matrix-input: invalid zeroDimensions policy');
    function validateSpec(spec) {
      if (!spec || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(spec.name)) throw new Error('matrix-input: invalid name');
      ['rows', 'cols'].forEach(function (key) {
        var axis = spec[key];
        if (!axis || typeof axis.auto !== 'boolean') throw new Error('matrix-input: invalid axis');
        ['min','max','initial'].forEach(function (bound) {
          if (!Number.isInteger(axis[bound]) || axis[bound] < (zero === 'reject' ? 1 : 0) || axis[bound] > 20) throw new Error('matrix-input: invalid dimension bound');
        });
        if (axis.min > axis.initial || axis.initial > axis.max || (!axis.auto && (axis.min !== axis.max || axis.initial !== axis.min))) throw new Error('matrix-input: inconsistent axis bounds');
      });
      if (options.maxEntries !== undefined && (!Number.isInteger(options.maxEntries) || options.maxEntries < 1 || spec.rows.max * spec.cols.max > options.maxEntries)) throw new Error('matrix-input: total entry bound exceeded');
    }
  function dynamicMatrixCellHtml(exerciseId, spec, row, column, vars) {
    var fid = exerciseId + '-dm-' + spec.name + '-' + row + '-' + column;
    var label = 'dm:' + spec.name + ':' + row + ',' + column;
    return {
      id: fid,
      label: label,
      html: '<input type="text" id="' + escHtml(fid) + '" data-answer=""'
          + ' data-vars="' + escHtml(vars) + '"'
          + ' data-dynamic-matrix-name="' + escHtml(spec.name) + '"'
          + ' data-matrix-row="' + row + '" data-matrix-column="' + column + '"'
          + ' data-structural-label="' + escHtml(label) + '"'
          + ' aria-label="' + escHtml(spec.name + ', ' + L.matrixRows + ' ' + row + ', ' + L.matrixColumns + ' ' + column) + '"'
          + ' autocomplete="off" autocorrect="off" spellcheck="false"'
          + ' class="math-input math-mat-cell">',
    };
  }

  function renderHTML(spec) {
    validateSpec(spec);
    var configuredRows = spec.rows.initial, configuredCols = spec.cols.initial;
    var rows = configuredRows, cols = configuredCols;
    if (rows === 0 || cols === 0) { rows = 0; cols = 0; }
    var ids = [], labels = [], cells = [];
    for (var row = 1; row <= rows; row++) {
      for (var column = 1; column <= cols; column++) {
        var cell = dynamicMatrixCellHtml(exerciseId, spec, row, column, vars);
        ids.push(cell.id); labels.push(cell.label); cells.push(cell.html);
      }
    }
    var matrix = '<span class="math-mat math-dynamic-mat" style="--cols:' + Math.max(cols, 1) + '"'
      + ' data-matrix-name="' + escHtml(spec.name) + '" data-rows="' + rows + '" data-cols="' + cols + '"'
      + ' data-auto-rows="' + spec.rows.auto + '" data-auto-cols="' + spec.cols.auto + '"'
      + ' data-min-rows="' + spec.rows.min + '" data-max-rows="' + spec.rows.max + '"'
      + ' data-min-cols="' + spec.cols.min + '" data-max-cols="' + spec.cols.max + '"'
      + ' data-last-rows="' + configuredRows + '" data-last-cols="' + configuredCols + '">'
      + cells.join('') + '</span>';
    var controls = '<span class="math-dynamic-matrix-controls" aria-label="Matrix size controls">'
      + '<span class="math-dynamic-axis" data-dynamic-axis="row"><span class="math-dynamic-axis-label"></span>'
      + '<button type="button" data-dynamic-action="remove-row">−</button><output></output>'
      + '<button type="button" data-dynamic-action="add-row">+</button></span>'
      + '<span class="math-dynamic-axis" data-dynamic-axis="col"><span class="math-dynamic-axis-label"></span>'
      + '<button type="button" data-dynamic-action="remove-col">−</button><output></output>'
      + '<button type="button" data-dynamic-action="add-col">+</button></span>'
      + '</span>';
    return {
      html: '<span class="math-dynamic-matrix-wrap" data-matrix-name="' + escHtml(spec.name) + '">' + matrix + controls + '</span>',
      ids: ids,
      labels: labels,
      count: 0,
    };
  }

  function dynamicSpecFromElement(matrix) {
    return {
      name: matrix.dataset.matrixName,
      rows: {
        auto: matrix.dataset.autoRows === 'true',
        initial: Number(matrix.dataset.lastRows),
        min: Number(matrix.dataset.minRows),
        max: Number(matrix.dataset.maxRows),
      },
      cols: {
        auto: matrix.dataset.autoCols === 'true',
        initial: Number(matrix.dataset.lastCols),
        min: Number(matrix.dataset.minCols),
        max: Number(matrix.dataset.maxCols),
      },
    };
  }

  function renderDynamicMatrixElement(matrix, exerciseId, vars, rows, cols) {
    var oldValues = {};
    matrix.querySelectorAll('input[data-matrix-row][data-matrix-column]').forEach(function (input) {
      oldValues[input.dataset.matrixRow + ',' + input.dataset.matrixColumn] = input.value;
    });
    var spec = dynamicSpecFromElement(matrix);
    if (rows === 0 || cols === 0) { rows = 0; cols = 0; }
    else {
      matrix.dataset.lastRows = String(rows);
      matrix.dataset.lastCols = String(cols);
    }
    var cells = [];
    for (var row = 1; row <= rows; row++) {
      for (var column = 1; column <= cols; column++) {
        var cell = dynamicMatrixCellHtml(exerciseId, spec, row, column, vars);
        cells.push(cell.html);
      }
    }
    matrix.dataset.rows = String(rows);
    matrix.dataset.cols = String(cols);
    matrix.style.setProperty('--cols', String(Math.max(cols, 1)));
    matrix.innerHTML = cells.length
      ? cells.join('')
      : '<span class="math-dynamic-matrix-empty" aria-live="polite">' + escHtml(L.emptyMatrix) + '</span>';
    matrix.querySelectorAll('input[data-matrix-row][data-matrix-column]').forEach(function (input) {
      var key = input.dataset.matrixRow + ',' + input.dataset.matrixColumn;
      if (Object.prototype.hasOwnProperty.call(oldValues, key)) input.value = oldValues[key];
    });
  }

  function resizedDynamicMatrixShape(matrix, spec, action) {
    var rows = Number(matrix.dataset.rows), cols = Number(matrix.dataset.cols);
    var empty = rows === 0 || cols === 0;
    if (empty && action === 'add-row') {
      rows = Math.max(1, spec.rows.min);
      cols = spec.cols.auto ? Math.max(1, Number(matrix.dataset.lastCols) || spec.cols.initial) : spec.cols.initial;
    } else if (empty && action === 'add-col') {
      cols = Math.max(1, spec.cols.min);
      rows = spec.rows.auto ? Math.max(1, Number(matrix.dataset.lastRows) || spec.rows.initial) : spec.rows.initial;
    } else if (action === 'add-row' && rows < spec.rows.max) rows++;
    if (action === 'remove-row' && rows > spec.rows.min) rows--;
    if (!empty && action === 'add-col' && cols < spec.cols.max) cols++;
    if (action === 'remove-col' && cols > spec.cols.min) cols--;
    return { rows: rows, cols: cols };
  }


    function mount(wrap) {
      if (wrap.matrixInput) wrap.matrixInput.destroy();
      var matrix = wrap.querySelector('.math-dynamic-mat');
      if (!matrix) throw new Error('matrix-input: missing matrix element');
      var spec = dynamicSpecFromElement(matrix);
      validateSpec(spec);
      var controls = wrap.querySelector('.math-dynamic-matrix-controls');
      var destroyed = false, listeners = [];
      var labels = {'add-row':L.matrixAddRow,'remove-row':L.matrixRemoveRow,'add-col':L.matrixAddColumn,'remove-col':L.matrixRemoveColumn};
      function alive() { if (destroyed) throw new Error('matrix-input: editor destroyed'); }
      function read() {
        alive();
        return {type:'matrix', rows:Number(matrix.dataset.rows), cols:Number(matrix.dataset.cols), raw:Array.from(matrix.querySelectorAll('input[data-matrix-row]'), function (input) { return input.value; })};
      }
      function setState(state) {
        alive(); state = state || {};
        var classes = {correct:'math-input-ok',dependent:'math-input-dependent',partial:'math-input-partial',incorrect:'math-input-wrong',invalid:'math-input-err',error:'math-input-err'};
        function validStatus(status) {
          if (status !== undefined && status !== '' && status !== 'empty' && !Object.prototype.hasOwnProperty.call(classes,status)) throw new Error('matrix-input: invalid presentation status');
        }
        function validAxis(values, limit) {
          if (values === undefined) return;
          if (!Array.isArray(values) || values.length > limit) throw new Error('matrix-input: invalid state coordinates');
          values.forEach(validStatus);
        }
        validStatus(state.status);
        validAxis(state.rows,Number(matrix.dataset.rows));
        validAxis(state.columns,Number(matrix.dataset.cols));
        if (state.cells !== undefined) {
          if (!Array.isArray(state.cells) || state.cells.length > Number(matrix.dataset.rows)) throw new Error('matrix-input: invalid state coordinates');
          state.cells.forEach(function (row) { validAxis(row,Number(matrix.dataset.cols)); });
        }
        matrix.querySelectorAll('input').forEach(function (input) {
          Object.keys(classes).forEach(function (key) { input.classList.remove(classes[key]); });
          input.removeAttribute('aria-invalid');
          var row = Number(input.dataset.matrixRow)-1, col = Number(input.dataset.matrixColumn)-1;
          var status = (state.cells && state.cells[row] && state.cells[row][col]) || (state.columns && state.columns[col]) || (state.rows && state.rows[row]) || state.status;
          if (classes[status]) input.classList.add(classes[status]);
          if (status === 'invalid' || status === 'error') input.setAttribute('aria-invalid','true');
        });
      }
      function syncControls() {
        var rows=Number(matrix.dataset.rows), cols=Number(matrix.dataset.cols);
        controls.querySelectorAll('.math-dynamic-axis').forEach(function (el) {
          var row=el.dataset.dynamicAxis==='row', axis=row?spec.rows:spec.cols;
          el.style.display=axis.auto?'':'none';
          el.querySelector('.math-dynamic-axis-label').textContent=row?L.matrixRows:L.matrixColumns;
          el.querySelector('output').textContent=String(row?rows:cols);
        });
        controls.querySelectorAll('button').forEach(function (button) {
          var action=button.dataset.dynamicAction, row=action.indexOf('row')!==-1, axis=row?spec.rows:spec.cols, value=row?rows:cols;
          button.setAttribute('aria-label',labels[action]+' '+spec.name);
          var opposite = row ? spec.cols : spec.rows;
          button.disabled=!axis.auto || (action.indexOf('add')===0?(value>=axis.max || opposite.max===0):value<=axis.min);
        });
      }
      function notify(kind) { setState(); if (options.onChange) options.onChange({kind:kind, value:read()}); }
    function resize(rows,cols, silent) {
        alive();
        var canonical=zero==='canonical' && (rows===0 || cols===0);
        ['rows','cols'].forEach(function (key) {
          var n=key==='rows'?rows:cols, axis=spec[key];
          if (!Number.isInteger(n) || (!canonical && (n<axis.min || n>axis.max)) || (canonical && (n<0 || n>axis.max))) throw new Error('matrix-input: dimensions outside bounds');
        });
        renderDynamicMatrixElement(matrix,exerciseId,vars,rows,cols); syncControls(); if (!silent) notify('resize');
      }
      function write(value) {
        alive();
        if (!value || !Array.isArray(value.raw) || value.raw.length!==value.rows*value.cols || value.raw.some(function (v) {return typeof v!=='string';})) throw new Error('matrix-input: expected rectangular raw string values');
        resize(value.rows,value.cols,true);
        matrix.querySelectorAll('input[data-matrix-row]').forEach(function (input,index) { input.value=value.raw[index]; });
        notify('write');
      }
      function listen(el,event,fn) { el.addEventListener(event,fn); listeners.push(function () {el.removeEventListener(event,fn);}); }
      controls.querySelectorAll('button[data-dynamic-action]').forEach(function (button) {
        listen(button,'click',function () { if (button.disabled) return; var shape=resizedDynamicMatrixShape(matrix,spec,button.dataset.dynamicAction); resize(shape.rows,shape.cols); });
      });
      listen(matrix,'input',function () {notify('edit');});
      if (Number(matrix.dataset.rows)===0 || Number(matrix.dataset.cols)===0) renderDynamicMatrixElement(matrix,exerciseId,vars,0,0);
      syncControls();
      var initial=read();
      var api={read:read,write:write,resize:resize,setState:setState,reset:function () {write(initial);},destroy:function () { if (destroyed) return; listeners.forEach(function (remove) {remove();}); destroyed=true; delete wrap.matrixInput; }};
      wrap.matrixInput=api;
      return api;
    }
    return {renderHTML:renderHTML,mount:mount,resizedShape:resizedDynamicMatrixShape};
  }
  root.MatrixInput={version:'1.0.0',create:factory};
})(typeof window !== 'undefined' ? window : globalThis);
