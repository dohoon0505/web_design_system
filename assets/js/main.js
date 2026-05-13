(function () {
  'use strict';

  /* ============ UTILITIES ============ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var blockIdCounter = 0;
  function uid() { return 'blk-' + (++blockIdCounter); }

  /* ============ THEME ============ */
  function toggleTheme() {
    var body = document.body;
    var current = body.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    var icon = next === 'light' ? '☾' : '☀';
    var label = next === 'light' ? 'Dark' : 'Light';
    var sub = next === 'light' ? 'Light Mode' : 'Dark Mode';
    ['theme-icon', 'sidebar-theme-icon'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = icon;
    });
    ['theme-label', 'sidebar-theme-label'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = label;
    });
    var sbSub = document.getElementById('theme-sub');
    if (sbSub) sbSub.textContent = sub;
  }
  window.toggleTheme = toggleTheme;

  /* ============ SIDEBAR (mobile) ============ */
  function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    var scrim = document.querySelector('.sidebar-scrim');
    var isOpen = sb.classList.toggle('is-open');
    if (scrim) {
      if (isOpen) {
        scrim.classList.add('is-open');
        requestAnimationFrame(function () { scrim.classList.add('is-visible'); });
        document.body.style.overflow = 'hidden';
      } else {
        scrim.classList.remove('is-visible');
        setTimeout(function () { scrim.classList.remove('is-open'); }, 200);
        document.body.style.overflow = '';
      }
    }
  }
  window.toggleSidebar = toggleSidebar;

  function closeSidebar() {
    var sb = document.getElementById('sidebar');
    var scrim = document.querySelector('.sidebar-scrim');
    sb.classList.remove('is-open');
    if (scrim) {
      scrim.classList.remove('is-visible');
      setTimeout(function () { scrim.classList.remove('is-open'); }, 200);
    }
    document.body.style.overflow = '';
  }
  window.closeSidebar = closeSidebar;

  function closeSidebarMobile() {
    if (window.matchMedia('(max-width: 1099px)').matches) closeSidebar();
  }

  /* ============ STATE ============ */
  var systemData = null;
  var analysisCache = {};
  var sectionDefs = [];

  /* Get section definitions for a specific reference.
     Each reference can define its own `sections` array (custom per site);
     otherwise we fall back to the global analysisSections. */
  function getSectionDefs(refId) {
    if (systemData && systemData.references) {
      for (var i = 0; i < systemData.references.length; i++) {
        var r = systemData.references[i];
        if (r.id === refId && Array.isArray(r.sections) && r.sections.length > 0) {
          return r.sections;
        }
      }
    }
    return sectionDefs;
  }

  var homeHero = document.getElementById('home-hero');
  var homeSections = document.querySelectorAll('.home-section, .home-empty');
  var reportView = document.getElementById('report-view');
  var refNavList = document.getElementById('ref-nav-list');

  /* ============ DATA LOADING ============ */
  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function loadSystem() {
    return fetchJSON('system.json').then(function (data) {
      systemData = data;
      sectionDefs = data.analysisSections || [];
      buildSidebar(data.references || []);
      return data;
    });
  }

  function loadAnalysis(refId) {
    if (analysisCache[refId]) return Promise.resolve(analysisCache[refId]);
    return fetchJSON('analyses/' + refId + '/analysis.json').then(function (data) {
      analysisCache[refId] = data;
      return data;
    });
  }

  /* ============ SIDEBAR BUILDING ============ */
  function buildSidebar(refs) {
    if (!refNavList) return;
    if (refs.length === 0) {
      refNavList.innerHTML = '<li class="sidebar-empty">분석된 레퍼런스가 없습니다</li>';
      return;
    }
    var html = '';
    refs.forEach(function (ref) {
      var defs = getSectionDefs(ref.id);
      html += '<li class="sidebar-expandable">';
      html += '<a class="sidebar-link" href="#ref/' + escapeHtml(ref.id) + '" data-section="ref/' + escapeHtml(ref.id) + '">';
      html += '<svg class="ico"><use href="#i-link"/></svg>';
      html += escapeHtml(ref.title);
      html += '<svg class="chevron" width="14" height="14"><use href="#i-chevron-down"/></svg>';
      html += '</a>';
      html += '<ul class="sidebar-sub">';
      defs.forEach(function (sec) {
        var sectionPath = 'ref/' + ref.id + '/' + sec.id;
        // Strip "(N종)" quantity suffix from sidebar display only
        var sidebarTitle = (sec.title || '').replace(/\s*\([0-9]+종\)\s*$/, '');
        html += '<li><a class="sidebar-link" href="#' + sectionPath + '" data-section="' + sectionPath + '">';
        html += '<span class="sidebar-sec-num">' + escapeHtml(sec.num) + '</span>';
        html += escapeHtml(sidebarTitle);
        html += '</a></li>';
      });
      html += '</ul></li>';
    });
    refNavList.innerHTML = html;
  }

  /* ============ VIEWS ============ */
  function showHome() {
    if (homeHero) homeHero.style.display = '';
    homeSections.forEach(function (s) { s.style.display = ''; });
    if (reportView) reportView.style.display = 'none';
    highlightSidebar('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function hideHome() {
    if (homeHero) homeHero.style.display = 'none';
    homeSections.forEach(function (s) { s.style.display = 'none'; });
  }

  function showReport(html) {
    hideHome();
    if (reportView) {
      reportView.innerHTML = html;
      reportView.style.display = '';
      activateComponents();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ============ BLOCK RENDERERS ============ */

  function renderBlock(block) {
    switch (block.type) {
      case 'heading':  return renderHeading(block);
      case 'text':     return renderText(block);
      case 'note':     return renderNote(block);
      case 'kv':       return renderKV(block);
      case 'stats':    return renderStats(block);
      case 'sitemap':  return renderSitemap(block);
      case 'structure': return renderStructure(block);
      case 'palette':  return renderPalette(block);
      case 'typo':     return renderTypo(block);
      case 'component': return renderComponent(block);
      case 'spacingScale': return renderSpacingScale(block);
      case 'radiusScale':  return renderRadiusScale(block);
      default: return '';
    }
  }

  function renderHeading(block) {
    return '<h2 class="blk-heading">' + escapeHtml(block.value) + '</h2>';
  }

  function renderText(block) {
    return '<p class="blk-text">' + escapeHtml(block.value) + '</p>';
  }

  function renderNote(block) {
    return '<div class="blk-note"><div class="blk-note-icon">i</div><p>' + escapeHtml(block.value) + '</p></div>';
  }

  function renderKV(block) {
    var cols = block.columns || 1;
    var h = '';
    if (block.title) {
      h += '<div class="blk-kv-title">' + escapeHtml(block.title) + '</div>';
    }
    h += '<div class="blk-kv blk-kv--col' + cols + '">';
    (block.items || []).forEach(function (item) {
      h += '<div class="blk-kv-item">';
      h += '<dt>' + escapeHtml(item.label) + '</dt>';
      h += '<dd>' + escapeHtml(item.value) + '</dd>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function renderStats(block) {
    var h = '<div class="blk-stats">';
    (block.items || []).forEach(function (item) {
      h += '<div class="blk-stat">';
      h += '<div class="blk-stat-number">' + escapeHtml(String(item.number)) + '</div>';
      if (item.suffix) h += '<div class="blk-stat-suffix">' + escapeHtml(item.suffix) + '</div>';
      h += '<div class="blk-stat-label">' + escapeHtml(item.label) + '</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function renderSitemap(block) {
    var h = '<div class="blk-sitemap">';
    (block.items || []).forEach(function (item) {
      h += '<div class="blk-sitemap-group">';
      h += '<div class="blk-sitemap-parent">' + escapeHtml(item.label) + '</div>';
      h += '<div class="blk-sitemap-children">';
      (item.children || []).forEach(function (child) {
        h += '<span class="blk-sitemap-child">' + escapeHtml(child) + '</span>';
      });
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  function renderStructure(block) {
    var h = '<div class="blk-structure">';
    (block.items || []).forEach(function (item, i) {
      h += '<div class="blk-structure-row">';
      h += '<div class="blk-structure-index">' + (i + 1) + '</div>';
      h += '<div class="blk-structure-body">';
      h += '<div class="blk-structure-label">' + escapeHtml(item.label);
      if (item.tag) h += '<span class="blk-structure-tag">' + escapeHtml(item.tag) + '</span>';
      h += '</div>';
      h += '<div class="blk-structure-desc">' + escapeHtml(item.desc) + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  function renderPalette(block) {
    var h = '';
    if (block.title) {
      h += '<div class="blk-palette-title">' + escapeHtml(block.title) + '</div>';
    }
    h += '<div class="blk-palette">';
    (block.colors || []).forEach(function (c) {
      var light = isLightColor(c.hex);
      h += '<div class="blk-swatch">';
      h += '<div class="blk-swatch-color' + (light ? ' blk-swatch--light' : '') + '" style="background:' + escapeHtml(c.hex) + '">';
      h += '<span>' + escapeHtml(c.hex) + '</span>';
      h += '</div>';
      h += '<div class="blk-swatch-info">';
      h += '<div class="blk-swatch-name">' + escapeHtml(c.name) + '</div>';
      h += '<div class="blk-swatch-usage">' + escapeHtml(c.usage) + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  function isLightColor(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  }

  function renderTypo(block) {
    var h = '<div class="blk-typo">';
    (block.items || []).forEach(function (item) {
      var style = 'font-size:' + escapeHtml(item.size) + ';font-weight:' + item.weight;
      if (item.tracking) style += ';letter-spacing:' + escapeHtml(item.tracking);
      h += '<div class="blk-typo-row">';
      h += '<div class="blk-typo-meta">';
      h += '<span class="blk-typo-label">' + escapeHtml(item.label) + '</span>';
      h += '<span class="blk-typo-spec">' + escapeHtml(item.size) + ' · ' + item.weight;
      if (item.tracking) h += ' · ' + escapeHtml(item.tracking);
      h += '</span>';
      h += '</div>';
      h += '<div class="blk-typo-sample" style="' + style + '">' + escapeHtml(item.sample) + '</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function renderComponent(block) {
    var id = uid();
    var full = block.fullWidth ? ' blk-component--full' : '';
    var h = '<div class="blk-component' + full + '">';
    if (block.title) {
      h += '<div class="blk-component-title">' + escapeHtml(block.title) + '</div>';
    }
    var previewCls = 'blk-component-preview' + (block.fullWidth ? ' blk-component-preview--full' : '');
    h += '<div class="' + previewCls + '" id="' + id + '"';
    h += ' data-html="' + escapeHtml(block.html || '') + '"';
    h += ' data-css="' + escapeHtml(block.css || '') + '"';
    if (block.js) h += ' data-js="' + escapeHtml(block.js) + '"';
    h += '></div></div>';
    return h;
  }

  function renderSpacingScale(block) {
    var h = '<div class="blk-spacing-scale">';
    (block.items || []).forEach(function (item) {
      h += '<div class="blk-spacing-row">';
      h += '<div class="blk-spacing-label">' + escapeHtml(item.label) + '</div>';
      h += '<div class="blk-spacing-bar-wrap">';
      h += '<div class="blk-spacing-bar" style="width:' + Math.min(item.px, 200) + 'px"></div>';
      h += '</div>';
      h += '<div class="blk-spacing-px">' + item.px + 'px</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function renderRadiusScale(block) {
    var h = '<div class="blk-radius-scale">';
    (block.items || []).forEach(function (item) {
      var r = item.px >= 99 ? '50%' : item.px + 'px';
      h += '<div class="blk-radius-item">';
      h += '<div class="blk-radius-box" style="border-radius:' + r + '"></div>';
      h += '<div class="blk-radius-info">';
      h += '<div class="blk-radius-name">' + escapeHtml(item.label) + '</div>';
      h += '<div class="blk-radius-val">' + (item.px >= 99 ? '50% (full)' : item.px + 'px') + '</div>';
      if (item.usage) h += '<div class="blk-radius-usage">' + escapeHtml(item.usage) + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  /* ============ COMPONENT ACTIVATION ============ */
  function activateComponents() {
    var previews = document.querySelectorAll('.blk-component-preview');
    previews.forEach(function (el) {
      var rawHtml = el.getAttribute('data-html');
      var rawCss = el.getAttribute('data-css');
      var rawJs = el.getAttribute('data-js');
      if (!rawHtml) return;

      var styleTag = rawCss ? '<style>' + rawCss + '</style>' : '';
      el.innerHTML = styleTag + rawHtml;

      if (rawJs) {
        var ioObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !el.dataset.animated) {
              el.dataset.animated = '1';
              try { new Function(rawJs)(); } catch (e) { /* silent */ }
              ioObserver.unobserve(el);
            }
          });
        }, { threshold: 0.15 });
        ioObserver.observe(el);
      }
    });
  }

  /* ============ REPORT RENDERING ============ */
  function renderRefOverview(analysis) {
    var h = '';
    h += '<div class="report-header">';
    h += '<a class="report-back" href="#">← 홈으로</a>';
    h += '<div class="report-meta">';
    h += '<span class="tag">레퍼런스 보고서</span>';
    h += '<span class="report-date">' + escapeHtml(analysis.date) + '</span>';
    h += '</div>';
    h += '<h1 class="report-title">' + escapeHtml(analysis.title) + ' 레퍼런스 보고서</h1>';
    h += '<p class="report-summary">' + escapeHtml(analysis.summary) + '</p>';
    h += '<a class="report-url" href="' + escapeHtml(analysis.url) + '" target="_blank" rel="noopener noreferrer">';
    h += '<svg class="ico"><use href="#i-link"/></svg>' + escapeHtml(analysis.url);
    h += '</a>';
    if (analysis.crawledPages) {
      h += '<span class="report-crawled">' + analysis.crawledPages + '개 페이지 크롤링</span>';
    }
    h += '</div>';

    var defs = getSectionDefs(analysis.id);
    h += '<div class="report-sections-grid">';
    defs.forEach(function (def) {
      var sec = analysis.sections[def.id];
      if (!sec) return;
      var sectionPath = 'ref/' + analysis.id + '/' + def.id;
      var blockCount = sec.blocks ? sec.blocks.length : (sec.items ? sec.items.length : 0);
      h += '<a class="report-section-card" href="#' + sectionPath + '">';
      h += '<div class="report-section-num">' + escapeHtml(def.num) + '</div>';
      h += '<h3>' + escapeHtml(sec.title) + '</h3>';
      h += '<p>' + escapeHtml(def.desc) + '</p>';
      h += '<span class="report-section-count">' + blockCount + '개 블록</span>';
      h += '</a>';
    });
    h += '</div>';

    return h;
  }

  function renderSection(analysis, sectionId) {
    var sec = analysis.sections[sectionId];
    if (!sec) return '<p>섹션을 찾을 수 없습니다.</p>';
    var defs = getSectionDefs(analysis.id);
    var def = null;
    defs.forEach(function (d) { if (d.id === sectionId) def = d; });
    var num = def ? def.num : '';

    var h = '';
    h += '<div class="report-header">';
    h += '<a class="report-back" href="#ref/' + escapeHtml(analysis.id) + '">← ' + escapeHtml(analysis.title) + ' 보고서</a>';
    h += '<div class="report-meta">';
    h += '<span class="tag">' + escapeHtml(analysis.title) + '</span>';
    h += '<span class="report-date">' + escapeHtml(analysis.date) + '</span>';
    h += '</div>';
    h += '<div class="report-section-header">';
    h += '<span class="report-section-header-num">' + escapeHtml(num) + '</span>';
    h += '<h1 class="report-title">' + escapeHtml(sec.title) + '</h1>';
    h += '</div>';
    h += '</div>';

    h += '<div class="report-blocks">';
    if (sec.blocks && sec.blocks.length > 0) {
      sec.blocks.forEach(function (block) {
        h += renderBlock(block);
      });
    } else if (sec.items && sec.items.length > 0) {
      h += '<div class="report-findings">';
      sec.items.forEach(function (item) {
        h += '<div class="finding-row">';
        h += '<div class="finding-label">' + escapeHtml(item.label) + '</div>';
        h += '<div class="finding-value">' + escapeHtml(item.value) + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '</div>';

    if (sec.note) {
      h += '<div class="blk-note"><div class="blk-note-icon">i</div><p>' + escapeHtml(sec.note) + '</p></div>';
    }

    var prevDef = null;
    var nextDef = null;
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === sectionId) {
        if (i > 0) prevDef = defs[i - 1];
        if (i < defs.length - 1) nextDef = defs[i + 1];
        break;
      }
    }
    h += '<div class="report-nav">';
    if (prevDef) {
      h += '<a class="report-nav-link" href="#ref/' + analysis.id + '/' + prevDef.id + '">';
      h += '<span class="report-nav-dir">← 이전</span>';
      h += '<span class="report-nav-label">' + escapeHtml(prevDef.num) + ' ' + escapeHtml(prevDef.title) + '</span>';
      h += '</a>';
    } else {
      h += '<span></span>';
    }
    if (nextDef) {
      h += '<a class="report-nav-link report-nav-next" href="#ref/' + analysis.id + '/' + nextDef.id + '">';
      h += '<span class="report-nav-dir">다음 →</span>';
      h += '<span class="report-nav-label">' + escapeHtml(nextDef.num) + ' ' + escapeHtml(nextDef.title) + '</span>';
      h += '</a>';
    }
    h += '</div>';

    return h;
  }

  /* ============ SIDEBAR HIGHLIGHT ============ */
  function highlightSidebar(id) {
    document.querySelectorAll('.sidebar-link').forEach(function (l) {
      l.classList.remove('is-active');
    });
    var link = document.querySelector('.sidebar-link[data-section="' + id + '"]');
    if (!link) return;
    link.classList.add('is-active');
    var sub = link.closest('.sidebar-sub');
    if (sub) {
      var exp = sub.closest('.sidebar-expandable');
      if (exp) exp.classList.add('is-open');
    }
  }

  /* ============ ROUTING ============ */
  function route() {
    var hash = location.hash.replace(/^#\/?/, '').trim();

    if (!hash) {
      showHome();
      return;
    }

    var parts = hash.split('/');
    if (parts[0] !== 'ref' || !parts[1]) {
      showHome();
      return;
    }

    var refId = parts[1];
    var sectionId = parts[2] || null;

    highlightSidebar(hash);

    loadAnalysis(refId).then(function (analysis) {
      if (sectionId) {
        showReport(renderSection(analysis, sectionId));
      } else {
        showReport(renderRefOverview(analysis));
      }
    }).catch(function () {
      showReport('<div class="report-header"><a class="report-back" href="#">← 홈으로</a><h1 class="report-title">분석 데이터를 불러올 수 없습니다</h1></div>');
    });
  }

  /* ============ SIDEBAR INTERACTIONS ============ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.sidebar-link');
    if (!link) return;

    var parent = link.parentElement;
    if (parent && parent.classList.contains('sidebar-expandable')) {
      var targetHash = link.getAttribute('href') || '';
      var currentHash = location.hash || '';
      if (targetHash === currentHash || '#' + targetHash === currentHash) {
        e.preventDefault();
        parent.classList.toggle('is-open');
        return;
      }
      parent.classList.add('is-open');
    }

    if (link.closest('.sidebar-sub')) {
      closeSidebarMobile();
    } else if (!parent || !parent.classList.contains('sidebar-expandable')) {
      closeSidebarMobile();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ============ SCROLL FADE-IN ============ */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.analysis-card').forEach(function (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 500ms cubic-bezier(0.2,0,0,1), transform 500ms cubic-bezier(0.2,0,0,1)';
    observer.observe(card);
  });

  /* ============ INIT ============ */
  window.addEventListener('hashchange', route);

  function init() {
    loadSystem().then(function () {
      route();
    }).catch(function () {
      route();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
