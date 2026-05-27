#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Full-screen Scroll (v1)
 *
 * Framer 마켓플레이스 "Scroll Slides" (Artem Kostenko, scrollslides.framer.website 라이브 데모)
 * 컴포넌트를 fade-stack 패턴으로 차용하고, 9가지 변형(horizontal-pan, zoom-into,
 * pin-stack, parallax-layer, 3d-rotate, scroll-snap, clip-reveal, scale-handoff,
 * caption-slide)을 정리한 풀스크린 스크롤 갤러리 카탈로그.
 *
 * 표준 보일러플레이트: parent 400vh + sticky stage 100vh + scroll progress 매핑.
 *   activeIndex = floor(p * N), slideProgress[i] = clamp(p*N - i, 0, 1)
 *
 * Usage: node scripts/generate-full-screen-scroll.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'full-screen-scroll');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'full-screen-scroll');

const CATEGORY = {
  id: 'full-screen-scroll',
  title: 'Full-screen Scroll',
  type: 'category',
  date: '2026-05-27',
  url: 'https://www.framer.com/marketplace/components/scroll-slides/',
  summary: 'parent를 N×100vh로 늘리고 sticky stage에 슬라이드를 고정한 뒤, 스크롤 진행률(0~1)을 activeIndex와 slideProgress[i]에 매핑해 풀스크린 슬라이드를 전환하는 인터랙션 카탈로그. Framer 마켓플레이스 "Scroll Slides" 컴포넌트(Artem Kostenko 작)의 sticky + fade + progress bar 패턴을 첫 번째(fade-stack)로 차용하고, 가로 팬·줌·핀 스택·패럴랙스·3D 회전·스크롤 스냅·clip reveal·스케일 핸드오프·캡션 슬라이드 등 9가지 변형을 비교 카탈로그로 정리.'
};

// 표준 4 슬라이드 콘텐츠 (한국어)
const SLIDES = [
  { number: '01', name: 'Inspiration', title: '자연에서 받은 영감', desc: '디자인 철학은 자연의 형상과 유기적 소재에서 출발합니다.', bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' },
  { number: '02', name: 'Design',      title: '사려 깊은 디자인',     desc: '모든 디테일은 일상을 더 풍요롭게 만들기 위해 존재합니다.', bg: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)' },
  { number: '03', name: 'Craft',       title: '장인의 마감',         desc: '공간과 사물의 균형을 한 치 어긋남 없이 다듬어 갑니다.',  bg: 'linear-gradient(135deg, #3b0764 0%, #7e22ce 100%)' },
  { number: '04', name: 'Result',      title: '완성된 경험',         desc: '디자인은 결과가 아니라 과정 자체입니다.',                  bg: 'linear-gradient(135deg, #422006 0%, #c2410c 100%)' }
];

// 슬라이드 마크업 빌더 — 패턴별로 클래스 prefix를 받음
function slidesMarkup(prefix) {
  return SLIDES.map(function (s, i) {
    return '<div class="' + prefix + '-slide" data-i="' + i + '" style="background:' + s.bg + '">'
      + '<div class="' + prefix + '-cap">'
      + '<div class="' + prefix + '-num">' + s.number + ' · ' + s.name + '</div>'
      + '<h2 class="' + prefix + '-title">' + s.title + '</h2>'
      + '<p class="' + prefix + '-desc">' + s.desc + '</p>'
      + '</div>'
      + '</div>';
  }).join('\n      ');
}

// 공통 슬라이드 CSS — 패턴별로 클래스 prefix를 받음
function slidesCSS(prefix) {
  return '.' + prefix + '-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
    + '.' + prefix + '-cap { text-align: center; color: #fff; max-width: 720px; padding: 0 8vw; }\n'
    + '.' + prefix + '-num { font: 600 12px/1 ui-monospace, monospace; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 20px; }\n'
    + '.' + prefix + '-title { font: 700 clamp(40px, 6vw, 84px)/1.1 "Pretendard Variable","Pretendard",system-ui; margin: 0 0 18px; letter-spacing: -0.02em; }\n'
    + '.' + prefix + '-desc { font: 400 clamp(16px, 1.4vw, 20px)/1.55 "Pretendard Variable","Pretendard",system-ui; margin: 0; opacity: 0.85; }';
}

// ============ 10 패턴 정의 ============

const PATTERNS = [
  // ───────────────────────────── 1. fade-stack (Framer Scroll Slides)
  {
    id: 'fade-stack',
    num: '01',
    title: '페이드 스택 (Framer Scroll Slides)',
    summary: '슬라이드가 sticky stage에 쌓여 있고, 진행률 구간 [i/N, (i+1)/N]에서 activeIndex가 i로 바뀌면서 이전 슬라이드는 opacity 0, 새 슬라이드는 opacity 1로 fade. 하단 progress bar가 각 슬라이드의 진행률을 시각화. Framer 마켓플레이스 Scroll Slides의 동일 동작.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n      ' + slidesMarkup('fs') + '\n      </div>\n      <div class="fs-bars">\n        ' + SLIDES.map(function (s, i) { return '<div class="fs-bar"><span class="fs-bar-label">' + s.number + ' · ' + s.name + '</span><div class="fs-bar-track"><div class="fs-bar-fill" data-i="' + i + '"></div></div></div>'; }).join('\n        ') + '\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; }\n' + slidesCSS('fs') + '\n.fs-slide { opacity: 0; transition: opacity 600ms ease-in-out; }\n.fs-slide.is-on { opacity: 1; }\n.fs-bars { position: absolute; bottom: 48px; left: 8vw; right: 8vw; display: flex; gap: 40px; align-items: flex-end; z-index: 5; }\n.fs-bar { flex: 1; display: flex; flex-direction: column; gap: 12px; }\n.fs-bar-label { font: 600 11px/1 ui-monospace, monospace; color: rgba(255,255,255,0.78); letter-spacing: 0.06em; }\n.fs-bar-track { width: 100%; height: 2px; background: rgba(255,255,255,0.2); overflow: hidden; }\n.fs-bar-fill { height: 100%; background: #fff; transform: scaleX(0); transform-origin: left; }',
      script: 'var slides = document.querySelectorAll(".fs-slide");\nvar bars = document.querySelectorAll(".fs-bar-fill");\nvar N = slides.length;\nfunction applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  slides.forEach(function(s, i){ s.classList.toggle("is-on", i === idx); });\n  bars.forEach(function(b, i){\n    var start = i / N, end = (i + 1) / N;\n    var local = p < start ? 0 : p > end ? 1 : (p - start) / (end - start);\n    b.style.transform = "scaleX(" + local + ")";\n  });\n}',
      height: 560,
      trackVh: 400
    },
    snippetHTML: '<div class="track" style="height: ' + (SLIDES.length * 100) + 'vh">\n  <div class="stage" style="position:sticky;top:0;height:100vh">\n    <div class="slide is-on">...</div>\n    <div class="slide">...</div>\n  </div>\n</div>',
    snippetCSS: '.slide { position: absolute; inset: 0; opacity: 0; transition: opacity 600ms ease-in-out; }\n.slide.is-on { opacity: 1; }',
    snippetJS: 'var slides = document.querySelectorAll(".slide");\nvar N = slides.length;\nvar track = document.querySelector(".track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  slides.forEach(function(s, i){ s.classList.toggle("is-on", i === idx); });\n}, { passive: true });',
    explain: 'parent .track 높이를 N×100vh로 설정해 스크롤 공간을 만들고, .stage를 position:sticky top:0 height:100vh로 viewport에 고정. 스크롤 진행률(0~1)을 N으로 곱한 인덱스로 activeIndex 결정 → 그 슬라이드만 .is-on. 슬라이드 간 transition 600ms로 자연스럽게 fade. progress bar는 각 슬라이드 구간의 local progress(0~1)을 scaleX로.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Framer Motion 대체 가능)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'activeIndex = floor(p × N)' },
      { label: 'Track 높이', value: 'N × 100vh (예: 4 슬라이드 = 400vh)' },
      { label: 'Fade', value: 'opacity 0↔1, 600ms ease-in-out (CSS transition)' },
      { label: '시그니처', value: 'Framer Scroll Slides / Apple iPhone Hero' }
    ],
    guide: '풀스크린 이미지/비디오 갤러리에 가장 보편적. 슬라이드 3~5개가 균형. 너무 많으면(6+) 스크롤이 너무 길어진다. Track 높이는 N×100vh 표준, 더 빠른 전환을 원하면 N×80vh로 줄임. progress bar 클릭 → scrollTo로 해당 슬라이드로 점프하는 기능도 함께 구현 가능 (Scroll Slides의 scrollToSlide).',
    recommendations: [
      { place: '히어로 헤더', body: '제품 홍보 페이지의 메인 Hero — 풀스크린 이미지 시리즈를 스크롤로 전환' },
      { place: '랜딩 페이지', body: '브랜드 스토리텔링의 핵심 섹션 — 4-5 챕터를 풀스크린으로 풀어냄' },
      { place: '제품 섹션', body: '제품 라인업 카탈로그 — 한 제품당 한 슬라이드, 비디오와 함께' },
      { place: '포트폴리오 소개', body: '대표 작업 4-5건을 풀스크린 갤러리로 — 각 작품에 충분한 시각 임팩트' }
    ],
    tradeoff: 'parent height가 4×100vh = 400vh로 페이지 전체 길이가 크게 늘어남. 페이지에 다른 콘텐츠도 많으면 사용자가 지칠 수 있어 한 페이지에 하나의 fade-stack만 권장. 모바일에서는 비디오/이미지 사이즈 최적화 필수.'
  },

  // ───────────────────────────── 2. horizontal-pan
  {
    id: 'horizontal-pan',
    num: '02',
    title: '가로 패닝',
    summary: '세로 스크롤을 가로 이동으로 변환. sticky stage 안의 rail이 N×100vw 폭이고, 진행률에 따라 translateX로 가로 이동. Apple AirPods·Stripe의 시그니처 가로 갤러리.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n        <div class="fs-rail">\n          ' + SLIDES.map(function (s, i) { return '<div class="fs-slide" style="background:' + s.bg + '"><div class="fs-cap"><div class="fs-num">' + s.number + ' · ' + s.name + '</div><h2 class="fs-title">' + s.title + '</h2><p class="fs-desc">' + s.desc + '</p></div></div>'; }).join('\n          ') + '\n        </div>\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; }\n.fs-rail { display: flex; flex-direction: row; width: ' + (SLIDES.length * 100) + 'vw; height: 100vh; will-change: transform; }\n' + slidesCSS('fs').replace('.fs-slide { position: absolute; inset: 0;', '.fs-slide { position: relative; width: 100vw; height: 100vh; flex-shrink: 0;'),
      script: 'var rail = document.querySelector(".fs-rail");\nvar N = ' + SLIDES.length + ';\nfunction applyReveal(p){\n  var x = -p * (N - 1) * 100;\n  rail.style.transform = "translateX(" + x + "vw)";\n}',
      height: 520,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage">\n    <div class="rail">\n      <div class="slide">1</div><div class="slide">2</div>\n    </div>\n  </div>\n</div>',
    snippetCSS: '.stage { overflow: hidden; }\n.rail { display: flex; width: 400vw; height: 100vh; }\n.slide { width: 100vw; height: 100vh; flex-shrink: 0; }',
    snippetJS: 'var rail = document.querySelector(".rail");\nvar N = 4;\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  rail.style.transform = "translateX(" + (-p * (N - 1) * 100) + "vw)";\n}, { passive: true });',
    explain: 'rail이 display:flex로 가로 정렬되어 있고 전체 폭이 N×100vw. sticky stage는 overflow:hidden + 100vw 100vh viewport. 진행률 × (N-1) × 100vw 만큼 rail을 translateX. 사용자가 세로로 스크롤하면 슬라이드가 옆으로 흐름. p=0 → 첫 슬라이드, p=1 → 마지막 슬라이드.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateX = -p × (N-1) × 100vw' },
      { label: 'Track 높이', value: 'N × 100vh (예: 4 슬라이드 = 400vh)' },
      { label: 'Rail 폭', value: 'N × 100vw' },
      { label: '시그니처', value: 'Apple AirPods Pro / Stripe Universal / GSAP 가로 스크롤' }
    ],
    guide: '슬라이드가 옆으로 흐르는 영화 같은 진행감. 슬라이드 3~5개가 균형. 6+면 사용자가 진행 위치 감각을 잃음 — 작은 progress 인디케이터 추가 권장. 모바일에서는 가로 스크롤이 자연스럽지 않을 수 있어 세로 fade-stack으로 fallback 또는 horizontal swipe 활용.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 가로 갤러리 — Apple 시그니처' },
      { place: '랜딩 페이지', body: '서비스 단계(Step 1→2→3) 가로 진행' },
      { place: '제품 섹션', body: '제품 사양 비교 — 슬라이드별 한 제품' },
      { place: '포트폴리오 소개', body: '연도별 작업 타임라인 — 가로로 흐르는 시간' }
    ],
    tradeoff: '가로 스크롤이라는 컨벤션은 익숙하지만, 페이지 안에 다른 세로 스크롤 콘텐츠와 섞이면 사용자 혼란. 모바일은 가로 스와이프로 fallback 권장.'
  },

  // ───────────────────────────── 3. zoom-into
  {
    id: 'zoom-into',
    num: '03',
    title: '줌인 전환',
    summary: '슬라이드가 자기 인덱스에 도달할 때 scale 0.8→1로 커지면서 opacity가 풀려나고, 인덱스를 지나면 scale 1→1.4 + opacity 1→0으로 줌인하며 사라짐. 카메라가 슬라이드 안으로 빨려 들어가는 인상.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n      ' + slidesMarkup('fs') + '\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; perspective: 1000px; }\n' + slidesCSS('fs') + '\n.fs-slide { opacity: 0; transform: scale(0.8); will-change: transform, opacity; }',
      script: 'var slides = document.querySelectorAll(".fs-slide");\nvar N = slides.length;\nfunction applyReveal(p){\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    if (pos < 0) { s.style.opacity = 0; s.style.transform = "scale(" + (0.8 + 0.2 * (1 + pos)) + ")"; }\n    else if (pos > 1) { s.style.opacity = 0; s.style.transform = "scale(" + (1 + 0.4 * (pos - 1)) + ")"; }\n    else {\n      var inP = Math.min(1, pos * 2);\n      var outP = Math.max(0, pos - 0.5) * 2;\n      s.style.opacity = inP * (1 - outP);\n      s.style.transform = "scale(" + (0.8 + 0.6 * pos) + ")";\n    }\n  });\n}',
      height: 520,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage">\n    <div class="slide">1</div><div class="slide">2</div>\n  </div>\n</div>',
    snippetCSS: '.slide { position: absolute; inset: 0; opacity: 0; transform: scale(0.8); will-change: transform, opacity; }',
    snippetJS: 'var slides = document.querySelectorAll(".slide");\nvar N = slides.length;\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    var scale = pos < 0 ? 0.8 + 0.2 * (1 + pos) : pos > 1 ? 1 + 0.4 * (pos - 1) : 0.8 + 0.6 * pos;\n    var op = pos < 0 || pos > 1 ? 0 : Math.min(1, pos * 2) * (1 - Math.max(0, pos - 0.5) * 2);\n    s.style.opacity = op; s.style.transform = "scale(" + scale + ")";\n  });\n}, { passive: true });',
    explain: '각 슬라이드의 local pos = p×N - i (자기 인덱스에서 0, 다음 인덱스에서 1). pos < 0 (등장 전)이면 scale 0.8→1 + opacity 0, pos ∈ [0, 1] (활성 구간)이면 scale 0.8→1.4 + opacity 풀려남, pos > 1 (지나감)이면 scale 1.4 이상 + opacity 0. 슬라이드가 가운데에서 줌인되며 사라지는 영화적 느낌.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'pos = p×N - i, scale 0.8→1.4, opacity Δ in/out' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'linear (사용자 제어)' },
      { label: '시그니처', value: 'Apple Vision Pro Hero / WebGL 카메라 줌' }
    ],
    guide: '카메라 줌인 같은 강한 시각 임팩트. 슬라이드 3~4개가 적정 — 너무 많으면(5+) 줌인 효과가 흐려짐. perspective:1000px을 stage에 두면 약간의 3D 깊이감 추가 가능. 슬라이드 콘텐츠가 이미지/비디오일 때 더 효과적, 텍스트 중심이면 가독성 저하 위험.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 발표 페이지 — 메인 제품이 카메라 줌인으로 등장' },
      { place: '랜딩 페이지', body: '컨셉 비주얼 시리즈 — 영화 트레일러 같은 인상' },
      { place: '제품 섹션', body: '디테일 줌 — 제품의 디테일이 점점 더 가까이' },
      { place: '포트폴리오 소개', body: '대표 작품 갤러리 — 한 작품이 줌인으로 강조' }
    ],
    tradeoff: 'scale 변화가 큰 슬라이드는 모바일에서 GPU 비용. will-change 힌트 필수. 텍스트 가독성에 주의 — 큰 폰트나 짧은 카피만 권장.'
  },

  // ───────────────────────────── 4. pin-stack
  {
    id: 'pin-stack',
    num: '04',
    title: '핀 스택 (위로 쌓임)',
    summary: '슬라이드가 화면 아래에서 위로 슬라이드 인 + 이전 슬라이드는 그 위에 sticky로 머무름. 카드가 위로 쌓이는 인상.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n      ' + slidesMarkup('fs') + '\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; }\n' + slidesCSS('fs') + '\n.fs-slide { transform: translateY(100%); will-change: transform; box-shadow: 0 -24px 60px -12px rgba(0,0,0,0.4); }',
      script: 'var slides = document.querySelectorAll(".fs-slide");\nvar N = slides.length;\nfunction applyReveal(p){\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    var y = 100 * (1 - local);\n    s.style.transform = "translateY(" + y + "%)";\n    s.style.zIndex = i;\n  });\n}',
      height: 540,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage">\n    <div class="slide">1</div><div class="slide">2</div>\n  </div>\n</div>',
    snippetCSS: '.slide { position: absolute; inset: 0; transform: translateY(100%); will-change: transform; box-shadow: 0 -24px 60px -12px rgba(0,0,0,0.4); }',
    snippetJS: 'var slides = document.querySelectorAll(".slide");\nvar N = slides.length;\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    s.style.transform = "translateY(" + (100 * (1 - local)) + "%)";\n    s.style.zIndex = i;\n  });\n}, { passive: true });',
    explain: '각 슬라이드는 처음에 translateY(100%)로 화면 아래에 위치. 자기 인덱스의 1단계 전부터 1단계 후까지의 진행률을 local progress(0~1)로 만들어 translateY 100% → 0%로 보간. zIndex는 i로 늘어나 새 슬라이드가 이전 슬라이드 위에 쌓임. 상단 그림자(box-shadow inset 위쪽)로 쌓임 효과 강조.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateY = (1 - local) × 100%' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '쌓임', value: 'zIndex = i + box-shadow 위쪽' },
      { label: '시그니처', value: 'Apple AirPods Pro / Tobias van Schneider' }
    ],
    guide: '카드가 위로 쌓이는 깊이감. 슬라이드 3~5개. box-shadow를 위쪽으로 두면 새 슬라이드가 위에서 떨어지는 듯한 인상. 슬라이드 콘텐츠가 텍스트+이미지 혼합일 때 잘 어울림. 진입 속도 조절은 매핑 함수의 `pos + 1` 부분을 `pos + 0.8` 식으로 좁히면 더 빠른 진입.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 단계별 소개 — 카드가 위로 쌓이며 스토리 진행' },
      { place: '랜딩 페이지', body: '핵심 기능 3-4개를 카드로 — 위로 쌓이는 효과' },
      { place: '제품 섹션', body: '제품 비교 — 슬라이드별 다른 제품이 위로 쌓임' },
      { place: '포트폴리오 소개', body: '프로젝트 케이스 스터디 — 한 작업당 한 카드' }
    ],
    tradeoff: '쌓이는 카드의 box-shadow가 진해지면 페이지 톤이 무거워짐 — 라이트 톤 페이지에서는 그림자 약화. 첫 슬라이드는 처음부터 보여야 하므로 첫 슬라이드만 transform 0으로 초기화하는 식의 보정이 필요할 수 있음.'
  },

  // ───────────────────────────── 5. parallax-layer
  {
    id: 'parallax-layer',
    num: '05',
    title: '패럴랙스 레이어',
    summary: '하나의 sticky 스테이지 안에 배경(느림) + 전경(빠름) 레이어가 다른 속도로 움직임. 깊이감 + 영화적 카메라 무빙.',
    demo: {
      slides: 1,
      bodyHTML: '<div class="fs-stack">\n        <div class="fs-bg"></div>\n        <div class="fs-mid"></div>\n        <div class="fs-cap">\n          <div class="fs-num">PARALLAX · LAYER</div>\n          <h2 class="fs-title">깊이 있는 풍경</h2>\n          <p class="fs-desc">스크롤할 때 배경과 전경이 다른 속도로 움직이며, 정지된 이미지에 깊이감을 부여합니다.</p>\n        </div>\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; background: #0f172a; }\n.fs-bg { position: absolute; inset: -20% 0 -20%; background: radial-gradient(ellipse at center top, #1e3a8a 0%, transparent 60%), linear-gradient(180deg, #0f172a 0%, #020617 100%); will-change: transform; }\n.fs-mid { position: absolute; inset: 30% 0 -30%; background: radial-gradient(ellipse at center, #7e22ce 0%, transparent 65%); opacity: 0.5; will-change: transform; mix-blend-mode: screen; }\n' + slidesCSS('fs').replace('.fs-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n', '') + '\n.fs-cap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #fff; max-width: 720px; margin: 0 auto; padding: 0 8vw; will-change: transform; }',
      script: 'var bg = document.querySelector(".fs-bg");\nvar mid = document.querySelector(".fs-mid");\nvar cap = document.querySelector(".fs-cap");\nfunction applyReveal(p){\n  bg.style.transform = "translateY(" + (p * -12) + "vh) scale(" + (1 + p * 0.08) + ")";\n  mid.style.transform = "translateY(" + (p * -28) + "vh) scale(" + (1 + p * 0.15) + ")";\n  cap.style.transform = "translateY(" + (p * -8) + "vh)";\n  cap.style.opacity = 1 - p * 0.4;\n}',
      height: 540,
      trackVh: 200
    },
    snippetHTML: '<div class="track" style="height:200vh">\n  <div class="stage">\n    <div class="bg"></div>\n    <div class="mid"></div>\n    <div class="cap">텍스트</div>\n  </div>\n</div>',
    snippetCSS: '.bg, .mid, .cap { position: absolute; inset: 0; will-change: transform; }\n.mid { mix-blend-mode: screen; opacity: 0.5; }',
    snippetJS: 'window.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  document.querySelector(".bg").style.transform = "translateY(" + (p * -12) + "vh)";\n  document.querySelector(".mid").style.transform = "translateY(" + (p * -28) + "vh)";\n  document.querySelector(".cap").style.transform = "translateY(" + (p * -8) + "vh)";\n}, { passive: true });',
    explain: '여러 레이어(.bg, .mid, .cap)에 진행률 × 다른 계수로 translateY를 곱해 다른 속도로 이동. 배경은 천천히(-12vh), 미들은 빠르게(-28vh), 캡션은 미세하게(-8vh). 깊이감의 핵심은 속도 차이. mix-blend-mode:screen으로 레이어가 자연스럽게 섞임.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateY = p × [-12vh / -28vh / -8vh] (레이어별)' },
      { label: 'Track 높이', value: '200vh (단일 sticky 섹션)' },
      { label: '레이어 수', value: '3개 (bg / mid / fg) — 더 추가 가능' },
      { label: '시그니처', value: 'Apple iPad / Awwwards 시네마틱' }
    ],
    guide: '깊이감이 핵심. 배경은 가장 천천히, 가까운 레이어는 빠르게. 속도 차이가 작으면(2배 이내) 효과가 약함, 크면(5배 이상) 어색함. 2-4 레이어가 균형. mix-blend-mode 사용 시 색 충돌 주의 — screen / soft-light / overlay가 자연스러움. 모바일에서는 GPU 비용 크니까 레이어 수 줄임.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 풍경 — 산·하늘·구름 같은 자연 풍경의 깊이감' },
      { place: '랜딩 페이지', body: '제품 소개 인트로 — 시네마틱 카메라 무빙' },
      { place: '제품 섹션', body: '브랜드 비전 섹션 — 추상적 깊이감으로 분위기 조성' },
      { place: '포트폴리오 소개', body: 'About 섹션 — 디자이너의 세계관 표현' }
    ],
    tradeoff: 'GPU 비용 (transform on multiple layers). will-change 힌트 필수. 모바일에서 60fps 유지 어려울 수 있어 prefers-reduced-motion에서 모든 transform 비활성 권장.'
  },

  // ───────────────────────────── 6. 3d-rotate
  {
    id: '3d-rotate',
    num: '06',
    title: '3D 회전 전환',
    summary: 'perspective + rotateY로 슬라이드가 카드처럼 회전하며 전환. 진행률 × 90° × N으로 각 슬라이드가 정면 → 측면 → 다음 슬라이드로.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n      ' + slidesMarkup('fs') + '\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; perspective: 1400px; background: #050505; }\n' + slidesCSS('fs') + '\n.fs-slide { transform-style: preserve-3d; backface-visibility: hidden; will-change: transform, opacity; }',
      script: 'var slides = document.querySelectorAll(".fs-slide");\nvar N = slides.length;\nfunction applyReveal(p){\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    if (pos < -1 || pos > 1) { s.style.opacity = 0; s.style.transform = "rotateY(" + (pos * 90) + "deg) translateZ(-200px)"; return; }\n    var rot = pos * 90;\n    var op = 1 - Math.min(1, Math.abs(pos));\n    var tz = -Math.abs(pos) * 200;\n    s.style.opacity = op;\n    s.style.transform = "rotateY(" + rot + "deg) translateZ(" + tz + "px)";\n  });\n}',
      height: 520,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage" style="perspective:1400px">\n    <div class="slide">1</div><div class="slide">2</div>\n  </div>\n</div>',
    snippetCSS: '.stage { perspective: 1400px; }\n.slide { position: absolute; inset: 0; transform-style: preserve-3d; backface-visibility: hidden; will-change: transform, opacity; }',
    snippetJS: 'var slides = document.querySelectorAll(".slide");\nvar N = slides.length;\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    s.style.opacity = 1 - Math.min(1, Math.abs(pos));\n    s.style.transform = "rotateY(" + (pos * 90) + "deg) translateZ(" + (-Math.abs(pos) * 200) + "px)";\n  });\n}, { passive: true });',
    explain: 'stage에 perspective:1400px로 3D 컨텍스트. 각 슬라이드의 local pos에 90°를 곱해 rotateY. pos=0(정면), pos=±0.5(45° 기울어짐), pos=±1(완전 측면, 보이지 않음). 동시에 translateZ로 뒤로 물러나는 깊이감. opacity는 |pos|에 따라 감소.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'rotateY = pos × 90deg, translateZ = -|pos| × 200px' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'perspective', value: '1400px (stage 단위)' },
      { label: '시그니처', value: 'Stripe Universal / WebGL 3D 카드' }
    ],
    guide: '3D 회전은 강한 시각 임팩트. 슬라이드 3-4개가 균형 — 너무 많으면 회전이 빈번해 어지러움. perspective 값은 1000~1600px이 자연스러움(낮을수록 강한 원근). transform-style:preserve-3d + backface-visibility:hidden 필수. 모바일 GPU 비용 큼 — will-change 힌트 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'WebGL 컴포넌트 라이브러리 / 디자인 도구 — 시그니처 인터랙션' },
      { place: '랜딩 페이지', body: '컨퍼런스 / 이벤트 페이지 — 영화적 임팩트' },
      { place: '제품 섹션', body: '카드 형태 제품 — 회전하며 디테일 노출' },
      { place: '포트폴리오 소개', body: '실험적 작품 갤러리 — 평범하지 않은 인상' }
    ],
    tradeoff: 'GPU 비용 매우 큼. 모바일에서 60fps 유지 어려울 수 있음. 사용자 어지러움 호소 가능 — prefers-reduced-motion에서 비활성 + 단순 fade로 fallback 필수. 텍스트 가독성 저하 — 큰 폰트만 권장.'
  },

  // ───────────────────────────── 7. scroll-snap
  {
    id: 'scroll-snap',
    num: '07',
    title: 'CSS 스크롤 스냅',
    summary: 'JS 매핑 없이 CSS scroll-snap-type만으로 슬라이드가 viewport에 snap. 사용자가 스크롤하면 한 슬라이드 단위로 딱 멈춤. 가장 가벼운 풀스크린 갤러리.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-snap">\n      ' + SLIDES.map(function (s, i) { return '<section class="fs-slide" style="background:' + s.bg + '"><div class="fs-cap"><div class="fs-num">' + s.number + ' · ' + s.name + '</div><h2 class="fs-title">' + s.title + '</h2><p class="fs-desc">' + s.desc + '</p></div></section>'; }).join('\n      ') + '\n      </div>',
      css: slidesCSS('fs').replace('.fs-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n', '.fs-snap { height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory; scroll-behavior: smooth; }\n.fs-snap::-webkit-scrollbar { display: none; }\n.fs-snap { scrollbar-width: none; }\n.fs-slide { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; scroll-snap-align: start; scroll-snap-stop: always; }\n'),
      script: '/* CSS only — JS 매핑 없음 */',
      isCustom: true,
      height: 560,
      trackVh: 100
    },
    snippetHTML: '<div class="snap">\n  <section class="slide">1</section>\n  <section class="slide">2</section>\n</div>',
    snippetCSS: '.snap { height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory; }\n.slide { height: 100vh; scroll-snap-align: start; scroll-snap-stop: always; }',
    snippetJS: '/* CSS only — JS 매핑 없음 */',
    explain: 'CSS scroll-snap-type:y mandatory가 핵심. 사용자가 스크롤하면 가장 가까운 .slide의 scroll-snap-align:start 지점에 딱 멈춤. scroll-snap-stop:always로 한 번에 한 슬라이드씩만 넘어감. JS 없이 동작. 단점: 슬라이드 간 매끈한 transition 없음 (즉시 snap).',
    kv: [
      { label: '의존성', value: 'CSS only (Vanilla, 라이브러리 0)' },
      { label: '트리거', value: '스크롤 (브라우저 native snap)' },
      { label: '매핑', value: 'scroll-snap-type + scroll-snap-align' },
      { label: 'Track 높이', value: '100vh × N (각 슬라이드)' },
      { label: 'JS 비용', value: '0' },
      { label: '시그니처', value: 'iOS 사진앱 / Instagram Stories 데스크톱' }
    ],
    guide: '가장 가벼운 풀스크린 갤러리. JS 매핑 없이 CSS만으로 슬라이드 간 snap. 슬라이드 사이 transition은 없음(즉시 snap) — 더 부드러운 전환이 필요하면 fade-stack이나 zoom-into 사용. scroll-snap-stop:always가 핵심 — 사용자가 빠르게 스크롤해도 한 슬라이드씩만 진행. 모바일 swipe도 자동으로 동작.',
    recommendations: [
      { place: '히어로 헤더', body: '단순한 풀스크린 갤러리 — JS 비용 0' },
      { place: '랜딩 페이지', body: '제품 시리즈 보여주기 — 빠르고 가볍게' },
      { place: '제품 섹션', body: '제품 상세 페이지의 이미지 갤러리' },
      { place: '포트폴리오 소개', body: '간단한 작품 카탈로그 — 한 작품당 한 슬라이드' }
    ],
    tradeoff: '슬라이드 간 transition이 없어 다소 거친 느낌. progress bar·인디케이터 같은 진행 표시도 직접 구현해야. iOS Safari는 scroll-snap 지원이 다소 거칠 수 있음 — 충분한 테스트 필요.'
  },

  // ───────────────────────────── 8. clip-reveal
  {
    id: 'clip-reveal',
    num: '08',
    title: 'Clip-path 리빌',
    summary: '다음 슬라이드가 위에서 아래로 clip-path inset으로 reveal. 슬라이드가 커튼처럼 내려오는 인상.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n      ' + slidesMarkup('fs') + '\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; }\n' + slidesCSS('fs') + '\n.fs-slide { clip-path: inset(100% 0 0 0); will-change: clip-path; }\n.fs-slide:first-child { clip-path: inset(0 0 0 0); }',
      script: 'var slides = document.querySelectorAll(".fs-slide");\nvar N = slides.length;\nfunction applyReveal(p){\n  slides.forEach(function(s, i){\n    if (i === 0) { s.style.clipPath = "inset(0 0 0 0)"; return; }\n    var pos = p * N - i + 1;\n    var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n    s.style.clipPath = "inset(" + inset + "% 0 0 0)";\n    s.style.zIndex = i;\n  });\n}',
      height: 540,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage">\n    <div class="slide first">1</div><div class="slide">2</div>\n  </div>\n</div>',
    snippetCSS: '.slide { position: absolute; inset: 0; clip-path: inset(100% 0 0 0); will-change: clip-path; }\n.slide:first-child { clip-path: inset(0); }',
    snippetJS: 'var slides = document.querySelectorAll(".slide");\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  slides.forEach(function(s, i){\n    if (i === 0) return;\n    var pos = p * slides.length - i + 1;\n    var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n    s.style.clipPath = "inset(" + inset + "% 0 0 0)";\n    s.style.zIndex = i;\n  });\n}, { passive: true });',
    explain: '첫 슬라이드는 처음부터 보임 (clip-path: inset(0)). 두 번째부터는 inset(100% 0 0 0)으로 위에서부터 100% 잘려 안 보임. 진행률이 i 인덱스에 가까워질수록 inset이 100% → 0%로 줄어들어 위에서 아래로 슬라이드가 reveal. 커튼이 내려오는 인상. clip-path는 GPU 가속이라 부드러움.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'clip-path inset top = (1 - local) × 100%' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '핵심', value: 'clip-path inset (GPU 가속)' },
      { label: '시그니처', value: 'Apple iPad / 시네마틱 reveal' }
    ],
    guide: '커튼이 내려오는 듯한 시네마틱 reveal. 슬라이드 3-4개가 적정. clip-path 방향은 inset(top right bottom left) — 가로 reveal은 inset(0 100% 0 0)로 바꾸면 됨. zIndex 관리가 핵심 — 새 슬라이드가 위로 와야 함. 텍스트 가독성 좋음 (스케일·회전 없음).',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 인트로 — 영화 오프닝 같은 reveal' },
      { place: '랜딩 페이지', body: '챕터별 전환 — 한 챕터에서 다음 챕터로' },
      { place: '제품 섹션', body: '비포/애프터 비교 — 마스크가 내려오며 전후 비교' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 한 작품에서 다음 작품으로 커튼' }
    ],
    tradeoff: 'clip-path는 모든 모던 브라우저 지원. 모바일 성능 양호. 슬라이드가 진입하는 방향이 한정적(top/bottom/left/right) — 더 복잡한 마스크는 SVG mask로 구현. 슬라이드 사이 transition은 없고 즉시 swap이라 빠른 인상.'
  },

  // ───────────────────────────── 9. scale-handoff
  {
    id: 'scale-handoff',
    num: '09',
    title: '스케일 핸드오프',
    summary: '한 슬라이드가 scale 1→1.1로 커지면서 사라지고, 다음 슬라이드가 0.9→1로 커지면서 등장. 두 슬라이드가 부드럽게 교체.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n      ' + slidesMarkup('fs') + '\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; }\n' + slidesCSS('fs') + '\n.fs-slide { opacity: 0; transform: scale(0.9); will-change: transform, opacity; }',
      script: 'var slides = document.querySelectorAll(".fs-slide");\nvar N = slides.length;\nfunction applyReveal(p){\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    if (pos < -1 || pos > 1) { s.style.opacity = 0; s.style.transform = "scale(" + (1 + pos * 0.1) + ")"; return; }\n    var op = 1 - Math.abs(pos);\n    var scale = 0.9 + (1 - Math.abs(pos)) * 0.1 + Math.max(0, pos) * 0.1;\n    s.style.opacity = op;\n    s.style.transform = "scale(" + scale + ")";\n  });\n}',
      height: 520,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage">\n    <div class="slide">1</div><div class="slide">2</div>\n  </div>\n</div>',
    snippetCSS: '.slide { position: absolute; inset: 0; opacity: 0; transform: scale(0.9); will-change: transform, opacity; }',
    snippetJS: 'var slides = document.querySelectorAll(".slide");\nvar N = slides.length;\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  slides.forEach(function(s, i){\n    var pos = p * N - i;\n    s.style.opacity = 1 - Math.abs(pos);\n    s.style.transform = "scale(" + (0.9 + (1 - Math.abs(pos)) * 0.1 + Math.max(0, pos) * 0.1) + ")";\n  });\n}, { passive: true });',
    explain: '각 슬라이드의 local pos = p×N - i. 자기 인덱스(pos=0)에서 scale 1 + opacity 1로 가장 또렷. pos가 ±1로 멀어질수록 opacity 0 + scale 0.9 또는 1.1. 두 인접 슬라이드가 동시에 보이면서 부드럽게 교체. zoom-into보다 변화가 작아 가독성 좋음.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'opacity = 1 - |pos|, scale = 0.9 → 1 → 1.1' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'linear (사용자 제어)' },
      { label: '시그니처', value: 'Apple Vision Pro / 부드러운 갤러리' }
    ],
    guide: '부드럽고 가독성 좋은 전환. zoom-into보다 scale 변화 작음(0.9~1.1). 슬라이드 3-5개. 두 슬라이드가 동시에 보이는 구간에서 자연스러운 교체. 텍스트 가독성 양호 — 본문 콘텐츠에도 적합. will-change 힌트 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 제품 소개 — 부드럽고 신뢰감 있는 전환' },
      { place: '랜딩 페이지', body: '회사 가치 시리즈 — 한 가치에서 다음 가치로' },
      { place: '제품 섹션', body: '제품 변형 비교 — 부드러운 교체' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 가독성 좋게' }
    ],
    tradeoff: '변화가 작아 임팩트는 약함 — 강한 인상이 필요하면 zoom-into나 3d-rotate 권장. 두 슬라이드 동시 렌더로 약간의 GPU 비용.'
  },

  // ───────────────────────────── 10. caption-slide
  {
    id: 'caption-slide',
    num: '10',
    title: '캡션 슬라이드',
    summary: '배경 1개는 sticky로 고정하고, 캡션(타이틀 + 설명)만 슬라이드별로 진입. 배경 무비는 그대로 + 텍스트가 흐름 — 디테일 페이지의 시그니처.',
    demo: {
      slides: SLIDES.length,
      bodyHTML: '<div class="fs-stack">\n        <div class="fs-bg-img"></div>\n        <div class="fs-caps">\n      ' + SLIDES.map(function (s, i) { return '<div class="fs-cap-item" data-i="' + i + '"><div class="fs-num">' + s.number + ' · ' + s.name + '</div><h2 class="fs-title">' + s.title + '</h2><p class="fs-desc">' + s.desc + '</p></div>'; }).join('\n      ') + '\n        </div>\n      </div>',
      css: '.fs-stack { position: absolute; inset: 0; overflow: hidden; background: #0a0a0a; }\n.fs-bg-img { position: absolute; inset: 0; background: radial-gradient(circle at 30% 40%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 70% 70%, #7e22ce 0%, transparent 50%), #0a0a0a; will-change: filter; }\n.fs-caps { position: absolute; inset: 0; }\n' + slidesCSS('fs').replace('.fs-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n', '') + '\n.fs-cap-item { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #fff; padding: 0 8vw; will-change: transform, opacity; opacity: 0; transform: translateY(50px); }',
      script: 'var bg = document.querySelector(".fs-bg-img");\nvar caps = document.querySelectorAll(".fs-cap-item");\nvar N = caps.length;\nfunction applyReveal(p){\n  bg.style.filter = "hue-rotate(" + (p * 240) + "deg) saturate(" + (1 + p * 0.5) + ")";\n  caps.forEach(function(c, i){\n    var pos = p * N - i;\n    if (pos < -1 || pos > 1) { c.style.opacity = 0; c.style.transform = "translateY(" + (pos < 0 ? 50 : -50) + "px)"; return; }\n    var op = 1 - Math.abs(pos);\n    var y = -pos * 50;\n    c.style.opacity = op;\n    c.style.transform = "translateY(" + y + "px)";\n  });\n}',
      height: 540,
      trackVh: 400
    },
    snippetHTML: '<div class="track">\n  <div class="stage">\n    <div class="bg"></div>\n    <div class="cap" data-i="0">1</div>\n    <div class="cap" data-i="1">2</div>\n  </div>\n</div>',
    snippetCSS: '.bg { position: absolute; inset: 0; }\n.cap { position: absolute; inset: 0; opacity: 0; transform: translateY(50px); will-change: transform, opacity; }',
    snippetJS: 'var caps = document.querySelectorAll(".cap");\nvar N = caps.length;\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  caps.forEach(function(c, i){\n    var pos = p * N - i;\n    c.style.opacity = 1 - Math.abs(pos);\n    c.style.transform = "translateY(" + (-pos * 50) + "px)";\n  });\n}, { passive: true });',
    explain: '배경(.bg)은 단일 레이어로 sticky 안에서 고정 + 필터로 미세하게 색조 변경 (hue-rotate). 캡션(.cap-item)들은 각자 position:absolute inset:0으로 같은 자리에 쌓이고, 자기 인덱스에 도달할 때 opacity 1 + translateY 0. 배경은 그대로, 텍스트만 슬라이드별로 진입.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '캡션 opacity·translateY + 배경 hue-rotate' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '구성', value: '배경 1 + 캡션 N개' },
      { label: '시그니처', value: 'Apple 제품 디테일 / 비디오 캡션' }
    ],
    guide: '배경 이미지/비디오가 핵심일 때 — 캡션만 슬라이드로. 한 영상에 N개 챕터 캡션 같은 컨텍스트. 배경 hue-rotate / brightness 변화로 미세하게 분위기 전환. 캡션은 텍스트 중심으로 짧게(40자 이내) 유지.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 영상 + 챕터 캡션 — 영상은 그대로, 텍스트만 흐름' },
      { place: '랜딩 페이지', body: '제품 비디오 + 기능 캡션 시리즈' },
      { place: '제품 섹션', body: '제품 이미지 + 스펙 챕터별 캡션' },
      { place: '포트폴리오 소개', body: '대표 작품 비디오 + 진행 단계 캡션' }
    ],
    tradeoff: '배경이 정적이라 시각 임팩트 약함 — 비디오 배경이거나 미세한 filter 변화로 보완. 캡션 N개 모두 같은 자리에 쌓이므로 z-stacking 주의.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  var trackVh = p.demo.trackVh || (p.demo.slides * 100);
  // scroll-snap은 자체 보일러플레이트가 다름 — JS 매핑 없이 CSS 단독
  if (p.demo.isCustom) {
    return buildSnapDemoHTML(p);
  }
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Full-screen Scroll Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable", "Pretendard", system-ui; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 ui-monospace, monospace; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; }\n'
    + '    .demo-reset:hover { color: #fff; background: rgba(255,255,255,0.14); }\n'
    + '    .demo-label { font: 500 10px/1 ui-monospace, monospace; color: rgba(255,255,255,0.4); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 ui-monospace, monospace; color: rgba(255,255,255,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(4px); opacity: 0.85; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #fff; width: 0; transition: width 60ms linear; }\n'
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
    + '      ' + p.demo.bodyHTML.replace(/\n/g, '\n      ') + '\n'
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

// scroll-snap 전용 보일러플레이트 (sticky 매핑 없이 native scroll-snap)
function buildSnapDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + '</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable", "Pretendard", system-ui; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; gap: 10px; z-index: 100; }\n'
    + '    .demo-label { font: 500 10px/1 ui-monospace, monospace; color: rgba(255,255,255,0.4); letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 0; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 ui-monospace, monospace; color: rgba(255,255,255,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls"><span class="demo-label">' + p.num + ' · ' + p.title + '</span></div>\n'
    + '  <div class="demo-hint">SCROLL ↓ (스냅)</div>\n'
    + '  ' + p.demo.bodyHTML.replace(/\n/g, '\n  ') + '\n'
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
        embed: 'demos/full-screen-scroll/' + p.id + '.html',
        embedHeight: p.demo.height || 540,
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
      { type: 'heading', value: 'Full-screen Scroll — 패턴 카탈로그 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + scroll 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글) · Inter (영문 보조)' },
          { label: '배경 / 본문 색', value: '#000 / #ffffff (다크 풀스크린)' },
          { label: 'Scroll 모델', value: '.scroll-track N×100vh + .sticky-stage 100vh (position:sticky top:0)' },
          { label: '진행률 계산', value: 'p = clamp(0, -rect.top / (rect.height - innerHeight), 1)' },
          { label: '슬라이드 인덱스', value: 'activeIndex = floor(p × N), slideProgress = p×N - i' },
          { label: '접근성', value: 'prefers-reduced-motion: sticky 비활성 + 모든 슬라이드 즉시 표시' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/full-screen-scroll/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. iframe 안에서 스크롤하면 진행률에 따라 슬라이드 전환' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률(0~1)을 어떻게 슬라이드 인덱스·상태에 매핑하는지' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 매핑 함수 / Track 높이 / 시그니처 사이트' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록 — sticky track + scroll handler 핵심' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '슬라이드 수·track 높이·매핑 구간·접근성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Framer 마켓플레이스 Scroll Slides 컴포넌트 (' + CATEGORY.url + ') — Artem Kostenko 작. 첫 번째 패턴(fade-stack)이 동일 동작(sticky + activeIndex + opacity fade + progress bar). 본 카탈로그는 단일 컴포넌트가 아닌 10가지 풀스크린 스크롤 변형 비교 카탈로그를 지향. 모든 데모는 자동 재생이 아니라 사용자가 iframe 안에서 스크롤할 때만 슬라이드가 전환되며, ↻ 다시 보기 버튼이 scroll position을 0으로 리셋.'
      }
    ]
  };
}

// ============ 메인 ============
function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (const p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/full-screen-scroll/' + p.id + '.html');
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
  console.log('✓ analyses/full-screen-scroll/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
