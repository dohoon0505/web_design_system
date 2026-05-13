/* =========================================================
   Web Design System — Main JS
   Router, dynamic sidebar, markdown export, theme toggle.
   Mirrors mechanism of dohoon0505/desgin_system app reference.
   ========================================================= */

(function () {
  'use strict';

  // ---------- State ----------
  const state = {
    manifest: null,
    analyses: new Map(), // id -> analysis.json data (lazy-loaded)
    currentHash: '',
  };

  // ---------- DOM refs ----------
  const $sidebar = document.getElementById('sidebar');
  const $sidebarNav = document.getElementById('sidebar-nav');
  const $main = document.querySelector('.container');
  const $scrim = document.getElementById('scrim');
  const $hamburger = document.getElementById('hamburger');
  const $sidebarClose = document.getElementById('sidebar-close');
  const $themeToggleTopbar = document.getElementById('theme-toggle-topbar');
  const $themeToggleSidebar = document.getElementById('theme-toggle-sidebar');

  // ---------- Utilities ----------
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2), attrs[k]);
        } else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function svgIcon(id) {
    return `<svg class="icon" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
  }

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    try { localStorage.setItem('wds-theme', theme); } catch (e) { /* ignore */ }
  }
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('wds-theme'); } catch (e) { /* ignore */ }
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
  function toggleTheme() {
    const cur = document.body.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'light' ? 'dark' : 'light');
  }

  // ---------- Sidebar (mobile) ----------
  function openSidebar() {
    $sidebar.classList.add('is-open');
    $scrim.hidden = false;
    requestAnimationFrame(() => $scrim.classList.add('is-visible'));
    $hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    $sidebar.classList.remove('is-open');
    $scrim.classList.remove('is-visible');
    $hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { $scrim.hidden = true; }, 200);
  }
  function toggleSidebar() {
    if ($sidebar.classList.contains('is-open')) closeSidebar();
    else openSidebar();
  }
  function closeSidebarIfMobile() {
    if (window.matchMedia('(max-width: 1099px)').matches) closeSidebar();
  }

  // ---------- Manifest load ----------
  async function loadManifest() {
    try {
      const res = await fetch('system.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load system.json: ' + res.status);
      state.manifest = await res.json();
    } catch (err) {
      console.error(err);
      state.manifest = {
        name: 'Web Design System',
        version: '0.1.0',
        groups: [
          { id: 'getting-started', title: 'Getting Started', items: [{ id: 'about', title: 'About', type: 'static' }] },
          { id: 'analyses', title: 'Analyses', items: [] },
        ],
        analysisSections: [],
      };
    }
  }

  async function loadAnalysis(id) {
    if (state.analyses.has(id)) return state.analyses.get(id);
    try {
      const res = await fetch(`analyses/${encodeURIComponent(id)}/analysis.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load analysis: ' + res.status);
      const data = await res.json();
      state.analyses.set(id, data);
      return data;
    } catch (err) {
      console.error('Could not load analysis ' + id, err);
      return null;
    }
  }

  // ---------- Sidebar render ----------
  function renderSidebar() {
    if (!state.manifest) return;
    const groups = state.manifest.groups || [];
    const analysisSections = state.manifest.analysisSections || [];
    $sidebarNav.innerHTML = '';

    groups.forEach((group) => {
      const $group = el('div', { class: 'sidebar-group' });
      $group.appendChild(el('div', { class: 'sidebar-group-title', text: group.title }));
      const $ul = el('ul', { class: 'sidebar-nav' });

      if (group.id === 'analyses' && (!group.items || group.items.length === 0)) {
        $ul.appendChild(el('li', { class: 'sidebar-empty', text: '아직 분석된 사이트가 없습니다.' }));
      } else {
        (group.items || []).forEach((item) => {
          if (group.id === 'analyses') {
            // expandable analysis entry with subsections
            const $li = el('li', { class: 'sidebar-expandable' });
            const $link = el('a', {
              class: 'sidebar-link',
              href: `#analyses/${item.id}`,
              'data-section': item.id,
              'data-route': `analyses/${item.id}`,
              html: `<span>${escapeHtml(item.title)}</span>${svgIcon('chevron-right')}`,
            });
            $li.appendChild($link);
            const $sub = el('ul', { class: 'sidebar-sub' });
            analysisSections.forEach((s) => {
              $sub.appendChild(el('li', null,
                el('a', {
                  class: 'sidebar-link',
                  href: `#analyses/${item.id}/${s.id}`,
                  'data-section': `${item.id}/${s.id}`,
                  'data-route': `analyses/${item.id}/${s.id}`,
                  text: s.title,
                })
              ));
            });
            $li.appendChild($sub);
            $ul.appendChild($li);
          } else {
            // flat static link
            const $li = el('li', null,
              el('a', {
                class: 'sidebar-link',
                href: `#${group.id}/${item.id}`,
                'data-section': item.id,
                'data-route': `${group.id}/${item.id}`,
                text: item.title,
              })
            );
            $ul.appendChild($li);
          }
        });
      }
      $group.appendChild($ul);
      $sidebarNav.appendChild($group);
    });

    // Wire expand/collapse and click-close-on-mobile
    $sidebarNav.querySelectorAll('.sidebar-expandable > .sidebar-link').forEach(($a) => {
      $a.addEventListener('click', (e) => {
        // toggle expand without preventing navigation
        const $li = $a.parentElement;
        $li.classList.toggle('is-open');
      });
    });
    $sidebarNav.querySelectorAll('.sidebar-link').forEach(($a) => {
      $a.addEventListener('click', () => closeSidebarIfMobile());
    });
  }

  function highlightSidebar(hash) {
    $sidebarNav.querySelectorAll('.sidebar-link').forEach(($a) => {
      $a.classList.remove('is-active');
    });
    if (!hash) return;
    // try exact, then prefix (parent)
    let $active = $sidebarNav.querySelector(`.sidebar-link[data-route="${hash}"]`);
    if (!$active) {
      // try parent route (e.g., analyses/amazon when hash is analyses/amazon/colors)
      const parent = hash.split('/').slice(0, 2).join('/');
      $active = $sidebarNav.querySelector(`.sidebar-link[data-route="${parent}"]`);
    }
    if ($active) {
      $active.classList.add('is-active');
      // auto-expand parent if inside expandable
      const $exp = $active.closest('.sidebar-expandable');
      if ($exp) $exp.classList.add('is-open');
    }
    // also highlight topbar nav
    document.querySelectorAll('.topbar-link').forEach(($a) => {
      $a.classList.toggle('is-active', $a.getAttribute('href') === '#' + hash);
    });
  }

  // ---------- Routing ----------
  function getHash() {
    return (window.location.hash || '').replace(/^#/, '');
  }

  async function route() {
    const hash = getHash();
    state.currentHash = hash;
    highlightSidebar(hash);

    if (!hash) {
      renderHome();
    } else if (hash === 'analyses') {
      renderAnalysesIndex();
    } else if (hash.startsWith('analyses/')) {
      const parts = hash.split('/');
      const id = parts[1];
      const section = parts[2] || null;
      await renderAnalysis(id, section);
    } else if (hash.startsWith('getting-started/')) {
      renderStatic(hash.replace('getting-started/', ''));
    } else {
      renderHome();
    }

    // scroll to top of content (except section anchors)
    if (!hash.includes('/') || !hash.split('/')[2]) {
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }
  }

  // ---------- Views ----------
  function renderHome() {
    const analyses = (state.manifest.groups.find((g) => g.id === 'analyses') || {}).items || [];
    $main.innerHTML = '';

    const hero = el('div', { class: 'page-hero' });
    hero.appendChild(el('div', { class: 'page-eyebrow', text: 'Web Design System' }));
    hero.appendChild(el('h1', { class: 'page-title', text: 'Website Analysis Catalog' }));
    hero.appendChild(el('p', { class: 'page-subtitle', text: '웹페이지 URL을 분석한 결과가 이 카탈로그에 누적됩니다. 각 분석은 좌측 네비게이터의 한 카테고리가 됩니다.' }));
    $main.appendChild(hero);

    if (analyses.length === 0) {
      const empty = el('div', { class: 'empty-state' });
      empty.appendChild(el('div', { class: 'empty-state-icon', html: svgIcon('globe') }));
      empty.appendChild(el('h2', { class: 'empty-state-title', text: '아직 분석된 사이트가 없습니다' }));
      empty.appendChild(el('p', {
        class: 'empty-state-desc',
        text: '어시스턴트에게 분석할 웹페이지 URL을 알려주세요. 분석 결과가 좌측 네비게이터에 카테고리로 누적됩니다.',
      }));
      $main.appendChild(empty);
      return;
    }

    const grid = el('div', { class: 'card-grid' });
    analyses.forEach((a) => {
      const card = el('a', { class: 'card', href: `#analyses/${a.id}` });
      card.appendChild(el('h3', { class: 'card-title', text: a.title || a.id }));
      if (a.url) card.appendChild(el('div', { class: 'card-url', text: a.url }));
      if (a.summary) card.appendChild(el('p', { class: 'card-desc', text: a.summary }));
      if (a.analyzedAt) card.appendChild(el('div', { class: 'card-meta', text: 'Analyzed ' + a.analyzedAt }));
      grid.appendChild(card);
    });
    $main.appendChild(grid);
  }

  function renderAnalysesIndex() {
    renderHome();
  }

  function renderStatic(id) {
    $main.innerHTML = '';
    const hero = el('div', { class: 'page-hero' });
    hero.appendChild(el('div', { class: 'page-eyebrow', text: 'Getting Started' }));
    const content = el('div', { class: 'content' });

    if (id === 'about') {
      hero.appendChild(el('h1', { class: 'page-title', text: 'About' }));
      hero.appendChild(el('p', { class: 'page-subtitle', text: '본 디자인시스템의 컨셉과 구조 안내.' }));
      content.innerHTML = `
        <h3>컨셉</h3>
        <p>이 디자인시스템은 <strong>웹사이트 분석 카탈로그</strong>입니다. 사용자가 URL을 제공하면 어시스턴트가 해당 페이지의 기술 스택, 색상, 타이포그래피, 레이아웃, 컴포넌트, 아이코노그래피, 인터랙션, 접근성을 분석합니다. 각 분석 결과는 좌측 네비게이터의 한 카테고리로 누적됩니다.</p>
        <h3>참조 아키텍처</h3>
        <p>레이아웃 셸, 좌측 네비게이터, MD 다운로드, 해시 라우팅, 검증 스크립트 등의 시스템 골격은 <a href="https://github.com/dohoon0505/desgin_system" target="_blank" rel="noopener">dohoon0505/desgin_system</a>의 아키텍처를 미러링합니다.</p>
        <h3>저장 구조</h3>
        <p>각 분석은 <code>analyses/{id}/analysis.json</code>과 <code>analyses/{id}/analysis.md</code>로 저장되며, <code>system.json</code> 매니페스트가 단일 진실 공급원입니다.</p>
      `;
    } else if (id === 'how-to-use') {
      hero.appendChild(el('h1', { class: 'page-title', text: 'How to Use' }));
      hero.appendChild(el('p', { class: 'page-subtitle', text: '분석 추가 및 카탈로그 사용 방법.' }));
      content.innerHTML = `
        <h3>1. 분석 요청</h3>
        <p>어시스턴트에게 분석할 페이지 URL을 전달합니다. 예: <em>"https://example.com 분석해줘"</em></p>
        <h3>2. 분석 생성</h3>
        <p>어시스턴트가 페이지를 가져와 9개 섹션(Overview, Tech Stack, Colors, Typography, Layout & Grid, Components, Iconography, Interactions, Accessibility)으로 분석하고, <code>analyses/{id}/</code>에 결과 파일을 작성합니다.</p>
        <h3>3. 매니페스트 등록</h3>
        <p>어시스턴트가 <code>system.json</code>의 <code>groups.analyses.items</code>에 새 entry를 추가합니다.</p>
        <h3>4. 새로고침</h3>
        <p>브라우저 새로고침 후 좌측 네비게이터에 새 카테고리가 표시됩니다. 클릭하면 상세 리포트로 이동합니다.</p>
        <h3>5. MD 다운로드</h3>
        <p>각 분석 상세 페이지의 <em>Download Report</em> 버튼으로 마크다운 리포트를 받을 수 있습니다.</p>
        <h3>검증</h3>
        <p><code>npm run validate</code> 명령으로 <code>system.json</code>과 <code>analyses/</code> 폴더 일관성을 확인합니다.</p>
      `;
    } else {
      hero.appendChild(el('h1', { class: 'page-title', text: 'Not Found' }));
      content.innerHTML = '<p>요청하신 페이지를 찾을 수 없습니다.</p>';
    }
    $main.appendChild(hero);
    $main.appendChild(content);
  }

  async function renderAnalysis(id, section) {
    $main.innerHTML = '<div class="loading">Loading…</div>';
    const data = await loadAnalysis(id);
    if (!data) {
      $main.innerHTML = '';
      const hero = el('div', { class: 'page-hero' });
      hero.appendChild(el('h1', { class: 'page-title', text: 'Analysis Not Found' }));
      hero.appendChild(el('p', { class: 'page-subtitle', text: `분석 데이터를 불러올 수 없습니다: analyses/${escapeHtml(id)}/analysis.json` }));
      $main.appendChild(hero);
      return;
    }

    $main.innerHTML = '';

    // Hero
    const hero = el('div', { class: 'page-hero' });
    hero.appendChild(el('div', { class: 'page-eyebrow', text: 'Analysis' }));
    hero.appendChild(el('h1', { class: 'page-title', text: data.title || data.id }));
    if (data.summary) hero.appendChild(el('p', { class: 'page-subtitle', text: data.summary }));

    const meta = el('div', { class: 'page-meta' });
    if (data.url) {
      const a = el('a', { href: data.url, target: '_blank', rel: 'noopener noreferrer', html: `${svgIcon('globe')}<span>${escapeHtml(data.url)}</span>` });
      meta.appendChild(a);
    }
    if (data.analyzedAt) meta.appendChild(el('span', { text: '• Analyzed ' + data.analyzedAt }));
    hero.appendChild(meta);

    const actions = el('div', { class: 'page-actions' });
    const dlBtn = el('button', {
      class: 'btn btn-primary',
      type: 'button',
      html: `${svgIcon('download')}<span>Download Report</span>`,
      onclick: () => downloadAnalysisMarkdown(id),
    });
    actions.appendChild(dlBtn);
    hero.appendChild(actions);
    $main.appendChild(hero);

    // Sections
    const sections = (state.manifest.analysisSections || []);
    sections.forEach((s) => {
      const $section = renderAnalysisSection(s.id, s.title, data);
      $main.appendChild($section);
    });

    // Scroll to specific section
    if (section) {
      setTimeout(() => {
        const $target = document.getElementById('s-' + section);
        if ($target) $target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      window.scrollTo({ top: 0 });
    }
  }

  function renderAnalysisSection(sectionId, title, data) {
    const wrap = el('section', { class: 'section' });
    const header = el('div', { class: 'section-header' });
    header.appendChild(el('h2', { class: 'section-title', id: 's-' + sectionId, text: title }));
    wrap.appendChild(header);

    let bodyHtml = '';
    switch (sectionId) {
      case 'overview':
        bodyHtml = renderOverview(data);
        break;
      case 'tech-stack':
        bodyHtml = renderTechStack(data.techStack);
        break;
      case 'colors':
        bodyHtml = renderColors(data.colors);
        break;
      case 'typography':
        bodyHtml = renderTypography(data.typography);
        break;
      case 'layout':
        bodyHtml = renderLayout(data.layout);
        break;
      case 'components':
        bodyHtml = renderComponents(data.components);
        break;
      case 'iconography':
        bodyHtml = renderIconography(data.iconography);
        break;
      case 'interactions':
        bodyHtml = renderInteractions(data.interactions);
        break;
      case 'accessibility':
        bodyHtml = renderAccessibility(data.accessibility);
        break;
      default:
        bodyHtml = '<p class="section-description">No content.</p>';
    }
    const body = el('div', { class: 'content', html: bodyHtml });
    wrap.appendChild(body);
    return wrap;
  }

  // ---------- Section renderers ----------
  function renderOverview(data) {
    const rows = [];
    if (data.url) rows.push(`<tr><th>URL</th><td><a href="${escapeHtml(data.url)}" target="_blank" rel="noopener">${escapeHtml(data.url)}</a></td></tr>`);
    if (data.analyzedAt) rows.push(`<tr><th>Analyzed</th><td>${escapeHtml(data.analyzedAt)}</td></tr>`);
    if (data.id) rows.push(`<tr><th>ID</th><td><code>${escapeHtml(data.id)}</code></td></tr>`);
    let html = '';
    if (data.summary) html += `<p>${escapeHtml(data.summary)}</p>`;
    if (rows.length) html += `<table class="table">${rows.join('')}</table>`;
    if (Array.isArray(data.screenshots) && data.screenshots.length) {
      html += data.screenshots.map((s) => `<figure><img src="analyses/${encodeURIComponent(data.id)}/${escapeHtml(s.src)}" alt="${escapeHtml(s.caption || '')}" />${s.caption ? `<figcaption>${escapeHtml(s.caption)}</figcaption>` : ''}</figure>`).join('');
    }
    return html || '<p class="section-description">No overview data.</p>';
  }
  function renderTechStack(t) {
    if (!t) return '<p class="section-description">No tech stack data.</p>';
    const groups = [
      ['Frameworks', t.frameworks],
      ['CSS Frameworks', t.cssFrameworks],
      ['Libraries', t.libraries],
      ['Fonts', t.fonts],
      ['Analytics', t.analytics],
    ];
    let html = '';
    groups.forEach(([label, arr]) => {
      if (Array.isArray(arr) && arr.length) {
        html += `<h3>${label}</h3><p>${arr.map((v) => `<span class="tag">${escapeHtml(v)}</span>`).join(' ')}</p>`;
      }
    });
    if (t.hosting) html += `<h3>Hosting</h3><p>${escapeHtml(t.hosting)}</p>`;
    if (t.cdn) html += `<h3>CDN</h3><p>${escapeHtml(t.cdn)}</p>`;
    if (t.notes) html += `<h3>Notes</h3><p>${escapeHtml(t.notes)}</p>`;
    return html || '<p class="section-description">No tech stack data.</p>';
  }
  function renderColors(c) {
    if (!c) return '<p class="section-description">No color data.</p>';
    let html = '';
    const labelled = [
      ['Primary', c.primary],
      ['Secondary', c.secondary],
      ['Accent', c.accent],
      ['Background', c.background],
      ['Surface', c.surface],
      ['Text', c.text],
      ['Text Muted', c.textMuted],
      ['Border', c.border],
    ].filter(([_, v]) => !!v);
    if (labelled.length) {
      html += '<h3>Named Roles</h3><table class="table"><thead><tr><th>Role</th><th>Value</th><th>Swatch</th></tr></thead><tbody>';
      labelled.forEach(([label, v]) => {
        html += `<tr><td>${label}</td><td><code>${escapeHtml(v)}</code></td><td><span class="color-swatch" style="--swatch-color:${escapeHtml(v)}">${escapeHtml(v)}</span></td></tr>`;
      });
      html += '</tbody></table>';
    }
    if (Array.isArray(c.extracted) && c.extracted.length) {
      html += '<h3>Extracted Palette</h3><table class="table"><thead><tr><th>Hex</th><th>Role</th><th>Usage</th><th>Swatch</th></tr></thead><tbody>';
      c.extracted.forEach((it) => {
        html += `<tr><td><code>${escapeHtml(it.hex)}</code></td><td>${escapeHtml(it.role || '')}</td><td>${escapeHtml(it.usage || '')}</td><td><span class="color-swatch" style="--swatch-color:${escapeHtml(it.hex)}">${escapeHtml(it.hex)}</span></td></tr>`;
      });
      html += '</tbody></table>';
    }
    return html || '<p class="section-description">No color data.</p>';
  }
  function renderTypography(t) {
    if (!t) return '<p class="section-description">No typography data.</p>';
    let html = '';
    const rows = [
      ['Heading Font', t.headingFont],
      ['Body Font', t.bodyFont],
      ['Mono Font', t.monoFont],
    ].filter(([_, v]) => !!v);
    if (rows.length) {
      html += '<table class="table"><tbody>';
      rows.forEach(([k, v]) => html += `<tr><th>${k}</th><td><code>${escapeHtml(v)}</code></td></tr>`);
      html += '</tbody></table>';
    }
    if (Array.isArray(t.fontSources) && t.fontSources.length) {
      html += `<h3>Font Sources</h3><ul>${t.fontSources.map((s) => `<li><code>${escapeHtml(s)}</code></li>`).join('')}</ul>`;
    }
    if (Array.isArray(t.sizes) && t.sizes.length) {
      html += '<h3>Sizes</h3><table class="table"><thead><tr><th>Name</th><th>Value</th><th>Usage</th></tr></thead><tbody>';
      t.sizes.forEach((s) => {
        html += `<tr><td>${escapeHtml(s.name || '')}</td><td><code>${escapeHtml(s.value || '')}</code></td><td>${escapeHtml(s.usage || '')}</td></tr>`;
      });
      html += '</tbody></table>';
    }
    if (Array.isArray(t.weights) && t.weights.length) {
      html += `<h3>Weights</h3><p>${t.weights.map((w) => `<span class="tag">${escapeHtml(String(w))}</span>`).join(' ')}</p>`;
    }
    if (t.notes) html += `<h3>Notes</h3><p>${escapeHtml(t.notes)}</p>`;
    return html || '<p class="section-description">No typography data.</p>';
  }
  function renderLayout(l) {
    if (!l) return '<p class="section-description">No layout data.</p>';
    let html = '';
    const rows = [
      ['Max Width', l.maxWidth],
      ['Grid', l.grid],
      ['Spacing', l.spacing],
    ].filter(([_, v]) => !!v);
    if (rows.length) {
      html += '<table class="table"><tbody>';
      rows.forEach(([k, v]) => html += `<tr><th>${k}</th><td>${escapeHtml(v)}</td></tr>`);
      html += '</tbody></table>';
    }
    if (Array.isArray(l.breakpoints) && l.breakpoints.length) {
      html += '<h3>Breakpoints</h3><table class="table"><thead><tr><th>Name</th><th>Min Width</th></tr></thead><tbody>';
      l.breakpoints.forEach((b) => {
        html += `<tr><td>${escapeHtml(b.name || '')}</td><td><code>${escapeHtml(b.minWidth || '')}</code></td></tr>`;
      });
      html += '</tbody></table>';
    }
    if (l.notes) html += `<h3>Notes</h3><p>${escapeHtml(l.notes)}</p>`;
    return html || '<p class="section-description">No layout data.</p>';
  }
  function renderComponents(arr) {
    if (!Array.isArray(arr) || !arr.length) return '<p class="section-description">No components data.</p>';
    let html = '<table class="table"><thead><tr><th>Name</th><th>Type</th><th>Variants</th><th>Notes</th></tr></thead><tbody>';
    arr.forEach((c) => {
      const variants = Array.isArray(c.variants) ? c.variants.map((v) => `<span class="tag">${escapeHtml(v)}</span>`).join(' ') : '';
      html += `<tr><td><strong>${escapeHtml(c.name || '')}</strong></td><td>${escapeHtml(c.type || '')}</td><td>${variants}</td><td>${escapeHtml(c.notes || '')}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  }
  function renderIconography(i) {
    if (!i) return '<p class="section-description">No iconography data.</p>';
    const rows = [
      ['Library', i.library],
      ['Style', i.style],
    ].filter(([_, v]) => !!v);
    let html = '';
    if (rows.length) {
      html += '<table class="table"><tbody>';
      rows.forEach(([k, v]) => html += `<tr><th>${k}</th><td>${escapeHtml(v)}</td></tr>`);
      html += '</tbody></table>';
    }
    if (i.notes) html += `<p>${escapeHtml(i.notes)}</p>`;
    return html || '<p class="section-description">No iconography data.</p>';
  }
  function renderInteractions(i) {
    if (!i) return '<p class="section-description">No interactions data.</p>';
    const rows = [
      ['Animations', i.animations],
      ['Transitions', i.transitions],
      ['Hover', i.hover],
    ].filter(([_, v]) => !!v);
    let html = '';
    if (rows.length) {
      html += '<table class="table"><tbody>';
      rows.forEach(([k, v]) => html += `<tr><th>${k}</th><td>${escapeHtml(v)}</td></tr>`);
      html += '</tbody></table>';
    }
    if (i.notes) html += `<p>${escapeHtml(i.notes)}</p>`;
    return html || '<p class="section-description">No interactions data.</p>';
  }
  function renderAccessibility(a) {
    if (!a) return '<p class="section-description">No accessibility data.</p>';
    const rows = [
      ['Contrast Ratio', a.contrastRatio],
      ['Keyboard', a.keyboard],
      ['ARIA', a.aria],
    ].filter(([_, v]) => !!v);
    let html = '';
    if (rows.length) {
      html += '<table class="table"><tbody>';
      rows.forEach(([k, v]) => html += `<tr><th>${k}</th><td>${escapeHtml(v)}</td></tr>`);
      html += '</tbody></table>';
    }
    if (a.notes) html += `<p>${escapeHtml(a.notes)}</p>`;
    return html || '<p class="section-description">No accessibility data.</p>';
  }

  // ---------- Markdown export ----------
  function _list(arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    return arr.map((v) => `- ${v}`).join('\n');
  }
  function _kv(label, value) {
    if (value === undefined || value === null || value === '') return '';
    return `- **${label}**: ${value}`;
  }
  function _tableRows(headers, rows) {
    const head = `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |`;
    const body = rows.map((r) => `| ${r.map((c) => (c === undefined || c === null ? '' : String(c).replace(/\|/g, '\\|'))).join(' | ')} |`).join('\n');
    return head + '\n' + body;
  }

  function generateAnalysisMarkdown(id, data) {
    const lines = [];
    lines.push(`# ${data.title || data.id}`);
    lines.push('');
    if (data.url) lines.push(`> ${data.url}`);
    if (data.analyzedAt) lines.push(`> Analyzed: ${data.analyzedAt}`);
    if (data.summary) { lines.push(''); lines.push(data.summary); }
    lines.push('');

    // Overview
    lines.push('## Overview');
    lines.push('');
    [_kv('URL', data.url), _kv('Analyzed', data.analyzedAt), _kv('ID', data.id)].filter(Boolean).forEach((l) => lines.push(l));
    lines.push('');

    // Tech Stack
    if (data.techStack) {
      lines.push('## Tech Stack');
      lines.push('');
      const t = data.techStack;
      if (t.frameworks && t.frameworks.length) { lines.push('### Frameworks'); lines.push(_list(t.frameworks)); lines.push(''); }
      if (t.cssFrameworks && t.cssFrameworks.length) { lines.push('### CSS Frameworks'); lines.push(_list(t.cssFrameworks)); lines.push(''); }
      if (t.libraries && t.libraries.length) { lines.push('### Libraries'); lines.push(_list(t.libraries)); lines.push(''); }
      if (t.fonts && t.fonts.length) { lines.push('### Fonts'); lines.push(_list(t.fonts)); lines.push(''); }
      if (t.analytics && t.analytics.length) { lines.push('### Analytics'); lines.push(_list(t.analytics)); lines.push(''); }
      [_kv('Hosting', t.hosting), _kv('CDN', t.cdn), _kv('Notes', t.notes)].filter(Boolean).forEach((l) => lines.push(l));
      lines.push('');
    }

    // Colors
    if (data.colors) {
      lines.push('## Color Palette');
      lines.push('');
      const c = data.colors;
      const labelled = [
        ['Primary', c.primary], ['Secondary', c.secondary], ['Accent', c.accent],
        ['Background', c.background], ['Surface', c.surface],
        ['Text', c.text], ['Text Muted', c.textMuted], ['Border', c.border],
      ].filter(([_, v]) => !!v);
      if (labelled.length) {
        lines.push('### Named Roles');
        lines.push(_tableRows(['Role', 'Value'], labelled));
        lines.push('');
      }
      if (Array.isArray(c.extracted) && c.extracted.length) {
        lines.push('### Extracted Palette');
        lines.push(_tableRows(['Hex', 'Role', 'Usage'], c.extracted.map((it) => [it.hex, it.role || '', it.usage || ''])));
        lines.push('');
      }
    }

    // Typography
    if (data.typography) {
      lines.push('## Typography');
      lines.push('');
      const t = data.typography;
      [_kv('Heading Font', t.headingFont), _kv('Body Font', t.bodyFont), _kv('Mono Font', t.monoFont)].filter(Boolean).forEach((l) => lines.push(l));
      lines.push('');
      if (t.fontSources && t.fontSources.length) {
        lines.push('### Font Sources');
        lines.push(_list(t.fontSources));
        lines.push('');
      }
      if (Array.isArray(t.sizes) && t.sizes.length) {
        lines.push('### Sizes');
        lines.push(_tableRows(['Name', 'Value', 'Usage'], t.sizes.map((s) => [s.name || '', s.value || '', s.usage || ''])));
        lines.push('');
      }
      if (Array.isArray(t.weights) && t.weights.length) {
        lines.push('### Weights'); lines.push(_list(t.weights)); lines.push('');
      }
      if (t.notes) { lines.push('### Notes'); lines.push(t.notes); lines.push(''); }
    }

    // Layout
    if (data.layout) {
      lines.push('## Layout & Grid');
      lines.push('');
      const l = data.layout;
      [_kv('Max Width', l.maxWidth), _kv('Grid', l.grid), _kv('Spacing', l.spacing)].filter(Boolean).forEach((x) => lines.push(x));
      lines.push('');
      if (Array.isArray(l.breakpoints) && l.breakpoints.length) {
        lines.push('### Breakpoints');
        lines.push(_tableRows(['Name', 'Min Width'], l.breakpoints.map((b) => [b.name || '', b.minWidth || ''])));
        lines.push('');
      }
      if (l.notes) { lines.push('### Notes'); lines.push(l.notes); lines.push(''); }
    }

    // Components
    if (Array.isArray(data.components) && data.components.length) {
      lines.push('## Components');
      lines.push('');
      lines.push(_tableRows(['Name', 'Type', 'Variants', 'Notes'],
        data.components.map((c) => [c.name || '', c.type || '', (c.variants || []).join(', '), c.notes || ''])));
      lines.push('');
    }

    // Iconography
    if (data.iconography) {
      lines.push('## Iconography');
      lines.push('');
      [_kv('Library', data.iconography.library), _kv('Style', data.iconography.style)].filter(Boolean).forEach((l) => lines.push(l));
      if (data.iconography.notes) { lines.push(''); lines.push(data.iconography.notes); }
      lines.push('');
    }

    // Interactions
    if (data.interactions) {
      lines.push('## Interactions');
      lines.push('');
      [_kv('Animations', data.interactions.animations), _kv('Transitions', data.interactions.transitions), _kv('Hover', data.interactions.hover)].filter(Boolean).forEach((l) => lines.push(l));
      if (data.interactions.notes) { lines.push(''); lines.push(data.interactions.notes); }
      lines.push('');
    }

    // Accessibility
    if (data.accessibility) {
      lines.push('## Accessibility');
      lines.push('');
      [_kv('Contrast Ratio', data.accessibility.contrastRatio), _kv('Keyboard', data.accessibility.keyboard), _kv('ARIA', data.accessibility.aria)].filter(Boolean).forEach((l) => lines.push(l));
      if (data.accessibility.notes) { lines.push(''); lines.push(data.accessibility.notes); }
      lines.push('');
    }

    // Free notes
    if (data.notes) {
      lines.push('## Notes');
      lines.push('');
      lines.push(data.notes);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('_Generated by Web Design System._');
    return lines.join('\n');
  }

  async function downloadAnalysisMarkdown(id) {
    const data = await loadAnalysis(id);
    if (!data) return;
    const md = generateAnalysisMarkdown(id, data);
    triggerDownload(md, `${id}-analysis.md`);
  }

  function triggerDownload(text, filename) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- Event wiring ----------
  function wireEvents() {
    window.addEventListener('hashchange', route);
    $hamburger.addEventListener('click', toggleSidebar);
    $sidebarClose.addEventListener('click', closeSidebar);
    $scrim.addEventListener('click', closeSidebar);
    $themeToggleTopbar.addEventListener('click', toggleTheme);
    $themeToggleSidebar.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });

    // close sidebar when navigating via home brand
    document.querySelectorAll('[data-route="home"]').forEach(($a) => {
      $a.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '';
        closeSidebarIfMobile();
      });
    });
  }

  // ---------- Init ----------
  async function init() {
    initTheme();
    await loadManifest();
    renderSidebar();
    wireEvents();
    await route();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
