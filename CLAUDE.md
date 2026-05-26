# CLAUDE.md — 기여 가이드라인 (v2 Flow Mode 표준)

Web Reference Lab(웹 디자인 레퍼런스 연구소)에 변경을 가할 때 따라야 할 단일 합의 문서. 운영자(/DH)와 AI 코딩 에이전트가 공동 준수한다.

본 문서는 **KT&G 2026-05-26 v2 사례**를 기준으로 전면 재작성됐다. 종전 가이드(일반 카탈로그 / Mirror Mode / Tier-A)는 모두 폐기. 이 문서가 유일한 표준.

---

## 🚨 자동화 실행 프로토콜

AI 에이전트는 사용자의 반복 지시 없이도 다음 4대 원칙을 **무조건 자동 수행**한다.

1. **언어 100% 한국어** — 사고 과정·진행 보고·오류·최종 답변 전부
2. **채팅창 코드 금지** — 산출물은 파일 시스템에 직접 저장. 실행 가능한 형태로
3. **선 실측 후 코딩** — Playwright로 라이브 사이트의 `getComputedStyle`·`getBoundingClientRect` + 10단계 스크롤 시계열 실측 후 정량 표 보고, 그 데이터로만 코딩 시작
4. **자가 검증 루프 강제** — "확인했습니다" 텍스트 자기보고 금지. 보고서 렌더 결과를 Playwright로 다시 캡처해 라이브와 양 사이트 동시 대조. 오차 0으로 수렴했음을 표·스크린샷으로 증명 후 보고

---

## 프로젝트 개요

실제 운영 중인 웹사이트의 디자인 시스템을 디자이너용 **흐름 스케치 + 디테일 와이어프레임**으로 정리한 레퍼런스 카탈로그.

### 단일 작업 표준 — Flow Mode v2

| 항목 | 사양 |
|------|------|
| 분석 범위 | 메인 + GNB·footer로 접근 가능한 **모든** 서브페이지 전수 (1개도 누락 금지) |
| 사이드바 | `system.json.references[].flowMode: true` 플래그 → 페이지명 일자 나열 (그룹화 X) |
| 캡처 방식 | 페이지마다 10단계 스크롤 (sY 0%·10%·…·100%, 11 위치) × 즉시·+1s·+2s 3장 = **33장 viewport screenshot + computed-state 시계열 11 step** |
| 산출물 (페이지마다) | (1) 페이지 개요 텍스트 / (2) 라이브 채집 메타 표 / (3) **디테일 SVG 와이어프레임 + 인터랙션 마커 ①~⑫** / (4) 섹션 시퀀스 / (5) 인터랙션 카탈로그 / (6) 시계열 변화 표 / (7) 정량 메모 |
| 와이어프레임 스타일 | **흑백/회색 톤만**. Pretendard / Inter sans-serif. 손그림 필터·컬러 코드·Caveat 폰트 모두 금지 (참고 톤: uxplaybook.org Landing Page Formula) |
| 인터랙션 표현 | **마커 + 풍선 주석으로 시각화**. 텍스트만 설명하는 카탈로그는 금지 |

### 산출 위치

```
analyses/{site-id}/analysis.json              ← 보고서 데이터 (페이지 = 섹션)
analyses/{site-id}/sections-meta.json         ← system.json 등록용 메타
scripts/capture-{site-id}-v2.mjs              ← Playwright Node 일괄 캡처
scripts/generate-{site-id}-flow-v2.mjs        ← 와이어프레임 + 인터랙션 마커 생성
scripts/register-{site-id}-flow.mjs           ← system.json 자동 등록
.playwright-mcp/{site-id}/v2/{page}/*.jpeg    ← 캡처 858장+ (gitignore)
.playwright-mcp/{site-id}/v2/{page}/timeline.json + meta.json
```

---

## 절대 규칙

### 0. 측정 도구는 Playwright 1종 (Chrome MCP 사용 금지)

학습 데이터 추정·외부 캐시·WebFetch는 **사이트맵 URL 패턴 추정** 같은 보조 용도로만.

**케이스 A — Playwright MCP** (디버그·스팟 점검·페이지 5개 이하):

```
mcp__playwright__browser_navigate({ url })
mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_evaluate({ function: '() => { ... }' })
mcp__playwright__browser_take_screenshot({ filename })
```

**케이스 B — Playwright Node 직접 호출 (Flow Mode 표준, 페이지 10개 이상)**:

MCP는 도구 호출당 1 메시지라 26 페이지 × 33장 = 800+ 메시지로 비현실적. 동일 Playwright 패키지를 Node로 직접 호출해 1회 실행으로 일괄 처리. KT&G v2: 13분에 26 페이지 858장 + 시계열 858 snapshot.

```js
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const p of PAGES) {
  await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000); // 하이드레이션 + 인트로
  const sH = await page.evaluate(() => document.body.scrollHeight);
  for (let step = 0; step <= 10; step++) {                                 // 10단계
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.floor(sH * step / 10));
    await page.waitForTimeout(200);  await page.screenshot({ /* a 즉시 */ });
    await page.waitForTimeout(1000); await page.screenshot({ /* b +1s */ });
    await page.waitForTimeout(1000); await page.screenshot({ /* c +2s */ });
    timeline.push(await page.evaluate(COLLECT_FN));                        // computed state
  }
}
```

표준 구현체: `scripts/capture-ktng-v2.mjs` (전수 일괄) + `scripts/generate-ktng-flow-v2.mjs` (와이어프레임 + 인터랙션 자동 검출).

### 1. 메인 + 모든 서브페이지 전수

GNB·footer를 통해 접근 가능한 페이지는 **하나도 누락하지 않는다.** 사이드페이지·기타 정보 페이지·신고 폼·게시판 모두 포함.

KT&G 사례: 26 페이지 (메인 / 회사소개 4 / 투자정보 7 / 지속가능경영 5 / 미디어 3 / 인재채용 3 / 기타 3).

### 2. 사이드바 페이지명 일자 나열 (`flowMode: true`)

`system.json.references[]` 엔트리에 `flowMode: true` 플래그를 추가하면 `assets/js/main.js`의 `buildSidebar`가 `sections` 배열을 sub-link로 펼친다.

```json
{
  "id": "ktng-com-flow",
  "title": "KT&G (흐름 스케치 1호 v2)",
  "url": "https://www.ktng.com/",
  "date": "2026-05-26",
  "analysis": "analyses/ktng-com-flow/analysis.json",
  "pagesAnalyzed": 26,
  "flowMode": true,                                          ← 필수
  "sections": [
    { "id": "site-overview",       "num": "00", "title": "사이트 개요 · 읽기 가이드", "desc": "..." },
    { "id": "main",                "num": "01", "title": "메인페이지",               "desc": "..." },
    { "id": "about-introduction",  "num": "02", "title": "회사소개 - KT&G 소개",     "desc": "..." },
    ...
  ],
  "subpages": [ { "title": "...", "url": "..." }, ... ]
}
```

**그룹화 (회사소개 / 투자정보 ...) 금지**. 페이지명 그대로 일자 나열만.

`#ref/{site-id}/{page}` 직접 URL로 페이지 단독 진입 가능 (`route()`가 `parts[2]` 받아 `renderSection`).

### 3. 와이어프레임 스타일 — 흑백/회색 톤 + Pretendard

참고 톤: **uxplaybook.org Landing Page Formula** 같은 깔끔한 디자이너용 와이어프레임.

| 금지 | 사용 |
|------|------|
| Caveat / Comic Sans 손글씨 폰트 | `Pretendard, Inter, system-ui, sans-serif` |
| 손그림 displacement filter (`feTurbulence` + `feDisplacementMap`) | 정확한 직선 박스 |
| 컬러 코드 (검정 KV / 보라 sticky / 호박 iframe / 녹색 ESG …) | **회색 톤만** (강조는 검정 박스로만) |
| 빨강 원형 마커 + 핑크 풍선 + 점선 화살표 | 검정 작은 원 (r=9) + 좌측 텍스트 주석 + 가는 검정 직선 화살표 |

### 4. 인터랙션은 마커 + 풍선 주석 (텍스트만 설명 금지)

와이어프레임 위에 검정 작은 원 + 번호 + 가는 검정 직선 화살표가 좌측 텍스트 주석으로 연결.

좌측 주석 = (① · KIND) / 제목 진하게 / 본문 회색 2-3줄.

```
①  · STICKY              ← anno-kind (회색 작은 글씨, uppercase)
GNB 헤더 상단 sticky      ← anno-title (검정 진하게)
header — position:sticky  ← anno-body (회색 2-3줄)
top:0 z-index:100. 모든
페이지 공통. 스크롤 시작과
함께 viewport 상단에 고정.
```

---

## 보고서 데이터 모델

### analysis.json — 페이지 = 섹션

```json
{
  "id": "ktng-com-flow",
  "title": "KT&G (흐름 스케치 1호 v2)",
  "url": "https://www.ktng.com/",
  "date": "2026-05-26",
  "summary": "2-3 문단 — 사이트 정체성, 캡처 방식, 마커 자동 검출",
  "crawledPages": 26,
  "sections": {
    "site-overview": { "title": "00. 사이트 개요 · 읽기 가이드", "blocks": [...] },
    "main":          { "title": "01. 메인페이지",                  "blocks": [...] },
    "about-history": { "title": "03. 회사소개 - 연혁",             "blocks": [...] },
    ...
  }
}
```

### 페이지 섹션의 표준 7 블록 (Flow Mode v2)

```
[1] heading      — "페이지명 — 페이지 흐름 + 와이어프레임"
[2] text         — Playwright 캡처 방식·sH·섹션 수·transition·animation 요약
[3] component    — 디테일 SVG 와이어프레임 (fullWidth: true, html에 인라인 SVG)
[4] heading      — "인터랙션 카탈로그 (스케치 마커 ①②③④⑤…)"
    structure    — 각 마커 = { label: "①  ...", tag: "KIND", desc: "동작 설명" }
[5] kv           — 라이브 채집 메타 (경로·sH·섹션 수·transition·color 빈도·인터랙션 인벤토리)
[6] heading      — "스크롤 시계열 변화 (10단계 +1s 시점)"
    structure    — step 0~10 × (sY/sticky/active/keyframes/counter)
[7] note         — Playwright 직접 호출 + viewport + 하이드레이션 wait + 검출 로직 메모
```

### 블록 타입 (`assets/js/main.js`의 `renderBlock()`)

| 타입 | 용도 |
|------|------|
| `heading` | h2 헤딩 |
| `text` | 단락 텍스트 |
| `note` | i 아이콘 노트 (정량 데이터 전용) |
| `kv` | 키-값 리스트 (1/2/3 컬럼) |
| `structure` | 순번 + 라벨 + 태그 + 설명 (인터랙션 카탈로그·시계열 표) |
| `sitemap` | 부모 + 자식 그룹 (개요 섹션) |
| `stats` | 큰 숫자 카드 그리드 |
| `palette` / `typo` / `spacingScale` / `radiusScale` | 디자인 토큰 표 |
| `component` | HTML(SVG) 인라인 프리뷰 — Flow Mode의 와이어프레임 임베드 |

`component` 블록 html 필드에는 SVG를 그대로 임베드. `assets/js/main.js`의 `escapeHtml`이 `<`·`>`·`&`·`"`·`'` 모두 escape하므로 attribute 안전.

---

## Flow Mode 작업 절차 (5단계)

### Step 1 — 사이트맵 추출 (Playwright MCP)

메인 페이지 1회 navigate + GNB·footer 링크 일괄 수집. 페이지 ID·한국어 라벨 매핑 작성.

```js
mcp__playwright__browser_navigate({ url: 'https://www.{site}.com/' });
mcp__playwright__browser_wait_for({ time: 3 });
mcp__playwright__browser_evaluate({ function: `() => {
  const gnb = [];
  document.querySelectorAll('header nav a, header a, .gnb a').forEach(a => {
    const t = (a.textContent||'').trim();
    const h = a.getAttribute('href') || '';
    if (t && h && !h.startsWith('#') && !h.startsWith('javascript')) gnb.push({ t, h });
  });
  return { title: document.title, gnb };
}`});
```

페이지 26개 (KT&G) ~ 12-30개 정도가 일반 범위.

### Step 2 — Playwright Node 일괄 캡처 스크립트 작성·실행

`scripts/capture-{site-id}-v2.mjs` 작성. 표준 템플릿은 `scripts/capture-ktng-v2.mjs` 복제 + PAGES 배열 수정.

```bash
node scripts/capture-{site-id}-v2.mjs           # 전수 (13~15분)
node scripts/capture-{site-id}-v2.mjs 01-main   # 단일 페이지 디버그
```

산출: `.playwright-mcp/{site-id}/v2/{page}/sNN-{ratio}pct-{a,b,c}.jpeg` + `timeline.json` + `meta.json`.

### Step 3 — Generator 스크립트 작성·실행

`scripts/generate-{site-id}-flow-v2.mjs` 작성. 표준 구성:

1. `PAGES` 배열 (id + file + num + title + sidebarLabel)
2. `classifySection(section)` — 라이브 클래스명 → 컴포넌트 종류 식별 (예: `kv` → mainkv, `sticky-sequence` → sticky-seq, `network__overseas-webgl` → webgl-globe)
3. `renderMiniComponent(kind, x, y, w, h)` — 컴포넌트 종류별 mini wireframe (회색 placeholder + 검정 CTA + 회색 텍스트 라인)
4. `detectInteractions(timeline, meta, page)` — 인터랙션 자동 검출
5. `buildWireframeSVG(meta, timeline, interactions, page)` — SVG 합성
6. `buildPageSection(data, page)` — 7 블록 표준 작성
7. `buildOverviewSection(allData)` — 00 사이트 개요 + 읽기 가이드
8. `main()` — analysis.json + sections-meta.json 저장

```bash
node scripts/generate-{site-id}-flow-v2.mjs
```

### Step 4 — system.json 자동 등록 + validate

`scripts/register-{site-id}-flow.mjs` 작성 (KT&G `register-ktng-flow.mjs` 복제). `flowMode: true` 플래그 필수.

```bash
node scripts/register-{site-id}-flow.mjs
node scripts/validate.mjs                       # 5 OK / 0 warn / 0 error 통과 필수
```

### Step 5 — 로컬 서버 + Playwright spot check

```bash
powershell.exe -NoProfile -File scripts/serve.ps1   # Windows
# 또는 pwsh -File scripts/serve.ps1
```

Playwright MCP로 `http://localhost:8080/#ref/{site-id}-flow` 진입 → 사이드바 sub-link 수 검증 + 페이지별 마커 카운트.

```js
mcp__playwright__browser_evaluate({ function: `async () => {
  const res = await fetch('/analyses/{site-id}-flow/analysis.json');
  const data = await res.json();
  return Object.keys(data.sections).map(sid => ({
    sid, n: countInteractionMarkers(data.sections[sid])
  }));
}`});
```

모든 페이지 마커 **최소 4개 보장**. 부족하면 Step 3의 `detectInteractions`에 페이지 특수 패턴 추가.

---

## SVG 와이어프레임 스타일 가이드

### 회색 톤 토큰 (변경 금지)

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

### SVG 캔버스 사양

- viewBox: `0 0 1400 {비례}` — 라이브 sH에 비례
- 좌측 260px: 인터랙션 주석 영역
- 가운데 1100px: 와이어프레임
- 우측 40px: 스크롤 인디케이터 + sH 라벨
- 헤더 56px (GNB 고정)

### sH 비례 스케일 (자동)

```js
const RATIO = sH > 20000 ? 0.06 : sH > 10000 ? 0.10 : sH > 5000 ? 0.14 : 0.18;
```

매우 긴 페이지(연혁 27,250px / 라이브러리 28,263px)는 자동 압축.

### 미니 컴포넌트 헬퍼

```js
const line = (x, y, w, h = 6, color = GREY.ph) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${color}"/>`;
const cta  = (x, y, w, h = 26, label = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${GREY.accent}"/>${label ? `<text ...>${label}</text>` : ''}`;
const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${GREY.bg}" stroke="${GREY.borderDim}" stroke-width="1"/>`;
const img  = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${GREY.ph}"/>`;
```

이 4가지 헬퍼로 모든 컴포넌트(카드 그리드·리스트·슬라이더·카운터·지구본·게시판·아코디언 등)를 표현.

### 컴포넌트 종류별 미니 wireframe (KT&G 기준 30+종 분류)

`classifySection`에서 라이브 클래스명을 분류하면 `renderMiniComponent`가 적절한 mini wireframe 생성. 표준 종류:

```
mainkv / subkv / subheader / kvslider / sticky-seq / strategy
global-webgl / sustain-cards / sustain / news / invest / with
img-row / value / introduction-block
history-area / history-year / history-row / history-container
webgl-globe / list-block / board / iframe / accordion
stock-card / performance / rating-cards / event-list / image-cards
esg-cards / strategy-block / highlight / efforts / banner
esg-text / esg-library / ethics-header / ethics-block / policies
poster-grid / social-channels
people / value-section / benefit / career / value-cards / benefit-cards
job-list / job-card / recruit-process / cta / interview
inquiry / compliance-block / safety-board
container / unknown (default)
```

새 사이트 작성 시 `classifySection`에 해당 사이트 고유 클래스 패턴 추가 + `renderMiniComponent` switch에 새 종류 case 추가.

---

## 인터랙션 마커 12종 + 페이지별 특수 패턴

### 자동 검출 12종 KIND

| KIND | 의미 | 검출 방법 (timeline 시계열 분석) |
|------|------|----------|
| `STICKY` | position:sticky/fixed | sticky.pos === 'sticky'/'fixed' + top<100 |
| `ACTIVATE` | 스크롤 진입 시 .active 클래스 | step별 activeCount 증가 (+1 이상) |
| `COUNTER` | 카운트업 / 슬롯머신 카운터 | counter.t 변화 또는 `number-section-integer` 클래스 |
| `ANIMATION` | @keyframes CSS 애니메이션 | animEls의 animationName 첫 등장 |
| `HEADER` | 헤더 스크롤 반응 (bg/색 변화) | timeline의 header.bg 변화 |
| `SLIDER` | Swiper.js 슬라이더 | meta.ix.swiper > 0 또는 swiper-slide-active 활성 |
| `IFRAME` | 외부 차트/시세 iframe | meta.sections의 hasIframe === 1 |
| `HOVER` | 카드/버튼 호버 효과 | meta.ix.card > 3 또는 CTA 텍스트 다수 |
| `CLICK` | 탭·아코디언·페이지네이션·필터 클릭 | meta.ix의 tab/accordion/pagin/filter |
| `VIDEO` | KV 배경 비디오 자동재생 | meta.sections의 hasVid === 1 |
| `WEBGL` | Canvas WebGL 렌더 | meta.sections의 hasCan === 1 |
| `FORM` | 입력 폼 (focus·submit) | meta.ix의 form/input |

### 페이지별 특수 패턴 (자동 추가)

자동 검출이 못 잡는 페이지 고유 인터랙션은 메타 ix 키워드 기반으로 자동 추가. KT&G 기준 9종:

```
17a. 연혁: history>100 + year>30  → sticky 시대 nav + year-row IntersectionObserver fade
17b. 글로벌 네트워크: map>30 또는 globe → WebGL 인터랙티브 지구본
17c. 주요사업: sequence>50          → sticky-sequence 3 카드 시퀀스
17d. 통계 카운터: counter>5         → 통계 숫자 카드 카운트업
17e. 미디어 라이브러리: sH>20000 + card>100 → 연도별 필터 + lazy-load
17f. ESG (지속가능경영): tab>10    → ESG 카드 자세히보기 hover
17g. IR 개요                         → 실시간 ticker 라이브 시세
17h. 인사제도                        → PEOPLE/VALUE/BENEFIT/CAREER 거대 헤딩 진입 fade
17i. swiper-slide-active 다수        → 슬라이더 자동 인디케이터
```

### 베이스라인 마커 (모든 페이지 최소 4개 보장)

```
18a. GNB 헤더 sticky (모든 페이지 공통)
18b. PDF/파일 다운로드 (자료실·정책 페이지)
18c-i. 지배구조·윤리경영·고객문의·신고·기업가치 페이지별 베이스라인
```

자동 검출이 부족한 페이지에 베이스라인을 더해 **모든 페이지 마커 4개 이상** 유지.

---

## KT&G Flow Mode 사례 (2026-05-26)

| 항목 | 결과 |
|------|------|
| 분석 ID | `ktng-com-flow` |
| crawledPages / sections | 26 / 27 (00 개요 + 01~26 페이지) |
| 사이드바 | flowMode: true → 26 페이지 일자 나열 |
| 캡처 | 26 × 33장 = **858 viewport screenshot**, Playwright Node 직접 호출 13분 |
| 시계열 snapshot | 858 (26 × 11 step × 3 sub-frame) computed-state |
| 와이어프레임 | 페이지마다 1400×{비례} 디테일 SVG (회색 톤 + mini wireframe 30+종) |
| 인터랙션 마커 | 페이지마다 4~9개 (평균 5.3개) — 12종 KIND + 페이지별 특수 9종 + 베이스라인 보장 |
| analysis.json | 522 KB · 27 sections |
| validate | 5 OK / 0 warn / 0 error |

**구현 파일**:
- `scripts/capture-ktng-v2.mjs` — 일괄 캡처 (표준 구현체)
- `scripts/generate-ktng-flow-v2.mjs` — 와이어프레임 + 인터랙션 검출 (표준 구현체)
- `scripts/register-ktng-flow.mjs` — system.json 등록
- `analyses/ktng-com-flow/analysis.json` — 보고서 데이터
- `analyses/ktng-com-flow/sections-meta.json` — system.json 등록용

**시스템 인프라**:
- `assets/js/main.js` `buildSidebar` — `flowMode: true`면 ref.sections를 sub-link로 펼침
- `assets/js/main.js` `route` — `#ref/{id}/{section}` URL → `renderSection` 호출
- `assets/css/main.css` `.sidebar-sublist` / `.sidebar-sub-link` — 페이지 단위 스타일

---

## 신규 사이트 추가 절차

```
[ ] 분석 대상 URL 결정 → 슬러그 ID 생성 (예: miracell-flow, plantym-flow)
[ ] Step 1: Playwright MCP로 사이트맵 추출 (메인 navigate + GNB·footer 수집)
[ ] Step 2: scripts/capture-{id}-v2.mjs 작성 (capture-ktng-v2.mjs 복제 + PAGES 수정) + 실행 (13~15분)
[ ] Step 3: scripts/generate-{id}-flow-v2.mjs 작성 (generate-ktng-flow-v2.mjs 복제)
    [ ] PAGES 배열 (id + file + num + title + sidebarLabel)
    [ ] classifySection — 해당 사이트 고유 클래스 패턴 추가
    [ ] renderMiniComponent — 새 컴포넌트 종류 case 추가 (필요 시)
    [ ] detectInteractions — 페이지별 특수 패턴 추가
    [ ] node scripts/generate-{id}-flow-v2.mjs 실행
[ ] Step 4: scripts/register-{id}-flow.mjs 작성·실행 (system.json 등록, flowMode: true 필수)
[ ] node scripts/validate.mjs 통과 (5 OK / 0 warn / 0 error)
[ ] Step 5: 로컬 서버 + Playwright spot check
    [ ] 모든 페이지 #ref/{id}/{page} 직접 진입 시 정상 렌더 + 사이드바 active 하이라이트
    [ ] 페이지마다 인터랙션 마커 최소 4개 보장 확인
    [ ] 손그림 필터·Caveat 폰트·컬러 코드 모두 제거됐는지 시각 확인
[ ] .gitignore에 .playwright-mcp/ 포함 (캡처 jpeg 수백 장 git 추적 금지)
[ ] 의미 있는 단일 커밋 + push
```

---

## 검증

```bash
node scripts/validate.mjs
```

기대 결과: `5 OK / 0 warn / 0 error`. **JSON 스키마 검증일 뿐 시각·동작 검증은 별개.**

### 시각·동작 검증 (필수, validate.mjs로 대체 불가)

1. 로컬 서버 띄움
   - Windows: `powershell.exe -NoProfile -WindowStyle Hidden -File scripts/serve.ps1`
   - Unix: `pwsh -File scripts/serve.ps1` 또는 `python -m http.server 8080`
2. Playwright MCP로 모든 페이지 `#ref/{id}/{page}` 진입 → 와이어프레임 렌더 + 마커 카운트 + 시계열 표 확인
3. 분석 데이터를 fetch로 가져와 페이지마다 인터랙션 카탈로그 항목 수 검증 (최소 4개)
4. 라이브 사이트 ↔ 보고서 양 사이트 동시 비교 (선택 — Mirror 검증은 v2 표준이 아님)

---

## QA 안티패턴 (절대 금지)

- ❌ **"QA 확인 완료" 텍스트 자기보고** — 0% 가치. 정량 데이터 또는 스크린샷 비교만
- ❌ **`validate.mjs` 통과 = 시각·동작 검증으로 간주** — JSON 스키마 검증일 뿐
- ❌ **fullPage 스크린샷 1장으로 sticky·counter·animation 판정** — 10단계 × 3캡처 시계열 필수
- ❌ **MCP로 페이지 10개 이상 캡처 시도** — Playwright Node 직접 호출 사용
- ❌ **손그림 필터·Caveat 폰트·컬러 코드 사용** — 흑백/회색 + Pretendard만
- ❌ **인터랙션을 텍스트만으로 설명** — 와이어프레임 위 마커 + 풍선 주석 필수
- ❌ **사이드바에 페이지 그룹화 (회사소개 / 투자정보 ...)** — 페이지명 일자 나열만
- ❌ **`.playwright-mcp/` 폴더를 git에 추가** — `.gitignore`에 무조건 포함
- ❌ **사이트 응답 지연 시 점검 횟수 축소** — `wait` 4s→8-12s 늘리고 끝까지
- ❌ **자동 hook 자동 커밋으로 거대 jpeg push 시도** — 단일 의미 커밋으로 push

---

## 안전 / 보안

- `analysis.json`의 사용자 텍스트는 모두 `escapeHtml()`을 거쳐 렌더링됨
- `escapeHtml` (`assets/js/main.js`)이 `<`·`>`·`&`·`"`·`'` 모두 escape — attribute 안전
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 자동 적용
- `component` 블록 html 필드에는 안전한 SVG/HTML만. `<script>` 직접 삽입 금지

---

## 컨벤션

### 파일 경로

```
analyses/{id}-flow/analysis.json              ← 보고서 본문
analyses/{id}-flow/sections-meta.json         ← system.json 등록용
scripts/capture-{id}-v2.mjs                   ← Playwright Node 일괄 캡처
scripts/generate-{id}-flow-v2.mjs             ← 와이어프레임 생성기
scripts/register-{id}-flow.mjs                ← system.json 등록
.playwright-mcp/{id}/v2/{page}/*.jpeg         ← 캡처 (gitignore)
.playwright-mcp/{id}/v2/{page}/timeline.json
.playwright-mcp/{id}/v2/{page}/meta.json
```

### 네이밍

- 분석 ID: `^[a-z0-9][a-z0-9-]*$` (예: `ktng-com-flow`, `miracell-flow`)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 색상: hex (`#RRGGBB`)
- 섹션 번호: 두 자리 0-패드 (`00`, `01`, …)
- 섹션 ID: kebab-case (`main`, `about-history`, `sustain-overview`)

### 브라우저 호환

- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용

### git 운영

- `.playwright-mcp/` 폴더는 **무조건 .gitignore**
- 단일 의미 커밋으로 push. 자동 hook 자동 커밋이 ahead 누적되면 백업 + `git reset --hard origin/main` + 의미 파일 복원 + 단일 commit + push로 정리
- 커밋 메시지: `feat(ktng-flow): KT&G 흐름 스케치 1호 v2 — 디테일 와이어프레임 + 인터랙션 마커` 형태

---

## 기존 분석 변환 (구 방식 → Flow Mode v2)

기존에 작성된 분석들 (`kdnavien-co-kr`, `miracell`, `asinsam`, `plantym-com`, `dcamp-kr`, `hct-co-kr`, `glovis-net`, `ktng-com`)은 종전 가이드의 산출물. **그대로 유지하되 더 이상 권장 방식 아님.**

각 사이트를 Flow Mode v2로 변환할 때:

1. 별도 ID로 신규 작성 (예: `miracell` → `miracell-flow`). 기존 분석은 유지
2. 본 문서 "신규 사이트 추가 절차" 그대로 따름
3. `scripts/capture-{id}-v2.mjs` + `scripts/generate-{id}-flow-v2.mjs` + `scripts/register-{id}-flow.mjs` 3종 작성
4. 사용자 확인 후 기존 분석 폐기 결정 (그 시점에 `ktng-com` 등 Tier-A 프로젝트 폴더도 제거 가능)

---

## 작업 순서 요약 (한 줄 정리)

```
사이트맵 추출 → capture-v2.mjs 일괄 캡처 → generate-flow-v2.mjs 와이어프레임·마커 →
register-flow.mjs system.json 등록 → validate 통과 → 로컬 서버 + Playwright spot check →
.gitignore 확인 → 단일 의미 commit + push
```
