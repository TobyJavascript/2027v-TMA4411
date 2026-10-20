/* Context and safe Markdown derived from math-exercise fc549d2; AGPL-3.0-or-later. */
(function (root) {
  'use strict';
  if (root.AIFeedback?.contextText) return;
  const MAX_FEEDBACK_CONTEXT_CHARS = 6000;
  function escHtml(value) { return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function simpleMarkdownInline(text) {
    return text
      .replace(/\*\*([^\n]*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^\n]*?)\*/g,     '<em>$1</em>')
      .replace(/`([^`\n]*)`/g,        '<code>$1</code>');
  }

  function splitMarkdownTableRow(line) {
    var text = line.trim();
    if (text.charAt(0) === '|') text = text.slice(1);
    if (text.charAt(text.length - 1) === '|') text = text.slice(0, -1);
    var cells = [], cell = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '|' && (i === 0 || text.charAt(i - 1) !== '\\')) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());
    return cells;
  }

  // Deliberately strict GFM-table fallback.  Requiring at least two columns,
  // a separator row, one data row, and an equal cell count prevents ordinary
  // prose or mathematical |x| notation from being mistaken for a table.
  function markdownTableAt(lines, start) {
    if (start + 2 >= lines.length || lines[start].indexOf('|') < 0) return null;
    var header = splitMarkdownTableRow(lines[start]);
    var separators = splitMarkdownTableRow(lines[start + 1]);
    if (header.length < 2 || separators.length !== header.length ||
        !separators.every(function (cell) { return /^:?-{3,}:?$/.test(cell); })) return null;

    var rows = [], i = start + 2;
    while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') >= 0) {
      var row = splitMarkdownTableRow(lines[i]);
      if (row.length !== header.length) break;
      rows.push(row);
      i++;
    }
    if (rows.length === 0) return null;

    function renderRow(tag, cells) {
      return '<tr>' + cells.map(function (cell) {
        return '<' + tag + '>' + simpleMarkdownInline(cell) + '</' + tag + '>';
      }).join('') + '</tr>';
    }
    return {
      html: '<div class="math-fb-table-wrap"><table class="math-fb-table"><thead>' +
        renderRow('th', header) + '</thead><tbody>' + rows.map(function (row) {
          return renderRow('td', row);
        }).join('') + '</tbody></table></div>',
      next: i,
    };
  }

  function simpleMarkdown(text) {
    text = String(text).replace(/\r\n?/g, '\n');
    // Protect TeX and code before Markdown interprets stars, pipes or newlines.
    var prefix = '\uE000AI';
    while (text.includes(prefix)) prefix += 'X';
    var tokens = new Map();
    text = text.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$|`[^`\n]+`|\\\\\[[\s\S]*?\\\\\]|\\\\\([^\n]*?\\\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([^\n]*?\\\)|(?<!\\)\$(?![\s$])(?:\\.|[^\\$\n])+?(?<!\s)\$(?!\d)/gm, function (value) {
      var key = prefix + tokens.size + '\uE001', html, block = false;
      if (value.startsWith('```')) {
        block = true;
        html = '<pre><code>' + escHtml(value.slice(value.indexOf('\n') + 1).replace(/\n?```[ \t]*$/, '')) + '</code></pre>';
      } else if (value.startsWith('`')) {
        html = '<code>' + escHtml(value.slice(1, -1)) + '</code>';
      } else {
        // Some providers reproduce JSON-style escaping in visible math. Match
        // the complete doubled delimiter before the ordinary one, then remove
        // one escaping layer only inside that explicitly doubled math span.
        // Ordinary TeX (including matrix row breaks), prose and code stay literal.
        var doubled = value.startsWith(String.raw`\\(`) || value.startsWith(String.raw`\\[`);
        block = value.startsWith('$$') || value.startsWith('\\[') || value.startsWith(String.raw`\\[`);
        var size = doubled ? 3 : (value.startsWith('$') && !block ? 1 : 2);
        var tex = value.slice(size, -size);
        if (doubled && !/(^|[^\\])\\[A-Za-z]/.test(tex)) tex = tex.replace(/\\\\/g, '\\');
        var tag = block ? 'div' : 'span';
        html = '<' + tag + ' class="ai-feedback-math" data-display="' + block + '" data-tex="' + escHtml(tex) + '">' + escHtml(value) + '</' + tag + '>';
      }
      tokens.set(key, {html, block});
      return key;
    });
    var lines = escHtml(text).split('\n');
    var out = [], paragraph = [], listType = null, listItems = [];

    function flushParagraph() {
      if (!paragraph.length) return;
      out.push('<p>' + simpleMarkdownInline(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }
    function flushList() {
      if (!listType) return;
      out.push('<' + listType + '>' + listItems.map(function (item) {
        return '<li>' + simpleMarkdownInline(item) + '</li>';
      }).join('') + '</' + listType + '>');
      listType = null;
      listItems = [];
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], trimmed = line.trim(), match;
      if (tokens.get(trimmed)?.block) {
        flushParagraph(); flushList(); out.push(trimmed); continue;
      }
      if (!trimmed) {
        flushParagraph();
        if (listType) {
          var j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          var next = j < lines.length ? lines[j].trim() : '';
          var continuesList = listType === 'ul'
            ? /^[-*+]\s+/.test(next)
            : /^\d+[.)]\s+/.test(next);
          if (!continuesList) flushList();
        }
        continue;
      }

      var table = markdownTableAt(lines, i);
      if (table) {
        flushParagraph(); flushList();
        out.push(table.html);
        i = table.next - 1;
        continue;
      }

      // Keep display-TeX delimiters and content together for KaTeX auto-render.
      if (trimmed.indexOf('$$') === 0 || trimmed.indexOf('\\[') === 0) {
        flushParagraph(); flushList();
        var closing = trimmed.indexOf('$$') === 0 ? '$$' : '\\]';
        var math = [line];
        while (math[math.length - 1].trim().slice(-closing.length) !== closing && i + 1 < lines.length) {
          math.push(lines[++i]);
        }
        out.push('<div class="math-fb-display">' + math.join('\n') + '</div>');
        continue;
      }

      // ATX headings may include a whitespace-separated closing hash sequence.
      // Parse only after protecting code and TeX, and keep model HTML escaped.
      match = trimmed.match(/^(#{1,6})(?:[ \t]+(.*))?$/);
      if (match) {
        flushParagraph(); flushList();
        var heading = (match[2] || '').replace(/[ \t]+#+[ \t]*$/, '');
        if (/^#+[ \t]*$/.test(heading)) heading = '';
        var tag = 'h' + match[1].length;
        out.push('<' + tag + '>' + simpleMarkdownInline(heading) + '</' + tag + '>');
        continue;
      }

      match = trimmed.match(/^[-*+]\s+(.+)$/);
      if (match) {
        flushParagraph();
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(match[1]);
        continue;
      }
      match = trimmed.match(/^\d+[.)]\s+(.+)$/);
      if (match) {
        flushParagraph();
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(match[1]);
        continue;
      }

      flushList();
      paragraph.push(trimmed);
    }
    flushParagraph();
    flushList();
    var html = out.join('');
    for (const [key, token] of tokens) html = html.split(key).join(token.html);
    return html;
  }

  var katexPromise;
  async function typesetFeedback(body) {
    const nodes = [...body.querySelectorAll('.ai-feedback-math')];
    if (!nodes.length) return;
    if (!katexPromise) {
      const base = 'https://cdn.jsdelivr.net/npm/katex@0.16/';
      if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === base + 'dist/katex.min.css')) {
        const style = document.createElement('link');
        style.rel = 'stylesheet'; style.href = base + 'dist/katex.min.css'; document.head.append(style);
      }
      // ES modules avoid collisions with Monaco's AMD loader.
      katexPromise = import(base + '+esm').then(module => module.default).catch(error => { katexPromise = null; throw error; });
    }
    const katex = await katexPromise;
    if (!body.isConnected) return;
    for (const el of nodes) {
      katex.render(el.dataset.tex, el, {displayMode: el.dataset.display === 'true', throwOnError: false, trust: false, maxExpand: 1000, maxSize: 10, macros: {}});
    }
  }

  function contextText(root, fieldLabels) {
    if (!root) return '';
    var parts = [];
    var mathItems = new Map();
    var mathDocument = window.MathJax && window.MathJax.startup && window.MathJax.startup.document;
    if (mathDocument && typeof mathDocument.getMathItemsWithin === 'function') {
      mathDocument.getMathItemsWithin([root]).forEach(function (item) {
        if (item.typesetRoot) mathItems.set(item.typesetRoot, item);
      });
    }
    var blockTags = {
      ADDRESS: true, ARTICLE: true, ASIDE: true, BLOCKQUOTE: true,
      DIV: true, FIGCAPTION: true, FIGURE: true, FOOTER: true,
      H1: true, H2: true, H3: true, H4: true, H5: true, H6: true,
      HEADER: true, LI: true, MAIN: true, NAV: true, P: true,
      PRE: true, SECTION: true, TABLE: true, TR: true,
    };

    function newline() {
      if (parts.length && parts[parts.length - 1] !== '\n') parts.push('\n');
    }

    function math(tex, display) {
      parts.push({ math: (display ? '\\[' : '\\(') + tex + (display ? '\\]' : '\\)') });
    }

    function missingMath() {
      console.warn('ai-feedback: mathematical source unavailable; rendered glyphs were not sent to AI.');
      parts.push('[Mathematical source unavailable]');
    }

    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push(node.nodeValue || '');
        return;
      }
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        Array.prototype.forEach.call(node.childNodes, walk);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      var el = node;
      if (el.matches(
        'script, style, noscript, template, button, select, ' +
        '.hidden, .ai-feedback, .feedback-criteria, .feedback-starter, .example-author-notes, .ai-feedback-ignore, [class*="cell-output"], .ai-feedback-activity, .ai-feedback-output, .ai-feedback-settings, .math-exercise-cell, .math-exercise-controls, .math-feedback-area, ' +
        '.py-exercise-cell, .qpyodide-interactive-area, .qpyodide-non-interactive-area, ' +
        '.math-legend-panel, .math-dynamic-matrix-controls, [hidden], [aria-hidden="true"]'
      )) return;

      var style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      if (el.matches('input, textarea')) {
        if (fieldLabels && Object.prototype.hasOwnProperty.call(fieldLabels, el.id)) {
          parts.push('[' + fieldLabels[el.id] + ']');
        }
        return;
      }
      if (fieldLabels && el.classList.contains('math-dynamic-matrix-wrap')) {
        parts.push('[Matrix ' + (el.dataset.matrixName || '') + ']');
        return;
      }

      // Authored context math survives either renderer and asynchronous loading.
      if (el.hasAttribute('data-ai-feedback-tex') || el.hasAttribute('data-math-exercise-tex')) {
        math(el.dataset.aiFeedbackTex ?? el.dataset.mathExerciseTex, (el.dataset.aiFeedbackDisplay ?? el.dataset.mathExerciseDisplay) === 'true');
        return;
      }

      if (el.matches('.katex, .katex-display')) {
        var annotation = el.querySelector('annotation[encoding="application/x-tex"]');
        if (annotation) math(annotation.textContent, el.classList.contains('katex-display'));
        else missingMath();
        return;
      }

      if (el.matches('mjx-container') || mathItems.has(el)) {
        var item = mathItems.get(el);
        var latex = el.querySelector('mjx-math[data-latex], [data-mml-node="math"][data-latex]');
        var texAnnotation = el.querySelector('annotation[encoding="application/x-tex"]');
        if (item && typeof item.math === 'string') math(item.math, item.display);
        // MathJax 4 exposes source on the root math node. Use the outermost
        // expression only; never concatenate the source of individual glyphs.
        else if (latex) math(latex.getAttribute('data-latex'), el.getAttribute('display') === 'true');
        else if (texAnnotation) math(texAnnotation.textContent, el.getAttribute('display') === 'true');
        else missingMath();
        return;
      }

      if (el.tagName === 'BR') {
        newline();
        return;
      }

      var isBlock = !!blockTags[el.tagName];
      if (isBlock) newline();
      if (el.tagName === 'LI') parts.push('- ');
      if (el.tagName === 'TD' || el.tagName === 'TH') parts.push(' | ');

      Array.prototype.forEach.call(el.childNodes, walk);

      if (isBlock) newline();
    }

    walk(root);
    var text = '', prose = '';
    function flush() {
      text += prose.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n');
      prose = '';
    }
    parts.forEach(function (part) {
      if (typeof part === 'string') prose += part;
      else { flush(); text += part.math; }
    });
    flush();
    return text.trim();
  }

  function sourceText(el, fieldLabels) {
    if (!el) return '';
    if (!el.hasAttribute('data-math-exercise-source')) return contextText(el, fieldLabels);
    // Inert HTML: no scripts, image requests or custom element constructors.
    var template = document.createElement('template');
    template.innerHTML = el.dataset.mathExerciseSource;
    return contextText(template.content, fieldLabels);
  }

  function questionText(cell, fieldIds, fieldLabel) {
    var labels = Object.create(null);
    fieldIds.forEach(function (id, index) { labels[id] = fieldLabel(index); });
    var caption = sourceText(cell.querySelector('.math-exercise-caption'));
    var question = sourceText(cell.querySelector('.math-exercise-question'), labels);
    return (caption ? caption + '\n' : '') + question;
  }

  // Resolves #| context: id1, id2, ... against the live DOM. Duplicate,
  // missing, wrongly-classed, empty, or over-budget ids are skipped (with a
  // console warning) rather than failing the whole request.
  function collectExplicitContexts(refsRaw) {
    var seen = Object.create(null);
    var contexts = [];
    var usedChars = 0;

    refsRaw.split(',').forEach(function (part) {
      var id = part.trim();
      if (!id || id.startsWith('jsxgraph:') || seen[id]) return;
      seen[id] = true;

      var el = document.getElementById(id);
      if (!el) {
        console.warn('ai-feedback: context "' + id + '" was not found.');
        return;
      }
      if (!el.matches('.ai-feedback-context, .ai-context, .math-exercise-context')) {
        console.warn('ai-feedback: element "' + id + '" is not tagged .ai-feedback-context (or .ai-context) and was ignored.');
        return;
      }

      var content = contextText(el);
      if (!content) {
        console.warn('ai-feedback: context "' + id + '" is empty.');
        return;
      }
      if (usedChars + content.length > MAX_FEEDBACK_CONTEXT_CHARS) {
        console.warn('ai-feedback: context "' + id + '" exceeds the combined ' + MAX_FEEDBACK_CONTEXT_CHARS + '-character limit and was ignored.');
        return;
      }

      contexts.push({ id: id, content: content });
      usedChars += content.length;
    });

    return contexts;
  }


  let visualSequence = 0;
  async function collectVisualContexts(refs = '') {
    const ids = [...new Set(String(refs).split(',').map(s => s.trim())
      .filter(s => s.startsWith('jsxgraph:')).map(s => s.slice('jsxgraph:'.length)))];
    const materials = [], attachments = [];
    for (const id of ids) {
      const frame = document.getElementById(id);
      if (!id || !frame || frame.tagName !== 'IFRAME' || !frame.contentWindow) {
        throw new Error('JSXGraph context iframe not found: ' + id);
      }
      const requestId = 'ai-context-' + Date.now() + '-' + (++visualSequence);
      const result = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => finish(new Error('Timed out waiting for JSXGraph context: ' + id)), 5000);
        function finish(error, value) {
          clearTimeout(timer); window.removeEventListener('message', receive);
          if (error) reject(error); else resolve(value);
        }
        function receive(event) {
          const data = event.data;
          if (event.source !== frame.contentWindow || !data ||
              data.protocol !== 'jsxgraph-quarto-assessment' || data.version !== 1 ||
              data.type !== 'response' || data.requestId !== requestId || data.assessmentId !== id) return;
          if (data.error) return finish(new Error('JSXGraph context: ' + data.error));
          try {
            const text = JSON.stringify({state:data.payload, summary:data.ai?.summary});
            if (data.payload === undefined || new TextEncoder().encode(text).length > 1024 * 1024) {
              throw new Error('JSXGraph context state is missing or exceeds 1 MiB');
            }
            if (!data.ai?.image) throw new Error('JSXGraph context requires a registered board with ai.render enabled');
            finish(null, {text, image:data.ai.image});
          } catch (error) { finish(error); }
        }
        window.addEventListener('message', receive);
        frame.contentWindow.postMessage({protocol:'jsxgraph-quarto-assessment', version:1,
          type:'request', assessmentId:id, requestId, includeAI:true}, '*');
      });
      materials.push({id:'diagram-' + id, role:'context', text:result.text});
      attachments.push({id:'diagram-' + id, role:'context', label:'Current diagram: ' + id, dataUrl:result.image});
    }
    return {materials, attachments};
  }

  // auto: the section's prose; explicit: the listed blocks, then the section's
  // own prose (without context blocks; A5); none: nothing.
  function contextMaterials({mode = 'auto', refs = '', text = ''} = {}) {
    if (mode === 'none') return [];
    const section = text ? [{id:'section-context', role:'context', text}] : [];
    if (mode === 'explicit') return [...collectExplicitContexts(refs).map(c => ({id:c.id, role:'context', text:c.content})), ...section];
    return section;
  }
  Object.assign(root.AIFeedback, { renderMarkdown: simpleMarkdown, typesetFeedback, contextMaterials, collectVisualContexts, contextText, sourceText, questionText, collectExplicitContexts });
})(globalThis);
