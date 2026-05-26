# CLAUDE.md — 기여 가이드라인

Web Reference Lab(웹 디자인 레퍼런스 연구소)에 변경을 가할 때 따라야 할 원칙. 운영자(/DH)와 AI 코딩 에이전트의 단일 합의 문서.

## 🚨 자동화 실행 프로토콜

본 문서를 읽는 AI 에이전트는 사용자의 반복 지시 없이도 다음 4대 원칙을 **무조건 자동 수행**한다.

1. **언어 100% 한국어** — 사고 과정·진행 보고·오류·최종 답변 전부
2. **채팅창 코드 금지** — 산출물은 파일 시스템에 직접 저장, 실행 가능한 형태로
3. **선 실측 후 코딩** — Playwright MCP로 `getComputedStyle`·`getBoundingClientRect` 실측 후 정량 표 보고, 그 데이터로만 코딩 시작
4. **자가 검증 루프 강제** — "확인했습니다" 텍스트 자기보고 금지. 양 사이트(라이브 ↔ 보고서) 스크롤 단계별 오차가 1px이라도 발생하면 즉시 분석·수정, 오차 0으로 수렴했음을 표·스크린샷으로 증명 후 보고

## 프로젝트 개요

실제 운영 중인 웹사이트의 디자인 시스템을 연구원 수준으로 분석하는 레퍼런스 카탈로그. **다른 프로젝트에서 곧바로 꺼내 쓸 수 있는 컴포넌트 라이브러리**가 산출물.

### 세 가지 작업 모드

| 모드 | 사용 시점 (키워드) | 페이지 분석 | 섹션 수 | 산출물 |
|------|----------|------------|---------|--------|
| **일반 카탈로그** | "사이트 전체 분석" 요청 | 메인 + 서브 30+ 페이지 | 30+ | 인라인 `component` 블록 라이브러리 |
| **Mirror Mode** | "100% 동일 / 정밀 클론 / 메인만 / 풀픽셀" 요청 | 단일 페이지 정밀 | 10-15 | `component` 블록 70%+ + Tier-A 프리뷰 모달 |
| **Flow Mode (v2)** | "흐름 스케치 / 와이어프레임 / 디자이너 컨셉 시안 / 디자인 시안" 요청 | 메인 + **모든** 서브 페이지 | 페이지 수 + 1 (개요) | 페이지마다 디테일 SVG 와이어프레임 + 인터랙션 마커 ①~⑫ (참고: uxplaybook.org Landing Page Formula 톤) |

## 절대 규칙

### 0. Playwright로 라이브 사이트 직접 측정 (MCP 또는 Node 직접 호출)

**측정 도구는 Playwright 1종** (Chrome MCP는 사용 금지). 학습 데이터 추정·외부 캐시·WebFetch는 **사이트맵 URL 패턴 추정** 같은 보조 용도로만.

**케이스 A — Playwright MCP** (Mirror Mode 단일 페이지·인터랙티브 디버그·스팟 점검):
```
1. mcp__playwright__browser_navigate({ url })
2. wait 3-5초 (하이드레이션 완료)
3. mcp__playwright__browser_evaluate({ function: '() => { ... }' })
4. mcp__playwright__browser_take_screenshot
5. mcp__playwright__browser_hover/click (인터랙션 측정)
```

**케이스 B — Playwright Node 직접 호출 스크립트** (Flow Mode·일반 카탈로그 대량 페이지·페이지 10개 이상):
MCP는 도구 호출당 1 메시지라 26 페이지 × 33장 = 800+ 메시지로 비현실적. 동일 Playwright 패키지를 Node로 직접 호출해 1회 실행으로 일괄 처리한다. KT&G v2: 13분에 26 페이지 858장 캡처.
```js
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const p of PAGES) {
  await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000); // 하이드레이션 + 인트로
  for (let step = 0; step <= 10; step++) {        // Flow Mode 표준: 10단계 × 3캡처
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), sH * step / 10);
    await page.waitForTimeout(200);  await page.screenshot({ /* a */ });
    await page.waitForTimeout(1000); await page.screenshot({ /* b */ });
    await page.waitForTimeout(1000); await page.screenshot({ /* c */ });
    timeline.push(await page.evaluate(COLLECT_FN)); // computed state 시계열
  }
}
```
KT&G v2 표준 구현체: `scripts/capture-ktng-v2.mjs` (전수 일괄 캡처) + `scripts/generate-ktng-flow-v2.mjs` (와이어프레임 + 인터랙션 마커 자동 검출).

### 1. 섹션 타이틀에 이모지 금지

`sections.{id}.title` 문자열에는 🟢 같은 이모지를 절대 넣지 않는다. 본문(`value`, `label`, `text`)에서만 허용.

```json
// 잘못된 예
{ "title": "20. 🟢 시그니처 - Orbital", ... }
// 올바른 예
{ "title": "20. 시그니처 - Orbital",
  "blocks": [{"type":"kv","items":[{"label":"🟢 특징","value":"..."}]}] }
```

### 2. 실제 사이트 이미지 적극 사용

라이브 사이트의 실제 이미지·영상 URL을 그대로 `<img src>`, `background-image:url(...)`로 임베드. 비공개 연구 자료라 저작권·CDN 비용 고려 X.

### 3. smooth-interaction-catalog 섹션 필수

마지막 섹션은 `smooth-interaction-catalog` ID로 통일. 정적 분석으로 잡히지 않는 라이브 동작 (Splitting.js 글자별 fade-in / Slot Counter / Particle Network / 마우스 추적 커서 등)을 정리.

## 보고서 데이터 모델

각 분석은 `analyses/{id}/analysis.json` 한 파일.

```json
{
  "id": "miracell",
  "title": "미라셀 (메인 100% 재현)",
  "url": "https://miracell.co.kr/kr/",
  "date": "2026-05-22",
  "summary": "2-3 문단 — 사이트 정체성, 기술 스택, 시그니처 패턴",
  "crawledPages": 1,
  "sections": {
    "overview":   { "title": "01. 개요", "blocks": [...] },
    ...
    "smooth-interaction-catalog": { "title": "N. 부드러운 인터랙션 카탈로그", "blocks": [...] }
  }
}
```

`system.json.references[]`에 동일 `id` + 커스텀 `sections` 배열(`{id, num, title, desc}`)을 함께 등록.

## 블록 타입 카탈로그

`assets/js/main.js`의 `renderBlock()`이 처리하는 블록 타입. 다른 타입은 렌더되지 않음.

| 타입 | 용도 | 필수/선택 키 |
|------|------|-----|
| `heading` | h2 헤딩 | `value` |
| `text` | 단락 텍스트 | `value` |
| `note` | i 아이콘 노트 (정량 데이터 전용) | `value` |
| `kv` | 키-값 리스트 (1/2/3 컬럼) | `title?`, `columns?`, `items[{label, value}]` |
| `stats` | 큰 숫자 카드 그리드 | `items[{number, suffix?, label}]` |
| `sitemap` | 부모 + 자식 그룹 | `items[{label, children[]}]` |
| `structure` | 순번 + 라벨 + 태그 + 설명 | `items[{label, tag?, desc}]` |
| `palette` | 컬러 스와치 표 | `title?`, `colors[{name, hex, usage}]` |
| `typo` | 폰트 샘플 표 | `items[{label, size, weight, sample, tracking?}]` |
| `component` | HTML/CSS/JS 라이브 프리뷰 (인라인) | `title?`, `html`, `css`, `js?`, `fullWidth?` |
| `component` (Tier-A) | 프리뷰 모달 (별도 페이지) | `title?`, `preview`, `thumbBg?`, `thumbLabel?` |
| `spacingScale` | 여백 바 | `items[{label, px}]` |
| `radiusScale` | 둥글기 박스 | `items[{label, px, usage?, note?}]` |

## Mirror Mode — 단일 페이지 100% 동일 재현 (미라셀 2026-05-22 정립)

### 핵심 원칙 6가지

1. **단일 페이지 집중** — `crawledPages: 1`, `subpages` 배열은 메인 1개만
2. **10-15 섹션 구조** — 헤더/히어로/미들/푸터 + 비주얼(타입·컬러) + 인터랙션 카탈로그
3. **`component` 블록 비중 70%+** — `kv` 표만 늘어놓지 말고 모든 섹션에 시각 컴포넌트 1개+
4. **실 이미지 CDN URL 임베드 의무** — `https://{site}/images/...` 절대 경로 그대로
5. **5-Round E2E 양 사이트 대조** — 우회 없이 라이브 ↔ 보고서 5회 왕복
6. **디자인 토큰 100% 실측** — `:root` CSS Variables, transform 값(`translate(-76.748%,0%)` 같은 어색한 % 그대로), 클래스명까지 라이브 측정값. 단순 텍스트 설명(`"White 60% + Black 30%"`) 절대 금지

### 5-Round E2E 양 사이트 대조 방법론 (94.75% 달성 핵심)

각 라운드에서 **라이브와 보고서를 양쪽 동시에 Playwright로 띄우고** 비교한다. 한쪽만 측정 후 "확인했다"고 마킹하는 것은 검증이 아니다.

| 라운드 | 작업 |
|--------|------|
| **Round 1: 동시 스크린샷** | 라이브 N장 + 보고서 N장 = 양쪽 N개 섹션 페어 비교. 각 페어 일치율(%) 산정 |
| **Round 2: 차이점 즉시 수정** | Round 1에서 발견한 차이 (텍스트 크기/색상/레이아웃) 즉시 CSS 수정 |
| **Round 3: Computed Style 정량 채집** | 핵심 요소 12개+의 `fs/fw/color/w/h/bg/br/padding`를 라이브에서 채집 → 보고서 토큰 표와 1:1 대조 |
| **Round 4: Hover/Click 인터랙션** | `mcp__playwright__browser_hover` + getComputedStyle로 hover 상태 측정. 카드 자체 transform vs 페이지 전역 커서(.mouse-pointer)인지 식별 |
| **Round 5: 재측정 + 일치율 표** | Round 2 수정 후 다시 양 사이트 스크린샷, 일치율 비교 표를 `smooth-interaction-catalog`에 기록 |

각 라운드 끝에 `node scripts/validate.mjs` 통과 + 보고서 렌더 확인. 자기보고 텍스트 절대 금지.

### 정적 분석으로 놓치는 8가지 히든 패턴 (의도적 탐색)

미라셀 사례에서 정적 분석으로 잡히지 않아 5-Round 중 발견된 패턴. 신규 작업 시 **반드시 의도적으로 찾아본다**:

1. **Slot Machine Counter** — `.count-num-item` ul 안 0-9 셀이 세로 cycling. About 섹션 통계 (창립일·고객·특허) 등
2. **Quick FAB** — `.cm-quick-menu` 우하단 fixed 원형 (보통 60-90px). Contact us / Scroll-to-top 등
3. **Particle Network 배경** — Hero/Contact의 빨간 점+선 네트워크. radial-gradient 또는 canvas
4. **회전 SVG textPath** — `<svg><defs><path id='c'/></defs><textPath href='#c'>VIEW MORE…</textPath>` 형태로 원형 텍스트가 14s linear infinite 회전
5. **마퀴 무한 텍스트** — `.marquee .mar_ch` 에 `transform: translate(-76.748%, 0%)` 같은 어색한 % 값으로 끝없는 좌측 이동
6. **Splitting.js 글자별 fade-in** — `.cm-word-split-JS words chars splitting` 클래스 마커. 단어→글자 2단 분할 후 stagger 0.05s
7. **헤더 듀얼 로고 fade** — `<h1>` 안에 흰/검정 로고 PNG 두 장이 겹침. 스크롤 위치에 따라 opacity 토글
8. **마우스 추적 커스텀 커서** — `.mouse-pointer.active.is-moving.view` (position:fixed z:10000). Service/Product 카드 hover 시 `.view` 클래스 추가로 191/163 빨간 원형 + 회전 VIEW MORE 텍스트 표시. **카드 자체 hover가 아님**

### Mirror Mode 섹션 구조 권장 (페이지 흐름 순)

```
01. 개요 · 메인 페이지 전용 분석
02. 디자인 토큰 — :root CSS Variables 실측
03. 헤더 — Top Fixed Object
04. GNB + 풀스크린 사이트맵 (OPEN)
05. Hero (라이브 패턴 재현)
06-N. 미들 섹션들 (about / service / product / news / contact ...)
N+1. Footer
N+2. 타이포그래피 시스템
N+3. 컬러 시스템
N+4. 인터랙션 시스템 — Transition·Animation 통계
마지막. 부드러운 인터랙션 카탈로그 (5-Round 검증 결과 표 포함)
```

각 섹션 = (a) `kv` 토큰 표 + (b) `component` 라이브 프리뷰 + (c) `note` 정량 차이 3종 세트.

### 인프라 핵심 사항

**escapeHtml `"`/`'` escape 적용** (2026-05-22 수정). `assets/js/main.js`:

```js
function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  // textNode.innerHTML escapes <, >, & but NOT " or '
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```

이 수정 전에는 HTML 안 `class="..."` 같은 double-quote가 `data-html="..."` 속성을 깨뜨려 컴포넌트가 렌더되지 않았음. 현재는 single/double 양쪽 안전.

### Mirror Mode 작업 체크리스트 (이중 모드 표준)

```
[ ] 사용자 요청에 "100% 동일 / 정밀 재현 / 메인만 / 풀픽셀" → Mirror Mode 진입
[ ] 기존 analysis.json 백업 (analysis.backup.json)
[ ] crawledPages: 1, subpages 배열은 메인 1개만
[ ] :root CSS Variables 전수 추출 (document.styleSheets → CSSRule selectorText ':root')
[ ] 페이지 차원 (sH, sW, viewport) + 각 article/section 좌표(top/h) 정밀 측정
[ ] 8가지 히든 패턴 의도적 탐색 (Slot Counter / FAB / Particle / Rotating SVG / Marquee / Splitting / Dual Logo / Mouse Pointer)
[ ] 모든 섹션에 인라인 component 블록 1개+ 포함 (kv 표만 늘어놓기 금지)
[ ] 실제 이미지 CDN URL 직접 임베드
[ ] 5-Round E2E 양 사이트 대조 완료 (라이브 N장 + 보고서 N장 페어 비교)
[ ] **Tier-A 병행 작성 (Mirror Mode 표준)** — {id}-app/styles/globals.css + components/{id}/*.html 8개+
[ ] **각 인라인 component 직후에 block.preview URL을 가진 Tier-A 블록 추가**
[ ] Playwright로 Tier-A 모달 동작 검증 ([프리뷰 열기] → iframe 로드 → ESC 닫기)
[ ] 마지막 섹션에 5-Round 검증 결과 표 + 발견 패턴 정리 + Tier-A 일치율 명시
[ ] node scripts/validate.mjs 5 OK / 0 error 통과
```

## Flow Mode — 흐름 스케치 + 디테일 와이어프레임 (KT&G 2026-05-26 정립, v2)

### 핵심 원칙 6가지

1. **사용자 키워드 감지** — "흐름 스케치 / 와이어프레임 / 디자이너 컨셉 시안 / 디자인 시안" → Flow Mode 진입
2. **메인 + 모든 서브페이지** — GNB·footer로 접근 가능한 페이지 전수. 한 페이지도 누락 금지
3. **사이드바 페이지 일자 나열** — `system.json.references[]` 엔트리에 `flowMode: true` 플래그 + `sections` 배열 (페이지명 그대로 노출). 그룹화 X
4. **10단계 × 3캡처 정밀 스크롤** — 페이지마다 sY 0%·10%·…·100% (11 위치) × 즉시·+1s·+2s 3장 = **33장 viewport screenshot + computed-state 시계열 11 step**. fullPage 스크린샷 1장으로는 sticky·counter·animation·hover 동적 변화 못 잡음
5. **디테일 SVG 와이어프레임** — 라이브 y/h 좌표를 1400×{비례} SVG로 환산. **흑백/회색 톤만** (참고: uxplaybook.org Landing Page Formula). 손그림 필터·컬러 코드·Caveat 폰트 모두 금지. Pretendard / Inter sans-serif + 회색 placeholder + 검정 CTA
6. **인터랙션은 마커 + 풍선 주석** — 텍스트만 설명 X. 와이어프레임 위에 검정 작은 원 (16×16) + 번호 + 가는 검정 직선 화살표 + 좌측 텍스트 주석 (제목 진하게 + 본문 회색 2-3줄). 사용자가 "어디서 어떤 인터랙션이 발생하는지" 한 눈에 파악

### 작업 절차 (KT&G v2 표준)

1. **Playwright MCP로 사이트맵 추출** — 메인 navigate + GNB·footer 링크 일괄 수집 → 페이지 ID·한국어 라벨 매핑 작성
2. **`scripts/capture-{id}-v2.mjs` 작성·실행** — Node로 chromium headless 띄워 26 페이지 일괄 캡처 (13-15분). 페이지마다 `.playwright-mcp/{id}/v2/{page}/sNN-{ratio}pct-{a,b,c}.jpeg` + `timeline.json` + `meta.json`
3. **`scripts/generate-{id}-flow-v2.mjs` 작성·실행** — timeline·meta 읽어 페이지마다:
   - SVG 와이어프레임 생성 (회색 톤 + 컴포넌트별 mini wireframe + 페이지별 분류 `classifySection`)
   - timeline 시계열에서 인터랙션 자동 검출 (sticky position·active count·counter textContent·animation name·header bg 변화)
   - 페이지별 특수 패턴 자동 추가 (연혁 sticky 5시대 nav · 글로벌 네트워크 WebGL globe · 주요사업 sticky-sequence · 통계 카운터 · 미디어 라이브러리 필터 등)
   - 베이스라인 보장 (GNB sticky 헤더 등)으로 모든 페이지 마커 최소 4개 보장
4. **`scripts/register-{id}-flow.mjs`** — `system.json`에 `flowMode: true` 플래그 + sections 자동 등록
5. **로컬 서버 + Playwright로 26 페이지 spot check** — `node scripts/validate.mjs` 통과 후 `http://localhost:8080/#ref/{id}-flow/{page}` 전수 확인

### SVG 와이어프레임 스타일 가이드 (회색 톤 토큰)

```js
const GREY = {
  bg:        '#ffffff',  // 배경
  surface:   '#fafafa',  // 일반 박스
  surface2:  '#f4f4f5',  // 강조 박스 (KV·hero)
  ph:        '#e5e5e5',  // placeholder (이미지·플레이스홀더)
  border:    '#d4d4d4',  // 박스 테두리
  borderDim: '#e5e5e5',  // 부드러운 테두리
  line:      '#a3a3a3',  // 텍스트 라인 (회색 가로 바)
  text:      '#171717',  // 본 검정
  textSub:   '#525252',  // 회색 메타
  textHint:  '#737373',  // 더 옅은 보조
  accent:    '#171717'   // 강조 (CTA / active 버튼)
};
```

- 폰트: `'Pretendard', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`
- 마커: 검정 원 r=9 + 흰색 번호 + 가는 검정 직선 화살표 (`marker-end` 표준)
- 미니 컴포넌트: 회색 텍스트 라인 (h 6-8px) + 회색 이미지 영역 + 검정 CTA 버튼 (`bg #171717`, 라운드)
- 손그림 필터 (`feTurbulence` + `feDisplacementMap`) **절대 사용 금지**

### 인터랙션 마커 종류 (12종 + 페이지별 특수 패턴)

| KIND | 의미 | 검출 방법 |
|------|------|----------|
| `STICKY` | position:sticky/fixed | timeline의 sticky.pos === 'sticky'/'fixed' + top<100 |
| `ACTIVATE` | 스크롤 진입 시 .active 클래스 | step별 activeCount 변화 (+1 이상 증가) |
| `COUNTER` | 카운트업 / 슬롯머신 카운터 | counter.t 텍스트 변화 또는 `number-section-integer` 클래스 |
| `ANIMATION` | @keyframes CSS 애니메이션 | animEls의 animationName 첫 등장 |
| `HEADER` | 헤더 스크롤 반응 (bg/색 변화) | timeline의 header.bg 변화 |
| `SLIDER` | Swiper.js 슬라이더 | meta.ix.swiper > 0 또는 swiper-slide-active 활성 |
| `IFRAME` | 외부 차트/시세 iframe | meta.sections의 hasIframe === 1 |
| `HOVER` | 카드/버튼 호버 효과 | meta.ix.card > 3 또는 CTA 텍스트 다수 |
| `CLICK` | 탭·아코디언·페이지네이션 클릭 | meta.ix의 tab/accordion/pagin |
| `VIDEO` | KV 배경 비디오 자동재생 | meta.sections의 hasVid === 1 |
| `WEBGL` | Canvas WebGL 렌더 | meta.sections의 hasCan === 1 |
| `FORM` | 입력 폼 (focus·submit) | meta.ix의 form/input |

페이지별 특수 패턴 (자동 추가): GNB sticky 헤더 / 연혁 시대 nav / WebGL 지구본 / sticky-sequence 카드 / 통계 카운터 / 미디어 라이브러리 필터 / ESG 카드 hover / IR 라이브 ticker / 인사제도 거대 헤딩 진입 fade 등.

### Flow Mode 체크리스트

```
[ ] 사용자 요청에 "흐름 스케치 / 와이어프레임 / 디자이너 시안" → Flow Mode 진입
[ ] 사이트맵 추출 (메인 + GNB + footer 전수)
[ ] scripts/capture-{id}-v2.mjs 작성·실행 (10단계 × 3캡처 = 페이지당 33장)
[ ] scripts/generate-{id}-flow-v2.mjs 작성·실행 (회색 톤 SVG + 인터랙션 자동 검출)
[ ] system.json에 flowMode: true ref 등록 (페이지명 그대로 sections)
[ ] node scripts/validate.mjs 통과
[ ] 26 페이지 spot check (analysis.json fetch → 마커 수 검증, 최소 4개 보장)
[ ] 모든 페이지 #ref/{id}/{page} 직접 진입 시 정상 렌더 + 사이드바 active 하이라이트 작동
[ ] 손그림 필터·Caveat 폰트·컬러 코드 모두 제거 (참고 이미지 톤 일치)
[ ] .gitignore에 .playwright-mcp/ 추가 (캡처 jpeg 수백 장 git 추적 금지)
```

## Tier-A 아키텍처 — 별도 프로젝트 + 프리뷰 모달

### 이중 모드 동시 적용 (인라인 + Tier-A 모달) — 미라셀 2026-05-22 정립 표준

Mirror Mode에서 **인라인 component 블록을 그대로 두고 그 직후 Tier-A 프리뷰 블록을 추가**하는 것이 최선의 패턴. 두 가지가 보완 관계:

| 모드 | 사용 시점 | 일치율 | 디자이너 활용 |
|------|----------|-------|---------------|
| **인라인 component** | 보고서 스크롤 중 빠른 시각 확인 | 90-95% (컨테이너 비례 축소) | 한눈에 보고 토큰 확인 |
| **Tier-A 풀스크린 모달** | [프리뷰 열기] 클릭 — 라이브 정확 px | **100% 1:1** | HTML/CSS 그대로 복사·사용 |

작성 방식:

```json
"sections": {
  "hero": {
    "blocks": [
      { "type": "kv", "title": "Hero 토큰", "items": [...] },
      { "type": "component", "title": "Hero 인라인 프리뷰 (비례 축소)",
        "html": "...", "css": "..." },
      { "type": "note", "value": "원본 1080px 풀 높이..." },
      { "type": "component", "title": "Tier-A 풀스크린 프리뷰 — site-app/components/hero (라이브 정확 1080px)",
        "preview": "components/site/hero.html",
        "thumbBg": "#000",
        "thumbLabel": "Hero 1080px · 5컬럼 무한 스크롤 · 실 CDN 이미지" }
    ]
  }
}
```

### 언제 Tier-A를 적용하는가

**Mirror Mode 작업이면 기본적으로 모든 섹션에 Tier-A 동반 적용** (미라셀 2026-05-22 베스트 프랙티스). 다음 중 하나라도 해당되면 Tier-A는 **필수**:

- 라이브의 viewport 풀폭(1920px) / 풀높이(1080px) 섹션이 핵심
- `position: sticky` / `scroll-driven` / WebGL / Three.js / 라이브 ticker
- 보고서 컨테이너의 `overflow:hidden` 영향받는 sticky 패턴
- 디자이너가 HTML/CSS를 그대로 복사해 자기 프로젝트에 쓰고 싶어 함

### 별도 프로젝트 구조

라이브 사이트의 실제 기술 스택(Next.js + React / Vue + Nuxt / Vanilla JS)을 그대로 클론.

```
{site}-app/                          ← 라이브 사이트 클론
├── README.md                        ← 빌드 가이드
├── index.html                       ← Vanilla 또는 라이브 SSG 결과
├── components/                      ← 각 섹션 1:1 대응
│   ├── header.html
│   ├── hero.html
│   ├── about.html
│   └── ...
├── styles/
│   └── globals.css                  ← 디자인 토큰 (CSS Variables)
└── (선택) package.json + Next/React
```

빌드 명령 (Next.js 클론인 경우):
```bash
cd {site}-app && npm install && npm run export
```

### 정적 HTML preview (즉시 동작)

npm 빌드 없이도 즉시 동작하도록 `components/{site}/*.html` 단독 HTML 파일을 함께 만든다. 디자인 동일, 소스만 Vanilla.

```
components/{site}/
├── hero.html          ← 풀폭/풀높이 + 라이브 CDN 자산
├── about.html
├── service.html
├── product.html
├── news.html
├── contact.html
└── footer.html
```

### 보고서 모달 연결

`analysis.json`의 `component` 블록에 `preview` 필드만 추가하면 인라인 렌더 대신 프리뷰 카드 + 모달 버튼이 표시된다.

```json
{
  "type": "component",
  "title": "독립 컴포넌트: miracell-app/components/Hero",
  "preview": "components/miracell/hero.html",
  "thumbBg": "linear-gradient(135deg,#000,#dd0031)",
  "thumbLabel": "Hero #mainVisual — 5-Roller Montage 1080px"
}
```

버튼 클릭 → 96vw × 94vh 풀스크린 모달 (`assets/js/main.js`의 `openPreviewModal()`):
- 검정 헤더 + `PREVIEW` 청색 배지 + 컴포넌트 제목 + ↗ 새 탭 + × 닫기
- ESC / 배경 클릭 / × 모두 닫기
- iframe src clear on close (비디오 자동 중단)
- cubic-bezier(0.22,1,0.36,1) pop 애니메이션

### 라이브 정확한 px 사용 (100vh 금지)

라이브 사이트는 viewport와 무관한 고정 px. 보고서 컨테이너 안에서도 동일 px로 재현.

| 요소 | 라이브 정확 px | ❌ 금지 |
|---|---|---|
| Miracell #mainVisual | `1080px` | `100vh` |
| Miracell #mainAbout | `1512px` | `100vh` |
| Miracell #mainContact | `451px` | `auto` |
| 전체 페이지 sH | `7170px` | - |

채집 방법:
```js
JSON.stringify(Array.from(document.querySelectorAll('main > *, article')).map(el => ({
  cls: el.className.toString(),
  h: el.offsetHeight
})))
```

### Tier-A 작성 규칙

- 라이브 사이트의 정확한 클래스명 사용 (`.kv`, `.mainVisual`, `.main-about-wrap` 등 BEM 그대로)
- 라이브 실제 CDN 자산(`https://{site}/images/...`) 직접 임베드
- `styles/globals.css`에 `:root` CSS Variables 공통 정의
- `prefers-reduced-motion` 미디어 쿼리로 접근성 지원
- 인터랙션은 vanilla JS (IntersectionObserver / requestAnimationFrame)

### Tier-A 체크리스트 (이중 모드 동시 적용 기준)

```
[ ] {site}-app/ 프로젝트 생성 (라이브 기술 스택)
[ ] {site}-app/styles/globals.css 에 :root 디자인 토큰 + 폰트 import + 키프레임
[ ] components/{site}/*.html 정적 HTML 8개+ (각 섹션 1:1, 라이브 정확 px)
[ ] 모든 height를 라이브 정확한 px로 (100vh 금지) — Hero 1080, About 1512 등
[ ] 라이브 CDN 자산 직접 임베드 (https://{site}/images/...)
[ ] analysis.json 의 각 인라인 component 블록 직후에 Tier-A 블록 추가
    - `type: "component"` + `title: "Tier-A 풀스크린 프리뷰 — ..."` + `preview: "components/{site}/{section}.html"`
    - `thumbBg` (그라데이션 또는 색상) + `thumbLabel` (한 줄 요약)
[ ] 보고서 모달 동작 검증 (Playwright로 [프리뷰 열기] 클릭 → iframe 로드 → ESC/× 닫기)
[ ] {site}-app/README.md 에 디자이너 사용 가이드 + 라이브 ID/Class 매핑 표
[ ] 인라인(빠른 시각) + Tier-A 모달(100% 정확) 양쪽 모두 정상 동작 확인
```

## 컴포넌트 작성 규칙

### 클래스명 접두사로 사이트 구별

| 사이트 | 접두사 | 예시 |
|--------|--------|------|
| kdnavien | `kn-` | `kn-bn1`, `kn-md1` |
| miracell | `mr-` | `mr-hero`, `mr-about-h4`, `mr-fab` |
| asinsam | `ai-` | `ai-bt1` |
| plantym | `pm-` | `pm-bt1` |
| dcamp | `dc-` | `dc-bt1` |

### 인라인 component 블록 규칙

- `html` 안 인라인 스타일은 데모 컨테이너용으로만, 컴포넌트 자체는 클래스 기반 CSS
- 실 이미지 URL 그대로 임베드
- 색상은 토큰 hex (`#dd0031` 같은)
- 폰트는 라이브 실 폰트 (예: `'Pretendard', 'Outfit'`)
- `fullWidth: true` 옵션으로 풀폭 데모 가능

## 시그니처 컴포넌트 표기

사이트만의 독특한 패턴은 본문 안에서 🟢 emoji로 표시. **섹션 타이틀에는 절대 금지**.

```json
{ "title": "20. 시그니처 - Orbital Diagram",
  "blocks": [{"type":"kv","items":[{"label":"🟢 특징","value":"..."}]}] }
```

## 안전 / 보안

- `analysis.json` 사용자 텍스트는 모두 `escapeHtml()`을 거쳐 렌더링
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 자동 적용
- 컴포넌트 블록 HTML/CSS는 안전한 표준 마크업만. `<script>` 직접 삽입 금지(`js` 필드 사용)

## 컨벤션

### 파일 경로
- 단일 진입점: `index.html`
- 정적 자원: `assets/css/`, `assets/js/`
- 분석 데이터: `analyses/{id}/analysis.json`
- Tier-A 정적 HTML: `components/{id}/*.html`
- Tier-A 프로젝트: `{id}-app/`
- 스크립트: `scripts/` (validate.mjs, serve.ps1)

### 네이밍
- 분석 ID: `^[a-z0-9][a-z0-9-]*$` (영소문자 시작)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 색상: hex (`#RRGGBB` 또는 `#RRGGBBAA`)
- 섹션 번호: 두 자리 0-패드 (`01`, `02`, ..., `15`)
- 섹션 ID: kebab-case (`smooth-interaction-catalog`)

### 브라우저 호환
- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용

## 검증

```bash
node scripts/validate.mjs
```

기대 결과: `5 OK / 0 warn / 0 error`. JSON 스키마 검증일 뿐 시각·동작 검증은 별개.

### 시각·동작 검증 (별개 절차)
- `pwsh scripts/serve.ps1` 또는 Node 인라인 서버로 `http://localhost:8080/#ref/{id}` 띄움
- Playwright MCP로 라이브 ↔ 보고서 양 사이트 동시 스크린샷 + computed style 채집
- 5-Round E2E 대조 후 일치율 표를 `smooth-interaction-catalog`에 명시

## QA 안티패턴 (절대 금지)

- ❌ **"QA 확인 완료" 텍스트 자기보고** — 0% 가치. 정량 데이터 또는 스크린샷 비교만
- ❌ **`validate.mjs` 통과 = 시각·동작 검증으로 간주** — JSON 스키마 검증일 뿐
- ❌ **단일 스크린샷으로 sticky/scroll 동작 판정** — 시간축 비교 필수
- ❌ **라이브 사이트가 느리다고 점검 횟수 축소** — wait 5초 → 8~12초 늘리고 끝까지
- ❌ **보고서를 한 번도 로컬에서 렌더해 보지 않고 작성 종료**
- ❌ **클래스명에 `sticky/sequence/animation/counter/parallax` 키워드 보이는데 computed style 채집 생략**
- ❌ **OLD 보고서 데이터를 spot-check 없이 그대로 복사** — 사이트는 리뉴얼되었을 수 있음
- ❌ **라이브 단방향 또는 보고서 단방향 측정 후 "5회 대조 완료"라고 마킹** — 진정한 양방향 동시 비교만 인정

## 미라셀 Mirror Mode 사례 (2026-05-22 기준 — 최종)

| 항목 | 결과 |
|------|------|
| 작업 모드 | Mirror Mode (단일 페이지 100% 재현) |
| crawledPages / subpages | 1 / 1 (메인만, 서브페이지 27개 의도적 제외) |
| 섹션 수 | 15 |
| 인라인 component 블록 | 14개 |
| Tier-A 풀스크린 프리뷰 | 8개 (Header / Hero / About / Service / Product / News / Contact / Footer) |
| 발견 히든 패턴 | 8가지 모두 발견 (Slot Counter / Pencil FAB / Particle / 회전 SVG / Marquee / Splitting / 듀얼 로고 / **마우스 추적 커서**) |
| 5-Round E2E 일치율 | Round 1 87.5% → Round 5 94.75% (인라인) / Tier-A 모달 100% |
| Tier-A 자산 | `miracell-app/styles/globals.css` (24 변수) + `components/miracell/*.html` 8개 + 보고서 모달 연결 |
| 인프라 버그 수정 | escapeHtml `"`/`'` escape 추가 (다른 보고서에도 영향) |
| UI 개선 | 사이드바 접기 버튼 추가 + topbar 제거 |

**핵심 학습**: 인라인 단독으로는 보고서 컨테이너 안에 demo가 비례 축소되어 절대 픽셀 일치가 구조상 어려움. **이중 모드 (인라인 + Tier-A 모달)** 동시 적용으로 인라인 90-95% + Tier-A 100% 양쪽 충족. 디자인 토큰(폰트·color·radius·키프레임)은 양쪽 모두 100% 일치.

## KT&G Flow Mode 사례 (2026-05-26 기준 — v2 최종)

| 항목 | 결과 |
|------|------|
| 작업 모드 | Flow Mode v2 (흐름 스케치 + 디테일 와이어프레임) |
| 분석 ID | `ktng-com-flow` (기존 `ktng-com` Tier-A 보고서와 별도 ID로 병존) |
| crawledPages / sections | 26 / 27 (00 개요 + 01~26 페이지) |
| 사이드바 | `flowMode: true` 플래그로 26 페이지 일자 나열 (그룹화 X) |
| 캡처 데이터 | 26 × 33장 = **858장 viewport screenshot** (Playwright Node 직접 호출 13분) |
| 시계열 snapshot | 858 (26 × 11 step × 3 sub-frame) computed-state |
| 와이어프레임 | 페이지마다 1400×{비례} 디테일 SVG (회색 톤, Pretendard, mini wireframe 13종+) |
| 인터랙션 마커 | 페이지마다 4~9개 (평균 5.3개) — 12종 KIND + 페이지별 특수 패턴 8종 |
| 인프라 추가 | `assets/js/main.js`의 buildSidebar에 flowMode 분기 + route의 `#ref/{id}/{section}` 라우팅 부활 |
| CSS 추가 | `.sidebar-sublist` / `.sidebar-sub-link` 스타일 (페이지 단위 노출) |
| 스크립트 | `scripts/capture-ktng-v2.mjs` (일괄 캡처) + `scripts/generate-ktng-flow-v2.mjs` (와이어프레임 + 인터랙션 검출) + `scripts/register-ktng-flow.mjs` (system.json 등록) |
| 검증 | `node scripts/validate.mjs` 5 OK / 0 warn / 0 error, 26 페이지 사이드바 active 하이라이트·렌더 정상 |

**핵심 학습**:
- fullPage 스크린샷 1장으로는 sticky·counter·animation 동적 변화를 못 잡음. **10단계 × 3캡처 = 시계열 33장**으로만 라이브 인터랙션 정확 검출
- Playwright MCP는 도구 호출당 1 메시지라 페이지 26개에 비현실적. **동일 Playwright 패키지를 Node 직접 호출**로 일괄 처리 (13분에 858장)
- 와이어프레임 톤은 사용자 참고 이미지 (uxplaybook.org Landing Page Formula) 기반 **흑백/회색만**. 손그림 필터·컬러 코드·Caveat 폰트는 디자이너 시안에 부적합
- 인터랙션 검출은 단계별 computed-state 변화 자동 분석 + 페이지별 특수 패턴 (라이브 키워드 인벤토리 기반) 자동 추가로 모든 페이지 최소 4개 마커 보장

## 최종 베스트 프랙티스 요약 (미라셀 사례 후)

신규 Mirror Mode 작업 시 다음 순서를 그대로 따르면 일치율 95%+ + Tier-A 100% 보장.

1. **사용자 요청 키워드 감지** — "100% 동일 / 정밀 재현 / 메인만 / 풀픽셀" → Mirror Mode + Tier-A 기본 적용
2. **Playwright MCP 라이브 1차 측정** — `:root` 변수 전수 추출 + 페이지 차원(sH/sW) + 섹션별 좌표(top/h) + 8 히든 패턴 의도 탐색
3. **인라인 component 블록 작성** — `kv` 토큰 표 + `html`/`css` 페어 (10-15 섹션, demo 540px 정도로 비례 축소)
4. **5-Round E2E 양 사이트 대조** — Round 1 동시 스크린샷, Round 2 차이 수정, Round 3 computed style 채집, Round 4 hover 인터랙션, Round 5 최종 픽셀 확인
5. **Tier-A 동시 작성** — `{site}-app/styles/globals.css` + `components/{site}/*.html` 8개+ (라이브 정확 px, 100vh 금지)
6. **`block.preview` URL 추가** — 각 인라인 component 직후에 Tier-A 프리뷰 블록 (모달용)
7. **모달 동작 검증** — Playwright로 [프리뷰 열기] 클릭 → iframe 로드 → ESC 닫기 확인
8. **검증 표 기록** — `smooth-interaction-catalog`에 5-Round 결과 + 8 히든 패턴 + Tier-A 일치율 표
9. **`node scripts/validate.mjs` 통과** + 로컬 서버 렌더 확인 + 커밋·푸시

이 9단계를 거치면 디자이너가 (a) 보고서로 빠른 시각 학습 (b) Tier-A 모달로 정확한 픽셀 확인 (c) 정적 HTML 복사로 자기 프로젝트 즉시 적용 — 세 가지 모두 가능.

## 기여 절차

1. 분석 대상 URL 결정 → 슬러그 ID 생성 (예: `miracell`)
2. 작업 모드 결정: 일반 카탈로그 vs Mirror Mode (사용자 요청에 "100% / 정밀 / 메인만" 키워드 있으면 Mirror Mode)
3. Playwright MCP로 라이브 사이트 측정 (1차 패스, `:root` 변수 + 페이지 차원 + 섹션 좌표)
4. `analyses/{id}/analysis.json` 작성:
   - 일반: 30+ 섹션, 컴포넌트 라이브러리 중심
   - Mirror Mode: 10-15 섹션, `component` 비중 70%+ + 마지막은 `smooth-interaction-catalog`
   - 섹션 타이틀에 이모지 금지
5. `system.json.references[]` 엔트리 추가 + `counts.references` 갱신
6. Mirror Mode: **5-Round E2E 양 사이트 대조** → 일치율 표 기록 (라이브 N장 + 보고서 N장 페어 비교)
7. **Mirror Mode 기본으로 Tier-A 병행 적용**:
   - `{id}-app/styles/globals.css` 디자인 토큰 정의
   - `components/{id}/*.html` 정적 HTML 8개+ (라이브 정확 px, 100vh 금지)
   - 인라인 component 블록 직후에 `block.preview` URL을 가진 Tier-A 블록 추가
   - Playwright로 모달 동작 검증
8. `node scripts/validate.mjs` 통과 + 로컬 서버 렌더 확인 + Tier-A 모달 8개 클릭 검증
9. 커밋 메시지에 영향받은 계층 + 실측 수치 + 일치율 % + Tier-A 적용 여부 포함
