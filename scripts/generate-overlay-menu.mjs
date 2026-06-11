#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: 풀스크린 오버레이 메뉴 (v1)
 *
 * Awwwards "Fullscreen Nav Menu" 셀렉션(Reform Digital 등) + linear.app 실측 참고.
 * 햄버거 버튼 클릭 시 화면 전체를 덮는 내비게이션 오버레이 — 열림 연출 10종을
 * standalone HTML로 작성 후 iframe 임베드.
 *
 * - 자동 재생 없음. 사용자가 햄버거 버튼을 클릭해야 오버레이가 열림.
 * - 검정 배경 + Pretendard Variable + 한국어 본문.
 * - 표준 페이지: 미니 사이트 헤더(브랜드 + 햄버거) + 히어로 더미 페이지.
 * - 오버레이 콘텐츠 공통: 메뉴 5개(홈/프로젝트/스튜디오/저널/문의) + 연락처·SNS 메타.
 * - 닫힘: 토글 버튼(☰↔✕) + ESC. ↻ 다시 보기 = 메뉴 닫고 초기화.
 *
 * Usage: node scripts/generate-overlay-menu.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'overlay-menu');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'overlay-menu');

const CATEGORY = {
  id: 'overlay-menu',
  title: '풀스크린 오버레이 메뉴',
  type: 'category',
  date: '2026-06-10',
  url: 'https://www.awwwards.com/inspiration/fullscreen-nav-menu-reform-digital-r',
  summary: '햄버거 버튼 클릭 한 번으로 화면 전체가 내비게이션 무대로 바뀌는 풀스크린 오버레이 메뉴 패턴 컬렉션. 에이전시·포트폴리오 사이트의 시그니처 연출로, Awwwards 셀렉션(Reform Digital)과 linear.app 실측(aria-haspopup 2개, 버튼 transition 0.1s cubic-bezier(0.25,0.46,0.45,0.94), 다크 rgb(8,9,10))을 참고해 서클 익스팬드·커튼 로우·링크 스태거·슬라이드 패널·스플릿 컬럼·블러 글래스·버거 모핑·글자 캐스케이드·바텀 시트·페이지 푸시 — 10가지 열림 연출을 비교한다. 모든 데모는 자동 재생 없이 사용자가 햄버거 버튼을 클릭할 때 오버레이가 열리고, ESC와 토글 버튼으로 닫히는 인터랙티브 데모.'
};

// ============ 공통 오버레이 콘텐츠 헬퍼 ============
// 메뉴 5개: 홈 / 프로젝트 / 스튜디오 / 저널 / 문의 + 하단 연락처·SNS 메타.
// --i = 정방향 인덱스(열림 stagger), --r = 역방향 인덱스(닫힘 stagger).

const LINKS = [
  { num: '01', label: '홈' },
  { num: '02', label: '프로젝트' },
  { num: '03', label: '스튜디오' },
  { num: '04', label: '저널' },
  { num: '05', label: '문의' }
];

function linksHTML(masked) {
  return LINKS.map((l, i) => {
    const a = `<a class="ov-link" href="#" style="--i:${i};--r:${LINKS.length - 1 - i}"><span class="ov-num">${l.num}</span><span class="ov-txt">${l.label}</span></a>`;
    return masked ? `      <div class="ov-mask">${a}</div>` : `      ${a}`;
  }).join('\n');
}

const META_HTML = [
  '    <div class="ov-meta">',
  '      <div class="ov-meta-col"><h5>연락처</h5><p>hello@studio-moment.kr<br>+82 2 1234 5678</p></div>',
  '      <div class="ov-meta-col"><h5>주소</h5><p>서울 성동구 연무장길 12, 3F</p></div>',
  '      <div class="ov-sns"><a href="#">Instagram</a><a href="#">Behance</a><a href="#">X</a></div>',
  '    </div>'
].join('\n');

function standardOverlay(masked) {
  return '<div class="overlay" aria-hidden="true">\n'
    + '    <nav class="ov-nav">\n' + linksHTML(masked) + '\n    </nav>\n'
    + META_HTML + '\n  </div>';
}

// ============ 10 패턴 정의 ============
//
// 각 패턴은 demos/overlay-menu/{id}.html에 standalone 페이지로 작성.
// 공통 보일러플레이트(미니 헤더 + 햄버거 + 히어로 + 토글/ESC JS)는 buildDemoHTML이 wrap.
// 각 패턴은:
//   - demo.overlayHTML — 오버레이 마크업 (.overlay 루트)
//   - demo.overlayCSS  — 오버레이 열림/닫힘 연출 CSS
//   - demo.overlayJS   — 추가 인터랙션 JS (옵션, 토글·ESC는 기본 제공)
//   - demo.height      — iframe 임베드 높이 (520~560)

const PATTERNS = [
  // ───────────────────────────── 1. circle-expand (시그니처)
  {
    id: 'circle-expand',
    num: '01',
    title: '서클 익스팬드 (시그니처)',
    summary: '햄버거 버튼 위치에서 원형 clip-path가 화면 전체로 확장되며 오버레이가 열린다. 닫힘은 같은 원으로 역재생. 버튼이 곧 연출의 진원지가 되는 풀스크린 메뉴의 대표 시그니처.',
    demo: {
      overlayHTML: standardOverlay(false),
      overlayCSS: `.overlay {
  display: flex; flex-direction: column; justify-content: center; gap: 52px;
  padding: 110px 9vw 64px; background: #101014;
  clip-path: circle(0px at calc(100% - 46px) 42px);
  transition: clip-path 640ms cubic-bezier(0.76,0,0.24,1);
}
body.menu-open .overlay { clip-path: circle(142% at calc(100% - 46px) 42px); }
.ov-link { opacity: 0; transform: translateY(18px); transition: opacity 280ms ease, transform 280ms ease; transition-delay: calc(var(--r) * 30ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(260ms + var(--i) * 60ms); }
.ov-meta { opacity: 0; transition: opacity 240ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 560ms; }`,
      overlayJS: '',
      height: 560
    },
    snippetHTML: '<button class="menu-btn" aria-expanded="false" aria-label="메뉴 열기">\n  <span class="bar"></span><span class="bar"></span><span class="bar"></span>\n</button>\n<div class="overlay" aria-hidden="true">\n  <nav class="ov-nav">\n    <a class="ov-link" href="#">홈</a>\n    <a class="ov-link" href="#">프로젝트</a>\n    ...\n  </nav>\n</div>',
    snippetCSS: '.overlay {\n  position: fixed; inset: 0;\n  clip-path: circle(0px at calc(100% - 46px) 42px); /* 햄버거 버튼 중심 */\n  transition: clip-path 640ms cubic-bezier(0.76,0,0.24,1);\n}\nbody.menu-open .overlay {\n  clip-path: circle(142% at calc(100% - 46px) 42px); /* 대각선 끝까지 덮는 반경 */\n}\nbody.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(260ms + var(--i) * 60ms); }',
    snippetJS: 'var btn = document.querySelector(".menu-btn");\nbtn.addEventListener("click", function(){\n  var open = document.body.classList.toggle("menu-open");\n  btn.setAttribute("aria-expanded", open);\n});\ndocument.addEventListener("keydown", function(e){\n  if (e.key === "Escape") document.body.classList.remove("menu-open");\n});',
    explain: 'clip-path: circle(반경 at 중심)의 반경만 0px → 142%로 트랜지션하면 버튼 위치에서 원이 자라나 화면 전체를 덮는다. 중심 좌표를 햄버거 버튼 중앙(calc(100% - 46px) 42px)에 고정해 "버튼에서 메뉴가 태어나는" 인과가 시각적으로 명확. 142%는 뷰포트 대각선을 넉넉히 덮는 반경. 닫을 때는 같은 트랜지션이 역재생되어 원이 버튼으로 빨려 들어간다. 링크는 원이 충분히 커진 시점(260ms)부터 60ms 간격 stagger로 등장.',
    kv: [
      { label: '의존성', value: 'CSS only (clip-path) — JS는 클래스 토글만' },
      { label: '트리거', value: '햄버거 클릭 토글 + ESC 닫힘' },
      { label: '열림 시간', value: '640ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '핵심 속성', value: 'clip-path: circle(0→142% at 버튼 좌표)' },
      { label: '접근성', value: 'aria-expanded + aria-hidden 토글 + ESC' },
      { label: '시그니처', value: 'Reform Digital / 에이전시 포트폴리오 다수' }
    ],
    guide: '원 중심 좌표는 버튼 위치와 1px도 어긋나지 않게 — 어긋나면 연출의 인과가 깨진다. 반응형이라면 JS로 getBoundingClientRect를 읽어 좌표를 CSS 변수로 주입하는 방식이 안전. 열림 640ms + 링크 stagger 260ms 지연이 균형점이며, 닫힘은 같은 duration의 역재생으로 충분하다. clip-path 트랜지션은 GPU 합성이 아니므로 오버레이 내부에 무거운 효과(blur·shadow 다중)를 겹치지 않는 게 매끄럽다.',
    recommendations: [
      { place: '히어로 헤더', body: '에이전시 사이트 첫 진입 — 메뉴 여는 순간부터 모션 역량을 증명하는 시그니처' },
      { place: '랜딩 페이지', body: '단일 제품 랜딩의 보조 내비 — 페이지는 미니멀하게, 메뉴에 임팩트를 몰아줌' },
      { place: '제품 섹션', body: '브랜드 캠페인 마이크로사이트 — 원형 확장을 브랜드 컬러로 물들여 아이덴티티 강화' },
      { place: '포트폴리오 소개', body: '디자이너 개인 사이트 — 작품 수가 적어도 메뉴 연출 하나로 인상을 남김' }
    ],
    tradeoff: 'clip-path 애니메이션은 페인트 영역이 커서 저사양 기기에서 프레임 드랍 가능 — 오버레이 배경을 단색으로 유지하면 안전. 원 중심이 버튼과 어긋나면 연출 의도가 무너지므로 반응형에서 좌표 동기화 필수. prefers-reduced-motion에서는 페이드로 대체 권장.'
  },

  // ───────────────────────────── 2. curtain-rows
  {
    id: 'curtain-rows',
    num: '02',
    title: '커튼 로우',
    summary: '가로 밴드 4개가 stagger로 차례차례 내려와 화면을 덮은 뒤 메뉴가 등장한다. 닫힘은 밴드가 위로 접혀 올라가며 사라짐. 무대 커튼의 메타포 — 극적이고 에디토리얼한 톤.',
    demo: {
      overlayHTML: '<div class="overlay" aria-hidden="true">\n'
        + '    <div class="curtain c1"></div><div class="curtain c2"></div><div class="curtain c3"></div><div class="curtain c4"></div>\n'
        + '    <div class="ov-wrap">\n'
        + '      <nav class="ov-nav">\n' + linksHTML(false) + '\n      </nav>\n'
        + META_HTML.replace(/^ {4}/gm, '      ') + '\n'
        + '    </div>\n  </div>',
      overlayCSS: `.curtain {
  position: absolute; left: 0; right: 0; height: 25.5%;
  background: #101014; transform: scaleY(0); transform-origin: top;
  transition: transform 520ms cubic-bezier(0.76,0,0.24,1);
}
.curtain.c1 { top: 0; }      .curtain.c2 { top: 25%; }
.curtain.c3 { top: 50%; }    .curtain.c4 { top: 75%; }
body.menu-open .curtain.c1 { transition-delay: 0ms; }
body.menu-open .curtain.c2 { transition-delay: 70ms; }
body.menu-open .curtain.c3 { transition-delay: 140ms; }
body.menu-open .curtain.c4 { transition-delay: 210ms; }
body.menu-open .curtain { transform: scaleY(1); }
.curtain.c4 { transition-delay: 0ms; } .curtain.c3 { transition-delay: 70ms; }
.curtain.c2 { transition-delay: 140ms; } .curtain.c1 { transition-delay: 210ms; }
.ov-wrap {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  justify-content: center; gap: 52px; padding: 110px 9vw 64px;
  opacity: 0; transform: translateY(14px);
  transition: opacity 260ms ease, transform 260ms ease;
}
body.menu-open .ov-wrap { opacity: 1; transform: none; transition-delay: 540ms; }`,
      overlayJS: '',
      height: 540
    },
    snippetHTML: '<div class="overlay" aria-hidden="true">\n  <div class="curtain c1"></div>\n  <div class="curtain c2"></div>\n  <div class="curtain c3"></div>\n  <div class="curtain c4"></div>\n  <div class="ov-wrap">\n    <nav class="ov-nav">…메뉴 링크…</nav>\n  </div>\n</div>',
    snippetCSS: '.curtain {\n  position: absolute; left: 0; right: 0; height: 25.5%;\n  background: #101014; transform: scaleY(0); transform-origin: top;\n  transition: transform 520ms cubic-bezier(0.76,0,0.24,1);\n}\n.curtain.c2 { top: 25%; } /* c1~c4 = 0/25/50/75% */\nbody.menu-open .curtain { transform: scaleY(1); }\nbody.menu-open .curtain.c2 { transition-delay: 70ms; } /* 70ms × 인덱스 stagger */\nbody.menu-open .ov-wrap { opacity: 1; transition-delay: 540ms; }',
    snippetJS: '/* CSS-only stagger — JS는 menu-open 클래스 토글만 */\nbtn.addEventListener("click", function(){\n  document.body.classList.toggle("menu-open");\n});',
    explain: '오버레이 루트는 투명하고, 그 안의 가로 밴드 4개(높이 25.5%로 1px 이음새 방지)가 각각 scaleY 0→1로 펼쳐진다. transform-origin: top이라 밴드가 위에서 아래로 "내려오는" 인상. 열림은 c1→c4 순서로 70ms stagger, 닫힘은 기본 상태의 delay를 역순(c4→c1)으로 깔아 아래 밴드부터 접혀 올라간다. 밴드가 모두 덮인 540ms 시점에 메뉴 콘텐츠가 페이드 인. transform만 사용하므로 합성 단계에서 처리되어 성능이 좋다.',
    kv: [
      { label: '의존성', value: 'CSS only (transform stagger)' },
      { label: '트리거', value: '햄버거 클릭 토글 + ESC 닫힘' },
      { label: '밴드 구성', value: '4행 × scaleY 0→1, 70ms stagger' },
      { label: '한 밴드 시간', value: '520ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '콘텐츠 등장', value: '밴드 완료 후 540ms 지연 페이드' },
      { label: '시그니처', value: '에디토리얼 매거진 / 패션 브랜드 사이트' }
    ],
    guide: '밴드 수는 3~5개가 적정 — 많을수록 잘게 쪼개져 산만하다. 밴드 높이를 25%가 아닌 25.5%로 살짝 겹치면 트랜지션 중 배경이 비치는 1px 이음새를 막을 수 있다. 닫힘 stagger를 열림과 역순으로 두면 "커튼이 걷히는" 대칭이 완성된다. 콘텐츠 페이드는 밴드 전체가 덮인 직후(마지막 delay + duration의 70~80% 시점)에 시작해야 끊김 없이 이어진다.',
    recommendations: [
      { place: '히어로 헤더', body: '패션·매거진 사이트 — 커튼 메타포가 에디토리얼 무드와 정합' },
      { place: '랜딩 페이지', body: '시즌 캠페인 페이지 — 밴드 색을 시즌 키 컬러로 교체해 무대 전환 연출' },
      { place: '제품 섹션', body: '런칭 티저 사이트 — 메뉴 열림 자체가 공개(reveal) 모티프' },
      { place: '포트폴리오 소개', body: '모션 디자이너 포트폴리오 — stagger 감각을 메뉴에서 먼저 증명' }
    ],
    tradeoff: '열림 완료까지 730ms 이상으로 빠른 탐색에는 느린 편 — 자주 여닫는 유틸리티 내비에는 부적합. 밴드가 펼쳐지는 동안 메뉴를 조작할 수 없으므로 재방문 사용자에게는 답답할 수 있다. 임팩트가 목적인 브랜드·캠페인 사이트에 한정 권장.'
  },
