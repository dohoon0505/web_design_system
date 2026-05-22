(function () {
  'use strict';

  /* ============ UTILITIES ============ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    // textNode.innerHTML escapes <, >, & but NOT " or '
    // Without escaping these, attribute values (data-html="...") break when content contains "
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
      html += '<li>';
      html += '<a class="sidebar-link" href="#ref/' + escapeHtml(ref.id) + '" data-section="ref/' + escapeHtml(ref.id) + '">';
      html += '<svg class="ico"><use href="#i-link"/></svg>';
      html += escapeHtml(ref.title);
      html += '</a>';
      html += '</li>';
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

    // Preview-button mode: when block.preview URL is set, render a thumbnail card + [프리뷰] button
    // that opens a Figma-style modal with the live preview page (matching KT&G tech stack).
    if (block.preview) {
      var thumbBg = block.thumbBg ? ' style="background:' + escapeHtml(block.thumbBg) + '"' : '';
      var thumbLabel = block.thumbLabel || block.title || 'Preview';
      h += '<div class="blk-preview-card">';
      h += '  <div class="blk-preview-thumb"' + thumbBg + '>';
      h += '    <div class="blk-preview-thumb-label">' + escapeHtml(thumbLabel) + '</div>';
      h += '    <div class="blk-preview-thumb-meta">' + escapeHtml(block.preview) + '</div>';
      h += '  </div>';
      h += '  <button class="blk-preview-btn" data-preview-url="' + escapeHtml(block.preview) + '" data-preview-title="' + escapeHtml(block.title || '') + '">';
      h += '    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      h += '    <span>프리뷰 열기</span>';
      h += '  </button>';
      h += '</div>';
      h += '</div>';
      return h;
    }

    // Legacy inline preview mode (existing component blocks with inline HTML/CSS/JS)
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

    // Wire up [프리뷰 열기] buttons → open modal with the preview page
    var previewBtns = document.querySelectorAll('.blk-preview-btn');
    previewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-preview-url');
        var title = btn.getAttribute('data-preview-title') || '';
        openPreviewModal(url, title);
      });
    });
  }

  /* ============ PREVIEW MODAL (Figma-style overlay) ============ */
  function ensurePreviewModal() {
    var modal = document.getElementById('preview-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.className = 'preview-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = ''
      + '<div class="preview-modal__backdrop" data-close></div>'
      + '<div class="preview-modal__panel">'
      +   '<header class="preview-modal__header">'
      +     '<div class="preview-modal__title-wrap">'
      +       '<span class="preview-modal__badge">PREVIEW</span>'
      +       '<span class="preview-modal__title"></span>'
      +     '</div>'
      +     '<div class="preview-modal__controls">'
      +       '<a class="preview-modal__open-tab" target="_blank" rel="noopener noreferrer" title="새 탭에서 열기">'
      +         '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
      +       '</a>'
      +       '<button class="preview-modal__close" data-close title="닫기 (ESC)" aria-label="닫기">'
      +         '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      +       '</button>'
      +     '</div>'
      +   '</header>'
      +   '<div class="preview-modal__viewport">'
      +     '<iframe class="preview-modal__frame" title="Preview" loading="lazy"></iframe>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(modal);

    // Close handlers
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closePreviewModal);
    });
    // ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closePreviewModal();
    });
    return modal;
  }

  function openPreviewModal(url, title) {
    var modal = ensurePreviewModal();
    var frame = modal.querySelector('.preview-modal__frame');
    var titleEl = modal.querySelector('.preview-modal__title');
    var openTab = modal.querySelector('.preview-modal__open-tab');
    titleEl.textContent = title || 'Preview';
    openTab.setAttribute('href', url);
    frame.setAttribute('src', url);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePreviewModal() {
    var modal = document.getElementById('preview-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear iframe src to stop video/audio
    setTimeout(function () {
      var frame = modal.querySelector('.preview-modal__frame');
      if (frame) frame.setAttribute('src', 'about:blank');
    }, 220);
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
    h += '<a class="report-url" href="' + escapeHtml(analysis.url) + '" target="_blank" rel="noopener noreferrer">';
    h += '<svg class="ico"><use href="#i-link"/></svg>' + escapeHtml(analysis.url);
    h += '</a>';
    h += '</div>';

    // Render ALL sections inline below the header (no separate navigation)
    var defs = getSectionDefs(analysis.id);
    var sectionIds = defs.length > 0 ? defs.map(function (d) { return d.id; })
                                     : Object.keys(analysis.sections);
    sectionIds.forEach(function (sid) {
      var sec = analysis.sections[sid];
      if (!sec) return;
      var def = defs.find ? defs.find(function (d) { return d.id === sid; }) : null;
      var num = def && def.num ? def.num : '';
      h += '<section class="report-inline-section" id="sec-' + escapeHtml(sid) + '">';
      h += '<div class="report-section-header">';
      if (num) h += '<span class="report-section-header-num">' + escapeHtml(num) + '</span>';
      h += '<h2 class="report-section-title">' + escapeHtml(sec.title) + '</h2>';
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
      h += '</section>';
    });

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
    if (link) link.classList.add('is-active');
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

    // Section URLs redirect to ref overview (sections removed from UX per simplified spec)
    if (parts[2]) {
      location.replace('#ref/' + refId);
      return;
    }

    highlightSidebar('ref/' + refId);

    loadAnalysis(refId).then(function (analysis) {
      showReport(renderRefOverview(analysis));
    }).catch(function () {
      showReport('<div class="report-header"><a class="report-back" href="#">← 홈으로</a><h1 class="report-title">분석 데이터를 불러올 수 없습니다</h1></div>');
    });
  }

  /* ============ SIDEBAR INTERACTIONS ============ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.sidebar-link');
    if (!link) return;
    closeSidebarMobile();
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
