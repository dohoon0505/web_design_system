#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: 스크롤 텍스트 로드 (v2)
 *
 * 변경점:
 * - 인라인 component 데모 → standalone iframe 데모 (Framer 마켓플레이스 스타일)
 * - demos/scroll-text-reveal/{pattern}.html 자동 생성 (검정 배경 + Pretendard + 한국어)
 * - 패턴 섹션에 "사용 가이드" + "활용 추천" 블록 추가 (히어로/랜딩/제품/포트폴리오)
 *
 * Usage: node scripts/generate-scroll-text-reveal.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scroll-text-reveal');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scroll-text-reveal');

const CATEGORY = {
  id: 'scroll-text-reveal',
  title: '스크롤 텍스트 로드',
  type: 'category',
  date: '2026-05-27',
  url: 'https://www.framer.com/marketplace/components/text-reveal/',
  summary: '텍스트가 viewport에 진입할 때 어떻게 시각적으로 드러나는가에 관한 인터랙션 컬렉션. Framer 마켓플레이스의 "Text Reveal" 컴포넌트(Scroll-driven text reveal animation, Inter 다크 톤, 라이브 데모 iframe)를 참고하여 10가지 대표 패턴을 정리한다. 각 패턴은 검정 배경 + Pretendard 한국어 본문의 standalone HTML 페이지로 작성되어 iframe으로 임베드되며, 작동 원리·코드 스니펫·사용 가이드·활용 추천(히어로/랜딩/제품/포트폴리오)·트레이드오프가 함께 정리된다.'
};

// 표준 본문 (긴 본문 패턴용 — Framer 마켓플레이스 스크린샷의 한국어 의역)
const LONG_BODY = '강력하고 확장된 가능성을 제공합니다. 디자인과 로직을 한 곳에서 결합하여, 동적인 동작과 애니메이션, 상태 기반 인터랙션을 매번 처음부터 만들지 않아도 됩니다. 일관되고 확장 가능한 인터페이스를 더 쉽게 구축하게 해 주고, 표준 요소만으로는 닿을 수 없는 훨씬 더 창의적이고 기능적인 가능성을 열어줍니다.';

const LONG_LINES = [
  '강력하고 확장된 가능성을 제공합니다.',
  '디자인과 로직을 한 곳에서 결합하여,',
  '동적인 동작과 애니메이션,',
  '상태 기반 인터랙션을 매번 처음부터 만들지 않아도 됩니다.'
];

// ============ 10 패턴 정의 ============
//
// 각 패턴은 standalone HTML 페이지(demos/scroll-text-reveal/{id}.html)로 작성되고
// 분석 보고서에서 iframe으로 임베드된다.
//
// demo: { content, css, js, height } — standalone 페이지 콘텐츠
// snippetCSS / snippetJS / snippetHTML — 코드 스니펫(핵심만, boilerplate 제외)
// guide — 사용 가이드 (어떻게 사용하나)
// recommendations — 활용 추천 [{ place, label, body }]

const PATTERNS = [
  // ───────────────────────────── 1. word-fade
  {
    id: 'word-fade',
    num: '01',
    title: '단어별 페이드 인',
    summary: '단어 단위로 자른 뒤 stagger delay를 부여해 opacity·translateY를 풀어내는 가장 보편적인 진입 패턴. 본문·서브헤딩처럼 줄당 단어 수가 많은 텍스트에 적합하다.',
    demo: {
      bodyHTML: '<div class="stage"><p class="reveal" data-orig="' + LONG_BODY + '">' + LONG_BODY + '</p></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 700 36px/1.5 "Pretendard Variable","Pretendard",system-ui; color: #fff; max-width: 900px; margin: 0; text-align: left; letter-spacing: -0.01em; }\n.reveal .w { display: inline-block; opacity: 0; transform: translateY(12px); transition: opacity 700ms cubic-bezier(0.2,0,0,1), transform 700ms cubic-bezier(0.2,0,0,1); }\n.reveal .w.on { opacity: 1; transform: translateY(0); }',
      js: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nfunction play(){\n  var words = orig.split(" ");\n  el.innerHTML = words.map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\n  var spans = el.querySelectorAll(".w");\n  spans.forEach(function(s, i){ s.style.transitionDelay = (i * 70) + "ms"; });\n  setTimeout(function(){ spans.forEach(function(s){ s.classList.add("on"); }); }, 60);\n}\nwindow.__replay = play;\nplay();',
      height: 480
    },
    snippetHTML: '<p class="reveal">Design is not just what it looks like and feels like. Design is how it works.</p>',
    snippetCSS: '.reveal .w { display: inline-block; opacity: 0; transform: translateY(12px); transition: opacity 700ms cubic-bezier(0.2,0,0,1), transform 700ms cubic-bezier(0.2,0,0,1); }\n.reveal .w.on { opacity: 1; transform: translateY(0); }',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar words = el.textContent.split(" ");\nel.innerHTML = words.map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\nvar spans = el.querySelectorAll(".w");\nspans.forEach(function(s, i){ s.style.transitionDelay = (i * 70) + "ms"; });\nnew IntersectionObserver(function(ents){\n  ents.forEach(function(e){\n    if (e.isIntersecting) spans.forEach(function(s){ s.classList.add("on"); });\n  });\n}, { threshold: 0.15 }).observe(el);',
    explain: '텍스트를 공백 기준으로 split해 각 단어를 <span class="w">로 감싸고, transition-delay를 인덱스 × 70ms로 부여해 한 단어씩 차례로 진입한다. opacity 0→1과 translateY 12px→0이 동시에 풀려나면서 위로 살짝 올라오는 듯한 부드러운 인상.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1) — Material standard' },
      { label: '단어 간격', value: '70ms stagger' },
      { label: '총 시간', value: '700ms × 단어 수 + stagger' },
      { label: '권장 글자 수', value: '8~40 단어 (한 줄 카피~짧은 본문)' }
    ],
    guide: '본문이나 서브헤딩처럼 단어 수가 많고 가독성이 중요한 텍스트에 적합. stagger는 60~100ms 사이가 자연스럽다. 한 단어당 transition 600~800ms로 천천히 풀어내야 읽는 흐름과 어긋나지 않는다. IntersectionObserver threshold 0.15로 viewport 진입 시점에 발화. prefers-reduced-motion일 때는 stagger 제거 + 즉시 표시 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '서브카피("우리는 일하는 방식을 새로 쓰고 있습니다") 단어별 페이드 인 — Hero 메인 타이틀 하단을 부드럽게 받치는 용도' },
      { place: '랜딩 페이지', body: '섹션 헤딩 아래 부연 설명 한 단락에서 사용. 본문을 끝까지 읽게 만드는 시선 유도' },
      { place: '제품 섹션', body: '제품 특징 3-4개 카드의 본문에 사용. 카드가 viewport 진입할 때마다 본문이 단어별로 풀려남' },
      { place: '포트폴리오 소개', body: '프로젝트 케이스 스터디의 도입부 단락에서 활용. 클라이언트 이름·역할·기간을 단어별로 강조' }
    ],
    tradeoff: '단어 수가 많을수록 마지막 단어까지 등장하는 데 시간이 길어진다. 60~100ms 사이의 stagger가 가독성 균형점. 접근성: prefers-reduced-motion 시 stagger 무시하고 즉시 표시 권장.'
  },

  // ───────────────────────────── 2. line-slide
  {
    id: 'line-slide',
    num: '02',
    title: '줄별 슬라이드 업',
    summary: '한 줄 단위로 아래에서 위로 슬라이드 + 페이드. 줄마다 overflow:hidden 마스크 + 내부 span을 translateY 110%→0. 시네마틱한 진입감.',
    demo: {
      bodyHTML: '<div class="stage"><div class="reveal">' + LONG_LINES.map(function (l) { return '<div class="ln"><span>' + l + '</span></div>'; }).join('') + '</div></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 600 32px/1.5 "Pretendard Variable","Pretendard",system-ui; color: #fff; max-width: 900px; letter-spacing: -0.01em; }\n.reveal .ln { overflow: hidden; padding: 4px 0; }\n.reveal .ln > span { display: inline-block; transform: translateY(115%); transition: transform 900ms cubic-bezier(0.22,1,0.36,1); }\n.reveal .ln.on > span { transform: translateY(0); }',
      js: 'var lns = document.querySelectorAll(".reveal .ln");\nfunction play(){\n  lns.forEach(function(ln){ ln.classList.remove("on"); });\n  setTimeout(function(){\n    lns.forEach(function(ln, i){ setTimeout(function(){ ln.classList.add("on"); }, i * 160); });\n  }, 60);\n}\nwindow.__replay = play;\nplay();',
      height: 520
    },
    snippetHTML: '<div class="reveal">\n  <div class="ln"><span>우리는 단순함을 추구합니다.</span></div>\n  <div class="ln"><span>단순함은 곧 진정성입니다.</span></div>\n  <div class="ln"><span>진정성이 좋은 디자인을 만듭니다.</span></div>\n</div>',
    snippetCSS: '.reveal .ln { overflow: hidden; padding: 4px 0; }\n.reveal .ln > span { display: inline-block; transform: translateY(115%); transition: transform 900ms cubic-bezier(0.22,1,0.36,1); }\n.reveal .ln.on > span { transform: translateY(0); }',
    snippetJS: 'var lns = document.querySelectorAll(".reveal .ln");\nnew IntersectionObserver(function(ents){\n  if (ents[0].isIntersecting) {\n    lns.forEach(function(ln, i){ setTimeout(function(){ ln.classList.add("on"); }, i * 160); });\n  }\n}, { threshold: 0.2 }).observe(document.querySelector(".reveal"));',
    explain: '줄 자체에 overflow:hidden을 걸어 마스크를 만들고, 줄 내부 <span>을 translateY(115%)에서 시작해 0까지 풀어낸다. 줄과 줄 사이에는 160ms stagger를 두어 줄이 잇따라 솟아오르는 시네마틱 효과.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) — out-expo' },
      { label: '줄 간격', value: '160ms stagger' },
      { label: '한 줄 시간', value: '900ms' },
      { label: '권장 줄 수', value: '2~5줄 (헤드라인·카피)' }
    ],
    guide: '한 줄이 한 호흡이 되도록 줄별로 명시적으로 끊는 카피에 적합. 줄당 글자 수는 시각적으로 비슷하게 맞추면 더 시네마틱하다. overflow:hidden 마스크 때문에 자동 줄바꿈된 줄에서는 효과가 깨지므로 줄을 미리 끊거나 white-space:nowrap을 사용. 한 줄당 900ms × 줄 수 → 4-5줄이면 약 2초.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 슬로건 3-4줄을 한 줄씩 시네마틱하게 등장 — Stripe·Vercel 메인 히어로의 클래식 패턴' },
      { place: '랜딩 페이지', body: '회사 미션 선언 섹션에 사용. "우리는 ~ / ~ / ~합니다." 형태의 3줄 카피' },
      { place: '제품 섹션', body: '제품의 핵심 가치 3-5줄 선언. 줄마다 한 가치씩 풀려나오면서 흐름 형성' },
      { place: '포트폴리오 소개', body: '"About / Vision / Approach" 같은 도입부 큰 카피에 적용. 첫 페이지의 도장 같은 인상' }
    ],
    tradeoff: '줄 안의 텍스트가 한 줄을 넘어가면(자동 줄바꿈) 마스크가 깨진다. 줄당 글자 수를 통제하거나 white-space:nowrap 사용. 모바일에서 줄바꿈 검수 필수.'
  },

  // ───────────────────────────── 3. char-stagger
  {
    id: 'char-stagger',
    num: '03',
    title: '글자별 stagger',
    summary: '한 글자씩 stagger delay로 진입. 짧고 굵은 워드마크나 타이포그래픽 헤드라인에 적합. 5~12자가 권장.',
    demo: {
      bodyHTML: '<div class="stage"><h1 class="reveal" data-orig="TYPOGRAPHY">TYPOGRAPHY</h1></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 800 12vw/1 "Pretendard Variable","Pretendard",system-ui; color: #fff; letter-spacing: 0.02em; margin: 0; }\n.reveal .c { display: inline-block; opacity: 0; transform: translateY(28px); transition: opacity 600ms, transform 600ms cubic-bezier(0.2,0,0,1); }\n.reveal .c.on { opacity: 1; transform: translateY(0); }',
      js: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nfunction play(){\n  el.innerHTML = orig.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\n  var spans = el.querySelectorAll(".c");\n  spans.forEach(function(s, i){ s.style.transitionDelay = (i * 70) + "ms"; });\n  setTimeout(function(){ spans.forEach(function(s){ s.classList.add("on"); }); }, 60);\n}\nwindow.__replay = play;\nplay();',
      height: 460
    },
    snippetHTML: '<h1 class="reveal">TYPOGRAPHY</h1>',
    snippetCSS: '.reveal .c { display: inline-block; opacity: 0; transform: translateY(28px); transition: opacity 600ms, transform 600ms cubic-bezier(0.2,0,0,1); }\n.reveal .c.on { opacity: 1; transform: translateY(0); }',
    snippetJS: 'var el = document.querySelector(".reveal");\nel.innerHTML = el.textContent.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\nvar spans = el.querySelectorAll(".c");\nspans.forEach(function(s, i){ s.style.transitionDelay = (i * 70) + "ms"; });\nspans.forEach(function(s){ s.classList.add("on"); });',
    explain: '텍스트를 글자 단위로 split해 각 글자를 <span class="c">로 감싸고, 인덱스 × 70ms의 transition-delay를 부여. opacity·translateY가 차례로 풀려난다. 띄어쓰기는 &nbsp;로 치환.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Splitting.js 대체 가능)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '글자 간격', value: '70ms stagger' },
      { label: '한 글자 시간', value: '600ms' },
      { label: '권장 글자 수', value: '5~12자 (단어 1~2개)' },
      { label: '주의', value: '한글은 자소 분리되면 어색 — 완성형만' }
    ],
    guide: '영문 워드마크·숫자에 가장 안전. 한국어는 5~7자 이내 짧은 슬로건에만. 글자 수가 많으면 후반부가 늘어져 보이므로 12자를 넘기지 않기. font-weight 700 이상 굵은 폰트와 잘 어울림.',
    recommendations: [
      { place: '히어로 헤더', body: 'BRAND·DESIGN·STUDIO 같은 큰 영문 워드마크 진입 — Awwwards SOTD의 클래식 오프닝 모션' },
      { place: '랜딩 페이지', body: '제품 카테고리 라벨("FEATURES", "PRICING")이 섹션 시작에 등장하는 효과' },
      { place: '제품 섹션', body: '가격표의 거대 숫자 "$0" 같은 큰 텍스트가 한 자릿수씩 등장' },
      { place: '포트폴리오 소개', body: '클라이언트 이름·프로젝트 코드네임 같은 짧은 워드 강조' }
    ],
    tradeoff: '글자 단위 split은 한국어에서 단위 인지가 어색해질 수 있다. 영문 워드마크·숫자에 안전. 한국어는 글자 수 5~7자 이내 짧은 슬로건에만 적용.'
  },

  // ───────────────────────────── 4. blur-reveal
  {
    id: 'blur-reveal',
    num: '04',
    title: '블러 해제',
    summary: 'filter: blur(14px)에서 0으로, opacity 0에서 1로 동시에 풀어낸다. 텍스트가 "초점이 맞춰지는" 영화적 인상.',
    demo: {
      bodyHTML: '<div class="stage"><h2 class="reveal">초점이 맞춰지는 순간,<br>중요한 것이 드러난다.</h2></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 500 56px/1.35 "Pretendard Variable","Pretendard",system-ui; color: #fff; margin: 0; text-align: center; letter-spacing: -0.01em; opacity: 0; filter: blur(18px); transition: opacity 1100ms ease-out, filter 1100ms ease-out; max-width: 900px; }\n.reveal.on { opacity: 1; filter: blur(0); }',
      js: 'var el = document.querySelector(".reveal");\nfunction play(){\n  el.classList.remove("on");\n  void el.offsetHeight;\n  setTimeout(function(){ el.classList.add("on"); }, 50);\n}\nwindow.__replay = play;\nplay();',
      height: 460
    },
    snippetHTML: '<h2 class="reveal">초점이 맞춰지는 순간, 중요한 것이 드러난다.</h2>',
    snippetCSS: '.reveal { opacity: 0; filter: blur(18px); transition: opacity 1100ms ease-out, filter 1100ms ease-out; }\n.reveal.on { opacity: 1; filter: blur(0); }',
    snippetJS: 'new IntersectionObserver(function(ents){\n  if (ents[0].isIntersecting) document.querySelector(".reveal").classList.add("on");\n}, { threshold: 0.15 }).observe(document.querySelector(".reveal"));',
    explain: 'CSS filter blur(18px)을 초기 상태로 설정하고, .on 클래스 추가 시 blur(0)으로 전환. opacity도 동시에 풀려나가면서 "초점이 맞춰지는" 인상을 만든다. JS는 단순 클래스 토글이라 가장 가벼움.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'ease-out (감속)' },
      { label: '블러 거리', value: 'blur(18px) → 0' },
      { label: '총 시간', value: '1100ms' },
      { label: '성능 비용', value: '낮음 (CSS 단일 transition)' }
    ],
    guide: '단일 헤드라인이나 결정적인 한 줄 카피에 효과적. 블러 거리 12~18px이 자연스럽다. 너무 길게(>1.5s) 두면 답답해지므로 1초 안팎. 큰 면적 텍스트(>200px height)에서는 모바일 성능 비용이 있으니 prefers-reduced-motion 폴백 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건이 블러에서 또렷이 맞춰지며 등장 — Linear·Vercel 랜딩의 시그니처' },
      { place: '랜딩 페이지', body: '"왜 우리인가" 같은 강조 문장에 적용. 본문 단락 시작 직전의 결정적 한 줄' },
      { place: '제품 섹션', body: '제품 사진 위 캡션이 사진 reveal 후 0.3초 뒤에 blur 해제로 따라옴' },
      { place: '포트폴리오 소개', body: '대표 작업 한 줄 코멘트("이 프로젝트의 핵심은 ~다") 도입부' }
    ],
    tradeoff: 'filter는 GPU 가속이지만 큰 면적 텍스트는 모바일에서 비용. 짧은 헤드라인에만 권장. 접근성: prefers-reduced-motion에서 blur 제거 + opacity만 0→1 권장.'
  },

  // ───────────────────────────── 5. color-fade
  {
    id: 'color-fade',
    num: '05',
    title: '회색 → 본 색',
    summary: '텍스트가 흐릿한 회색(dim)에서 본문 흰색으로 차오른다. 본문 가독성을 해치지 않으면서 진입을 강조하는 점잖은 패턴.',
    demo: {
      bodyHTML: '<div class="stage"><p class="reveal">한 줄의 카피가 브랜드 전체를 좌우합니다.</p></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 700 44px/1.4 "Pretendard Variable","Pretendard",system-ui; margin: 0; text-align: center; color: #525252; transition: color 1600ms cubic-bezier(0.4,0,0.2,1); max-width: 900px; letter-spacing: -0.01em; }\n.reveal.on { color: #fff; }',
      js: 'var el = document.querySelector(".reveal");\nfunction play(){\n  el.classList.remove("on");\n  void el.offsetHeight;\n  setTimeout(function(){ el.classList.add("on"); }, 50);\n}\nwindow.__replay = play;\nplay();',
      height: 440
    },
    snippetHTML: '<p class="reveal">한 줄의 카피가 브랜드 전체를 좌우합니다.</p>',
    snippetCSS: '.reveal { color: #525252; transition: color 1600ms cubic-bezier(0.4,0,0.2,1); }\n.reveal.on { color: #fff; }',
    snippetJS: 'new IntersectionObserver(function(ents){\n  if (ents[0].isIntersecting) document.querySelector(".reveal").classList.add("on");\n}, { threshold: 0.3 }).observe(document.querySelector(".reveal"));',
    explain: '단일 color 속성 transition. 시작은 dim 회색, 끝은 본문 색. transition 1600ms로 천천히 풀려나면서 "단어가 또렷이 잡히는" 인상. JS는 클래스 토글만.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'cubic-bezier(0.4,0,0.2,1) — Material' },
      { label: '시작 색', value: '#525252 (dim)' },
      { label: '끝 색', value: '#fff (본문)' },
      { label: '총 시간', value: '1600ms (점잖은 속도)' }
    ],
    guide: '가장 부드럽고 점잖아서 어디에나 안전. 본문·서브카피에 적합. 1.4~1.8초 transition이 자연스럽다. 강조하고 싶으면 색차를 크게(dim → 흰색), 점잖게 하려면 작게(회색 60% → 100%). 단어별 stagger와 결합도 가능.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건 아래 보조 카피의 색이 회색→흰색으로 차오름 — 가장 점잖은 진입' },
      { place: '랜딩 페이지', body: '회사 미션·비전 단락이 viewport 진입 시 색이 차오름. asinsam·미라셀의 시그니처 톤' },
      { place: '제품 섹션', body: '"왜 이 제품인가" 같은 단락 본문이 회색→본색으로 채워짐' },
      { place: '포트폴리오 소개', body: '프로젝트 설명 단락 본문. 가독성을 해치지 않아 글을 끝까지 읽게 함' }
    ],
    tradeoff: '가장 부드럽고 안전하지만 인상은 가장 약하다. 결정적인 헤드라인보다는 본문·서브카피에 적합. 접근성 최우수.'
  },

  // ───────────────────────────── 6. scrub-color
  {
    id: 'scrub-color',
    num: '06',
    title: '스크롤 스크럽 컬러',
    summary: '스크롤 진행률에 1:1 매핑되어 글자가 차례로 dim → 흰색으로 채워진다. GSAP ScrollTrigger scrub의 시그니처 패턴. Framer 마켓플레이스의 핵심 인터랙션.',
    demo: {
      bodyHTML: '<div class="spacer"></div>\n<div class="stage"><p class="reveal" data-orig="' + LONG_BODY + '">' + LONG_BODY + '</p></div>\n<div class="spacer"></div>',
      css: '.spacer { height: 60vh; }\n.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; position: sticky; top: 0; }\n.reveal { font: 700 38px/1.5 "Pretendard Variable","Pretendard",system-ui; color: #525252; max-width: 900px; margin: 0; text-align: left; letter-spacing: -0.01em; }\n.reveal .w { display: inline-block; transition: color 200ms; }\n.reveal .w.on { color: #fff; }',
      js: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nel.innerHTML = orig.split(" ").map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\nvar spans = el.querySelectorAll(".w");\nvar stage = document.querySelector(".stage");\nfunction onScroll(){\n  var rect = stage.getBoundingClientRect();\n  var stickyH = window.innerHeight;\n  var totalScroll = stage.parentElement.offsetHeight - stickyH;\n  var scrolled = Math.max(0, -rect.top);\n  var p = Math.min(1, Math.max(0, scrolled / Math.max(1, totalScroll - stickyH * 0.4)));\n  var idx = Math.floor(p * (spans.length + 2));\n  spans.forEach(function(s, i){ s.classList.toggle("on", i < idx); });\n}\nwindow.addEventListener("scroll", onScroll, { passive: true });\nfunction play(){\n  spans.forEach(function(s){ s.classList.remove("on"); });\n  window.scrollTo({ top: 0, behavior: "smooth" });\n  setTimeout(function(){ window.scrollTo({ top: window.innerHeight * 1.2, behavior: "smooth" }); }, 600);\n}\nwindow.__replay = play;\nonScroll();',
      height: 560
    },
    snippetHTML: '<div class="spacer" style="height:60vh"></div>\n<div class="stage" style="position:sticky;top:0;height:100vh"><p class="reveal">Read every word as if it matters.</p></div>\n<div class="spacer" style="height:60vh"></div>',
    snippetCSS: '.reveal { color: #525252; }\n.reveal .w { display: inline-block; transition: color 200ms; }\n.reveal .w.on { color: #fff; }',
    snippetJS: '/* GSAP ScrollTrigger 사용 시:\ngsap.registerPlugin(ScrollTrigger);\nvar spans = document.querySelectorAll(".reveal .w");\nScrollTrigger.create({\n  trigger: ".stage", start: "top top", end: "+=" + (window.innerHeight * 1.5),\n  scrub: true, pin: true,\n  onUpdate: function(self){\n    var idx = Math.floor(self.progress * spans.length);\n    spans.forEach(function(s, i){ s.classList.toggle("on", i < idx); });\n  }\n});\n*/\n// 라이브러리 없이 — sticky + scroll 이벤트\nvar spans = document.querySelectorAll(".reveal .w");\nvar stage = document.querySelector(".stage");\nwindow.addEventListener("scroll", function(){\n  var rect = stage.getBoundingClientRect();\n  var p = Math.min(1, Math.max(0, -rect.top / (stage.parentElement.offsetHeight - window.innerHeight)));\n  var idx = Math.floor(p * spans.length);\n  spans.forEach(function(s, i){ s.classList.toggle("on", i < idx); });\n}, { passive: true });',
    explain: 'sticky position으로 텍스트를 viewport에 고정한 뒤, 부모 컨테이너의 스크롤 진행률(0~1)을 단어 인덱스에 매핑. 사용자가 스크롤을 멈추면 reveal도 멈춘다. Framer 마켓플레이스의 가장 시그니처적인 패턴.',
    kv: [
      { label: '의존성', value: 'GSAP ScrollTrigger 또는 sticky + scroll' },
      { label: '트리거', value: '스크롤 진행률 0→1 (scrub:true)' },
      { label: '이징', value: 'linear (스크럽은 사용자 제어)' },
      { label: '진행률 매핑', value: 'progress × N단어 = on-index' },
      { label: '권장 길이', value: '한 줄~세 줄 본문 (10~40 단어)' },
      { label: '성능 비용', value: '중간 (스크롤마다 forEach + class toggle)' }
    ],
    guide: '카테고리의 시그니처 패턴. 사용자에게 "스크롤을 멈추면 reveal도 멈춘다"는 직관을 만든다. 컨테이너 높이는 viewport의 1.5~2배로 잡아야 자연스럽게 진행률이 나옴. sticky 또는 GSAP pin. 한 단어당 transition 200ms로 짧게 잡아야 스크롤에 즉각 반응.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건이 첫 스크롤에 단어별로 흰색으로 차오름 — Apple Pro Display·Framer 마켓플레이스의 핵심 진입' },
      { place: '랜딩 페이지', body: '"우리가 하는 일"을 한 문단으로 풀어내는 About 섹션 — 스크롤로 한 단어씩 채워지며 시선 유도' },
      { place: '제품 섹션', body: '제품 철학·미션 선언 한 단락. 사용자가 스크롤 속도로 reveal 속도를 직접 제어' },
      { place: '포트폴리오 소개', body: '"이 프로젝트는 ~다" 핵심 코멘트를 스크럽 컬러로 부각. 클라이언트와 함께 스크롤로 읽기' }
    ],
    tradeoff: '스크롤 잠금(pin)이 동반되면 사용자가 "스크롤이 안 된다"고 느낄 수 있어 거리감 조절 필수. prefers-reduced-motion에서는 scrub 비활성 + 모두 즉시 표시 권장. 모바일 스크롤이 빠르면 reveal이 거의 동시에 끝날 수 있다.'
  },

  // ───────────────────────────── 7. mask-sweep
  {
    id: 'mask-sweep',
    num: '07',
    title: '가로 마스크 스윕',
    summary: 'background-clip:text + linear-gradient 위치 이동으로 텍스트 색이 좌→우로 쓸려간다. 두 색이 결정적으로 교차하는 효과.',
    demo: {
      bodyHTML: '<div class="stage"><h1 class="reveal">REVEAL</h1></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 900 18vw/1 "Pretendard Variable","Pretendard",system-ui; letter-spacing: 0.02em; margin: 0; background: linear-gradient(90deg, #ffffff 50%, #525252 50%); background-size: 200% 100%; background-position: 100% 0; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; transition: background-position 1400ms cubic-bezier(0.22,1,0.36,1); }\n.reveal.on { background-position: 0 0; }',
      js: 'var el = document.querySelector(".reveal");\nfunction play(){\n  el.classList.remove("on");\n  void el.offsetHeight;\n  setTimeout(function(){ el.classList.add("on"); }, 50);\n}\nwindow.__replay = play;\nplay();',
      height: 460
    },
    snippetHTML: '<h1 class="reveal">REVEAL</h1>',
    snippetCSS: '.reveal {\n  background: linear-gradient(90deg, #ffffff 50%, #525252 50%);\n  background-size: 200% 100%;\n  background-position: 100% 0;\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  transition: background-position 1400ms cubic-bezier(0.22,1,0.36,1);\n}\n.reveal.on { background-position: 0 0; }',
    snippetJS: 'new IntersectionObserver(function(ents){\n  if (ents[0].isIntersecting) document.querySelector(".reveal").classList.add("on");\n}, { threshold: 0.3 }).observe(document.querySelector(".reveal"));',
    explain: 'linear-gradient를 두 색 50:50으로 만들고 background-size 200%로 확대해 background-position을 100%→0%로 transition. background-clip:text + text-fill-color:transparent로 텍스트 모양에만 색이 클립된다.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) — out-expo' },
      { label: '핵심 기술', value: 'background-clip:text + gradient position' },
      { label: '총 시간', value: '1400ms' },
      { label: '호환성', value: 'Safari/iOS는 -webkit-text-fill-color 필수' }
    ],
    guide: '거대한 워드마크에 가장 잘 어울림. 한 단어 또는 짧은 슬로건(5~10자)에. background-clip:text는 큰 폰트(>80px)일수록 효과가 명확. iOS Safari 호환을 위해 -webkit- prefix 필수. 시작과 끝 색의 명도 차이가 클수록 임팩트.',
    recommendations: [
      { place: '히어로 헤더', body: 'BRAND·HELLO·WELCOME 같은 거대 워드마크가 한 번에 좌→우로 색이 차오름 — Awwwards 수상작 다수의 시그니처' },
      { place: '랜딩 페이지', body: '섹션 전환 헤딩(FEATURES, ABOUT)에 적용. 섹션마다 마스크 스윕으로 진입' },
      { place: '제품 섹션', body: '제품 라인업 이름이 한 단어씩 좌→우로 색이 차며 등장' },
      { place: '포트폴리오 소개', body: '클라이언트 로고 자리에 텍스트 로고를 마스크 스윕으로 강조' }
    ],
    tradeoff: 'background-clip:text는 모든 모던 브라우저 지원하지만 iOS에서 -webkit- prefix 필수. 매우 큰 폰트(>120px)에서 약간의 anti-aliasing 차이. SEO/접근성에는 영향 없음(실제 텍스트는 그대로 존재).'
  },

  // ───────────────────────────── 8. letter-cascade
  {
    id: 'letter-cascade',
    num: '08',
    title: '글자 폭포',
    summary: '글자가 위에서 떨어지듯 translateY(-115%)→0. overflow:hidden 마스크로 글자 모양만 노출.',
    demo: {
      bodyHTML: '<div class="stage"><h1 class="reveal" data-orig="CASCADE">CASCADE</h1></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 800 14vw/1 "Pretendard Variable","Pretendard",system-ui; color: #fff; letter-spacing: 0.04em; margin: 0; overflow: hidden; padding: 14px 0; }\n.reveal .c { display: inline-block; transform: translateY(-115%); transition: transform 800ms cubic-bezier(0.7,0,0.3,1); }\n.reveal .c.on { transform: translateY(0); }',
      js: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nfunction play(){\n  el.innerHTML = orig.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\n  var spans = el.querySelectorAll(".c");\n  spans.forEach(function(s, i){ s.style.transitionDelay = (i * 80) + "ms"; });\n  setTimeout(function(){ spans.forEach(function(s){ s.classList.add("on"); }); }, 60);\n}\nwindow.__replay = play;\nplay();',
      height: 460
    },
    snippetHTML: '<h1 class="reveal">CASCADE</h1>',
    snippetCSS: '.reveal { overflow: hidden; padding: 14px 0; }\n.reveal .c { display: inline-block; transform: translateY(-115%); transition: transform 800ms cubic-bezier(0.7,0,0.3,1); }\n.reveal .c.on { transform: translateY(0); }',
    snippetJS: 'var el = document.querySelector(".reveal");\nel.innerHTML = el.textContent.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\nvar spans = el.querySelectorAll(".c");\nspans.forEach(function(s, i){ s.style.transitionDelay = (i * 80) + "ms"; });\nspans.forEach(function(s){ s.classList.add("on"); });',
    explain: '글자별 split + transition-delay까지는 char-stagger와 같지만, 부모에 overflow:hidden을 걸고 translateY(-115%)에서 시작. 글자 모양으로 클립되어 "위에서 흘러내린다"는 인상.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'cubic-bezier(0.7,0,0.3,1) — 탄력' },
      { label: '글자 간격', value: '80ms stagger' },
      { label: '핵심', value: '부모 overflow:hidden 필수' },
      { label: '권장', value: '5~10자 워드마크' }
    ],
    guide: '강한 인상이 필요한 영문 워드마크에. 부모 overflow:hidden 필수 — 잊으면 효과가 무너짐. 디센더(g, y, p)가 잘리지 않도록 padding 12~16px 권장. 글자 간격은 60~100ms.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 워드마크가 위에서 폭포처럼 떨어져 자리 잡음 — 강렬한 첫인상' },
      { place: '랜딩 페이지', body: '신제품 발표 페이지의 제품명 reveal — Apple WWDC 키노트 스타일' },
      { place: '제품 섹션', body: '가격 페이지의 큰 숫자(연간/월간)가 위에서 떨어져 정렬' },
      { place: '포트폴리오 소개', body: '프로젝트 코드네임/넘버링(SS24, AW25 등)을 강조' }
    ],
    tradeoff: 'overflow:hidden을 부모에 걸어야 하므로 line-height·padding 조정 필요. 디센더 잘림 주의. 한글 자소 분리 위험은 char-stagger와 동일.'
  },

  // ───────────────────────────── 9. variable-morph
  {
    id: 'variable-morph',
    num: '09',
    title: 'Variable Font 변형',
    summary: 'Pretendard Variable의 wght 축을 100(Thin)에서 900(Black)으로 morph. 글자가 "두꺼워지는" 인상으로 무게감을 시각화.',
    demo: {
      bodyHTML: '<div class="stage"><h1 class="reveal">Variable</h1></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font-family: "Pretendard Variable","Pretendard",system-ui; font-size: 18vw; line-height: 1; color: #fff; margin: 0; font-variation-settings: "wght" 100; font-weight: 100; transition: font-variation-settings 1800ms cubic-bezier(0.4,0,0.2,1), font-weight 1800ms cubic-bezier(0.4,0,0.2,1); }\n.reveal.on { font-variation-settings: "wght" 900; font-weight: 900; }',
      js: 'var el = document.querySelector(".reveal");\nfunction play(){\n  el.classList.remove("on");\n  void el.offsetHeight;\n  setTimeout(function(){ el.classList.add("on"); }, 50);\n}\nwindow.__replay = play;\nplay();',
      height: 460
    },
    snippetHTML: '<h1 class="reveal">Variable</h1>',
    snippetCSS: '.reveal {\n  font-family: "Pretendard Variable","Pretendard",system-ui;\n  font-variation-settings: "wght" 100;\n  font-weight: 100;\n  transition: font-variation-settings 1800ms cubic-bezier(0.4,0,0.2,1), font-weight 1800ms cubic-bezier(0.4,0,0.2,1);\n}\n.reveal.on {\n  font-variation-settings: "wght" 900;\n  font-weight: 900;\n}',
    snippetJS: 'new IntersectionObserver(function(ents){\n  if (ents[0].isIntersecting) document.querySelector(".reveal").classList.add("on");\n}, { threshold: 0.3 }).observe(document.querySelector(".reveal"));',
    explain: 'Variable font의 wght 축을 transition으로 100→900 morph. font-weight도 함께 적어주는 게 폴백 안전. 단순한 클래스 토글만으로 가늘어→두꺼워지는 morph가 만들어진다.',
    kv: [
      { label: '의존성', value: 'Variable font (Pretendard Variable, Inter Variable)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '이징', value: 'cubic-bezier(0.4,0,0.2,1)' },
      { label: 'wght 범위', value: '100 → 900 (전체 축)' },
      { label: '총 시간', value: '1800ms (천천히 morph)' },
      { label: '호환성', value: 'CSS Fonts Level 4 (97% 이상 지원)' }
    ],
    guide: 'Variable font가 로드된 환경에서만 동작. 폰트가 가변인지 확인 필수. weight 100→900 같은 큰 범위가 시각적으로 가장 흥미롭다. 다만 1초 미만 transition은 어색하므로 1.5~2초로 천천히. 폰트 사이트·typography 중심 페이지에 가장 자연스럽다.',
    recommendations: [
      { place: '히어로 헤더', body: '디자인 스튜디오·폰트 파운드리 사이트의 메인 워드마크가 thin→black으로 morph' },
      { place: '랜딩 페이지', body: '타이포그래피 강조 섹션의 헤딩에 적용 — "Typography matters" 같은 메타 카피' },
      { place: '제품 섹션', body: 'Variable Font 자체를 시연하는 폰트 데모 페이지' },
      { place: '포트폴리오 소개', body: '디자이너 본인 이름·스튜디오 로고를 weight morph로 강조' }
    ],
    tradeoff: 'Variable font 로드 비용(파일 1개에 모든 weight). 가변이 아닌 폰트에서는 weight transition이 끊겨 보임. prefers-reduced-motion에서 transition 제거 + 즉시 900 표시 권장.'
  },

  // ───────────────────────────── 10. underline-reveal
  {
    id: 'underline-reveal',
    num: '10',
    title: '밑줄 동반 진입',
    summary: '텍스트가 fade-up으로 진입하면서 250ms 지연된 밑줄이 scaleX(0)→1로 좌→우로 펼쳐진다. CTA·강조 카피에 적합.',
    demo: {
      bodyHTML: '<div class="stage"><div class="reveal"><span class="t">주목해서 읽어 주세요.</span><span class="u"></span></div></div>',
      css: '.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 60px 8vw; }\n.reveal { font: 700 56px/1.35 "Pretendard Variable","Pretendard",system-ui; color: #fff; margin: 0; display: inline-flex; flex-direction: column; gap: 12px; align-items: flex-start; letter-spacing: -0.01em; }\n.reveal .t { display: inline-block; opacity: 0; transform: translateY(20px); transition: opacity 700ms, transform 700ms cubic-bezier(0.2,0,0,1); }\n.reveal .u { display: block; height: 4px; width: 100%; background: #fff; transform: scaleX(0); transform-origin: left; transition: transform 900ms cubic-bezier(0.22,1,0.36,1) 300ms; }\n.reveal.on .t { opacity: 1; transform: translateY(0); }\n.reveal.on .u { transform: scaleX(1); }',
      js: 'var el = document.querySelector(".reveal");\nfunction play(){\n  el.classList.remove("on");\n  void el.offsetHeight;\n  setTimeout(function(){ el.classList.add("on"); }, 50);\n}\nwindow.__replay = play;\nplay();',
      height: 460
    },
    snippetHTML: '<div class="reveal"><span class="t">주목해서 읽어 주세요.</span><span class="u"></span></div>',
    snippetCSS: '.reveal { display: inline-flex; flex-direction: column; gap: 12px; align-items: flex-start; }\n.reveal .t { opacity: 0; transform: translateY(20px); transition: opacity 700ms, transform 700ms cubic-bezier(0.2,0,0,1); }\n.reveal .u { display: block; height: 4px; width: 100%; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform 900ms cubic-bezier(0.22,1,0.36,1) 300ms; }\n.reveal.on .t { opacity: 1; transform: translateY(0); }\n.reveal.on .u { transform: scaleX(1); }',
    snippetJS: 'new IntersectionObserver(function(ents){\n  if (ents[0].isIntersecting) document.querySelector(".reveal").classList.add("on");\n}, { threshold: 0.3 }).observe(document.querySelector(".reveal"));',
    explain: '텍스트(.t)는 opacity 0 + translateY(20px)에서 시작해 700ms로 풀려나고, 밑줄(.u)은 300ms 지연 후 scaleX(0)→1로 좌→우로 펼쳐진다. transform-origin: left가 핵심. 두 모션의 미세한 시간차가 "강조의 결정적 순간"을 만든다.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: 'IntersectionObserver 진입 1회' },
      { label: '텍스트 이징', value: 'cubic-bezier(0.2,0,0,1) 700ms' },
      { label: '밑줄 이징', value: 'cubic-bezier(0.22,1,0.36,1) 900ms + 300ms 지연' },
      { label: '핵심', value: 'transform-origin: left' },
      { label: '권장', value: 'CTA·강조 카피·키 메시지' }
    ],
    guide: '핵심 메시지·CTA에 사용. 한 줄짜리 짧은 카피에만 적합 — 다중 줄에서는 밑줄이 마지막 줄에만 그어지므로. transform-origin이 left일 때 자연스러우나, 우측 정렬 카피에서는 right로. 밑줄 두께 3~5px이 적당.',
    recommendations: [
      { place: '히어로 헤더', body: '서브카피 + 강조 밑줄로 핵심 메시지 강조 — "지금 시작하세요" 같은 CTA 카피' },
      { place: '랜딩 페이지', body: '기능 강조 카피("핵심 기능" 같은 키워드)에 밑줄 동반 진입' },
      { place: '제품 섹션', body: '버전·플랜 이름(Pro / Enterprise 등)에 밑줄로 강조' },
      { place: '포트폴리오 소개', body: '"Selected Works", "About Me" 같은 섹션 헤딩에 밑줄 진입으로 무게감' }
    ],
    tradeoff: '밑줄의 transform-origin이 left일 때 자연스러우나, 우측 정렬 카피에서는 right. 다중 줄 텍스트에서는 밑줄이 마지막 줄에만 그어지므로 한 줄짜리 카피에만 권장.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Live Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body {\n'
    + '      background: #000; color: #fff;\n'
    + '      font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;\n'
    + '      min-height: 100vh; overflow-x: hidden;\n'
    + '      -webkit-font-smoothing: antialiased;\n'
    + '    }\n'
    + '    .demo-controls {\n'
    + '      position: fixed; top: 16px; left: 16px;\n'
    + '      display: inline-flex; align-items: center; gap: 10px;\n'
    + '      z-index: 10;\n'
    + '    }\n'
    + '    .demo-replay {\n'
    + '      font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.72);\n'
    + '      background: rgba(255,255,255,0.08);\n'
    + '      border: 1px solid rgba(255,255,255,0.16);\n'
    + '      border-radius: 999px;\n'
    + '      padding: 8px 14px; cursor: pointer;\n'
    + '      transition: color 160ms, background 160ms, border-color 160ms;\n'
    + '    }\n'
    + '    .demo-replay:hover {\n'
    + '      color: #fff; background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32);\n'
    + '    }\n'
    + '    .demo-label {\n'
    + '      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.3);\n'
    + '      letter-spacing: 0.14em; text-transform: uppercase;\n'
    + '    }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-replay" type="button" onclick="window.__replay && window.__replay()">▶ 다시 재생</button>\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  ' + p.demo.bodyHTML.replace(/\n/g, '\n  ') + '\n'
    + '  <script>\n'
    + '    ' + p.demo.js.replace(/\n/g, '\n    ') + '\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

// ============ 분석 보고서 블록 빌더 ============

function buildPatternSection(p) {
  const blocks = [
    { type: 'text', value: p.summary },
    { type: 'heading', value: '라이브 데모' },
    {
      type: 'component',
      embed: 'demos/scroll-text-reveal/' + p.id + '.html',
      embedHeight: p.demo.height || 480,
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
      items: p.recommendations.map(r => ({ label: r.place, tag: r.label || '', desc: r.body }))
    },
    { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
  ];

  return {
    title: p.num + '. ' + p.title,
    blocks: blocks
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
      { type: 'heading', value: '스크롤 텍스트 로드 — 패턴 카탈로그 v2' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글) · Inter (영문 보조)' },
          { label: '배경 / 본문 색', value: '#000 / #ffffff · dim 시작 색 #525252' },
          { label: '트리거', value: 'IntersectionObserver threshold 0.15~0.3 (패턴별)' },
          { label: '표준 이징', value: 'cubic-bezier(0.2,0,0,1) / cubic-bezier(0.22,1,0.36,1) (out-expo)' },
          { label: '평균 진입 시간', value: '600-1100ms (한 단위) + stagger 70-160ms' },
          { label: '접근성', value: 'prefers-reduced-motion: stagger·transition 모두 제거 → 즉시 표시 권장' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-text-reveal/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. ▶ 다시 재생 버튼으로 반복 확인 가능, 새 탭 버튼으로 분리 확인' },
          { label: '작동 원리', tag: 'HOW', desc: '한 줄 요약 + 1-2 문단으로 핵심 메커니즘 설명' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 이징 / 시간 / 권장 글자 길이 등을 키-값으로' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록으로 분리. 그대로 복붙해 사용 가능' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — 길이·이징·접근성·주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개의 4가지 컨텍스트에 어떻게 활용할지' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Framer 마켓플레이스 Text Reveal 컴포넌트 (' + CATEGORY.url + ') — Inter 다크 톤 + 라이브 데모 iframe + H2 단위 섹션 분할 구조를 차용했고, 본 카탈로그는 단일 컴포넌트가 아닌 10가지 패턴 비교 카탈로그를 지향한다.'
      }
    ]
  };
}

// ============ 메인 ============
function main() {
  // 1) standalone demo HTML 10개
  mkdirSync(DEMO_DIR, { recursive: true });
  for (const p of PATTERNS) {
    const html = buildDemoHTML(p);
    const file = join(DEMO_DIR, p.id + '.html');
    writeFileSync(file, html, 'utf-8');
    console.log('✓ demos/scroll-text-reveal/' + p.id + '.html');
  }

  // 2) analysis.json
  const sections = { overview: buildOverview() };
  for (const p of PATTERNS) {
    sections[p.id] = buildPatternSection(p);
  }
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

  console.log('✓ analyses/scroll-text-reveal/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
