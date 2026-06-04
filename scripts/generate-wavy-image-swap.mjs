#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Wavy Image Swap (v1)
 * Framer 마켓플레이스 "Masked Scroll Slider" 시그니처
 *
 * 핵심:
 *   - sticky-stage(100vh)에 풀블리드 이미지 레이어 5장을 z-index 순서로 스택
 *   - 스크롤 진행률 0~1 → 활성 세그먼트(idx) + 로컬 진행률(local) 계산
 *   - 다음 이미지(idx+1)를 clip-path: polygon() 물결 엣지로 reveal (local=coverage)
 *   - 모든 reveal은 스크롤 진행률에 1:1 매핑 (자동 재생 없음)
 *
 * Usage: node scripts/generate-wavy-image-swap.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'wavy-image-swap');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'wavy-image-swap');

const CATEGORY = {
  id: 'wavy-image-swap',
  title: 'Wavy Image Swap',
  type: 'category',
  date: '2026-06-04',
  url: 'https://www.framer.com/marketplace/components/masked-scroll-slider/',
  summary: 'Framer 마켓플레이스 "Masked Scroll Slider" 시그니처 — 스크롤 시 화면이 고정(sticky)되고, 풀블리드 이미지 카드만 물결(wavy) 모양 마스크로 다음 이미지로 전환되는 인터랙션. sticky-stage 위에 이미지 5장을 z-index 순서로 스택하고, 스크롤 진행률 0~1을 세그먼트별 로컬 진행률로 환산해 다음 이미지를 clip-path: polygon() 물결 엣지로 reveal한다. 물결의 방향·진폭·주파수·형태(라인 / 사선 / 블롭 / 밴드 / 지그재그)만 패턴별로 달라지며, 모든 reveal은 스크롤 진행률에 1:1 매핑되어 사용자가 스크롤을 멈추면 물결도 그 위치에서 멈춘다.'
};

/* ================================================================
   이미지 카드 콘텐츠 (풀블리드 + 한국어 캡션)
   ================================================================ */

const IMAGES = [
  { src: 'https://picsum.photos/seed/wave-coast/1600/1000', cap: '01 · 해안의 아침' },
  { src: 'https://picsum.photos/seed/wave-arch/1600/1000',  cap: '02 · 물결 위의 건축' },
  { src: 'https://picsum.photos/seed/wave-dune/1600/1000',  cap: '03 · 사구와 들꽃' },
  { src: 'https://picsum.photos/seed/wave-dusk/1600/1000',  cap: '04 · 황혼의 바다' },
  { src: 'https://picsum.photos/seed/wave-calm/1600/1000',  cap: '05 · 미니멀 풍경' }
];
const N = IMAGES.length;

function cardsMarkup() {
  return IMAGES.map(function (im, i) {
    return '<div class="wis-card" data-i="' + i + '">'
      + '\n          <img class="wis-img" src="' + im.src + '" alt="">'
      + '\n          <span class="wis-cap">' + im.cap + '</span>'
      + '\n        </div>';
  }).join('\n        ');
}

/* ================================================================
   공통 CSS
   ================================================================ */

const BASE_CSS = ''
  + '.scroll-track { min-height: 500vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; background: #000; }\n'
  + '.wis-card { position: absolute; inset: 0; will-change: clip-path; }\n'
  + '.wis-img { width: 100%; height: 100%; object-fit: cover; display: block; }\n'
  + '.wis-cap { position: absolute; left: 32px; bottom: 40px; color: #fff; font: 600 clamp(14px,1.3vw,18px)/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.02em; text-shadow: 0 2px 12px rgba(0,0,0,0.5); padding: 8px 0; }\n';

/* ================================================================
   clip-path 물결 헬퍼 (데모에 전체 주입, 스니펫에는 사용분만)
   ================================================================ */

const ZERO_SRC = 'var ZERO = "polygon(0px 0px,0px 0px,0px 0px)";';

const HELPER_SRC = {
  // 아래→위 상승하는 물결 라인 (zig=true → 지그재그)
  polyUp: 'function polyUp(c,w,h,amp,waves,zig){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var A=amp, base=(1-c)*(h+2*A)-A, s=28, pts=[];\n'
    + '  for(var i=0;i<=s;i++){\n'
    + '    var x=w*i/s, ph=i/s*waves*Math.PI*2, sn=Math.sin(ph);\n'
    + '    var v=zig?(2/Math.PI)*Math.asin(sn):sn;\n'
    + '    pts.push(x.toFixed(1)+"px "+(base+A*v).toFixed(1)+"px");\n'
    + '  }\n'
    + '  pts.push(w+"px "+h+"px"); pts.push("0px "+h+"px");\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}',
  // 좌→우 진행하는 세로 물결 엣지
  polySide: 'function polySide(c,w,h,amp,waves){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var A=amp, ex=c*(w+2*A)-A, s=28, pts=[];\n'
    + '  for(var i=0;i<=s;i++){\n'
    + '    var y=h*i/s, ph=i/s*waves*Math.PI*2;\n'
    + '    pts.push((ex+A*Math.sin(ph)).toFixed(1)+"px "+y.toFixed(1)+"px");\n'
    + '  }\n'
    + '  pts.push("0px "+h+"px"); pts.push("0px 0px");\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}',
  // 좌하단→우상단 사선 물결
  polyDiag: 'function polyDiag(c,w,h,amp,waves){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var A=amp, s=28, pts=[];\n'
    + '  for(var i=0;i<=s;i++){\n'
    + '    var y=h*i/s, ph=i/s*waves*Math.PI*2;\n'
    + '    var x=w*(2*c - y/h)+A*Math.sin(ph);\n'
    + '    pts.push(x.toFixed(1)+"px "+y.toFixed(1)+"px");\n'
    + '  }\n'
    + '  pts.push("0px "+h+"px"); pts.push("0px 0px");\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}',
  // 중앙에서 확장하는 물결 블롭 (lobes=로브 수, af=진폭 비율)
  polyBlob: 'function polyBlob(c,w,h,lobes,af){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var cx=w/2, cy=h/2, maxR=Math.hypot(w,h)/2*1.15, R=c*maxR, s=56, pts=[];\n'
    + '  for(var i=0;i<=s;i++){\n'
    + '    var a=i/s*Math.PI*2, r=R*(1+af*Math.sin(a*lobes));\n'
    + '    pts.push((cx+r*Math.cos(a)).toFixed(1)+"px "+(cy+r*Math.sin(a)).toFixed(1)+"px");\n'
    + '  }\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}',
  // 중앙에서 세로로 벌어지는 밴드 (위·아래 물결 2줄)
  polyBand: 'function polyBand(c,w,h,amp,waves){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var A=amp, cy=h/2, half=c*(h/2+A), s=24, pts=[];\n'
    + '  for(var i=0;i<=s;i++){ var x=w*i/s, ph=i/s*waves*Math.PI*2; pts.push(x.toFixed(1)+"px "+(cy-half+A*Math.sin(ph)).toFixed(1)+"px"); }\n'
    + '  for(var i=s;i>=0;i--){ var x=w*i/s, ph=i/s*waves*Math.PI*2; pts.push(x.toFixed(1)+"px "+(cy+half+A*Math.sin(ph)).toFixed(1)+"px"); }\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}',
  // 중앙에서 가로로 벌어지는 커튼 (좌·우 물결 2줄)
  polyCurtain: 'function polyCurtain(c,w,h,amp,waves){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var A=amp, cx=w/2, half=c*(w/2+A), s=24, pts=[];\n'
    + '  for(var i=0;i<=s;i++){ var y=h*i/s, ph=i/s*waves*Math.PI*2; pts.push((cx-half+A*Math.sin(ph)).toFixed(1)+"px "+y.toFixed(1)+"px"); }\n'
    + '  for(var i=s;i>=0;i--){ var y=h*i/s, ph=i/s*waves*Math.PI*2; pts.push((cx+half+A*Math.sin(ph)).toFixed(1)+"px "+y.toFixed(1)+"px"); }\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}',
  // 2중 주파수 합성 상승 물결 (레이어드)
  polyStack: 'function polyStack(c,w,h){\n'
    + '  if(c<=0) return ZERO; if(c>=1) return "inset(0)";\n'
    + '  var A=50, base=(1-c)*(h+2*A)-A, s=32, pts=[];\n'
    + '  for(var i=0;i<=s;i++){\n'
    + '    var x=w*i/s, ph=i/s*Math.PI*2, y=base+28*Math.sin(ph)+15*Math.sin(ph*2.5+1);\n'
    + '    pts.push(x.toFixed(1)+"px "+y.toFixed(1)+"px");\n'
    + '  }\n'
    + '  pts.push(w+"px "+h+"px"); pts.push("0px "+h+"px");\n'
    + '  return "polygon("+pts.join(",")+")";\n'
    + '}'
};

const ALL_HELPERS = ZERO_SRC + '\n' + Object.values(HELPER_SRC).join('\n');

/* ================================================================
   공통 코드 스니펫
   ================================================================ */

const SNIPPET_HTML = '<div class="scroll-track">\n'
  + '  <div class="sticky-stage">\n'
  + '    <div class="card" data-i="0"><img src="img-01.jpg" alt=""><span class="cap">01 · 해안의 아침</span></div>\n'
  + '    <div class="card" data-i="1"><img src="img-02.jpg" alt=""><span class="cap">02 · 물결 위의 건축</span></div>\n'
  + '    <!-- x5 카드 (z-index 순서로 스택) -->\n'
  + '  </div>\n'
  + '</div>';

const SNIPPET_CSS = '.scroll-track { min-height: 500vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh;\n  overflow: hidden; background: #000; }\n'
  + '.card { position: absolute; inset: 0; will-change: clip-path; }\n'
  + '.card img { width: 100%; height: 100%; object-fit: cover; display: block; }';

function buildSnippetJS(p) {
  return 'var cards = document.querySelectorAll(".card"), N = cards.length;\n\n'
    + ZERO_SRC + '\n'
    + HELPER_SRC[p.helper] + '\n\n'
    + 'function clipFor(c, w, h){ ' + p.clipCall + ' }\n\n'
    + '// 스크롤 진행률 p(0~1) → 세그먼트 + 로컬 진행률 → 다음 이미지 물결 reveal\n'
    + 'function applyReveal(p){\n'
    + '  var w = innerWidth, h = innerHeight, segs = N - 1;\n'
    + '  var fp = p * segs, idx = Math.min(Math.floor(fp), segs - 1), local = fp - idx;\n'
    + '  cards.forEach(function(c, i){\n'
    + '    var cov = i === 0 ? 1 : i <= idx ? 1 : i === idx + 1 ? local : 0;\n'
    + '    c.style.zIndex = i;\n'
    + '    c.style.clipPath = clipFor(cov, w, h);\n'
    + '  });\n'
    + '}';
}

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  {
    id: 'wave-up', num: '01', title: '물결 상승 (Masked Slider 시그니처)',
    summary: '다음 이미지가 화면 아래에서 물결 라인을 그리며 위로 차오른다. Framer Masked Scroll Slider의 기본 시그니처 전환.',
    helper: 'polyUp', clipCall: 'return polyUp(c,w,h,42,2.5,false);',
    explain: '스크롤 진행률을 세그먼트(이미지 사이 구간)별 로컬 진행률 0~1로 환산하고, 다음 이미지를 clip-path: polygon()으로 reveal한다. 폴리곤 상단 엣지가 사인파 물결(진폭 42px, 주기 2.5회)을 그리며 base Y가 화면 아래(h+A)에서 위(-A)로 이동 → 물결이 아래에서 위로 차오르는 효과. 사용자가 스크롤을 멈추면 물결도 그 진행률에서 정지.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 세그먼트 로컬 coverage' },
      { label: '물결', value: '사인파 상승 라인 (진폭 42px / 2.5주기)' },
      { label: '방향', value: '아래 → 위 reveal' },
      { label: '이미지', value: '풀블리드 object-fit: cover 5장 스택' },
      { label: '시그니처', value: 'Framer Masked Scroll Slider' }
    ],
    guide: '가장 기본적이고 안정적인 물결 전환. 진폭 30~50px, 주기 2~3회가 자연스럽다. 진폭을 키우면 더 역동적이지만 이미지 가독성이 잠시 떨어진다. clip-path polygon은 GPU 가속되며 모던 브라우저 전부 지원.',
    recommendations: [
      { place: '히어로 헤더', body: '풀스크린 비주얼 슬라이더 — 물결로 다음 키 비주얼 등장' },
      { place: '랜딩 페이지', body: '제품 갤러리 — 스크롤로 이미지 시리즈를 물결 전환' },
      { place: '제품 섹션', body: '룩북·컬렉션 — 한 장씩 물결로 교체' },
      { place: '포트폴리오 소개', body: '대표 작품 풀스크린 — 물결로 작품 넘김' }
    ],
    tradeoff: '폴리곤 점이 많으면(28+) 저사양 기기에서 비용. 전환 중 이미지 절반이 물결로 잘려 텍스트 오버레이는 피하는 게 좋다.'
  },
  {
    id: 'wave-side', num: '02', title: '측면 물결 스윕',
    summary: '다음 이미지가 좌측에서 세로 물결 엣지를 그리며 우측으로 쓸려 들어온다.',
    helper: 'polySide', clipCall: 'return polySide(c,w,h,42,2.5);',
    explain: '폴리곤의 우측 경계가 세로 사인파 물결을 그리며, 엣지 X가 화면 왼쪽(-A)에서 오른쪽(w+A)으로 coverage에 비례해 이동한다. 물결진 수직 경계가 좌→우로 스윕하며 다음 이미지를 드러낸다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 엣지 X 위치' },
      { label: '물결', value: '세로 사인파 엣지 (진폭 42px / 2.5주기)' },
      { label: '방향', value: '좌 → 우 reveal' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '커튼 스윕 + 물결 엣지' }
    ],
    guide: '가로 방향 전환이 필요할 때. 세로 스크롤과 직교하는 가로 흐름이라 약간의 인지 비용이 있지만 시네마틱하다. RTL 사이트는 방향을 우→좌로 반전 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '와이드 비주얼 — 좌측에서 물결로 진입' },
      { place: '랜딩 페이지', body: '단계별 스토리 — 좌→우 흐름과 일치' },
      { place: '제품 섹션', body: '비교 슬라이드 — 나란히 비교 느낌' },
      { place: '포트폴리오 소개', body: '와이드 작품 — 파노라마 스윕' }
    ],
    tradeoff: '가로 흐름이 세로 스크롤과 직교 — 방향 인지 비용. overflow:hidden 필수.'
  },
  {
    id: 'wave-diagonal', num: '03', title: '사선 물결',
    summary: '물결 경계가 좌하단 → 우상단 대각선으로 기울어진 채 쓸려 올라온다.',
    helper: 'polyDiag', clipCall: 'return polyDiag(c,w,h,40,2);',
    explain: 'x/w + y/h = 2c 형태의 대각선 임계선을 따라 경계를 잡고, 여기에 사인파 진폭을 더해 물결진 사선 엣지를 만든다. coverage가 커지면 대각선이 좌하단에서 우상단으로 밀려나며 다음 이미지를 reveal.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 대각선 임계값' },
      { label: '물결', value: '사선 사인파 엣지 (진폭 40px / 2주기)' },
      { label: '방향', value: '좌하단 → 우상단 reveal' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '다이내믹 대각선 와이프' }
    ],
    guide: '정적인 수평/수직보다 역동적인 인상을 준다. 사선 각도는 w:h 비율로 자동 결정되며, 진폭을 줄이면(20~30px) 더 깔끔한 대각선 와이프에 가까워진다.',
    recommendations: [
      { place: '히어로 헤더', body: '스포츠·다이내믹 브랜드 — 역동적 진입' },
      { place: '랜딩 페이지', body: '에너지 있는 제품 — 대각선 전환' },
      { place: '제품 섹션', body: '신제품 공개 — 임팩트 있는 와이프' },
      { place: '포트폴리오 소개', body: '모션 디자이너 — 다이내믹 연출' }
    ],
    tradeoff: '대각선이라 화면 모서리에서 reveal 타이밍 차이가 큼. 모서리 콘텐츠는 늦게 드러난다.'
  },
  {
    id: 'wave-blob', num: '04', title: '물결 블롭 확장',
    summary: '다음 이미지가 화면 중앙에서 둥근 물결 블롭으로 확장되며 화면을 채운다.',
    helper: 'polyBlob', clipCall: 'return polyBlob(c,w,h,5,0.10);',
    explain: '중앙(cx,cy)을 기준으로 반지름 R = coverage × maxR인 원을 그리되, 각도에 따라 r = R(1 + 0.10·sin(angle×5))로 5개의 로브를 만들어 물결진 블롭 형태로 만든다. coverage가 커지면 블롭이 중앙에서 바깥으로 확장.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 블롭 반지름' },
      { label: '물결', value: '5-로브 원형 블롭 (진폭 10%)' },
      { label: '방향', value: '중앙 → 바깥 확장' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '오가닉 블롭 reveal' }
    ],
    guide: '중앙 포커스를 강조하는 오가닉 전환. 로브 수 4~6개, 진폭 비율 0.08~0.12가 자연스럽다. 로브를 늘리고 진폭을 줄이면 ripple(05)에 가까워진다.',
    recommendations: [
      { place: '히어로 헤더', body: '크리에이티브 스튜디오 — 유기적 등장' },
      { place: '랜딩 페이지', body: '브랜드 스토리 — 중앙 포커스 확장' },
      { place: '제품 섹션', body: '뷰티·코스메틱 — 부드러운 블롭' },
      { place: '포트폴리오 소개', body: '아티스트 — 유기적 형태 연출' }
    ],
    tradeoff: '폴리곤 점 56개로 가장 무거운 편. 확장 초반 작은 블롭에서는 이미지 일부만 보여 맥락 파악이 늦다.'
  },
  {
    id: 'wave-ripple', num: '05', title: '물결 파장',
    summary: '중앙에서 잔물결(고주파·저진폭) 원형 파장이 퍼지듯 다음 이미지가 확산된다.',
    helper: 'polyBlob', clipCall: 'return polyBlob(c,w,h,14,0.05);',
    explain: 'blob과 동일한 중앙 확장 모델이지만 로브를 14개, 진폭 비율을 0.05로 낮춰 잔물결진 원형 파장처럼 보이게 한다. 호수에 돌을 던졌을 때 퍼지는 동심 파장의 가장자리 느낌.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 파장 반지름' },
      { label: '물결', value: '14-로브 잔물결 (진폭 5%)' },
      { label: '방향', value: '중앙 → 바깥 확산' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '수면 동심 파장' }
    ],
    guide: '고주파·저진폭으로 거의 원형에 가깝되 가장자리가 잔물결진다. 물·자연·명상 테마에 잘 맞는다. 진폭을 0으로 두면 완전한 원형 와이프.',
    recommendations: [
      { place: '히어로 헤더', body: '웰니스·명상 — 잔잔한 파장 등장' },
      { place: '랜딩 페이지', body: '음료·생수 브랜드 — 수면 파장' },
      { place: '제품 섹션', body: '친환경 제품 — 자연스러운 확산' },
      { place: '포트폴리오 소개', body: '사진작가 — 잔잔한 reveal' }
    ],
    tradeoff: '진폭이 작아 물결감이 미묘하다 — 강한 인상이 필요하면 blob(04)이나 wave-up(01) 권장.'
  },
  {
    id: 'wave-band', num: '06', title: '수직 밴드 분할',
    summary: '화면 중앙에서 위·아래 두 물결 라인이 벌어지며 다음 이미지가 세로로 펼쳐진다.',
    helper: 'polyBand', clipCall: 'return polyBand(c,w,h,38,2.5);',
    explain: '중앙 수평선(cy)을 기준으로 위쪽 물결 엣지와 아래쪽 물결 엣지를 동시에 그려 하나의 밴드 폴리곤을 만든다. coverage가 커지면 두 엣지가 위·아래로 벌어지며 중앙에서 바깥으로 이미지를 펼친다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 밴드 높이' },
      { label: '물결', value: '위·아래 수평 물결 2줄 (진폭 38px)' },
      { label: '방향', value: '중앙 → 위·아래 분할' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '중앙 분할 오프닝' }
    ],
    guide: '중앙에서 양쪽으로 열리는 극적인 오프닝. 가운데 핵심 피사체가 먼저 드러나므로 중앙 구도 이미지에 잘 맞는다. 진폭 30~45px 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '영화·미디어 — 시네마틱 오프닝' },
      { place: '랜딩 페이지', body: '런칭 발표 — 중앙 분할 공개' },
      { place: '제품 섹션', body: '주얼리·시계 — 중앙 피사체 강조' },
      { place: '포트폴리오 소개', body: '디렉터 — 극적 인트로' }
    ],
    tradeoff: '단일 폴리곤 밴드라 위·아래가 동시에 열린다. 상하단 모서리 콘텐츠가 가장 늦게 드러난다.'
  },
  {
    id: 'wave-curtain', num: '07', title: '가로 커튼 분할',
    summary: '화면 중앙에서 좌·우 두 물결 라인이 벌어지며 다음 이미지가 가로로 펼쳐진다.',
    helper: 'polyCurtain', clipCall: 'return polyCurtain(c,w,h,38,2.5);',
    explain: '중앙 수직선(cx)을 기준으로 왼쪽 물결 엣지와 오른쪽 물결 엣지를 동시에 그려 커튼 폴리곤을 만든다. coverage가 커지면 두 물결 커튼이 좌·우로 벌어지며 중앙에서 바깥으로 이미지를 펼친다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 커튼 폭' },
      { label: '물결', value: '좌·우 세로 물결 2줄 (진폭 38px)' },
      { label: '방향', value: '중앙 → 좌·우 분할' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '물결 커튼 오프닝' }
    ],
    guide: '무대 커튼이 양쪽으로 열리듯 가로 분할. band(06)와 한 쌍으로, 세로 구도 이미지나 좌우 대칭 구도에 잘 맞는다.',
    recommendations: [
      { place: '히어로 헤더', body: '공연·전시 — 커튼 오프닝' },
      { place: '랜딩 페이지', body: '이벤트 발표 — 무대 연출' },
      { place: '제품 섹션', body: '패션 룩북 — 세로 인물 강조' },
      { place: '포트폴리오 소개', body: '무대·공간 디자이너 — 커튼 연출' }
    ],
    tradeoff: '좌·우 모서리가 가장 늦게 드러난다. 좌우 끝 텍스트 오버레이는 전환 중 잘림.'
  },
  {
    id: 'wave-zigzag', num: '08', title: '지그재그 물결',
    summary: '둥근 사인파 대신 뾰족한 지그재그 톱니 엣지가 아래에서 위로 차오른다.',
    helper: 'polyUp', clipCall: 'return polyUp(c,w,h,46,3,true);',
    explain: 'wave-up과 같은 상승 모델이되, 사인 값을 (2/π)·asin(sin)으로 변환해 삼각파(톱니)로 만든다. 부드러운 물결 대신 날카로운 지그재그 엣지가 화면 아래에서 위로 reveal된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 톱니 엣지 Y' },
      { label: '물결', value: '삼각파 지그재그 (진폭 46px / 3주기)' },
      { label: '방향', value: '아래 → 위 reveal' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '에지·테크 지그재그' }
    ],
    guide: '날카롭고 테크니컬한 인상. 게임·테크·스트리트 브랜드에 잘 맞는다. 주기를 늘리면(4~6) 더 촘촘한 톱니가 된다. 부드러움이 필요하면 wave-up 사용.',
    recommendations: [
      { place: '히어로 헤더', body: '게임·e스포츠 — 에지 있는 진입' },
      { place: '랜딩 페이지', body: '테크 가젯 — 날카로운 전환' },
      { place: '제품 섹션', body: '스트리트웨어 — 그래픽 톱니' },
      { place: '포트폴리오 소개', body: '그래픽 디자이너 — 강한 개성' }
    ],
    tradeoff: '톱니 꼭짓점에서 계단 현상(aliasing)이 보일 수 있다. 주기를 너무 높이면 점 수 부족으로 뭉개짐.'
  },
  {
    id: 'wave-morph', num: '09', title: '물결 모핑',
    summary: '전환 중간에 물결 진폭이 최대로 부풀었다가 양 끝에서 평평해지며 다음 이미지로 모핑된다.',
    helper: 'polyUp', clipCall: 'return polyUp(c,w,h,70*Math.sin(Math.PI*c)+6,3,false);',
    explain: 'wave-up 상승 모델에서 진폭을 70·sin(π·c)+6으로 동적 변조한다. coverage 0과 1에서는 진폭이 거의 0(평평)이고, 중간(c=0.5)에서 최대 76px로 부푼다 → 전환 시작·끝은 깔끔하고 중간에만 물결이 크게 출렁이는 모핑 효과.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 진폭 변조 + Y' },
      { label: '물결', value: '진폭 동적 변조 sin(π·c) (최대 76px)' },
      { label: '방향', value: '아래 → 위, 중간 부풂' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '진폭 모핑 물결' }
    ],
    guide: '시작과 끝이 평평해 이미지가 깔끔하게 안착하고, 전환 중간에만 큰 물결이 일어 드라마틱하다. 진폭 변조는 다른 패턴에도 곱해 쓸 수 있는 범용 기법.',
    recommendations: [
      { place: '히어로 헤더', body: '프리미엄 브랜드 — 절제된 드라마' },
      { place: '랜딩 페이지', body: '스토리텔링 — 리듬감 있는 전환' },
      { place: '제품 섹션', body: '하이엔드 제품 — 정교한 모션' },
      { place: '포트폴리오 소개', body: '모션 전문가 — 디테일한 이징' }
    ],
    tradeoff: '진폭이 매 프레임 바뀌어 폴리곤이 크게 출렁 — 모션 민감 사용자는 prefers-reduced-motion 대응 권장.'
  },
  {
    id: 'wave-stack', num: '10', title: '레이어드 물결',
    summary: '두 개의 다른 주파수 물결이 겹쳐 불규칙하고 자연스러운 합성 물결이 차오른다.',
    helper: 'polyStack', clipCall: 'return polyStack(c,w,h);',
    explain: '기본 주파수 사인파(진폭 28px)에 2.5배 주파수 사인파(진폭 15px)를 위상 차를 두고 더해 합성한다. 단일 사인파보다 불규칙하고 유기적인 물결 라인이 만들어지며, 실제 파도에 가까운 느낌으로 아래에서 위로 차오른다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (clip-path: polygon)' },
      { label: '트리거', value: '스크롤 진행률 → 합성 물결 Y' },
      { label: '물결', value: '2중 주파수 합성 (28px + 15px×2.5)' },
      { label: '방향', value: '아래 → 위 reveal' },
      { label: '이미지', value: '풀블리드 5장 스택' },
      { label: '시그니처', value: '리얼 파도 합성 물결' }
    ],
    guide: '두 사인파를 겹쳐 가장 자연스럽고 유기적인 물결을 만든다. 주파수 비(1 : 2.5)와 위상 차를 바꾸면 무한히 다양한 물결을 생성할 수 있다. 자연·바다 테마에 최적.',
    recommendations: [
      { place: '히어로 헤더', body: '리조트·여행 — 진짜 파도 같은 전환' },
      { place: '랜딩 페이지', body: '자연·아웃도어 — 유기적 물결' },
      { place: '제품 섹션', body: '서핑·해양 제품 — 파도 메타포' },
      { place: '포트폴리오 소개', body: '풍경 사진작가 — 자연스러운 흐름' }
    ],
    tradeoff: '합성 물결은 점 수가 많을수록(32+) 부드럽지만 비용 증가. 진폭 합이 커 전환 중 잘리는 영역이 넓다.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더
   ================================================================ */

function buildDemoHTML(p) {
  var bodyContent = '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '        ' + cardsMarkup() + '\n'
    + '    </div>\n'
    + '  </div>';

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Wavy Image Swap Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.18); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; backdrop-filter: blur(8px); }\n'
    + '    .demo-reset:hover { color: #fff; background: rgba(0,0,0,0.7); }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.55); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.6); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; background: rgba(0,0,0,0.4); padding: 8px 14px; border-radius: 999px; backdrop-filter: blur(8px); animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.12); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #fff; width: 0; transition: width 60ms linear; }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
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
    + bodyContent + '\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      var track = document.querySelector(".scroll-track");\n'
    + '      var cards = document.querySelectorAll(".wis-card");\n'
    + '      var N = ' + N + ';\n'
    + '      ' + ALL_HELPERS.replace(/\n/g, '\n      ') + '\n'
    + '      function clipFor(c, w, h){ ' + p.clipCall + ' }\n'
    + '      function calc(){\n'
    + '        var rect = track.getBoundingClientRect();\n'
    + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
    + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
    + '      }\n'
    + '      function applyReveal(p){\n'
    + '        var w = window.innerWidth, h = window.innerHeight, segs = N - 1;\n'
    + '        var fp = p * segs, idx = Math.min(Math.floor(fp), segs - 1), local = fp - idx;\n'
    + '        for (var i = 0; i < cards.length; i++){\n'
    + '          var cov = i === 0 ? 1 : i <= idx ? 1 : i === idx + 1 ? local : 0;\n'
    + '          cards[i].style.zIndex = i;\n'
    + '          cards[i].style.clipPath = clipFor(cov, w, h);\n'
    + '        }\n'
    + '      }\n'
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

/* ================================================================
   분석 보고서 블록 빌더
   ================================================================ */

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/wavy-image-swap/' + p.id + '.html',
        embedHeight: 560,
        embedLabel: p.num + ' · ' + p.title,
        title: p.title + ' 라이브 데모'
      },
      { type: 'heading', value: '작동 원리' },
      { type: 'text', value: p.explain },
      { type: 'kv', columns: 2, items: p.kv },
      { type: 'heading', value: '코드 스니펫' },
      { type: 'code', lang: 'HTML', title: 'HTML', value: SNIPPET_HTML },
      { type: 'code', lang: 'CSS', title: 'CSS', value: SNIPPET_CSS },
      { type: 'code', lang: 'JS', title: 'JavaScript', value: buildSnippetJS(p) },
      { type: 'heading', value: '사용 가이드' },
      { type: 'text', value: p.guide },
      { type: 'heading', value: '활용 추천' },
      {
        type: 'structure',
        items: p.recommendations.map(function (r) { return { label: r.place, tag: '', desc: r.body }; })
      },
      { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
    ]
  };
}

function buildOverview() {
  var indexItems = PATTERNS.map(function (p) {
    return {
      label: p.num + '. ' + p.title,
      tag: p.kv.find(function (k) { return k.label === '방향'; })?.value || '',
      desc: p.summary
    };
  });

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'Wavy Image Swap — 물결 마스크 이미지 전환 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 인터랙션 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일' },
          { label: '무대', value: 'sticky-stage 100vh + overflow:hidden + 배경 #000' },
          { label: '스크롤 공간', value: 'scroll-track 500vh (이미지 5장 = 4 전환)' },
          { label: '이미지', value: '풀블리드 object-fit:cover, z-index 순서로 스택' },
          { label: '진행률 환산', value: 'fp = p×(N-1) → idx = floor(fp), local = fp-idx' },
          { label: 'reveal', value: '다음 이미지(idx+1)를 clip-path: polygon() coverage=local' },
          { label: '물결 생성', value: '사인파/삼각파/블롭/밴드/합성파 polygon 샘플링' },
          { label: '핵심 원칙', value: '모든 reveal은 스크롤 진행률에 1:1 매핑 (자동 재생 없음)' },
          { label: '의존성', value: 'Vanilla JS only (외부 라이브러리 없음)' },
          { label: '참고', value: 'Framer 마켓플레이스 Masked Scroll Slider' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/wavy-image-swap/{pattern}.html — 물결 이미지 전환' },
          { label: '작동 원리', tag: 'HOW', desc: '스크롤 진행률 → 세그먼트 로컬 coverage → clip-path polygon 물결 엣지' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 물결 / 방향 / 이미지 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 clip 헬퍼 + applyReveal' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·테마 적합성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '물결 마스크 아키텍처 — sticky-stage 위 이미지 5장을 z-index 스택하고, 스크롤 진행률을 세그먼트 로컬 진행률로 환산해 다음 이미지를 clip-path: polygon() 물결 엣지로 reveal. 물결의 방향·진폭·주파수·형태만 패턴별로 달라진다. clip-path polygon은 GPU 가속되며 외부 의존성이 없다.'
      }
    ]
  };
}

/* ================================================================
   메인
   ================================================================ */

function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (var p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/wavy-image-swap/' + p.id + '.html');
  }

  var sections = { overview: buildOverview() };
  for (var p of PATTERNS) sections[p.id] = buildPatternSection(p);

  var analysis = {
    id: CATEGORY.id,
    title: CATEGORY.title,
    type: CATEGORY.type,
    url: CATEGORY.url,
    date: CATEGORY.date,
    summary: CATEGORY.summary,
    patternCount: PATTERNS.length,
    sections: sections
  };
  mkdirSync(ANALYSIS_DIR, { recursive: true });
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log('✓ analyses/wavy-image-swap/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
