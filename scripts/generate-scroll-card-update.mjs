#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Scroll-Card-Update (v3 — 텍스트+이미지 = 하나의 카드)
 *
 * v3 핵심: "텍스트+이미지"가 하나의 카드 단위.
 *   - scroll-track (500vh) + sticky-stage (100vh, overflow:hidden)
 *   - 각 .scu-card = position:absolute;inset:0 (좌 텍스트 + 우 이미지 grid)
 *   - 카드 전체가 아래에서 위로 올라와 이전 카드를 덮음
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
  summary: '스크롤 시 "텍스트+이미지"가 하나의 카드 단위로 아래에서 위로 올라와 이전 카드를 덮는 인터랙션 카탈로그. base44.com의 시그니처 구조를 첫 번째 패턴(stack-up)으로 차용하고, 카드 전환 방식 9 변형을 비교 카탈로그로 정리. 각 카드는 좌측 텍스트(넘버링·타이틀·본문·CTA) + 우측 이미지(둥근 카드 형태)의 2-column grid이며, 이 전체가 하나의 전환 단위.'
};

// ============ 표준 4 카드 데이터 ============
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

// ============ 공통 마크업 빌더 ============

function scuFullCardsMarkup() {
  return SCU_CARDS.map(function (c, i) {
    return '<div class="scu-card' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">'
      + '\n          <div class="scu-text">'
      + '\n            <div class="scu-num"><span class="scu-num-cur">' + c.num + '</span><span class="scu-num-sep">/</span><span class="scu-num-tot">0' + N + '</span><span class="scu-num-title">' + c.title + '</span></div>'
      + '\n            <p class="scu-body">' + c.body + '</p>'
      + '\n            <button class="scu-btn" type="button">Start building</button>'
      + '\n          </div>'
      + '\n          <div class="scu-img-wrap"><div class="scu-img" style="background-image: url(\'' + c.img + '\');"></div></div>'
      + '\n        </div>';
  }).join('\n        ');
}

// 공통 base CSS — 모든 패턴 공유
// 핵심: scroll-track + sticky-stage + 카드(텍스트+이미지) 전체가 하나의 전환 단위
const SCU_BASE_CSS = ''
  + '.scroll-track { min-height: 500vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }\n'
  + '.scu-card { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 0 48px; background: linear-gradient(180deg, #fafafa 0%, #f5e6f5 60%, #f0c3ed 100%); font-family: "Pretendard Variable","Pretendard",sans-serif; will-change: transform, opacity, clip-path, filter; }\n'
  + '.scu-text { display: flex; flex-direction: column; justify-content: center; padding: 80px 0; }\n'
  + '.scu-num { display: inline-flex; align-items: baseline; gap: 8px; font: 500 14px/1.4 inherit; color: #0a0a0a; margin: 0 0 40px; flex-wrap: wrap; }\n'
  + '.scu-num-cur { color: #0a0a0a; }\n'
  + '.scu-num-sep { color: rgba(10,10,10,0.3); }\n'
  + '.scu-num-tot { color: rgba(10,10,10,0.4); margin-right: 16px; }\n'
  + '.scu-num-title { color: #0a0a0a; padding-left: 8px; }\n'
  + '.scu-body { font: 500 clamp(22px, 2vw, 30px)/1.35 inherit; color: #0a0a0a; margin: 0 0 36px; max-width: 540px; letter-spacing: -0.01em; }\n'
  + '.scu-btn { display: inline-block; font: 600 14px/1 inherit; color: #fff; background: #0a0a0a; border: 0; border-radius: 999px; padding: 16px 32px; cursor: pointer; transition: transform 160ms, background 160ms; align-self: flex-start; }\n'
  + '.scu-btn:hover { transform: translateY(-1px); background: #1a1a1a; }\n'
  + '.scu-img-wrap { display: flex; align-items: center; justify-content: center; padding: 60px 0; }\n'
  + '.scu-img { width: 100%; aspect-ratio: 4 / 5; max-height: calc(100vh - 120px); border-radius: 24px; overflow: hidden; background-size: cover; background-position: center; background-repeat: no-repeat; box-shadow: 0 32px 80px -20px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.04); }\n';

// 공통 reveal helper — scroll-track 진행률
const SCU_COMMON_SCRIPT = ''
  + 'var track = document.querySelector(".scroll-track");\n'
  + 'var cards = document.querySelectorAll(".scu-card");\n'
  + 'var N = ' + N + ';\n'
  + 'function calc(){\n'
  + '  var rect = track.getBoundingClientRect();\n'
  + '  var max = Math.max(1, rect.height - window.innerHeight);\n'
  + '  return Math.max(0, Math.min(1, -rect.top / max));\n'
  + '}';

// ============ 공통 스니펫 HTML ============
const SNIPPET_HTML_COMMON = '<div class="scroll-track">\n  <div class="sticky-stage">\n    <div class="card" data-i="0">\n      <div class="text">넘버링 + 타이틀 + 본문 + CTA</div>\n      <div class="img-wrap"><div class="img">이미지</div></div>\n    </div>\n    <!-- ×4 카드 (텍스트+이미지 = 하나의 카드) -->\n  </div>\n</div>';

// ============ 10 패턴 정의 ============

const PATTERNS = [
  // 01 — stack-up (base44 시그니처)
  {
    id: 'stack-up', num: '01', title: '스택 업 (base44 시그니처)',
    summary: '카드(텍스트+이미지) 전체가 아래에서 위로 슬라이드하며 이전 카드 위에 쌓임. base44.com의 시그니처 인터랙션.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { transform: translateY(100%); }\n.scu-card[data-i="0"] { transform: translateY(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  cards.forEach(function(c, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    var ease = 1 - Math.pow(1 - local, 3);\n    c.style.transform = "translateY(" + (100 * (1 - ease)) + "%)";\n    c.style.zIndex = i;\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.scroll-track { min-height: 500vh; }\n.sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }\n.card { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr;\n  transform: translateY(100%); will-change: transform; }\n.card[data-i="0"] { transform: translateY(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  var pos = p * N - i;\n  var local = Math.max(0, Math.min(1, pos + 1));\n  var ease = 1 - Math.pow(1 - local, 3);\n  c.style.transform = "translateY(" + (100 * (1 - ease)) + "%)";\n  c.style.zIndex = i;\n});',
    explain: '각 카드는 좌측 텍스트(넘버링·타이틀·본문·CTA) + 우측 이미지(둥근 카드 형태)의 2-column grid. 카드 전체가 하나의 단위로 처음에 translateY(100%) 상태에서 스크롤 진행률에 따라 ease-out-cubic으로 0%까지 올라옴. zIndex 누적으로 새 카드가 이전 카드 위에 자연스럽게 쌓인다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'translateY = (1 - ease(local)) × 100%' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드 (2-col grid)' },
      { label: '이미지 영역', value: 'aspect-ratio 4/5, border-radius 24px, 그림자' },
      { label: '시그니처', value: 'base44.com / Linear changelog' }
    ],
    guide: '카드 전체(텍스트+이미지)가 하나의 단위로 아래에서 올라와 덮는 패턴. scroll-track 500vh 안에서 4개 카드가 순차로 등장. 첫 카드는 translateY(0)으로 즉시 보임. 모바일에서는 grid를 1-column으로 fallback.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 핵심 가치 4가지 — base44 그대로 좌측 카피 + 우측 UI 카드' },
      { place: '랜딩 페이지', body: '기능 소개 섹션 — 각 기능당 하나의 카드가 올라오며 교체' },
      { place: '제품 섹션', body: '제품 라인업 — 가격·스펙·이미지를 카드별로' },
      { place: '포트폴리오 소개', body: '대표 작품 케이스 스터디 — 좌측 설명 + 우측 작품 이미지' }
    ],
    tradeoff: 'scroll-track 500vh로 페이지 길이 증가. 모바일에서는 2-col grid를 1-col로 변환 권장. 카드 4~6개가 적정.'
  },

  // 02 — fade-stack
  {
    id: 'fade-stack', num: '02', title: '페이드 스택',
    summary: '카드(텍스트+이미지) 전체가 opacity 0↔1로 부드럽게 swap. 가장 보편적인 전환.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { opacity: 0; transition: opacity 600ms ease-in-out; }\n.scu-card.is-on { opacity: 1; }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { position: absolute; inset: 0; opacity: 0; transition: opacity 600ms ease-in-out; }\n.card.is-on { opacity: 1; }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: '활성 카드(텍스트+이미지 전체)만 .is-on 클래스로 opacity 1. CSS transition 600ms로 부드러운 swap. 모든 카드가 sticky-stage 안에 절대 위치로 쌓여 있고, 활성 카드만 보임.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'activeIndex = floor(p × N)' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: 'Fade', value: '600ms ease-in-out' },
      { label: '시그니처', value: 'Stripe / Vercel 부드러운 swap' }
    ],
    guide: '가장 안전한 카드 전환. 카드 간 색상·톤이 비슷할 때 가장 자연스러움. transition 500~800ms 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 메인 hero — 단순하고 안전한 전환' },
      { place: '랜딩 페이지', body: '기능 소개 — 부드러운 swap으로 가독성 유지' },
      { place: '제품 섹션', body: '제품 변형 비교 — 자연스러운 교체' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 방해 없는 전환' }
    ],
    tradeoff: '임팩트 약함 — 강한 인상이 필요하면 stack-up이나 clip-bottom 권장.'
  },

  // 03 — scale-pop
  {
    id: 'scale-pop', num: '03', title: '스케일 팝',
    summary: '새 카드가 scale 0.92→1로 커지며 등장, 이전 카드는 1→1.04로 미세 확대되며 퇴장.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { opacity: 0; transform: scale(0.92); transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.2,0,0,1); }\n.scu-card.is-on { opacity: 1; transform: scale(1); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "scale(1.04)";\n    else if (i > idx) c.style.transform = "scale(0.92)";\n    else c.style.transform = "scale(1)";\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { opacity: 0; transform: scale(0.92); transition: opacity 500ms, transform 500ms cubic-bezier(0.2,0,0,1); }\n.card.is-on { opacity: 1; transform: scale(1); }',
    snippetJS: 'cards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  c.style.transform = "scale(" + (i < idx ? 1.04 : i > idx ? 0.92 : 1) + ")";\n});',
    explain: '활성 카드 scale 1. 다음 카드는 scale 0.92(작은 상태로 대기), 지난 카드는 scale 1.04(살짝 커지며 사라짐). 카드 전체(텍스트+이미지)가 함께 줌 인/아웃.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'scale 0.92 → 1 → 1.04' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: '시그니처', value: '부드러운 zoom 갤러리' }
    ],
    guide: '부드럽고 시각 변화가 자연스러움. scale 변화 0.92~1.04 (작은 폭). 카드 전체가 함께 줌 되므로 텍스트+이미지 동시에 변화.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 부드러운 hero 전환' },
      { place: '랜딩 페이지', body: '회사 가치 시리즈 교체' },
      { place: '제품 섹션', body: '제품 변형 교체' },
      { place: '포트폴리오 소개', body: '작품 시리즈' }
    ],
    tradeoff: 'GPU 비용 약간. 변화가 작아 임팩트 중간.'
  },

  // 04 — slide-from-right
  {
    id: 'slide-from-right', num: '04', title: '우측 슬라이드',
    summary: '새 카드(텍스트+이미지)가 우측에서 슬라이드 진입, 이전 카드는 좌측으로 퇴장.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { transform: translateX(100%); opacity: 0; transition: transform 600ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease; }\n.scu-card.is-on { transform: translateX(0); opacity: 1; }\n.scu-card[data-i="0"] { transform: translateX(0); opacity: 1; }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "translateX(-100%)";\n    else if (i > idx) c.style.transform = "translateX(100%)";\n    else c.style.transform = "translateX(0)";\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { transform: translateX(100%); opacity: 0; transition: transform 600ms cubic-bezier(0.22,1,0.36,1); }\n.card.is-on { transform: translateX(0); opacity: 1; }',
    snippetJS: 'cards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  c.style.transform = "translateX(" + (i < idx ? -100 : i > idx ? 100 : 0) + "%)";\n});',
    explain: '활성 카드 translateX 0. 지난 카드는 -100%(좌측 퇴장), 다음 카드는 100%(우측 대기). 카드 전체(텍스트+이미지)가 함께 가로 슬라이드. sticky-stage overflow:hidden으로 영역 밖 카드는 가려짐.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'translateX -100/0/100%' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) out-expo' },
      { label: '시그니처', value: '캐러셀 스타일 swap' }
    ],
    guide: '가로 슬라이드 전환. sticky-stage의 overflow:hidden 필수. 텍스트+이미지가 함께 이동하여 일체감 있음.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 가로 슬라이드' },
      { place: '랜딩 페이지', body: '서비스 단계 진행' },
      { place: '제품 섹션', body: '비교 슬라이드' },
      { place: '포트폴리오 소개', body: '연도별 작품' }
    ],
    tradeoff: '가로 흐름이 스크롤 방향과 직교해 약간의 인지 비용.'
  },

  // 05 — clip-bottom
  {
    id: 'clip-bottom', num: '05', title: 'Clip 바텀 리빌',
    summary: '새 카드(텍스트+이미지) 전체가 clip-path inset으로 아래에서 위로 reveal. 커튼이 올라가는 느낌.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { clip-path: inset(100% 0 0 0); }\n.scu-card[data-i="0"] { clip-path: inset(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  cards.forEach(function(c, i){\n    if (i === 0) { c.style.clipPath = "inset(0)"; c.style.zIndex = 0; return; }\n    var pos = p * N - i + 1;\n    var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n    c.style.clipPath = "inset(" + inset + "% 0 0 0)";\n    c.style.zIndex = i;\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { clip-path: inset(100% 0 0 0); }\n.card[data-i="0"] { clip-path: inset(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  if (i === 0) return;\n  var pos = p * N - i + 1;\n  var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n  c.style.clipPath = "inset(" + inset + "% 0 0 0)";\n  c.style.zIndex = i;\n});',
    explain: '첫 카드는 처음부터 보임. 이후 카드들은 clip-path inset 100%에서 시작해 진행률 따라 0으로 줄어들며 아래에서 위로 reveal. 카드 전체(텍스트+이미지)가 커튼처럼 드러남.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'clip-path inset top = (1 - local) × 100%' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '핵심', value: 'clip-path inset (GPU 가속)' },
      { label: '시그니처', value: '시네마틱 reveal' }
    ],
    guide: '카드 전체가 커튼처럼 드러나는 시네마틱 전환. zIndex 누적 필수. 텍스트와 이미지가 동시에 reveal 되어 임팩트 강함.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 인트로' },
      { place: '랜딩 페이지', body: '챕터별 전환' },
      { place: '제품 섹션', body: '비포/애프터 전환' },
      { place: '포트폴리오 소개', body: '커튼 전환 연출' }
    ],
    tradeoff: 'clip-path 모던 브라우저 필수. reveal 방향이 아래→위 한정.'
  },

  // 06 — rotate-tilt
  {
    id: 'rotate-tilt', num: '06', title: '회전 틸트',
    summary: '카드(텍스트+이미지) 전체가 translateY 60px + rotate ±3°로 등장. 종이가 떨어지는 느낌.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { opacity: 0; transform: translateY(60px) rotate(-3deg); transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }\n.scu-card.is-on { opacity: 1; transform: translateY(0) rotate(0deg); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "translateY(-60px) rotate(3deg)";\n    else if (i > idx) c.style.transform = "translateY(60px) rotate(-3deg)";\n    else c.style.transform = "translateY(0) rotate(0)";\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { opacity: 0; transform: translateY(60px) rotate(-3deg); transform-origin: bottom center;\n  transition: opacity 600ms, transform 600ms cubic-bezier(0.2,0,0,1); }\n.card.is-on { opacity: 1; transform: translateY(0) rotate(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  if (i < idx) c.style.transform = "translateY(-60px) rotate(3deg)";\n  else if (i > idx) c.style.transform = "translateY(60px) rotate(-3deg)";\n  else c.style.transform = "translateY(0) rotate(0)";\n});',
    explain: '활성 카드 translateY 0 + rotate 0. 다음 카드는 60px 아래 + -3°, 지난 카드는 60px 위 + +3°. 카드 전체(텍스트+이미지)가 종이처럼 기울어지며 등장·퇴장. transform-origin: bottom center.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'translateY ±60px + rotate ±3deg' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: '시그니처', value: '에디토리얼 / 종이 같은 인상' }
    ],
    guide: '회전 2~5°가 자연스러움. 카드 전체가 기울어지므로 텍스트+이미지 함께 회전하여 종이 넘기기 인상.',
    recommendations: [
      { place: '히어로 헤더', body: '에디토리얼·매거진 스타일' },
      { place: '랜딩 페이지', body: '크리에이티브 도구 소개' },
      { place: '제품 섹션', body: '아트·문구 제품' },
      { place: '포트폴리오 소개', body: '디자이너 포트폴리오' }
    ],
    tradeoff: '큰 회전은 가독성 저하. 2~5° 권장.'
  },

  // 07 — blur-swap
  {
    id: 'blur-swap', num: '07', title: '블러 스왑',
    summary: '카드(텍스트+이미지) 전체가 blur in/out. 카메라 초점 변화 같은 영화적 전환.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { opacity: 0; filter: blur(18px); transition: opacity 700ms ease-in-out, filter 700ms ease-in-out; }\n.scu-card.is-on { opacity: 1; filter: blur(0); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { opacity: 0; filter: blur(18px); transition: opacity 700ms, filter 700ms ease-in-out; }\n.card.is-on { opacity: 1; filter: blur(0); }',
    snippetJS: 'cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: '비활성 카드 filter:blur(18px) + opacity 0. 활성 카드 blur(0) + opacity 1. 카드 전체(텍스트+이미지)가 함께 blur/unblur 되어 카메라 초점 전환 효과.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'is-on 토글' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '블러 거리', value: 'blur(18px) → 0' },
      { label: '시그니처', value: 'Apple Vision Pro 시네마틱' }
    ],
    guide: '카메라 초점 변화 같은 영화적 전환. 텍스트까지 blur 되므로 전환 중 가독성은 떨어지지만 임팩트 강함. transition 700~1000ms.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 SaaS hero' },
      { place: '랜딩 페이지', body: '브랜드 스토리텔링' },
      { place: '제품 섹션', body: '부드러운 swap' },
      { place: '포트폴리오 소개', body: '영화적 작품 갤러리' }
    ],
    tradeoff: 'filter blur GPU 비용. 전체 카드 blur라 전환 중 텍스트 읽기 불가.'
  },

  // 08 — stack-spread
  {
    id: 'stack-spread', num: '08', title: '스택 스프레드 (카드 덱)',
    summary: '이전 카드(텍스트+이미지)들이 위로 어긋나며 쌓이고 새 카드가 위에 올라옴. 카드 덱 깊이감.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { transform: translateY(100%) scale(1); transition: transform 600ms cubic-bezier(0.2,0,0,1); }\n.scu-card[data-i="0"] { transform: translateY(0) scale(1); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  cards.forEach(function(c, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    if (pos < 0) { c.style.transform = "translateY(" + (100 * (1 - local)) + "%)"; c.style.zIndex = i; return; }\n    var behind = pos;\n    c.style.transform = "translateY(" + (-behind * 12) + "px) scale(" + Math.max(0.92, 1 - behind * 0.04) + ")";\n    c.style.zIndex = N - i;\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { transform: translateY(100%); transition: transform 600ms cubic-bezier(0.2,0,0,1); }\n.card[data-i="0"] { transform: translateY(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  var pos = p * N - i;\n  if (pos < 0) { /* 등장 전 */ return; }\n  c.style.transform = "translateY(" + (-pos * 12) + "px) scale(" + (1 - pos * 0.04) + ")";\n  c.style.zIndex = N - i;\n});',
    explain: '활성 카드 + 이전 카드들 동시 보임. 이전 카드는 -12px씩 위로 + scale 0.96·0.92로 작아지며 뒤에 쌓임. 카드 전체(텍스트+이미지)가 덱처럼 보여 깊이감 제공.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'translateY -behind × 12px + scale 1 - behind × 0.04' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '핵심', value: 'zIndex 역순 + 이전 카드 미니어처' },
      { label: '시그니처', value: 'iOS 사진앱 deck' }
    ],
    guide: '카드 덱 깊이감. 이전 카드 전체(텍스트+이미지)가 살짝 보여 진행 위치 시각화. 카드 3~5개 적정.',
    recommendations: [
      { place: '히어로 헤더', body: '카드 시리즈 — 모든 카드 한 번에 인상' },
      { place: '랜딩 페이지', body: '기능 단계 — 이전 단계 잔상' },
      { place: '제품 섹션', body: '제품 라인업 시리즈' },
      { place: '포트폴리오 소개', body: '작품 덱 형태' }
    ],
    tradeoff: '카드 6+이면 시각 혼잡. 3~5개 권장.'
  },

  // 09 — dissolve
  {
    id: 'dissolve', num: '09', title: '디졸브 (그레인)',
    summary: '카드(텍스트+이미지) 전체가 그레인·노이즈로 디졸브. 필름 카메라 cross-dissolve.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { opacity: 0; transition: opacity 800ms ease-in-out, filter 800ms ease-in-out; filter: contrast(0.92) saturate(0.8); }\n.scu-card.is-on { opacity: 1; filter: contrast(1) saturate(1); }\n.scu-noise { position: absolute; inset: 0; pointer-events: none; opacity: 0.08; mix-blend-mode: overlay; z-index: 100; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.6\'/%3E%3C/svg%3E"); }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 720,
      extraInnerHTML: '<div class="scu-noise"></div>'
    },
    snippetHTML: SNIPPET_HTML_COMMON.replace('<!-- ×4', '<div class="noise"></div>\n    <!-- ×4'),
    snippetCSS: '.card { opacity: 0; filter: contrast(0.92) saturate(0.8); transition: opacity 800ms, filter 800ms; }\n.card.is-on { opacity: 1; filter: contrast(1) saturate(1); }\n.noise { position: absolute; inset: 0; pointer-events: none; opacity: 0.08;\n  mix-blend-mode: overlay; /* SVG fractalNoise */ }',
    snippetJS: 'cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: 'opacity + filter contrast/saturate 동시 변화. SVG fractalNoise overlay로 그레인 텍스처. 카드 전체(텍스트+이미지)가 800ms 천천히 swap.',
    kv: [
      { label: '의존성', value: 'CSS + SVG noise' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'opacity + filter contrast·saturate' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: 'transition', value: '800ms ease-in-out' },
      { label: '시그니처', value: '필름 카메라 dissolve' }
    ],
    guide: '시네마틱 dissolve. 카드 전체가 그레인과 함께 전환되어 필름 느낌. SVG noise opacity 0.05~0.1.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 영상 시네마틱' },
      { place: '랜딩 페이지', body: '에디토리얼 매거진' },
      { place: '제품 섹션', body: '예술·문화 제품' },
      { place: '포트폴리오 소개', body: '사진작가·필름 메이커' }
    ],
    tradeoff: 'SVG noise GPU 비용. mix-blend-mode 모바일 호환 검수.'
  },

  // 10 — carousel
  {
    id: 'carousel', num: '10', title: '캐러셀',
    summary: '카드(텍스트+이미지)들이 가로로 정렬, 활성 카드만 정면 + 인접 카드 좌우에 미니어처.',
    demo: {
      css: SCU_BASE_CSS + '.scu-card { transform: translateX(100%) scale(0.85); opacity: 0.4; transition: transform 600ms cubic-bezier(0.2,0,0,1), opacity 600ms; }\n.scu-card[data-i="0"] { transform: translateX(0) scale(1); opacity: 1; }',
      script: SCU_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    var diff = i - idx;\n    if (diff === 0) { c.style.transform = "translateX(0) scale(1)"; c.style.opacity = 1; c.style.zIndex = 10; }\n    else if (Math.abs(diff) === 1) { c.style.transform = "translateX(" + (diff * 80) + "%) scale(0.85)"; c.style.opacity = 0.35; c.style.zIndex = 5; }\n    else { c.style.transform = "translateX(" + (diff * 120) + "%) scale(0.7)"; c.style.opacity = 0; c.style.zIndex = 1; }\n  });\n}',
      height: 720
    },
    snippetHTML: SNIPPET_HTML_COMMON,
    snippetCSS: '.card { transform: translateX(100%) scale(0.85); opacity: 0.4;\n  transition: transform 600ms cubic-bezier(0.2,0,0,1), opacity 600ms; }',
    snippetJS: 'cards.forEach(function(c, i){\n  var diff = i - idx;\n  c.style.transform = "translateX(" + (diff * 80) + "%) scale(" + (diff === 0 ? 1 : 0.85) + ")";\n  c.style.opacity = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.35 : 0;\n});',
    explain: '활성 카드(텍스트+이미지) 가운데 + scale 1. 좌우 인접 카드 ±80% + scale 0.85 + opacity 0.35. 카드 전체가 가로 캐러셀로 흐름.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '페이지 스크롤 (scroll-track 진행률)' },
      { label: '매핑', value: 'diff = i - idx → translateX·scale·opacity' },
      { label: '카드 구조', value: '텍스트+이미지 = 하나의 카드' },
      { label: '시각', value: '활성 가운데 + 인접 미니어처 양쪽' },
      { label: '시그니처', value: 'iOS 카드 캐러셀' }
    ],
    guide: '캐러셀 형태로 카드 시리즈를 한 번에 보여줌. 인접 카드의 텍스트+이미지가 함께 축소되어 전체 흐름 파악 가능.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 캐러셀' },
      { place: '랜딩 페이지', body: '서비스 시리즈 — 한 번에 모두' },
      { place: '제품 섹션', body: '제품 비교 — 인접 미니어처' },
      { place: '포트폴리오 소개', body: '작품 캐러셀 흐름' }
    ],
    tradeoff: '카드 전체가 축소되므로 인접 카드의 텍스트는 읽기 어려움. 시각적 흐름 파악용.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  var extraInner = p.demo.extraInnerHTML || '';
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
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(10,10,10,0.6); background: rgba(255,255,255,0.85); border: 1px solid rgba(10,10,10,0.12); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; backdrop-filter: blur(8px); }\n'
    + '    .demo-reset:hover { color: #000; background: #fff; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(10,10,10,0.45); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(10,10,10,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; background: rgba(255,255,255,0.75); padding: 8px 14px; border-radius: 999px; backdrop-filter: blur(8px); animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(10,10,10,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #0a0a0a; width: 0; transition: width 60ms linear; }\n'
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
    + '      ' + scuFullCardsMarkup() + '\n'
    + '      ' + extraInner + '\n'
    + '    </div>\n'
    + '  </div>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
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
        embedHeight: p.demo.height || 720,
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
      { type: 'heading', value: 'Scroll-Card-Update — 패턴 카탈로그 v3 (텍스트+이미지 = 하나의 카드)' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + 구조' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일' },
          { label: '배경', value: '#fafafa → #f0c3ed gradient (각 카드 자체 배경)' },
          { label: '카드 모델', value: '"텍스트+이미지 = 하나의 카드" (2-col grid, position:absolute)' },
          { label: '스크롤 트랙', value: 'scroll-track 500vh + sticky-stage 100vh' },
          { label: '이미지 영역', value: 'aspect-ratio 4/5 + border-radius 24px + 그림자' },
          { label: '진행률 계산', value: 'p = clamp(0, -track.top / (track.height - innerHeight), 1)' },
          { label: '카드 수', value: '4종 고정 (base44.com 콘텐츠 + wixstatic 이미지)' },
          { label: '전환 방식', value: '카드 전체(텍스트+이미지)가 하나의 단위로 전환' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-card-update/{pattern}.html — 카드(텍스트+이미지) 전체 전환' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률 → 카드 전체 인터랙션 (transform/opacity/clip)' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 매핑 / 카드 구조 / 이징 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '카드 수·구조·모바일 fallback' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: base44.com (' + CATEGORY.url + '). 각 카드는 "좌측 텍스트(넘버링·타이틀·본문·CTA) + 우측 이미지(둥근 카드 형태)"의 2-column grid이며, 이 전체가 하나의 전환 단위로 아래에서 위로 올라와 이전 카드를 덮는다.'
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
