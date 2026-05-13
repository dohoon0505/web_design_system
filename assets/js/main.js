(function () {
  'use strict';

  /* ============ UTILITIES ============ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

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
      html += '<li class="sidebar-expandable">';
      html += '<a class="sidebar-link" href="#ref/' + escapeHtml(ref.id) + '" data-section="ref/' + escapeHtml(ref.id) + '">';
      html += '<svg class="ico"><use href="#i-link"/></svg>';
      html += escapeHtml(ref.title);
      html += '<svg class="chevron" width="14" height="14"><use href="#i-chevron-down"/></svg>';
      html += '</a>';
      html += '<ul class="sidebar-sub">';
      sectionDefs.forEach(function (sec) {
        var sectionPath = 'ref/' + ref.id + '/' + sec.id;
        html += '<li><a class="sidebar-link" href="#' + sectionPath + '" data-section="' + sectionPath + '">';
        html += '<span class="sidebar-sec-num">' + escapeHtml(sec.num) + '</span>';
        html += escapeHtml(sec.title);
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
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
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
    h += '</div>';

    h += '<div class="report-sections-grid">';
    sectionDefs.forEach(function (def) {
      var sec = analysis.sections[def.id];
      if (!sec) return;
      var sectionPath = 'ref/' + analysis.id + '/' + def.id;
      h += '<a class="report-section-card" href="#' + sectionPath + '">';
      h += '<div class="report-section-num">' + escapeHtml(def.num) + '</div>';
      h += '<h3>' + escapeHtml(sec.title) + '</h3>';
      h += '<p>' + escapeHtml(def.desc) + '</p>';
      h += '<span class="report-section-count">' + (sec.items ? sec.items.length : 0) + '개 항목</span>';
      h += '</a>';
    });
    h += '</div>';

    return h;
  }

  function renderSection(analysis, sectionId) {
    var sec = analysis.sections[sectionId];
    if (!sec) return '<p>섹션을 찾을 수 없습니다.</p>';
    var def = null;
    sectionDefs.forEach(function (d) { if (d.id === sectionId) def = d; });
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

    if (sec.items && sec.items.length > 0) {
      h += '<div class="report-findings">';
      sec.items.forEach(function (item) {
        h += '<div class="finding-row">';
        h += '<div class="finding-label">' + escapeHtml(item.label) + '</div>';
        h += '<div class="finding-value">' + escapeHtml(item.value) + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }

    if (sec.note) {
      h += '<div class="report-note">';
      h += '<div class="report-note-title">분석 노트</div>';
      h += '<p>' + escapeHtml(sec.note) + '</p>';
      h += '</div>';
    }

    // Section navigation
    var prevDef = null;
    var nextDef = null;
    for (var i = 0; i < sectionDefs.length; i++) {
      if (sectionDefs[i].id === sectionId) {
        if (i > 0) prevDef = sectionDefs[i - 1];
        if (i < sectionDefs.length - 1) nextDef = sectionDefs[i + 1];
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
