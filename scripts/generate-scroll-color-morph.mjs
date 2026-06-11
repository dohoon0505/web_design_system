#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: 스크롤 컬러 모핑 (v1)
 *
 * 표준 scroll-pin 모델 (scroll-text-reveal v3와 동일):
 * - .scroll-track 240vh + .sticky-stage 100vh (position:sticky top:0)
 * - progress = clamp(0, -rect.top / (rect.height - innerHeight), 1)
 * - 모든 색 변경은 inline style로 progress에 1:1 보간 (RGB lerp 공용 헬퍼)
 * - 자동 재생 금지 — 스크롤 멈추면 색도 그 지점에 멈춘다
 * - ↻ 다시 보기 = scrollTo 0
 *
 * Usage: node scripts/generate-scroll-color-morph.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scroll-color-morph');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scroll-color-morph');

const CATEGORY = {
  id: 'scroll-color-morph',
  title: '스크롤 컬러 모핑',
  type: 'category',
  date: '2026-06-10',
  url: 'https://reallygooddesigns.com/web-design-trends-2026/',
  summary: '스크롤 진행률에 따라 페이지 배경·텍스트·액센트 컬러가 연속 보간되는 전환 패턴 컬렉션. 섹션마다 무드가 바뀌는 2026 브랜드 모션 트렌드 — sticky로 화면을 고정한 뒤 스크롤 진행률(0~1)을 RGB·HSL 값에 1:1 매핑해, 사용자가 스크롤을 멈추면 색도 정확히 그 지점에 멈춘다. 단순 섹션 배경 페이드부터 다크↔라이트 플립·그라디언트 hue 시프트·서클/대각 와이프·액센트 토큰 교체·듀오톤 씬·적응형 내비·hue-rotate 스크럽까지 10가지 컬러 모핑 매핑을 비교 카탈로그로 정리.'
};

// 모든 데모 스크립트 앞에 주입되는 공용 색 보간 헬퍼
const HELPER_JS = [
  'function clamp01(v){ return Math.max(0, Math.min(1, v)); }',
  'function lerp(a, b, t){ return a + (b - a) * t; }',
  'function mixArr(a, b, t){',
  '  return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))];',
  '}',
  'function lerpRGB(a, b, t){',
  '  var c = mixArr(a, b, t);',
  '  return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";',
  '}',
  'function pick3Arr(stops, p){',
  '  var seg = p < 0.5 ? 0 : 1;',
  '  var t = clamp01(seg === 0 ? p / 0.5 : (p - 0.5) / 0.5);',
  '  return mixArr(stops[seg], stops[seg + 1], t);',
  '}',
  'function pick3(stops, p){',
  '  var c = pick3Arr(stops, p);',
  '  return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";',
  '}'
].join('\n');

// ============ 10 패턴 정의 ============
//
// 각 패턴은 standalone 페이지로 작성 (demos/scroll-color-morph/{id}.html).
// 공통 보일러플레이트 (sticky track + scroll handler + 색 보간 헬퍼)는 buildDemoHTML이 wrap.
//   - demo.css       — 패턴별 CSS
//   - demo.bodyHTML  — .sticky-stage 안에 들어갈 마크업
//   - demo.script    — applyReveal(p) 함수 정의 + init 변수
//   - demo.height    — iframe 임베드 높이 (기본 480, 시그니처 560)

const PATTERNS = [
  // __P1_2__
  // __P3_4__
  // __P5_6__
  // __P7_8__
  // __P9_10__
];

// ============ Standalone demo HTML 빌더 (scroll-pin + progress) ============

function buildDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Scroll Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    html { scroll-behavior: smooth; }\n'
    + '    body {\n'
    + '      background: #000; color: #fff;\n'
    + '      font-family: "Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif;\n'
    + '      overflow-x: hidden;\n'
    + '      -webkit-font-smoothing: antialiased;\n'
    + '      will-change: background-color;\n'
    + '    }\n'
    + '    .demo-controls {\n'
    + '      position: fixed; top: 16px; left: 16px;\n'
    + '      display: inline-flex; align-items: center; gap: 10px;\n'
    + '      z-index: 20;\n'
    + '    }\n'
    + '    .demo-reset {\n'
    + '      font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.72);\n'
    + '      background: rgba(0,0,0,0.35);\n'
    + '      border: 1px solid rgba(255,255,255,0.16);\n'
    + '      border-radius: 999px;\n'
    + '      padding: 8px 14px; cursor: pointer;\n'
    + '      backdrop-filter: blur(6px);\n'
    + '      transition: color 160ms, background 160ms, border-color 160ms;\n'
    + '    }\n'
    + '    .demo-reset:hover {\n'
    + '      color: #fff; background: rgba(0,0,0,0.55); border-color: rgba(255,255,255,0.32);\n'
    + '    }\n'
    + '    .demo-label {\n'
    + '      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.35);\n'
    + '      letter-spacing: 0.14em; text-transform: uppercase;\n'
    + '      text-shadow: 0 1px 6px rgba(0,0,0,0.4);\n'
    + '    }\n'
    + '    .demo-hint {\n'
    + '      position: fixed; right: 16px; bottom: 24px;\n'
    + '      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.45);\n'
    + '      letter-spacing: 0.18em; text-transform: uppercase;\n'
    + '      z-index: 20;\n'
    + '      text-shadow: 0 1px 6px rgba(0,0,0,0.4);\n'
    + '      animation: demo-hint-bounce 1.6s ease-in-out infinite;\n'
    + '    }\n'
    + '    @keyframes demo-hint-bounce {\n'
    + '      0%, 100% { transform: translateY(0); opacity: 0.45; }\n'
    + '      50%       { transform: translateY(4px); opacity: 0.8; }\n'
    + '    }\n'
    + '    .demo-progress {\n'
    + '      position: fixed; bottom: 0; left: 0; right: 0;\n'
    + '      height: 2px; background: rgba(127,127,127,0.18);\n'
    + '      z-index: 20;\n'
    + '    }\n'
    + '    .demo-progress > div {\n'
    + '      height: 100%; background: #fff; width: 0;\n'
    + '      mix-blend-mode: difference;\n'
    + '      transition: width 60ms linear;\n'
    + '    }\n'
    + '    .scroll-track { min-height: 240vh; position: relative; }\n'
    + '    .sticky-stage {\n'
    + '      position: sticky; top: 0;\n'
    + '      height: 100vh;\n'
    + '      display: flex; align-items: center; justify-content: center;\n'
    + '      padding: 80px 8vw 60px;\n'
    + '      overflow: hidden;\n'
    + '    }\n'
    + '    /* 패턴별 CSS */\n'
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
    + '\n'
    + '      // 공용 색 보간 헬퍼\n'
    + '      ' + HELPER_JS.replace(/\n/g, '\n      ') + '\n'
    + '\n'
    + '      // 패턴별 init + applyReveal 정의\n'
    + '      ' + p.demo.script.replace(/\n/g, '\n      ') + '\n'
    + '\n'
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
  const blocks = [
    { type: 'text', value: p.summary },
    { type: 'heading', value: '라이브 데모' },
    {
      type: 'component',
      embed: 'demos/scroll-color-morph/' + p.id + '.html',
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
      items: p.recommendations.map(r => ({ label: r.place, tag: '', desc: r.body }))
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
      { type: 'heading', value: '스크롤 컬러 모핑 — 패턴 카탈로그 v1 (scroll-pin + RGB 보간)' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + scroll 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글) · 실측 참고 linear.app은 Inter Variable' },
          { label: '기준 다크 색', value: 'rgb(8,9,10) — linear.app 실측 다크 배경' },
          { label: 'Scroll 모델', value: '.scroll-track 240vh + .sticky-stage 100vh (position:sticky top:0)' },
          { label: '진행률 계산', value: 'p = clamp(0, -rect.top / (rect.height - innerHeight), 1)' },
          { label: '색 보간', value: 'RGB lerp 공용 함수 (Math.round) — 텍스트 대비 동시 보간 필수' },
          { label: '성능 힌트', value: 'will-change: background-color + inline style 1:1 매핑 (transition 우회 금지)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-color-morph/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. iframe 안에서 스크롤하면 진행률에 따라 색이 보간. ↻ 다시 보기로 처음으로' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률(0~1)을 어떤 색 공간(RGB/HSL)·어떤 토큰에 매핑하는지 핵심 메커니즘' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 색 스톱 / 매핑 구간 / 성능 비용 등 6항목' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. sticky track + scroll handler + lerp 포함' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — 색 스톱 선정·대비 유지·접근성·주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개의 4가지 컨텍스트 활용' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Really Good Designs — Web Design Trends 2026 (' + CATEGORY.url + ')의 "스크롤 연동 컬러 트랜지션" 트렌드 + linear.app 다크 토큰 실측 rgb(8,9,10). 모든 데모는 자동 재생이 아니라 사용자가 iframe 안에서 스크롤할 때만 색이 보간되며, 스크롤을 멈추면 색도 정확히 그 진행률 지점에 멈춘다. ↻ 다시 보기 버튼이 scroll position을 0으로 리셋한다.'
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
    console.log('✓ demos/scroll-color-morph/' + p.id + '.html');
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

  console.log('✓ analyses/scroll-color-morph/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
