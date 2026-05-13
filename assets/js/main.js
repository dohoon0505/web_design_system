function toggleTheme() {
  const body = document.body;
  const current = body.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', next);
  // Topbar toggle
  const topIcon = document.getElementById('theme-icon');
  const topLabel = document.getElementById('theme-label');
  if (topIcon) topIcon.textContent = next === 'light' ? '☾' : '☀';
  if (topLabel) topLabel.textContent = next === 'light' ? 'Dark' : 'Light';
  // Sidebar toggle sync
  const sbIcon = document.getElementById('sidebar-theme-icon');
  const sbLabel = document.getElementById('sidebar-theme-label');
  const sbSub = document.getElementById('theme-sub');
  if (sbIcon) sbIcon.textContent = next === 'light' ? '☾' : '☀';
  if (sbLabel) sbLabel.textContent = next === 'light' ? 'Dark' : 'Light';
  if (sbSub) sbSub.textContent = next === 'light' ? 'Light Mode' : 'Dark Mode';
}

/* ============ SIDEBAR ============ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  const isOpen = sb.classList.toggle('is-open');
  if (scrim) {
    if (isOpen) {
      scrim.classList.add('is-open');
      requestAnimationFrame(() => scrim.classList.add('is-visible'));
      document.body.style.overflow = 'hidden';
    } else {
      scrim.classList.remove('is-visible');
      setTimeout(() => scrim.classList.remove('is-open'), 200);
      document.body.style.overflow = '';
    }
  }
}
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  sb.classList.remove('is-open');
  if (scrim) {
    scrim.classList.remove('is-visible');
    setTimeout(() => scrim.classList.remove('is-open'), 200);
  }
  document.body.style.overflow = '';
}
function closeSidebarMobile() {
  if (window.matchMedia('(max-width: 1099px)').matches) closeSidebar();
}

/* ============ SPA ROUTER ============ */

// Activate SPA mode
document.body.classList.add('spa-mode');

// Category definitions — for landing pages when a category is clicked
const CATEGORIES = {
  'getting-started': {
    title: 'Part 01 · 시작하기',
    desc: '시스템이 어떻게 동작하는지, 어떤 원칙을 따르는지, 토큰은 어떻게 구조화되는지. 컴포넌트를 만들기 전에 알아야 할 모든 것.',
    items: [
      { id:'about',      ico:'✦', title:'디자인시스템이란',  desc:'4가지 구성요소가 하나로 돌아가는 생산 체계' },
      { id:'principles', ico:'※', title:'6가지 원칙',         desc:'의미가 값보다 먼저 · 공유 이름 · 축약어 금지 등' },
      { id:'tokens',     ico:'◎', title:'토큰 아키텍처',       desc:'Primitive → Semantic → Component 3단계 구조' },
      { id:'naming',     ico:'≈', title:'네이밍 컨벤션',       desc:'이름은 팀 간의 계약. 약어는 대부분 금지' },
      { id:'policy',     ico:'◉', title:'그라데이션 정책',     desc:'v0.3부터 솔리드가 기본. 두-색 그라데이션 금지' },
      { id:'writing',    ico:'✎', title:'UX Writing 7원칙',    desc:'해요체 · 능동 · 긍정 · 잡초 제거 · 에러는 안내' },
    ]
  },
  'foundations': {
    title: 'Part 02 · Foundations',
    desc: '보이는 것의 기초 — 색 · 타이포 · 크기 · 반경 · 모션. 시스템의 모든 시각 토큰이 여기서 정의됩니다.',
    items: [
      { id:'color',            ico:'◐', title:'Color',            desc:'Primitive 34개 + Semantic Light/Dark 29개' },
      { id:'typography',       ico:'Aa', title:'Typography',      desc:'Pretendard Variable · display → overline 14단계' },
      { id:'sizing',           ico:'▭', title:'Sizing',           desc:'4px 기반 그리드 · size-50 → size-1200' },
      { id:'radius',           ico:'◖', title:'Radius',           desc:'none → full 8단계 반경 토큰' },
      { id:'motion',           ico:'➤', title:'Motion',           desc:'5개 duration · 4개 easing · 의미를 담은 움직임' },
      { id:'component-tokens', ico:'◇', title:'Component Tokens', desc:'Component 내부에서만 쓰는 예외 흡수층' },
    ]
  },
  'components': {
    title: 'Part 03 · Components',
    desc: '토큰과 원칙 위에 올라가는 실제 UI 단위. 각 컴포넌트는 자신만의 컴포넌트 토큰을 가지며, 시맨틱 토큰을 참조해 Light/Dark를 횡단합니다.',
    items: [
      { id:'asset',     ico:'◉', title:'Asset · Icon',             desc:'아이콘 세트 · 일러스트 스타일' },
      { id:'badge',     ico:'◆', title:'Badge',                    desc:'상태 · 카운트 · 뱃지 변형' },
      { id:'chart',     ico:'▥', title:'Bar Chart',                desc:'세로 / 가로 / 누적 · 데이터 시각화' },
      { id:'border',    ico:'│', title:'Border · Divider',         desc:'테두리 · 구분선 · 장식 요소' },
      { id:'button',    ico:'▢', title:'Button',                   desc:'7변형 × 5크기 × 6상태' },
      { id:'chip',      ico:'◎', title:'Chip',                     desc:'필터 · 태그 · 칩 상호작용' },
      { id:'textfield', ico:'▭', title:'Text Field',               desc:'입력 필드 · 유효성 · 포커스' },
      { id:'avatar',    ico:'○', title:'Avatar',                   desc:'이니셜 · 이미지 · 상태 오버레이' },
      { id:'control',   ico:'☑', title:'Checkbox · Radio · Toggle',desc:'선택 컨트롤 3종' },
      { id:'list',      ico:'≡', title:'List Item',                desc:'리스트 행 · leading/trailing' },
      { id:'alert',     ico:'!', title:'Alert · Toast',            desc:'인라인 경고 · 일시적 피드백' },
      { id:'progress',  ico:'▰', title:'Progress · Slider',        desc:'진행률 · 범위 선택' },
      { id:'tabs',      ico:'⧉', title:'Tabs · Segment',           desc:'콘텐츠 전환 · 모드 선택' },
      { id:'others',    ico:'▤', title:'Card',                     desc:'카드 컨테이너 · 조합 패턴' },
      { id:'banner',    ico:'▥', title:'Banner',                   desc:'이미지+텍스트 프로모션 · 6변형' },
    ]
  },
  'overlays': {
    title: 'Part 04 · Overlays · Navigation',
    desc: '페이지 위에 띄우는 표면과 앱 전체를 연결하는 네비게이션.',
    items: [
      { id:'dialog',  ico:'◫', title:'Dialog',              desc:'중단 필수 · 사용자의 결정이 필요한 순간' },
      { id:'sheet',   ico:'⌆', title:'Bottom Sheet',        desc:'모바일에서 Dialog 대체 · 하단 슬라이드' },
      { id:'popover', ico:'◈', title:'Popover · Tooltip',   desc:'짧은 설명 · 컨텍스트 메뉴 · Date Picker' },
      { id:'appbar',  ico:'▬', title:'Top App Bar',         desc:'모바일 상단 고정 헤더' },
      { id:'tabbar',  ico:'▬', title:'Tab Bar',             desc:'모바일 하단 고정 · 주요 섹션 3~5개' },
      { id:'drawer',  ico:'◧', title:'Drawer · Breadcrumb', desc:'주 메뉴 패널 · 계층 경로' },
    ]
  },
  'states': {
    title: 'Part 05 · States',
    desc: '로딩과 비어 있음 — 사용자가 "기다린다"는 순간을 어떻게 디자인할 것인가.',
    items: [
      { id:'skeleton', ico:'▨', title:'Skeleton Loader', desc:'500ms 이상 로딩의 그림자' },
      { id:'empty',    ico:'◌', title:'Empty State',     desc:'First use · Search · Error 3가지 유형' },
    ]
  },
  'density': {
    title: 'Part 06 · Density',
    desc: '많은 정보를 한 화면에 — 정렬과 접힘으로 밀도를 올립니다.',
    items: [
      { id:'table',     ico:'⊞', title:'Data Table',        desc:'정렬 · 비교 · 상태 칩 · 진행률' },
      { id:'accordion', ico:'⌄', title:'Accordion · Tree',  desc:'FAQ · 폼 섹션 · 폴더 구조' },
    ]
  },
  'demo': {
    title: 'Part 07 · 실제 사용 데모',
    desc: '디자인시스템만으로 만들 수 있는 실제 서비스 화면들. 스플래시부터 결제 완료까지, 같은 토큰·같은 컴포넌트로 어떻게 다른 맥락을 빚어내는지.',
    items: [
      { id:'demo-splash',    ico:'🚀', title:'Splash',       desc:'앱이 켜지는 1.5초 · 브랜드 인각' },
      { id:'demo-login',     ico:'🔑', title:'로그인',        desc:'소셜 로그인 · 이메일/패스워드' },
      { id:'demo-signup',    ico:'✍', title:'회원가입',      desc:'단계 표시 · 약관 동의 · 필수 검증' },
      { id:'demo-community', ico:'💬', title:'커뮤니티',      desc:'피드 · 카드 · 아바타 · FAB' },
      { id:'demo-store',     ico:'🛍', title:'스토어',        desc:'상품 그리드 · 할인 뱃지 · 장바구니' },
      { id:'demo-pricing',   ico:'💎', title:'요금제',        desc:'Segment · 플랜 카드 · Sticky CTA' },
      { id:'demo-calendar',  ico:'📅', title:'달력',          desc:'월 그리드 · 이벤트 도트 · 일정 상세' },
      { id:'demo-todo',      ico:'✓',  title:'To-do List',    desc:'진행률 · 우선순위 · 체크박스' },
      { id:'demo-booking',   ico:'🍽', title:'맛집 예약',      desc:'위치 필터 · 섹션별 BEST · 가격대 탭' },
      { id:'demo-foodorder', ico:'🛵', title:'배달',          desc:'쿠폰 배너 · 5-way 탭 · 카테고리 그리드 · 무료배달 파트너' },
      { id:'demo-shopping',  ico:'🛒', title:'쇼핑몰 홈',      desc:'브랜드 헤더 · 캐러셀 · 쿠폰 뱃지 상품' },
      { id:'demo-social',    ico:'👥', title:'소셜 모임',      desc:'히어로 배너 · 이중 CTA · 모임 카드' },
      { id:'demo-banking',   ico:'💳', title:'뱅킹 홈',        desc:'계좌 카드 · 퀵 액션 · 거래 내역' },
      { id:'demo-map',       ico:'📍', title:'지도 탐색',      desc:'검색 오버레이 · POI 핀 · 바텀 시트' },
      { id:'demo-mypage',    ico:'👤', title:'마이페이지',     desc:'아바타 · 통계 · 메뉴 리스트' },
      { id:'demo-chat',      ico:'💭', title:'채팅 리스트',    desc:'대화방 · 안 읽음 뱃지 · 검색' },
      { id:'demo-checkout',  ico:'✅', title:'결제 완료',      desc:'성공 피드백 · 주문 요약 · 영수증' },
      { id:'demo-notify',    ico:'🔔', title:'알림 센터',      desc:'그룹 리스트 · 타입 아이콘 · 읽음 표시' },
    ]
  },
};

// Home page content (shown when no hash)
const HOME = {
  title: 'UIUX-DH · Unified Design System',
  desc: '토큰부터 문장까지. 하나의 시스템, 누적되는 기록. 아래 카테고리를 클릭해 탐색을 시작하세요.',
  items: [
    { id:'getting-started', ico:'✦', title:'시작하기',              desc:'원칙 · 토큰 · 네이밍 · 정책 · UX Writing' },
    { id:'foundations',     ico:'◐', title:'Foundations',           desc:'Color · Typography · Sizing · Radius · Motion' },
    { id:'components',      ico:'▢', title:'Components',            desc:'기본 컴포넌트 15종' },
    { id:'overlays',        ico:'◫', title:'Overlays · Navigation', desc:'Dialog · Sheet · Popover · App Bar · Tab Bar · Drawer' },
    { id:'states',          ico:'▨', title:'States',                desc:'Skeleton · Empty State' },
    { id:'density',         ico:'⊞', title:'Density',               desc:'Data Table · Accordion · Tree' },
    { id:'demo',            ico:'◉', title:'실제 사용 데모',         desc:'18개 모바일 화면 데모' },
    { id:'changelog',       ico:'⎌', title:'Release & Governance',  desc:'버전 기록 · 거버넌스' },
  ]
};

// Section ids that represent categories (part-headers)
const CATEGORY_IDS = ['getting-started', 'foundations', 'components', 'overlays', 'states', 'density', 'demo'];

// Container for dynamic category view
let categoryView;
function ensureCategoryView() {
  if (categoryView) return categoryView;
  categoryView = document.createElement('div');
  categoryView.className = 'category-view';
  categoryView.id = 'category-view';
  const container = document.querySelector('.container');
  const hero = container.querySelector('.hero');
  hero.parentNode.insertBefore(categoryView, hero.nextSibling);
  return categoryView;
}

function renderCategoryView(catKey) {
  const cat = catKey === 'home' ? HOME : CATEGORIES[catKey];
  if (!cat) return false;
  ensureCategoryView();
  const breadcrumbHTML = catKey === 'home' ? '' :
    `<div class="category-breadcrumb"><a href="#">홈</a> › <span>${cat.title.split(' · ').pop() || cat.title}</span></div>`;
  const itemsHTML = cat.items.map(item => `
    <a class="cat-card" href="#${item.id === 'home' ? '' : item.id}">
      <div class="cat-card-ico">${item.ico}</div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <div class="cat-card-meta">자세히 보기 →</div>
    </a>
  `).join('');
  categoryView.innerHTML = `
    ${breadcrumbHTML}
    <h1 class="category-title">${cat.title}</h1>
    <p class="category-desc">${cat.desc}</p>
    <div class="category-grid">${itemsHTML}</div>
  `;
  categoryView.classList.add('is-active');
  return true;
}

function hideCategoryView() {
  if (categoryView) categoryView.classList.remove('is-active');
}

function hideAllSections() {
  document.querySelectorAll('.is-route-active').forEach(el => el.classList.remove('is-route-active'));
  hideCategoryView();
}

function showHome() {
  hideAllSections();
  renderCategoryView('home');
}

function showSection(id) {
  hideAllSections();
  const el = document.getElementById(id);
  if (!el) return showHome();
  el.classList.add('is-route-active');
  try { window.scrollTo(0, 0); } catch(e) {}
}

function highlightSidebar(id) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('is-active'));
  const link = document.querySelector(`.sidebar-link[data-section="${id}"]`);
  if (!link) return;
  link.classList.add('is-active');
  // Auto-expand parent expandable ONLY when the active link is a sub-item.
  // For category links themselves, defer to manual user toggle (handler below)
  // so the user can collapse the category they are currently viewing.
  const sub = link.closest('.sidebar-sub');
  if (sub) {
    const exp = sub.closest('.sidebar-expandable');
    if (exp) exp.classList.add('is-open');
  }
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '').trim();
  if (!hash) {
    showHome();
    highlightSidebar('home');
    return;
  }
  // Category?
  if (CATEGORY_IDS.includes(hash)) {
    hideAllSections();
    renderCategoryView(hash);
    highlightSidebar(hash);
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  // Leaf section
  showSection(hash);
  highlightSidebar(hash);
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
// Initial route if DOMContentLoaded already passed
if (document.readyState !== 'loading') route();

/* ============ SIDEBAR INTERACTIONS ============ */

/* Expandable group toggle:
   - Same hash (already on this category) → toggle open/close
   - Different hash → ensure open, then let navigation proceed */
document.querySelectorAll('.sidebar-expandable > .sidebar-link').forEach(trig => {
  trig.addEventListener('click', (e) => {
    const parent = trig.parentElement;
    const targetHash = trig.getAttribute('href') || '';
    const currentHash = location.hash || '';
    if (targetHash === currentHash) {
      // Same destination — manual toggle (open ↔ close)
      parent.classList.toggle('is-open');
    } else {
      // Different destination — open and let href navigate
      parent.classList.add('is-open');
    }
    // Mobile: don't auto-close sidebar when toggling category header
    // (user might want to click a sub-item next)
  });
});

/* Close sidebar on mobile when clicking a leaf link */
document.querySelectorAll('.sidebar-sub .sidebar-link').forEach(link => {
  link.addEventListener('click', () => closeSidebarMobile());
});
document.querySelectorAll('.sidebar-group > .sidebar-nav > li > a.sidebar-link:not(.is-external)').forEach(link => {
  // Non-expandable top-level leaf links
  if (!link.parentElement.classList.contains('sidebar-expandable')) {
    link.addEventListener('click', () => closeSidebarMobile());
  }
});

/* ESC key closes sidebar on mobile */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

/* ============ DEMO DEPENDENCY MATRIX ============
   Each demo section declares its design-system dependencies via `data-uses`.
   On load, we:
   1. Build a matrix: which component/token → which demos use it.
   2. Validate referenced CSS variables (--sm-*, --p-*, --cm-*) exist at runtime.
   3. Expose `window.demoMatrix` for introspection / future governance.

   ⚠ When a component or token is modified, `demoMatrix.byComponent[<name>]`
   tells you exactly which demos must be re-verified.
*/
function buildDemoMatrix() {
  const sections = document.querySelectorAll('.demo-section[data-uses]');
  const byDemo = {};
  const byComponent = {};
  const byToken = {};
  const missingTokens = [];
  const rootStyles = getComputedStyle(document.documentElement);

  sections.forEach(sec => {
    const id = sec.id;
    const raw = (sec.getAttribute('data-uses') || '').trim();
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const comps = [];
    const toks = [];
    parts.forEach(part => {
      if (part.startsWith('--')) {
        toks.push(part);
        if (!rootStyles.getPropertyValue(part).trim()) {
          missingTokens.push({ demo: id, token: part });
        }
        (byToken[part] = byToken[part] || []).push(id);
      } else {
        comps.push(part);
        (byComponent[part] = byComponent[part] || []).push(id);
      }
    });
    byDemo[id] = { components: comps, tokens: toks };
  });

  const matrix = { byDemo, byComponent, byToken, missingTokens };
  window.demoMatrix = matrix;
  if (missingTokens.length) {
    console.warn('[demoMatrix] Referenced CSS tokens not found at runtime:', missingTokens);
  }
  return matrix;
}
window.addEventListener('DOMContentLoaded', buildDemoMatrix);

/* ============ DEMO: Calendar grid generation ============ */
function renderCalendarGrid() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';
  // April 2026: starts on Wednesday (day 3), has 30 days
  const firstDay = 3; // 0 = Sun
  const daysInMonth = 30;
  const today = 22;
  const eventDays = new Set([3, 8, 15, 22, 25, 28]);

  // Leading blanks
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.style.aspectRatio = '1';
    grid.appendChild(blank);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const dayOfWeek = (firstDay + d - 1) % 7;
    const isToday = d === today;
    const isSunday = dayOfWeek === 0;
    const hasEvent = eventDays.has(d);
    cell.style.cssText = `
      aspect-ratio:1; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:3px;
      border-radius:10px; cursor:pointer;
      font:${isToday ? '700' : '500'} 14px/1 var(--font-sans);
      color:${isToday ? '#fff' : (isSunday ? 'var(--sm-status-error)' : 'var(--sm-content-primary)')};
      background:${isToday ? 'var(--sm-interactive-brand-default)' : 'transparent'};
    `;
    cell.innerHTML = `
      <span>${d}</span>
      ${hasEvent ? `<span style="width:4px;height:4px;border-radius:50%;background:${isToday ? '#fff' : 'var(--sm-interactive-brand-default)'};"></span>` : '<span style="width:4px;height:4px;"></span>'}
    `;
    grid.appendChild(cell);
  }
}
// Render calendar grid whenever user navigates to demo-calendar
function maybeRenderCalendar() {
  if (location.hash.replace(/^#\/?/, '') === 'demo-calendar') {
    setTimeout(renderCalendarGrid, 10);
  }
}
window.addEventListener('hashchange', maybeRenderCalendar);
maybeRenderCalendar();

function toggleAccordion(trigger) {
  const item = trigger.parentElement;
  item.classList.toggle('open');
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('section.section, section.component-section, .part-header').forEach(sec => {
  sec.style.opacity = '0';
  sec.style.transform = 'translateY(16px)';
  sec.style.transition = 'opacity 500ms cubic-bezier(0.2, 0, 0, 1), transform 500ms cubic-bezier(0.2, 0, 0, 1)';
  observer.observe(sec);
});

const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.hbar-fill, .progress-fill, .slider-fill, .stack-seg');
      bars.forEach((bar, i) => {
        const original = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = original; }, 100 + i * 60);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('#chart, #progress').forEach(s => chartObserver.observe(s));

/* ============ MARKDOWN DOWNLOAD ============
   Each design system page (foundations / components / demos) gets a download
   button. The generated Markdown reflects ONLY what is rendered on that page.
   - .demo-section     → data-uses 기반 (사용 컴포넌트 + 토큰)
   - .component-section → DOM의 variant-block + 스키마 enrichment
   - .section          → DOM의 헤딩/단락/리스트/원칙/티어/색상스케일
*/

let _sysJsonCache = null;
const _schemaCache = {};

async function _fetchSystemJson() {
  if (_sysJsonCache) return _sysJsonCache;
  try {
    const r = await fetch('system.json');
    _sysJsonCache = await r.json();
  } catch (e) { _sysJsonCache = null; }
  return _sysJsonCache;
}

async function _fetchSchema(path) {
  if (_schemaCache[path] !== undefined) return _schemaCache[path];
  try {
    const r = await fetch(path);
    _schemaCache[path] = await r.json();
  } catch (e) { _schemaCache[path] = null; }
  return _schemaCache[path];
}

function _triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function _txt(el) {
  if (!el) return '';
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

function _tokenMeta(tok) {
  if (tok.startsWith('--sm-content-'))       return ['Semantic', '텍스트 색상 · ' + tok.slice(13)];
  if (tok.startsWith('--sm-background-'))    return ['Semantic', '배경 색상 · ' + tok.slice(16)];
  if (tok.startsWith('--sm-interactive-'))   return ['Semantic', '인터랙션 · ' + tok.slice(17)];
  if (tok.startsWith('--sm-border-'))        return ['Semantic', '테두리 · ' + tok.slice(12)];
  if (tok.startsWith('--sm-status-'))        return ['Semantic', '상태 · ' + tok.slice(12)];
  if (tok.startsWith('--sm-surface-'))       return ['Semantic', '표면 · ' + tok.slice(13)];
  if (tok.startsWith('--sm-'))               return ['Semantic', tok.slice(5)];
  if (tok.startsWith('--p-indigo-'))         return ['Primitive', '브랜드 인디고 · shade ' + tok.slice(11)];
  if (tok.startsWith('--p-neutral-'))        return ['Primitive', '뉴트럴 · shade ' + tok.slice(12)];
  if (tok.startsWith('--p-'))                return ['Primitive', tok.slice(4)];
  if (tok.startsWith('--font-'))             return ['Typography', tok.slice(7) + ' 폰트'];
  if (tok.startsWith('--cm-'))               return ['Component', tok.slice(5)];
  if (tok.startsWith('--size-'))             return ['Spacing', tok.slice(7)];
  if (tok.startsWith('--radius-'))           return ['Radius', tok.slice(9)];
  return ['Custom', tok];
}

function _appendTokenTable(lines, tokens) {
  lines.push('| 토큰 | 분류 | 용도 |');
  lines.push('|------|------|------|');
  tokens.forEach(tok => {
    const [cat, usage] = _tokenMeta(tok);
    lines.push(`| \`${tok}\` | ${cat} | ${usage} |`);
  });
  lines.push('');
}

function _appendSchemaDetails(lines, schema) {
  if (schema.variants && schema.variants.length) {
    lines.push('**Variants**');
    lines.push('');
    lines.push('| Variant | 설명 | 예시 HTML |');
    lines.push('|---------|------|-----------|');
    schema.variants.forEach(v => {
      const html = v.html ? `\`${v.html.replace(/\|/g, '\\|').replace(/\n/g, ' ')}\`` : '-';
      lines.push(`| ${v.label || v.id} | ${v.description || '-'} | ${html} |`);
    });
    lines.push('');
  }
  if (schema.sizes && schema.sizes.length) {
    lines.push('**Sizes**');
    lines.push('');
    // Collect all property keys across sizes (excluding id) to build a dynamic table
    const sizeKeys = Array.from(schema.sizes.reduce((set, s) => {
      Object.keys(s).forEach(k => { if (k !== 'id') set.add(k); });
      return set;
    }, new Set()));
    lines.push('| Size | ' + sizeKeys.join(' | ') + ' |');
    lines.push('|' + ['------', ...sizeKeys.map(() => '------')].join('|') + '|');
    schema.sizes.forEach(s => {
      const cells = sizeKeys.map(k => s[k] !== undefined ? (typeof s[k] === 'number' ? `${s[k]}px` : s[k]) : '-');
      lines.push(`| \`${s.id}\` | ${cells.join(' | ')} |`);
    });
    lines.push('');
  }
  if (schema.states && schema.states.length) {
    lines.push(`**States:** ${schema.states.join(' · ')}`);
    lines.push('');
  }
  if (schema.modifiers && schema.modifiers.length) {
    lines.push('**Modifiers**');
    schema.modifiers.forEach(m => lines.push(`- \`.${m.class}\` — ${m.description || ''}`));
    lines.push('');
  }
  if (schema.whenToUse && schema.whenToUse.length) {
    lines.push('**언제 사용**');
    schema.whenToUse.forEach(w => lines.push(`- ${w}`));
    lines.push('');
  }
  if (schema.whenNotToUse && schema.whenNotToUse.length) {
    lines.push('**언제 사용하지 않음**');
    schema.whenNotToUse.forEach(w => lines.push(`- ${w}`));
    lines.push('');
  }
  if (schema.uxWriting && schema.uxWriting.length) {
    lines.push('**UX Writing**');
    schema.uxWriting.forEach(u => lines.push(`- ${u}`));
    lines.push('');
  }
  if (schema.accessibility) {
    const a = schema.accessibility;
    lines.push('**접근성**');
    if (a.role)            lines.push(`- role: \`${a.role}\``);
    if (a.keyboardSupport) lines.push(`- 키보드: ${a.keyboardSupport.join(', ')}`);
    if (a.minTouchTarget)  lines.push(`- 최소 터치 타겟: ${a.minTouchTarget}px`);
    if (a.focusRing)       lines.push(`- 포커스 링: \`${a.focusRing}\``);
    if (a.ariaNotes)       a.ariaNotes.forEach(n => lines.push(`- ${n}`));
    lines.push('');
  }
}

/* DOM walker — converts a section's body to Markdown lines.
   Recognizes design-system specific containers (.principle, .tier, .color-scale,
   .variant-block) and standard HTML (h3-h5, p, ul/ol, table, pre/code). */
function _walkContent(root, lines, skipSel) {
  const skipEls = new Set();
  if (skipSel) root.querySelectorAll(skipSel).forEach(el => skipEls.add(el));

  const handleEl = (el) => {
    if (skipEls.has(el)) return;
    if (el.classList && el.classList.contains('btn-md-dl')) return;

    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    const cls = el.classList || { contains: () => false };

    // Design-system specific containers (intercept before recursion)
    if (cls.contains('principle')) {
      const num  = el.querySelector('.principle-num');
      const h    = el.querySelector('h4');
      const ps   = el.querySelectorAll(':scope > p');
      const anti = el.querySelector('.anti');
      if (num) lines.push(`#### ${_txt(num)}`);
      if (h)   lines.push(`**${_txt(h)}**`);
      lines.push('');
      ps.forEach(p => { lines.push(_txt(p)); lines.push(''); });
      if (anti) { lines.push(`> 🚫 ${_txt(anti)}`); lines.push(''); }
      return;
    }
    if (cls.contains('tier')) {
      const num = el.querySelector('.tier-num');
      const h   = el.querySelector('h4');
      const en  = el.querySelector('.en');
      const ps  = el.querySelectorAll(':scope > p');
      const ex  = el.querySelector('.tier-example');
      if (num) lines.push(`#### ${_txt(num)}`);
      if (h && en) lines.push(`**${_txt(h)}** _(${_txt(en)})_`);
      else if (h)  lines.push(`**${_txt(h)}**`);
      lines.push('');
      ps.forEach(p => { lines.push(_txt(p)); lines.push(''); });
      if (ex) {
        lines.push('```css');
        _txt(ex).split(';').map(s => s.trim()).filter(Boolean).forEach(s => lines.push(s + ';'));
        lines.push('```');
        lines.push('');
      }
      return;
    }
    if (cls.contains('color-scale')) {
      lines.push('| Shade | Hex |');
      lines.push('|-------|-----|');
      el.querySelectorAll(':scope > .color-chip').forEach(chip => {
        const w = chip.querySelector('.w');
        const h = chip.querySelector('.h');
        if (w && h) lines.push(`| ${_txt(w)} | \`#${_txt(h)}\` |`);
      });
      lines.push('');
      return;
    }
    if (cls.contains('variant-block')) {
      const label = el.querySelector('.variant-label');
      const sub   = el.querySelector('.variant-sub');
      if (label) { lines.push(`#### ${_txt(label)}`); lines.push(''); }
      if (sub)   { lines.push(_txt(sub)); lines.push(''); }
      return;
    }
    if (cls.contains('subsection-title') || tag === 'h3') {
      lines.push(''); lines.push(`### ${_txt(el)}`); lines.push(''); return;
    }
    if (tag === 'h4') { lines.push(''); lines.push(`#### ${_txt(el)}`); lines.push(''); return; }
    if (tag === 'h5') { lines.push(''); lines.push(`##### ${_txt(el)}`); lines.push(''); return; }

    if (tag === 'p') {
      const t = _txt(el);
      if (t) { lines.push(t); lines.push(''); }
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      Array.from(el.children).forEach((li, i) => {
        if (li.tagName !== 'LI') return;
        lines.push(tag === 'ul' ? `- ${_txt(li)}` : `${i + 1}. ${_txt(li)}`);
      });
      lines.push('');
      return;
    }
    if (tag === 'pre' || tag === 'code') {
      const t = _txt(el);
      if (t) { lines.push('```'); lines.push(t); lines.push('```'); lines.push(''); }
      return;
    }
    if (tag === 'table') {
      const rows = el.querySelectorAll('tr');
      if (rows.length === 0) return;
      const head = rows[0].querySelectorAll('th, td');
      lines.push('| ' + Array.from(head).map(c => _txt(c)).join(' | ') + ' |');
      lines.push('| ' + Array.from(head).map(() => '---').join(' | ') + ' |');
      Array.from(rows).slice(1).forEach(row => {
        const cells = row.querySelectorAll('th, td');
        lines.push('| ' + Array.from(cells).map(c => _txt(c)).join(' | ') + ' |');
      });
      lines.push('');
      return;
    }
    // Leaf div/span with only text → emit as paragraph (catches labels like
    // "--p-neutral-* / 11 stops" placed in styled divs)
    if ((tag === 'div' || tag === 'span') && el.children.length === 0) {
      const t = _txt(el);
      if (t) { lines.push(t); lines.push(''); }
      return;
    }
    // Recurse into structural containers
    if (el.children && el.children.length > 0) {
      Array.from(el.children).forEach(handleEl);
    }
  };

  Array.from(root.children).forEach(handleEl);
}

function _stripTrailingBlanks(lines) {
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  // collapse 3+ blanks → 1
  return lines.filter((l, i, a) => !(l === '' && a[i - 1] === ''));
}

async function _docHeader(title, kind, sectionId, sysVersion) {
  const today = new Date().toISOString().split('T')[0];
  const ver = sysVersion || (await _fetchSystemJson() || {}).version || '0.5.0';
  return [
    `# ${title}`,
    '',
    `> **${kind}** · UIUX-DH Unified Design System v${ver}`,
    `> 페이지 ID: \`${sectionId}\` · 생성일: ${today}`,
    '',
    '---',
    ''
  ];
}

async function generateDemoMarkdown(sec) {
  const label = _txt(sec.querySelector('.demo-label'));
  const title = _txt(sec.querySelector('.demo-header h2')) || sec.id;
  const desc  = _txt(sec.querySelector('.demo-header p'));

  const raw   = (sec.getAttribute('data-uses') || '').trim();
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  const compIds = parts.filter(p => !p.startsWith('--'));
  const tokens  = parts.filter(p => p.startsWith('--'));

  const sys = await _fetchSystemJson();
  const compMap = {};
  if (sys && sys.components) sys.components.forEach(c => { compMap[c.id] = c; });

  const schemas = {};
  await Promise.all(compIds.map(async cid => {
    const entry = compMap[cid];
    if (entry && entry.schema) {
      const s = await _fetchSchema(entry.schema);
      if (s) schemas[cid] = { meta: entry, schema: s };
    }
  }));

  const lines = await _docHeader(`${title} 디자인 가이드`, label || 'DEMO', sec.id, sys && sys.version);

  if (desc) {
    lines.push('## 개요'); lines.push(''); lines.push(desc); lines.push(''); lines.push('---'); lines.push('');
  }

  if (compIds.length > 0) {
    lines.push('## 사용 컴포넌트');
    lines.push('');
    for (const cid of compIds) {
      const entry = schemas[cid];
      const metaName = compMap[cid] ? compMap[cid].name : cid;
      lines.push(`### ${entry ? (entry.schema.name || metaName) : metaName}`);
      lines.push('');
      if (!entry) { lines.push('_(스키마 정보 없음)_'); lines.push(''); continue; }
      if (entry.schema.description) { lines.push(entry.schema.description); lines.push(''); }
      _appendSchemaDetails(lines, entry.schema);
    }
    lines.push('---'); lines.push('');
  }

  if (tokens.length > 0) {
    lines.push('## 디자인 토큰'); lines.push('');
    _appendTokenTable(lines, tokens);
    lines.push('**토큰 사용 원칙**');
    lines.push('');
    lines.push('- `--sm-*` Semantic 토큰: UI에 직접 사용. Light/Dark 자동 대응');
    lines.push('- `--p-*` Primitive 토큰: Semantic의 원천. UI에 직접 사용 금지');
    lines.push('- `--cm-*` Component 토큰: 특정 컴포넌트 전용');
    lines.push('');
    lines.push('---'); lines.push('');
  }

  lines.push('## 참조');
  lines.push('');
  lines.push(`- 라이브 데모: https://dohoon0505.github.io/desgin_system/#${sec.id}`);
  lines.push('- 컴포넌트 스키마: `components/<id>.schema.json`');
  lines.push('- 토큰 정의: `tokens/theme-map.json`');
  lines.push('');

  return _stripTrailingBlanks(lines).join('\n');
}

async function generateComponentMarkdown(sec) {
  const head    = sec.querySelector('.section-head');
  const meta    = _txt(sec.querySelector('.section-meta'));
  const title   = _txt(sec.querySelector('.section-head .section-title')) || sec.id;
  const desc    = _txt(sec.querySelector('.section-head .section-desc'));

  const sys     = await _fetchSystemJson();
  const compMap = {};
  if (sys && sys.components) sys.components.forEach(c => { compMap[c.id] = c; });
  const compEntry = compMap[sec.id];

  let schema = null;
  if (compEntry && compEntry.schema) schema = await _fetchSchema(compEntry.schema);

  const kindLabel = meta ? `Component · ${meta.replace(/^\d+\s*·\s*/, '')}` : 'Component';
  const lines = await _docHeader(`${title} 컴포넌트 가이드`, kindLabel, sec.id, sys && sys.version);

  if (desc) { lines.push('## 개요'); lines.push(''); lines.push(desc); lines.push(''); }
  if (schema && schema.description && schema.description !== desc) {
    lines.push(schema.description); lines.push('');
  }

  // Variants displayed on this page (extracted from .variant-block elements)
  const variantBlocks = sec.querySelectorAll(':scope > .variant-block');
  if (variantBlocks.length > 0) {
    lines.push('---'); lines.push('');
    lines.push('## 페이지에 표시된 Variants');
    lines.push('');
    variantBlocks.forEach(vb => {
      const vlabel = _txt(vb.querySelector('.variant-label'));
      const vsub   = _txt(vb.querySelector('.variant-sub'));
      if (vlabel) lines.push(`### ${vlabel}`);
      if (vsub)   { lines.push(''); lines.push(vsub); }
      lines.push('');
    });
  }

  // Schema-based deep details (canonical spec)
  if (schema) {
    lines.push('---'); lines.push('');
    lines.push('## 사양 (Schema)');
    lines.push('');
    _appendSchemaDetails(lines, schema);
    if (schema.tokens && Object.keys(schema.tokens).length > 0) {
      lines.push('**컴포넌트 토큰 매핑**');
      lines.push('');
      Object.entries(schema.tokens).forEach(([k, v]) => {
        lines.push(`- \`${k}\` → \`${v}\``);
      });
      lines.push('');
    }
  }

  lines.push('---'); lines.push('');
  lines.push('## 참조');
  lines.push('');
  lines.push(`- 라이브 데모: https://dohoon0505.github.io/desgin_system/#${sec.id}`);
  if (compEntry && compEntry.schema) lines.push(`- 스키마: \`${compEntry.schema}\``);
  if (compEntry && compEntry.md)     lines.push(`- 서술 문서: \`${compEntry.md}\``);
  lines.push('');

  return _stripTrailingBlanks(lines).join('\n');
}

async function generateSectionMarkdown(sec) {
  const indexMeta = _txt(sec.querySelector('.section-index'));
  const title     = _txt(sec.querySelector('.section-header .section-title')) || sec.id;
  const desc      = _txt(sec.querySelector('.section-header .section-desc'));

  const sys = await _fetchSystemJson();
  const kindLabel = indexMeta ? `Foundation · ${indexMeta.replace(/^\d+\s*·\s*/, '')}` : 'Foundation';
  const lines = await _docHeader(`${title}`, kindLabel, sec.id, sys && sys.version);

  if (desc) { lines.push('## 개요'); lines.push(''); lines.push(desc); lines.push(''); lines.push('---'); lines.push(''); }

  // Walk content after the header, skipping section-index and section-header themselves
  lines.push('## 페이지 내용');
  lines.push('');
  const headerEl = sec.querySelector('.section-header');
  const indexEl  = sec.querySelector('.section-index');
  const skipped = new Set();
  if (headerEl) skipped.add(headerEl);
  if (indexEl)  skipped.add(indexEl);

  // Use _walkContent on a virtual root that excludes header/index
  const tempRoot = { children: Array.from(sec.children).filter(c => !skipped.has(c)) };
  // Wrap in a real-looking iterable for our walker
  const fakeRoot = document.createElement('div');
  tempRoot.children.forEach(c => fakeRoot.appendChild(c.cloneNode(true)));
  _walkContent(fakeRoot, lines);

  lines.push('---'); lines.push('');
  lines.push('## 참조');
  lines.push('');
  lines.push(`- 라이브 데모: https://dohoon0505.github.io/desgin_system/#${sec.id}`);
  lines.push('- 토큰 정의: `tokens/theme-map.json`');
  lines.push('- 원칙 문서: `docs/01-principles.md`');
  lines.push('');

  return _stripTrailingBlanks(lines).join('\n');
}

async function generatePageMarkdown(sec) {
  if (!sec) return '';
  if (sec.classList.contains('demo-section'))      return generateDemoMarkdown(sec);
  if (sec.classList.contains('component-section')) return generateComponentMarkdown(sec);
  if (sec.classList.contains('section'))           return generateSectionMarkdown(sec);
  return '';
}

const _DL_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

function _makeDownloadButton(sec) {
  const btn = document.createElement('button');
  btn.className = 'btn-md-dl';
  btn.setAttribute('aria-label', '디자인 가이드 Markdown 다운로드');
  btn.innerHTML = `${_DL_ICON} <span>Markdown</span>`;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.innerHTML = `${_DL_ICON} <span>생성 중…</span>`;
    try {
      const content = await generatePageMarkdown(sec);
      _triggerDownload(`${sec.id}_design_guide.md`, content);
      btn.innerHTML = `${_DL_ICON} <span>완료!</span>`;
      setTimeout(() => { btn.innerHTML = `${_DL_ICON} <span>Markdown</span>`; }, 1800);
    } catch (e) {
      console.error('[MD Download]', e);
      btn.innerHTML = `${_DL_ICON} <span>Markdown</span>`;
    } finally {
      btn.disabled = false;
    }
  });
  return btn;
}

function injectDownloadButtons() {
  // .demo-section → into .demo-header
  document.querySelectorAll('.demo-section').forEach(sec => {
    if (!sec.id) return;
    const header = sec.querySelector('.demo-header');
    if (!header || header.querySelector('.btn-md-dl')) return;
    header.appendChild(_makeDownloadButton(sec));
  });
  // .component-section → into .section-head
  document.querySelectorAll('.component-section').forEach(sec => {
    if (!sec.id) return;
    const head = sec.querySelector('.section-head');
    if (!head || head.querySelector('.btn-md-dl')) return;
    head.appendChild(_makeDownloadButton(sec));
  });
  // .section → into .section-header
  document.querySelectorAll('section.section').forEach(sec => {
    if (!sec.id) return;
    const header = sec.querySelector('.section-header');
    if (!header || header.querySelector('.btn-md-dl')) return;
    header.appendChild(_makeDownloadButton(sec));
  });
}
window.addEventListener('DOMContentLoaded', injectDownloadButtons);
