#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Scroll-Card-Update (v1)
 *
 * base44.com 시그니처: 좌측 텍스트(01/04 + 타이틀 + 본문 + 버튼) +
 * 우측 sticky 카드 시퀀스(스크롤로 카드 전환). 카드 전환 방식 10 변형.
 *
 * 표준 보일러플레이트:
 *   parent N×100vh + sticky stage + 2-column 레이아웃 (좌 텍스트, 우 카드)
 *   activeIndex = floor(p × N), slideProgress[i] = clamp(p×N - i, 0, 1)
 *
 * 모든 패턴 동일 4 카드(01 Speed / 02 Backend / 03 Ready / 04 Agent) +
 * 동일 wixstatic 이미지 + Pretendard 단일 폰트.
 * 차이는 우측 카드의 인터랙션 변환(applyReveal)만.
 *
 * Usage: node scripts/generate-scroll-card-update.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scroll-card-update');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scroll-card-update');

const CATEGORY = {
  id: 'scroll-card-update',
  title: 'Scroll-Card-Update',
  type: 'category',
  date: '2026-05-27',
  url: 'https://base44.com/',
  summary: '좌측에 페이지네이션·타이틀·본문 텍스트, 우측에 sticky 미디어 카드를 두고 스크롤 진행률에 따라 카드가 순차적으로 전환되는 인터랙션 카탈로그. base44.com의 시그니처 동작(좌측 텍스트 fade-up + 우측 카드 stack-up 슬라이드)을 첫 번째 패턴으로 차용하고, 카드 전환 방식 9가지 변형(fade-stack · scale-pop · slide-from-right · clip-bottom · rotate-tilt · blur-swap · stack-spread · dissolve · carousel)을 비교 카탈로그로 정리.'
};

// ============ 표준 4 카드 데이터 (모든 패턴이 공유) ============
const SCU_CARDS = [
  {
    num: '01',
    title: 'Create at the speed of thought',
    body: 'Tell Base44 your idea, and watch it transform into a working app with all the building blocks already in place, from beautifully designed pages to user flows and one-click integrations.',
    img: 'https://static.wixstatic.com/media/dea07e_125faa410ab84732b15a14d6408fa704~mv2.jpg/v1/fill/w_681,h_881,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Create%20at%20the%20speed%20of%20thought%20-%20Desktop.jpg'
  },
  {
    num: '02',
    title: 'A backend that builds with you',
    body: 'While you shape the idea, Base44 automatically sets up the logic and infrastructure so your app works out of the box. User logins, authentication, data storage, and role-based permissions are generated behind the scenes.',
    img: 'https://static.wixstatic.com/media/dea07e_3e3440eba62a4e0280547c9c58f1c31a~mv2.jpg/v1/fill/w_681,h_881,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/A%20backend%20that%20builds%20with%20you%20-%20Desktop.jpg'
  },
  {
    num: '03',
    title: 'Ready to use, instantly',
    body: 'Our platform comes with built-in hosting, analytics, and custom domains so when your app is ready to go live, all you have to do is press publish.',
    img: 'https://static.wixstatic.com/media/dea07e_01a647f9a0c244ce9d4f3cd3289bf081~mv2.jpg/v1/fill/w_681,h_881,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ready%20to%20use%2C%20instantly%20-%20Desktop.jpg'
  },
  {
    num: '04',
    title: 'One platform. Any agent.',
    body: 'Get access to the latest AI models as they launch. Base44 automatically selects the best model for your project, or you can choose the one that fits your build, your style, and your workflow.',
    img: 'https://static.wixstatic.com/media/dea07e_2c9ac0357d0b460eb02073c3740626f1~mv2.jpg/v1/fill/w_681,h_881,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/One%20platform_%20Any%20agent%20-%20Desktop.jpg'
  }
];
const N = SCU_CARDS.length;
const TRACK_VH = 400;

// ============ 공통 마크업 빌더 ============

function scuTextsMarkup() {
  return '<div class="scu-texts">\n          '
    + SCU_CARDS.map(function (c, i) {
        return '<div class="scu-text' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">'
          + '<div class="scu-num"><span class="scu-num-cur">' + c.num + '</span><span class="scu-num-sep">/</span><span class="scu-num-tot">0' + N + '</span><span class="scu-num-title">' + c.title + '</span></div>'
          + '<h2 class="scu-title">' + c.title + '</h2>'
          + '<p class="scu-body">' + c.body + '</p>'
          + '<button class="scu-btn" type="button">Start building</button>'
          + '</div>';
      }).join('\n          ')
    + '\n        </div>';
}

function scuCardsMarkup(extraClass) {
  return '<div class="scu-cards">\n          '
    + SCU_CARDS.map(function (c, i) {
        return '<div class="scu-card' + (extraClass ? ' ' + extraClass : '') + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '" style="background-image: url(\'' + c.img + '\');"></div>';
      }).join('\n          ')
    + '\n        </div>';
}

// 공통 base CSS — 모든 패턴이 공유
const SCU_BASE_CSS = ''
  + '.scu-stage { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 0 48px; align-items: center; background: linear-gradient(180deg, #fafafa 0%, #f5e6f5 80%, #f0c3ed 100%); font-family: "Pretendard Variable","Pretendard",sans-serif; overflow: hidden; }\n'
  + '.scu-texts { position: relative; height: 100%; }\n'
  + '.scu-text { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 80px 0; opacity: 0; transform: translateY(24px); transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.2,0,0,1); will-change: opacity, transform; pointer-events: none; }\n'
  + '.scu-text.is-on { opacity: 1; transform: translateY(0); pointer-events: auto; }\n'
  + '.scu-num { display: inline-flex; align-items: center; gap: 8px; font: 500 14px/1.4 inherit; color: #0a0a0a; margin: 0 0 280px; flex-wrap: wrap; }\n'
  + '.scu-num-cur { color: #0a0a0a; }\n'
  + '.scu-num-sep { color: rgba(10,10,10,0.3); }\n'
  + '.scu-num-tot { color: rgba(10,10,10,0.4); margin-right: 12px; }\n'
  + '.scu-num-title { color: #0a0a0a; padding-left: 4px; }\n'
  + '.scu-title { display: none; }\n'
  + '.scu-body { font: 500 clamp(22px, 2vw, 28px)/1.35 inherit; color: #0a0a0a; margin: 0 0 36px; max-width: 540px; letter-spacing: -0.01em; }\n'
  + '.scu-btn { display: inline-block; font: 600 14px/1 inherit; color: #fff; background: #0a0a0a; border: 0; border-radius: 999px; padding: 16px 32px; cursor: pointer; transition: transform 160ms, background 160ms; align-self: flex-start; }\n'
  + '.scu-btn:hover { transform: translateY(-1px); background: #1a1a1a; }\n'
  + '.scu-cards { position: relative; height: calc(100% - 80px); border-radius: 24px; overflow: hidden; background: #0a0a0a; box-shadow: 0 24px 60px -16px rgba(0,0,0,0.25); }\n'
  + '.scu-card { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat; will-change: opacity, transform, clip-path, filter; }\n';

// 공통 reveal helper — applyCommon(p, N): 좌측 텍스트 상태 갱신
const SCU_COMMON_SCRIPT = ''
  + 'var texts = document.querySelectorAll(".scu-text");\n'
  + 'var cards = document.querySelectorAll(".scu-card");\n'
  + 'var N = ' + N + ';\n'
  + 'function applyTextReveal(p){\n'
  + '  var idx = Math.min(Math.floor(p * N), N - 1);\n'
  + '  texts.forEach(function(t, i){ t.classList.toggle("is-on", i === idx); });\n'
  + '  return idx;\n'
  + '}';

// ============ 10 패턴 정의 ============

const PATTERNS = [
  // 01 — stack-up (base44 시그니처)
  {
    id: 'stack-up', num: '01', title: '스택 업 (base44 시그니처)',
    summary: '새 카드가 화면 아래에서 위로 슬라이드 + 이전 카드는 그대로 머무름 → 새 카드가 그 위에 쌓임. base44.com의 시그니처 카드 전환. zIndex로 layering, box-shadow로 떠오르는 인상.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-stack-up'),
      css: SCU_BASE_CSS + '.scu-stack-up { transform: translateY(100%); }\n.scu-stack-up[data-i="0"] { transform: translateY(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyTextReveal(p);\n  cards.forEach(function(c, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    var ease = 1 - Math.pow(1 - local, 3);\n    c.style.transform = "translateY(" + (100 * (1 - ease)) + "%)";\n    c.style.zIndex = i;\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="stage">\n  <div class="texts"><div class="text">…</div>×4</div>\n  <div class="cards"><div class="card" data-i="0"></div>×4</div>\n</div>',
    snippetCSS: '.card { position: absolute; inset: 0; background-size: cover; transform: translateY(100%); will-change: transform; }\n.card[data-i="0"] { transform: translateY(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  var pos = p * N - i;\n  var local = Math.max(0, Math.min(1, pos + 1));\n  var ease = 1 - Math.pow(1 - local, 3);\n  c.style.transform = "translateY(" + (100 * (1 - ease)) + "%)";\n  c.style.zIndex = i;\n});',
    explain: '각 카드는 처음에 translateY(100%)로 화면 아래. 자기 인덱스의 1단계 전부터 후까지의 진행률을 local progress(0~1)로 만들어 translateY 100% → 0%로 보간. ease-out-cubic으로 자연스럽게 솟아오름. zIndex는 i로 누적해서 새 카드가 이전 카드 위에 쌓임. base44.com의 인터랙션과 동일.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateY = (1 - ease(local)) × 100%' },
      { label: 'Track 높이', value: 'N × 100vh (4 카드 = 400vh)' },
      { label: '이징', value: 'ease-out-cubic 자체 보간' },
      { label: '시그니처', value: 'base44.com / Linear changelog' }
    ],
    guide: '카드 미디어가 핵심인 SaaS 랜딩의 시그니처. 카드 3~5개가 균형. 우측 sticky 카드를 그대로 두고 새 카드가 그 위에 쌓이는 인상. box-shadow를 위쪽으로 두면 떠오르는 느낌. 모바일에서는 stack-up 그대로 가능 (세로 스크롤 자연스러움).',
    recommendations: [
      { place: '히어로 헤더', body: '제품 핵심 가치 4가지를 좌측 텍스트 + 우측 UI 스크린샷으로 — base44 그대로' },
      { place: '랜딩 페이지', body: '기능 소개 섹션 — 각 기능당 한 카드 + 좌측 설명' },
      { place: '제품 섹션', body: '제품 라인업 카드 — 가격·스펙·이미지를 카드별로' },
      { place: '포트폴리오 소개', body: '대표 작품 4-5건 케이스 스터디 — 좌측 설명 + 우측 작품 이미지' }
    ],
    tradeoff: 'parent 4×100vh = 400vh로 페이지가 길어짐. 모바일에서 텍스트와 카드 1-column 스택으로 fallback 권장. 첫 카드는 처음부터 보여야 하므로 [data-i="0"] 초기 translateY:0 보정.'
  },

  // 02 — fade-stack
  {
    id: 'fade-stack', num: '02', title: '페이드 스택',
    summary: '카드가 opacity 0↔1로 부드럽게 swap. 가장 보편적인 전환 방식 — stack-up보다 가볍지만 임팩트는 작음.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-fade'),
      css: SCU_BASE_CSS + '.scu-fade { opacity: 0; transition: opacity 600ms ease-in-out; }\n.scu-fade.is-on { opacity: 1; }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 680
    },
    snippetHTML: '<div class="card is-on"></div>×4',
    snippetCSS: '.card { position: absolute; inset: 0; opacity: 0; transition: opacity 600ms ease-in-out; }\n.card.is-on { opacity: 1; }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: '가장 가벼운 전환. activeIndex의 카드만 .is-on, opacity 1. CSS transition 600ms로 부드러운 swap. 모든 카드는 같은 자리에 절대 위치로 쌓여 있고, 활성 카드만 보임.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'activeIndex = floor(p × N), is-on 토글' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'Fade', value: '600ms ease-in-out (CSS transition)' },
      { label: '시그니처', value: 'Stripe / Vercel 부드러운 swap' }
    ],
    guide: '가장 안전한 전환. 어디에나 잘 어울리지만 시각 임팩트는 약함. transition 시간 500-800ms가 자연스러움. 카드 간 명도 차이가 크면 fade 시 깜빡임 인상 — 비슷한 톤의 카드 시리즈에 적합.',
    recommendations: [
      { place: '히어로 헤더', body: '단순하고 안전한 카드 swap — SaaS 메인 hero' },
      { place: '랜딩 페이지', body: '기능 소개 — 부드러운 swap으로 가독성 유지' },
      { place: '제품 섹션', body: '제품 변형 — 자연스러운 교체' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 가독성 좋게' }
    ],
    tradeoff: '임팩트 약함 — 강한 인상이 필요하면 stack-up이나 scale-pop. CSS 단순.'
  },

  // 03 — scale-pop
  {
    id: 'scale-pop', num: '03', title: '스케일 팝',
    summary: '새 카드가 scale 0.92→1로 살짝 커지면서 opacity 풀려나고, 이전 카드는 1→1.04로 미세하게 커지며 사라짐. 부드러운 zoom-in 느낌.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-pop'),
      css: SCU_BASE_CSS + '.scu-pop { opacity: 0; transform: scale(0.92); transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.2,0,0,1); }\n.scu-pop.is-on { opacity: 1; transform: scale(1); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "scale(1.04)";\n    else if (i > idx) c.style.transform = "scale(0.92)";\n    else c.style.transform = "scale(1)";\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="card"></div>×4',
    snippetCSS: '.card { opacity: 0; transform: scale(0.92); transition: opacity 500ms, transform 500ms cubic-bezier(0.2,0,0,1); }\n.card.is-on { opacity: 1; transform: scale(1); }',
    snippetJS: 'cards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  c.style.transform = "scale(" + (i < idx ? 1.04 : i > idx ? 0.92 : 1) + ")";\n});',
    explain: '활성 카드 scale 1 + opacity 1. 다음 카드는 scale 0.92 + opacity 0(작아진 상태로 대기), 지난 카드는 scale 1.04 + opacity 0(살짝 커지며 사라짐). 두 인접 카드가 동시에 보이는 구간에서 자연스러운 zoom 교체.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'activeIndex + scale 0.92 → 1 → 1.04' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: '시그니처', value: 'Apple Vision Pro / 부드러운 갤러리' }
    ],
    guide: '부드럽고 시각 변화가 자연스러움. scale 변화 0.92~1.04 (작은 폭)이 자연스러움. 너무 큰 변화(0.7~1.3)는 어색. 본문 카드·기능 카드에 적합.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 부드러운 hero — 신뢰감' },
      { place: '랜딩 페이지', body: '회사 가치 시리즈' },
      { place: '제품 섹션', body: '제품 변형 — 자연스러운 교체' },
      { place: '포트폴리오 소개', body: '작품 시리즈' }
    ],
    tradeoff: 'fade-stack보다 약간의 GPU 비용. 변화가 작아 임팩트는 중간.'
  },

  // 04 — slide-from-right
  {
    id: 'slide-from-right', num: '04', title: '우측 슬라이드',
    summary: '새 카드가 우측에서 좌측으로 슬라이드 들어오고 이전 카드는 좌측으로 슬라이드 나감. 가로 흐름 전환.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-slide'),
      css: SCU_BASE_CSS + '.scu-slide { transform: translateX(100%); opacity: 0; transition: transform 600ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease; }\n.scu-slide.is-on { transform: translateX(0); opacity: 1; }\n.scu-slide[data-i="0"] { transform: translateX(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "translateX(-100%)";\n    else if (i > idx) c.style.transform = "translateX(100%)";\n    else c.style.transform = "translateX(0)";\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="card"></div>×4',
    snippetCSS: '.card { transform: translateX(100%); transition: transform 600ms cubic-bezier(0.22,1,0.36,1); }\n.card.is-on { transform: translateX(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  c.style.transform = "translateX(" + (i < idx ? -100 : i > idx ? 100 : 0) + "%)";\n});',
    explain: '활성 카드 translateX 0. 지난 카드는 -100%(좌측으로 사라짐), 다음 카드는 100%(우측에서 대기). overflow:hidden 부모 안에서 카드가 가로로 흐름. cubic-bezier(0.22,1,0.36,1) out-expo로 시네마틱.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateX = (i < idx ? -100 : i > idx ? 100 : 0)%' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) — out-expo' },
      { label: '시그니처', value: '캐러셀 스타일 swap' }
    ],
    guide: '가로 카드 swap. 카드가 옆에서 흘러오는 시네마틱. 캐러셀 패턴과 시각적으로 비슷. 부모 overflow:hidden 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 가로 슬라이드' },
      { place: '랜딩 페이지', body: '서비스 단계별 진행' },
      { place: '제품 섹션', body: '비교 슬라이드' },
      { place: '포트폴리오 소개', body: '연도별 작품 흐름' }
    ],
    tradeoff: '가로 흐름이 스크롤 방향과 직교해 약간의 인지 비용. 모바일에서도 자연스럽긴 함.'
  },

  // 05 — clip-bottom
  {
    id: 'clip-bottom', num: '05', title: 'Clip 바텀 리빌',
    summary: '새 카드가 아래에서 위로 clip-path inset으로 reveal. 커튼이 올라오는 인상.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-clip'),
      css: SCU_BASE_CSS + '.scu-clip { clip-path: inset(100% 0 0 0); }\n.scu-clip[data-i="0"] { clip-path: inset(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyTextReveal(p);\n  cards.forEach(function(c, i){\n    if (i === 0) { c.style.clipPath = "inset(0)"; c.style.zIndex = 0; return; }\n    var pos = p * N - i + 1;\n    var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n    c.style.clipPath = "inset(" + inset + "% 0 0 0)";\n    c.style.zIndex = i;\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="card" data-i="0"></div>×4',
    snippetCSS: '.card { clip-path: inset(100% 0 0 0); }\n.card[data-i="0"] { clip-path: inset(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  if (i === 0) return;\n  var pos = p * N - i + 1;\n  var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n  c.style.clipPath = "inset(" + inset + "% 0 0 0)";\n  c.style.zIndex = i;\n});',
    explain: '첫 카드는 처음부터 보임. 두 번째부터는 inset(100% 0 0 0)으로 위에서부터 잘려 안 보임. 진행률이 i 인덱스에 가까워질수록 inset이 100% → 0%로 줄어들어 위에서 아래로 reveal. 새 카드가 위에서 커튼 내려오듯 등장.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'clip-path inset top = (1 - local) × 100%' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '핵심', value: 'clip-path inset (GPU 가속)' },
      { label: '시그니처', value: 'Apple iPad / 시네마틱 reveal' }
    ],
    guide: '커튼이 내려오는 시네마틱 reveal. clip-path 방향은 inset(top right bottom left). zIndex 관리 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 인트로' },
      { place: '랜딩 페이지', body: '챕터별 전환' },
      { place: '제품 섹션', body: '비포/애프터 비교' },
      { place: '포트폴리오 소개', body: '작품 시리즈 커튼 전환' }
    ],
    tradeoff: 'clip-path 모던 브라우저 지원 양호. 슬라이드 진입 방향 한정(top/bottom/left/right).'
  },

  // 06 — rotate-tilt
  {
    id: 'rotate-tilt', num: '06', title: '회전 틸트',
    summary: '카드가 약간의 rotateZ + translateY로 등장. 종이가 떨어지는 듯한 자연스러운 motion.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-tilt'),
      css: SCU_BASE_CSS + '.scu-tilt { opacity: 0; transform: translateY(60px) rotate(-3deg); transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }\n.scu-tilt.is-on { opacity: 1; transform: translateY(0) rotate(0deg); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "translateY(-60px) rotate(3deg)";\n    else if (i > idx) c.style.transform = "translateY(60px) rotate(-3deg)";\n    else c.style.transform = "translateY(0) rotate(0)";\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="card"></div>×4',
    snippetCSS: '.card { opacity: 0; transform: translateY(60px) rotate(-3deg); transform-origin: bottom center; transition: opacity 600ms, transform 600ms cubic-bezier(0.2,0,0,1); }\n.card.is-on { opacity: 1; transform: translateY(0) rotate(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  if (i < idx) c.style.transform = "translateY(-60px) rotate(3deg)";\n  else if (i > idx) c.style.transform = "translateY(60px) rotate(-3deg)";\n  else c.style.transform = "translateY(0) rotate(0)";\n});',
    explain: '활성 카드는 translateY 0 + rotate 0. 다음 카드는 60px 아래 + -3°(약간 기울어진 채 대기), 지난 카드는 60px 위 + +3°(반대 방향으로 사라짐). 카드가 종이처럼 떨어지고 떠나가는 자연스러운 motion.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateY ±60px + rotate ±3deg' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: '시그니처', value: 'Tobias van Schneider / Polymath' }
    ],
    guide: '약간의 회전이 카드에 종이 같은 자연스러움을 더함. 회전 각도 2-5°이 자연스러움. 너무 크면(>8°) 어색. transform-origin: bottom center로 카드 아래쪽이 축이 됨.',
    recommendations: [
      { place: '히어로 헤더', body: '에디토리얼·매거진 사이트' },
      { place: '랜딩 페이지', body: '크리에이티브 도구·디자인 서비스' },
      { place: '제품 섹션', body: '아트·문구 제품' },
      { place: '포트폴리오 소개', body: '디자이너 본인 포트폴리오' }
    ],
    tradeoff: '회전이 강하면 가독성 저하. 작은 각도(2-5°) 권장.'
  },

  // 07 — blur-swap
  {
    id: 'blur-swap', num: '07', title: '블러 스왑',
    summary: '이전 카드 blur out + 새 카드 blur in. 부드럽고 영화적 전환.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-blur'),
      css: SCU_BASE_CSS + '.scu-blur { opacity: 0; filter: blur(18px); transition: opacity 700ms ease-in-out, filter 700ms ease-in-out; }\n.scu-blur.is-on { opacity: 1; filter: blur(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 680
    },
    snippetHTML: '<div class="card"></div>×4',
    snippetCSS: '.card { opacity: 0; filter: blur(18px); transition: opacity 700ms ease-in-out, filter 700ms ease-in-out; }\n.card.is-on { opacity: 1; filter: blur(0); }',
    snippetJS: 'cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: '비활성 카드는 filter:blur(18px) + opacity 0. 활성 카드는 blur(0) + opacity 1. transition 700ms로 부드럽게 swap. 카메라가 다음 카드에 초점 맞추는 영화적 인상.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'activeIndex → is-on 토글' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '블러 거리', value: 'blur(18px) → 0' },
      { label: '시그니처', value: 'Apple Vision Pro / 시네마틱 swap' }
    ],
    guide: '카메라 초점 변화 같은 영화적 swap. 블러 거리 12-20px이 자연스러움. transition 700-1000ms. filter는 GPU 가속이지만 큰 카드(>500px)에서 모바일 비용. will-change 힌트 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 SaaS 메인' },
      { place: '랜딩 페이지', body: '브랜드 스토리텔링' },
      { place: '제품 섹션', body: '제품 디테일 — 부드러운 swap' },
      { place: '포트폴리오 소개', body: '작품 갤러리 — 영화적 인상' }
    ],
    tradeoff: 'filter blur는 GPU 비용. 큰 면적·모바일 주의. prefers-reduced-motion에서 blur 제거 + opacity만.'
  },

  // 08 — stack-spread
  {
    id: 'stack-spread', num: '08', title: '스택 스프레드 (카드 덱)',
    summary: '이전 카드들이 약간씩 어긋난 채로 뒤에 쌓여 있고, 새 카드가 위에서 슬라이드. 카드 덱(deck of cards) 같은 깊이감.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-deck'),
      css: SCU_BASE_CSS + '.scu-deck { transform: translateY(100%) scale(1); transition: transform 600ms cubic-bezier(0.2,0,0,1); }\n.scu-deck[data-i="0"] { transform: translateY(0) scale(1); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyTextReveal(p);\n  cards.forEach(function(c, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    if (pos < 0) { c.style.transform = "translateY(" + (100 * (1 - local)) + "%)"; c.style.zIndex = i; return; }\n    var behind = pos;\n    c.style.transform = "translateY(" + (-behind * 12) + "px) scale(" + Math.max(0.92, 1 - behind * 0.04) + ")";\n    c.style.zIndex = i;\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="card" data-i="0"></div>×4',
    snippetCSS: '.card { transform: translateY(100%); transition: transform 600ms cubic-bezier(0.2,0,0,1); }\n.card[data-i="0"] { transform: translateY(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  var pos = p * N - i;\n  if (pos < 0) { /* 등장 전 */ return; }\n  c.style.transform = "translateY(" + (-pos * 12) + "px) scale(" + (1 - pos * 0.04) + ")";\n  c.style.zIndex = i;\n});',
    explain: '활성 카드 + 이전 카드들이 동시에 보이는 깊이감. 이전 카드는 -12px씩 위로 + scale 0.96, 0.92로 점점 작아지며 뒤에 쌓임. 카드 덱(playing cards stack) 같은 인상. 새 카드는 stack-up처럼 아래에서 등장.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateY -behind × 12px + scale 1 - behind × 0.04' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '핵심', value: 'zIndex + 이전 카드들 미니어처' },
      { label: '시그니처', value: 'iOS 사진앱 deck / Spotify' }
    ],
    guide: '카드 덱 같은 깊이감. 이전 카드들이 살짝 보이면서 진행 위치를 시각화. 카드 3-5개. 너무 많으면(6+) 뒤 카드가 너무 작아져 인식 어려움.',
    recommendations: [
      { place: '히어로 헤더', body: '카드 시리즈 소개 — 모든 카드가 한 번에 보이는 느낌' },
      { place: '랜딩 페이지', body: '기능 단계 — 진행하면서 이전 단계 잔상' },
      { place: '제품 섹션', body: '제품 라인업 — 시리즈 인상' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 덱 형태로' }
    ],
    tradeoff: '카드가 많으면(6+) 시각적 혼잡. 3-5개 권장.'
  },

  // 09 — dissolve
  {
    id: 'dissolve', num: '09', title: '디졸브 (그레인)',
    summary: '카드가 그레인·노이즈로 디졸브. 영화 디졸브 transition. 미세한 noise filter가 두 카드를 부드럽게 연결.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        <div class="scu-cards">\n          ' + SCU_CARDS.map(function (c, i) { return '<div class="scu-card scu-dis' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '" style="background-image: url(\'' + c.img + '\');"></div>'; }).join('\n          ') + '\n          <div class="scu-noise"></div>\n        </div>',
      css: SCU_BASE_CSS + '.scu-dis { opacity: 0; transition: opacity 800ms ease-in-out, filter 800ms ease-in-out; filter: contrast(0.92) saturate(0.8); }\n.scu-dis.is-on { opacity: 1; filter: contrast(1) saturate(1); }\n.scu-noise { position: absolute; inset: 0; pointer-events: none; opacity: 0.08; mix-blend-mode: overlay; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.6\'/%3E%3C/svg%3E"); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 680
    },
    snippetHTML: '<div class="card"></div>×4\n<div class="noise"></div>',
    snippetCSS: '.card { opacity: 0; filter: contrast(0.92) saturate(0.8); transition: opacity 800ms, filter 800ms; }\n.card.is-on { opacity: 1; filter: contrast(1) saturate(1); }\n.noise { /* SVG fractalNoise overlay */ opacity: 0.08; mix-blend-mode: overlay; }',
    snippetJS: 'cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: 'opacity transition + filter contrast/saturate 동시 변화. SVG fractalNoise를 overlay로 깔아 그레인 텍스처 추가. 영화의 cross-dissolve 같은 시네마틱 transition. 800ms 천천히 swap.',
    kv: [
      { label: '의존성', value: 'CSS + SVG noise' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'activeIndex → opacity + filter contrast·saturate' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'transition', value: '800ms ease-in-out (천천히)' },
      { label: '시그니처', value: '필름 카메라 dissolve / 다큐멘터리' }
    ],
    guide: '시네마틱 dissolve. 카드 콘텐츠가 시각적으로 연결될 때 자연스러움. transition 800-1200ms로 천천히. SVG noise는 매우 미세하게 (opacity 0.05-0.1).',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 영상 같은 시네마틱 인트로' },
      { place: '랜딩 페이지', body: '에디토리얼 매거진' },
      { place: '제품 섹션', body: '예술·문화 제품' },
      { place: '포트폴리오 소개', body: '사진작가·필름 메이커' }
    ],
    tradeoff: 'SVG noise는 GPU 비용. mix-blend-mode 모바일 호환 검수. transition 길어 빠른 스크롤에서 답답할 수 있음.'
  },

  // 10 — carousel
  {
    id: 'carousel', num: '10', title: '캐러셀',
    summary: '카드들이 가로로 정렬되어 있고, 활성 카드만 가운데 + 인접 카드가 좌우에 미니어처로 보임. 클래식 캐러셀.',
    demo: {
      bodyHTML: scuTextsMarkup() + '\n        ' + scuCardsMarkup('scu-car'),
      css: SCU_BASE_CSS + '.scu-cards { perspective: 1600px; }\n.scu-car { transform: translateX(100%) scale(0.85); opacity: 0.4; transition: transform 600ms cubic-bezier(0.2,0,0,1), opacity 600ms; }\n.scu-car[data-i="0"] { transform: translateX(0) scale(1); opacity: 1; }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyTextReveal(p);\n  cards.forEach(function(c, i){\n    var diff = i - idx;\n    if (diff === 0) { c.style.transform = "translateX(0) scale(1)"; c.style.opacity = 1; c.style.zIndex = 10; }\n    else if (Math.abs(diff) === 1) { c.style.transform = "translateX(" + (diff * 65) + "%) scale(0.85)"; c.style.opacity = 0.35; c.style.zIndex = 5; }\n    else { c.style.transform = "translateX(" + (diff * 90) + "%) scale(0.7)"; c.style.opacity = 0; c.style.zIndex = 1; }\n  });\n}',
      height: 680
    },
    snippetHTML: '<div class="card"></div>×4',
    snippetCSS: '.card { transform: translateX(100%) scale(0.85); opacity: 0.4; transition: transform 600ms cubic-bezier(0.2,0,0,1), opacity 600ms; }',
    snippetJS: 'cards.forEach(function(c, i){\n  var diff = i - idx;\n  c.style.transform = "translateX(" + (diff * 65) + "%) scale(" + (diff === 0 ? 1 : 0.85) + ")";\n  c.style.opacity = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.35 : 0;\n});',
    explain: '활성 카드는 가운데 + scale 1 + opacity 1. 좌우 인접 카드는 ±65% translateX + scale 0.85 + opacity 0.35 (미니어처). 그 너머는 ±90% + scale 0.7 + opacity 0. 캐러셀 전체가 한 번에 보임. 진행률에 따라 다음 카드가 가운데로 이동.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'diff = i - idx → translateX·scale·opacity' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '시각', value: '활성 가운데 + 인접 미니어처 양쪽' },
      { label: '시그니처', value: 'iOS 카드 캐러셀 / Apple TV+' }
    ],
    guide: '캐러셀 형태가 카드 시리즈를 한 번에 보여줘 진행 위치 인식 좋음. 인접 카드 opacity 0.3-0.5가 자연스러움. 카드 3-5개. 너무 많으면(6+) 양 끝 카드가 너무 흐릿.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 캐러셀' },
      { place: '랜딩 페이지', body: '서비스 시리즈 — 한 번에 모두 보이는 느낌' },
      { place: '제품 섹션', body: '제품 비교 — 양쪽 인접 카드 미니어처' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 캐러셀 흐름' }
    ],
    tradeoff: '카드 너비가 좁아짐 (양쪽 인접 카드에 공간 양보). 활성 카드 콘텐츠가 작아 보일 수 있음.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  var trackVh = p.demo.trackVh || TRACK_VH;
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Scroll Card Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #fafafa; color: #0a0a0a; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(10,10,10,0.6); background: rgba(255,255,255,0.8); border: 1px solid rgba(10,10,10,0.12); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; }\n'
    + '    .demo-reset:hover { color: #000; background: #fff; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(10,10,10,0.4); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(10,10,10,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; background: rgba(255,255,255,0.7); padding: 8px 14px; border-radius: 999px; animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(10,10,10,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #0a0a0a; width: 0; transition: width 60ms linear; }\n'
    + '    .scroll-track { min-height: ' + trackVh + 'vh; position: relative; }\n'
    + '    .sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">SCROLL ↓</div>\n'
    + '  <div class="demo-progress"><div></div></div>\n'
    + '\n'
    + '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '      <div class="scu-stage">\n'
    + '        ' + p.demo.bodyHTML.replace(/\n/g, '\n        ') + '\n'
    + '      </div>\n'
    + '    </div>\n'
    + '  </div>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var track = document.querySelector(".scroll-track");\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      function calc(){\n'
    + '        var rect = track.getBoundingClientRect();\n'
    + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
    + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
    + '      }\n'
    + '      ' + p.demo.script.replace(/\n/g, '\n      ') + '\n'
    + '      function tick(){\n'
    + '        var p = calc();\n'
    + '        progressFill.style.width = (p * 100) + "%";\n'
    + '        applyReveal(p);\n'
    + '      }\n'
    + '      window.addEventListener("scroll", tick, { passive: true });\n'
    + '      window.addEventListener("resize", tick, { passive: true });\n'
    + '      window.__reset = function(){ window.scrollTo({ top: 0, behavior: "smooth" }); };\n'
    + '      tick();\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

// ============ 분석 보고서 블록 빌더 ============

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/scroll-card-update/' + p.id + '.html',
        embedHeight: p.demo.height || 680,
        embedLabel: p.num + ' · ' + p.title,
        title: p.title + ' 라이브 데모'
      },
      { type: 'heading', value: '작동 원리' },
      { type: 'text', value: p.explain },
      { type: 'kv', columns: 2, items: p.kv },
      { type: 'heading', value: '코드 스니펫' },
      { type: 'code', lang: 'HTML', title: 'HTML', value: p.snippetHTML },
      { type: 'code', lang: 'CSS', title: 'CSS', value: p.snippetCSS },
      { type: 'code', lang: 'JS', title: 'JavaScript', value: p.snippetJS },
      { type: 'heading', value: '사용 가이드' },
      { type: 'text', value: p.guide },
      { type: 'heading', value: '활용 추천' },
      {
        type: 'structure',
        items: p.recommendations.map(r => ({ label: r.place, tag: '', desc: r.body }))
      },
      { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
    ]
  };
}

function buildOverview() {
  const indexItems = PATTERNS.map(p => ({
    label: p.num + '. ' + p.title,
    tag: p.kv.find(k => k.label === '의존성')?.value || '',
    desc: p.summary
  }));

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'Scroll-Card-Update — 패턴 카탈로그 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + scroll 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일 (헤딩 500, 본문 500, 라벨 500)' },
          { label: '배경 / 텍스트 색', value: '#fafafa → #f0c3ed gradient / #0a0a0a' },
          { label: 'Scroll 모델', value: '.scroll-track N×100vh + .sticky-stage 100vh + 2-col grid' },
          { label: '진행률 계산', value: 'p = clamp(0, -rect.top / (rect.height - innerHeight), 1)' },
          { label: '카드 인덱스', value: 'activeIndex = floor(p × N)' },
          { label: '좌측 텍스트', value: '동일 fade-up 진입 (모든 패턴 공통)' },
          { label: '우측 카드', value: '패턴별 인터랙션 변환 (transform/opacity/clip-path)' },
          { label: '카드 데이터', value: '4종 고정 (base44.com 콘텐츠 + wixstatic 이미지)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-card-update/{pattern}.html — 동일 4 카드(콘텐츠+이미지) 위에 카드 전환 방식만 다름' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률 → 카드 변환(transform/opacity/clip-path/filter) 매핑' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 매핑 / Track 높이 / 이징 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '카드 수·track 높이·접근성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: base44.com (' + CATEGORY.url + '). 모든 패턴이 동일한 4 카드(01 Speed / 02 Backend / 03 Ready / 04 Agent) + 동일 wixstatic 이미지 + Pretendard 단일 폰트. 차이는 우측 카드의 인터랙션 변환만. 좌측 텍스트는 모든 패턴이 동일한 fade-up 진입.'
      }
    ]
  };
}

// ============ 메인 ============
function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (const p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/scroll-card-update/' + p.id + '.html');
  }
  const sections = { overview: buildOverview() };
  for (const p of PATTERNS) sections[p.id] = buildPatternSection(p);
  const analysis = {
    id: CATEGORY.id,
    title: CATEGORY.title,
    type: CATEGORY.type,
    url: CATEGORY.url,
    date: CATEGORY.date,
    summary: CATEGORY.summary,
    patternCount: PATTERNS.length,
    sections
  };
  mkdirSync(ANALYSIS_DIR, { recursive: true });
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log('✓ analyses/scroll-card-update/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
