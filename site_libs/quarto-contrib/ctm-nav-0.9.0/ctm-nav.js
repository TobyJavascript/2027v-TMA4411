/* CTM Assessment: links into tabs and reveals (ctm-libs) — AGPL-3.0-or-later.
 * The courses' tab-links.html, moved here and extended (AC, 19 Oct 2026).
 * Loaded on pages with a tabset or a reveal unless ctm-assessment:
 * tab-links: false (lua/ui.lua).
 *
 * A link to an id inside tabs, closed <details> or a collapsed callout (a
 * heading, an anchor, an exercise, a tab title's .ctm-tab-target) opens every
 * enclosing tab, nested ones too, every enclosing <details> and every
 * enclosing collapsed Quarto callout, in any nesting (a callout inside a tab
 * or a reveal, a reveal inside a callout; a link to the callout itself opens
 * it, as a link to a <details> does); then it scrolls the target below
 * the header and focuses it; the browser's own jump to the fragment lands
 * there too (the target's scroll-margin-top). This works for links in the
 * page (the address bar shows the id: pushState), links from other pages,
 * Back/Forward and reloads. It runs after Quarto's own handlers: a link wins over the tab a
 * grouped tabset remembers, for this view, without changing what it
 * remembers. While editors, boards and Python output change the layout above
 * the target, it stays in place, for 2 s at most or until the reader scrolls,
 * types or clicks.
 *
 * Focus: a tab title's target focuses its tab panel, or the panel's first
 * heading when that is in view (the tab row stays visible); a section's
 * heading, a <details>' summary, or else the target itself (tabindex -1 while
 * focused). The browser's own jump to the fragment, late in WebKit, runs the
 * focusing steps of "scroll to the fragment": a target that cannot take focus
 * (a tab title's .ctm-tab-target, an empty anchor) leaves nothing focused. So
 * while the page settles (2 s, until the reader scrolls, types, clicks or
 * touches), focus that falls to the page goes back where the script put it;
 * so it does when a tab that was switched back is opened again. Each history
 * entry keeps its scroll position and open tabs in
 * history.state.__quartoTabPosition, as the courses' script did; a reload
 * restores them, unless the entry still showed its link's target: then it
 * handles the link again (coi-serviceworker reloads a first visit).
 *
 * CTMNav.reveal(element): the same for any element (returns a promise).
 * A handled target gets data-ctm-nav (load, link, hash, history or api).
 */
(function () {
  'use strict';
  if (window.CTMNav) return;
  var KEY = '__quartoTabPosition';
  var PIN_MS = 2000;
  var STOP_PIN = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  var FOCUSABLE = 'a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable]';
  // `restoring` holds saves back until the page's first navigation has run:
  // while the page loads, the browser's own jump to the fragment scrolls, and
  // a position saved then would make the load look like a history restore.
  var navigation = 0, restoring = true, scrollTimer = 0, handledURL = location.href, pinned = null;
  // The entry's position as the page was loaded: a reload or Back/Forward
  // restores it; a new visit (a link, a typed address) has none.
  var loaded = history.state && history.state[KEY] || null, shown = false;
  // While an entry still shows its link's target (the reader has not
  // scrolled, typed, clicked or touched since), its saved position says so
  // (`at`), and a reload follows the link again instead of restoring the
  // position: so does the reload with which coi-serviceworker makes a
  // learner's first visit cross-origin isolated where the host sends no
  // COOP/COEP headers (GitHub Pages). `showing`: the hash whose target the
  // last navigation showed.
  var showing = '', moved = false;
  STOP_PIN.forEach(function (type) {
    window.addEventListener(type, function (event) {
      // The browser's reload keys are not the reader moving.
      if (type === 'keydown' && (event.key === 'F5'
        || ((event.ctrlKey || event.metaKey) && (event.code === 'KeyR' || /^r$/i.test(event.key || ''))))) return;
      moved = true;
    }, {capture: true, passive: true});
  });
  try { history.scrollRestoration = 'manual'; } catch (error) { /* older browsers: the browser restores */ }

  // The next frame, or 100 ms where frames come slowly or not at all (a
  // page in the background, a slow renderer).
  function frame() {
    return new Promise(function (resolve) {
      var done = false;
      var finish = function () { if (!done) { done = true; resolve(); } };
      requestAnimationFrame(finish);
      setTimeout(finish, 100);
    });
  }
  function each(list, visit) { Array.prototype.forEach.call(list, visit); }

  // One page under its URLs: quarto-nav.js rewrites links to …/index.html as
  // …/, and GitHub Pages serves x.html also as x.
  function samePage(url) {
    var page = function (pathname) { return pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, ''); };
    return url.origin === location.origin && url.search === location.search && page(url.pathname) === page(location.pathname);
  }
  function targetFor(hash) {
    if (!hash || hash === '#') return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (error) { return null; }
  }
  // A collapsible Quarto callout keeps its content in a `.callout-collapse`
  // (Bootstrap's `collapse`, `show` once open); its header is the trigger.
  function shut(node) {
    return !!node.classList && node.classList.contains('callout-collapse')
      && (node.classList.contains('collapsing') || !node.classList.contains('show'));
  }
  // What hides an element until it is opened, outer first (a tab pane, the
  // content of a collapsible callout: in DOM order they open in turn, so
  // that one inside another opens inside an open one). An element that is a
  // callout also has its own content.
  function layersOf(element) {
    var layers = [], own = element.classList && element.classList.contains('callout')
      ? element.querySelector(':scope > .callout-collapse') : null;
    if (own) layers.push(own);
    for (var node = element; node; node = node.parentElement) {
      if (node.classList && (node.classList.contains('tab-pane') || node.classList.contains('callout-collapse'))) layers.unshift(node);
    }
    return layers;
  }

  function snapshot() {
    return {x: window.scrollX, y: window.scrollY,
      panes: Array.prototype.map.call(document.querySelectorAll('.tab-pane.active'), function (pane) { return pane.id; })};
  }
  function save() {
    if (restoring) return;
    var state = history.state, next = {};
    if (state && typeof state === 'object') for (var name in state) next[name] = state[name];
    next[KEY] = snapshot();
    if (showing && showing === location.hash && !moved) next[KEY].at = showing;
    try { history.replaceState(next, '', location.href); } catch (error) { /* rate-limited: the next save stores it */ }
  }

  function tabOf(pane) {
    return document.getElementById(pane.getAttribute('aria-labelledby') || '')
      || (pane.id && window.CSS && CSS.escape
        ? document.querySelector('[role="tab"][data-bs-target="#' + CSS.escape(pane.id) + '"]') : null);
  }
  // Marks a pane and its tab active, as Quarto's grouped tabsets do: without
  // Bootstrap's Tab, or when its tab is already marked active.
  function activate(pane, tab) {
    each(pane.parentElement ? pane.parentElement.children : [], function (other) {
      if (other !== pane && other.classList.contains('tab-pane')) other.classList.remove('active', 'show');
    });
    pane.classList.add('active');
    var list = tab && tab.closest('[role="tablist"]');
    if (list) {
      each(list.querySelectorAll('[role="tab"]'), function (link) {
        link.classList.toggle('active', link === tab);
        link.setAttribute('aria-selected', String(link === tab));
      });
    }
  }
  // Shows a pane through Bootstrap (its events and ARIA), which neither
  // clicks the tab nor changes a grouped tabset's remembered choice.
  function openPane(pane) {
    if (pane.classList.contains('active')) return Promise.resolve();
    var tab = tabOf(pane), Tab = window.bootstrap && window.bootstrap.Tab;
    if (!tab || !Tab || tab.classList.contains('active')) {
      activate(pane, tab);
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var timer = setTimeout(resolve, 400);
      tab.addEventListener('shown.bs.tab', function () { clearTimeout(timer); resolve(); }, {once: true});
      Tab.getOrCreateInstance(tab).show();
    }).then(function () { if (!pane.classList.contains('active')) activate(pane, tab); });
  }
  // Shows a callout's content through Bootstrap (its events; it sets the
  // header's ARIA and `collapsed` class), without clicking the header. Without
  // Bootstrap, or when it does not finish, the content and header are marked
  // open by hand.
  function expand(body) {
    body.classList.remove('collapsing');
    body.classList.add('collapse', 'show');
    body.style[body.classList.contains('collapse-horizontal') ? 'width' : 'height'] = '';
    var header = body.parentElement && body.parentElement.querySelector(':scope > .callout-header');
    if (header) {
      header.classList.remove('collapsed');
      header.setAttribute('aria-expanded', 'true');
    }
  }
  function openCallout(body) {
    if (!shut(body)) return Promise.resolve();
    var Collapse = window.bootstrap && window.bootstrap.Collapse;
    if (!Collapse) {
      expand(body);
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var finished = false;
      var done = function (event) {
        // A callout inside this one reports to it too.
        if (event && event.target !== body) return;
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        body.removeEventListener('shown.bs.collapse', done);
        body.removeEventListener('hidden.bs.collapse', done);
        resolve();
      };
      var timer = setTimeout(function () {
        // Complete Bootstrap's own queued transition first, just as its
        // transition-end emulation does. Its completion owns the instance's
        // transition state, classes and inline size; changing just the DOM
        // would leave its next show/hide stuck or let a late hide close us.
        if (body.classList.contains('collapsing')) body.dispatchEvent(new Event('transitionend'));
        if (!finished) {
          expand(body);
          done();
        }
      }, 600);
      body.addEventListener('shown.bs.collapse', done);
      body.addEventListener('hidden.bs.collapse', done);
      // show() ignores an in-flight hide (and an in-flight show). Wait for
      // either transition to settle, then open again if it was a hide.
      if (!body.classList.contains('collapsing')) Collapse.getOrCreateInstance(body, {toggle: false}).show();
    }).then(function () { if (shut(body)) return openCallout(body); });
  }
  function isOpen(layer) {
    return layer.classList.contains('tab-pane') ? layer.classList.contains('active') : !shut(layer);
  }
  function openLayer(layer) {
    return layer.classList.contains('tab-pane') ? openPane(layer) : openCallout(layer);
  }
  function openLayers(layers) {
    return layers.reduce(function (done, layer) { return done.then(function () { return openLayer(layer); }); }, Promise.resolve());
  }
  function openAll(target, layers) {
    for (var node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS' && !node.open) node.open = true;
    }
    return openLayers(layers);
  }

  // Below a fixed or sticky header (its full height, also while headroom has
  // slid it away: scrolling up brings it back).
  function clearance() {
    var header = document.getElementById('quarto-header');
    var position = header ? getComputedStyle(header).position : '';
    return (position === 'fixed' || position === 'sticky' ? header.offsetHeight : 0) + 16;
  }
  // A section's heading. (Quarto stretches a section that is :target upwards
  // by the header's height, so the section's own top moves.)
  function headingOf(target) {
    var first = target.firstElementChild;
    return target.tagName === 'SECTION' && first && /^H[1-6]$/.test(first.tagName) ? first : null;
  }
  // What lands below the header: for a tab title, the tab row above its pane.
  function anchorOf(target) {
    if (!target.classList.contains('ctm-tab-target')) return headingOf(target) || target;
    var pane = target.closest('.tab-pane'), tabset = pane && pane.closest('.panel-tabset');
    var row = tabset && tabset.querySelector(':scope > [role="tablist"], :scope > .nav');
    return row || target;
  }
  // Jumps, also where the page scrolls smoothly (Bootstrap's :root rule).
  function scrollToY(top) {
    var root = document.documentElement, smooth = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(window.scrollX, Math.max(0, top));
    root.style.scrollBehavior = smooth;
  }
  function scrollTo(element) {
    scrollToY(window.scrollY + element.getBoundingClientRect().top - clearance());
  }
  // The browser's own jump to the address's fragment lands where the script
  // puts its target. WebKit still jumps to it once its pane is laid out, also
  // after the script has scrolled (a busy page lays out late): the target at
  // the viewport's top, a tab title's tab row above it, out of view. The
  // target's scroll-margin-top places the anchor below the header instead
  // (negative where a section's heading has a top margin). It follows the
  // target, the anchor and the header when they reflow later (a web font, a
  // narrower window, a rotated phone, Quarto's late section:target offset):
  // a jump then still lands there.
  var margined = null;
  function margin(target, anchor) {
    if (!target.getClientRects().length || !anchor.getClientRects().length) return;
    var offset = target.getBoundingClientRect().top - anchor.getBoundingClientRect().top;
    target.style.scrollMarginTop = Math.round(offset + clearance()) + 'px';
  }
  function landAt(target, anchor) {
    if (target !== targetFor(location.hash)) return;
    if (margined) {
      if (margined.observer) margined.observer.disconnect();
      if (margined.element !== target) margined.element.style.scrollMarginTop = margined.value;
    }
    if (!margined || margined.element !== target) margined = {element: target, value: target.style.scrollMarginTop};
    margin(target, anchor);
    margined.observer = typeof ResizeObserver === 'function' ? new ResizeObserver(function () { margin(target, anchor); }) : null;
    if (!margined.observer) return;
    margined.observer.observe(anchor);
    if (anchor !== target) margined.observer.observe(target);
    var header = document.getElementById('quarto-header');
    if (header) margined.observer.observe(header);
  }
  function inView(element) {
    var rect = element.getBoundingClientRect();
    return rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight;
  }

  function focusOf(target) {
    if (target.classList.contains('ctm-tab-target')) {
      var pane = target.closest('.tab-pane');
      var first = pane && pane.querySelector('h1, h2, h3, h4, h5, h6');
      if (first && inView(first)) return first;
      return pane || target;
    }
    var heading = headingOf(target);
    if (heading) return heading;
    if (target.tagName === 'DETAILS') return target.querySelector(':scope > summary') || target;
    return target;
  }
  function focus(target) {
    var element = focusOf(target);
    var focusIt = function () {
      try { element.focus({preventScroll: true}); } catch (error) { element.focus(); }
      return document.activeElement === element;
    };
    if (element.matches(FOCUSABLE) && focusIt()) return;
    if (element.hasAttribute('tabindex')) return;
    // Not focusable (or not in this browser, such as a summary): only while
    // focused, marked for ctm-ui.css (no ring for mouse users).
    element.setAttribute('tabindex', '-1');
    element.setAttribute('data-ctm-nav-focus', '');
    element.addEventListener('blur', function () {
      element.removeAttribute('tabindex');
      element.removeAttribute('data-ctm-nav-focus');
    }, {once: true});
    focusIt();
  }

  // Focus that falls to the page (nothing focused) while the page settles goes
  // back to the target's focus (see the top).
  var kept = null;
  function unkeep() {
    if (!kept) return;
    document.removeEventListener('focusout', kept.lost, true);
    clearTimeout(kept.timer);
    kept = null;
  }
  function nothingFocused() {
    var active = document.activeElement;
    return !active || active === document.body || active === document.documentElement;
  }
  function keepFocus(target, current) {
    unkeep();
    var lost = function (event) {
      if (event.relatedTarget) return;
      setTimeout(function () {
        if (kept && kept.lost === lost && !moved && current() && nothingFocused() && target.getClientRects().length) focus(target);
      }, 0);
    };
    kept = {lost: lost, timer: setTimeout(unkeep, PIN_MS)};
    document.addEventListener('focusout', lost, true);
  }

  function unpin() {
    if (!pinned) return;
    pinned.observer.disconnect();
    clearTimeout(pinned.timer);
    STOP_PIN.forEach(function (type) { window.removeEventListener(type, unpin, true); });
    pinned = null;
  }
  // Keeps `element` where it is while the layout above it changes.
  function pin(element) {
    unpin();
    if (typeof ResizeObserver !== 'function') return;
    var top = element.getBoundingClientRect().top;
    var observer = new ResizeObserver(function () {
      if (!pinned) return;
      var drift = element.getBoundingClientRect().top - top;
      if (Math.abs(drift) >= 1) scrollToY(window.scrollY + drift);
    });
    pinned = {observer: observer, timer: setTimeout(unpin, PIN_MS)};
    observer.observe(document.body);
    STOP_PIN.forEach(function (type) { window.addEventListener(type, unpin, {capture: true, passive: true}); });
  }

  function allOpen(layers) {
    return layers.every(isOpen);
  }

  // Restores a history entry's position, or opens, scrolls to and focuses a target.
  function navigate(position, target, how) {
    var request = ++navigation;
    var current = function () { return request === navigation; };
    restoring = true;
    clearTimeout(scrollTimer);
    unpin();
    var layers = position ? position.panes.map(function (id) { return document.getElementById(id); }).filter(Boolean)
      : target ? layersOf(target) : [];
    var opened = position ? openLayers(layers) : target ? openAll(target, layers) : Promise.resolve();
    var anchor = null;
    return opened.then(function () {
      if (!current()) return null;
      window.dispatchEvent(new Event('resize'));
      return frame().then(frame);
    }).then(function () {
      if (!current()) return null;
      if (position) {
        scrollToY(position.y);
        showing = position.at || '';
        moved = false;
      } else if (target && target.getClientRects().length) {
        anchor = anchorOf(target);
        landAt(target, anchor);
        scrollTo(anchor);
        focus(target);
        keepFocus(target, current);
        target.setAttribute('data-ctm-nav', how);
        pin(anchor);
        showing = target === targetFor(location.hash) ? location.hash : '';
        moved = false;
      }
      return frame();
    }).then(function () {
      if (!current()) return null;
      // Something switched a tab back (a grouped tabset restoring its
      // remembered choice): the link wins.
      if (target && !position && !allOpen(layers)) {
        return openAll(target, layers).then(frame).then(function () {
          if (!current() || !anchor) return;
          landAt(target, anchor);
          scrollTo(anchor);
          // Its pane was hidden, which took the focus away.
          if (!moved && nothingFocused()) focus(target);
          pin(anchor);
        });
      }
      return null;
    }).then(function () {
      if (!current()) return;
      restoring = false;
      save();
    });
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    save();
    if (link.getAttribute('role') === 'tab' || link.hasAttribute('data-bs-toggle')) return;
    var url;
    try { url = new URL(link.href, location.href); } catch (error) { return; }
    if (!samePage(url)) return;
    var target = targetFor(url.hash);
    if (!target) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    handledURL = location.href;
    navigate(null, target, 'link');
  }, true);

  window.addEventListener('scroll', function () {
    if (restoring) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(save, 100);
  }, {passive: true});
  document.addEventListener('shown.bs.tab', function () { if (!restoring) save(); });
  window.addEventListener('pagehide', save);
  window.addEventListener('popstate', function (event) {
    handledURL = location.href;
    navigate(event.state && event.state[KEY] || null, targetFor(location.hash), 'history');
  });

  // After Quarto's handlers: its grouped tabsets restore their choice on
  // pageshow, and quarto-nav.js scrolls by the header's height on
  // hashchange; both register before DOMContentLoaded.
  function start() {
    window.addEventListener('hashchange', function () {
      // Back/Forward sends popstate first: that entry is handled.
      if (handledURL === location.href) return;
      handledURL = location.href;
      navigate(null, targetFor(location.hash), 'hash');
    });
    var show = function (event) {
      handledURL = location.href;
      // First shown: the position the entry had when the page loaded. From
      // the back-forward cache: the one it has now.
      var first = !shown && !(event && event.persisted);
      var position = first ? loaded : (history.state && history.state[KEY] || null);
      var target = targetFor(location.hash);
      // A reload of an entry that still showed its link's target: the link again.
      if (first && position && position.at && position.at === location.hash && target) position = null;
      shown = true;
      navigate(position, target, 'load');
    };
    window.addEventListener('pageshow', show);
    // Loaded late, after the page was shown.
    if (document.readyState === 'complete') show();
  }

  window.CTMNav = {
    version: 1,
    reveal: function (element) { return element ? navigate(null, element, 'api') : Promise.resolve(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

