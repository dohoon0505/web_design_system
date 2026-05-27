# CLAUDE.md — 기여 가이드라인 (v4 인터랙션 카탈로그 + iframe 데모)

Web Reference Lab — 디자이너용 **인터랙션 애니메이션 카탈로그**. 한 카테고리(예: "스크롤 텍스트 로드") 안에 그 카테고리의 대표 패턴 N종을 Framer 마켓플레이스 스타일로 저장한다. 각 패턴은 **standalone HTML 페이지**(검정 배경 + Pretendard + 한국어 본문)로 작성되어 **iframe으로 임베드**되며, 작동 원리 + 코드 스니펫 + **사용 가이드** + **활용 추천**(히어로/랜딩/제품/포트폴리오) + 트레이드오프로 구성된다.

본 문서는 **2026-05-27 첫 카테고리(스크롤 텍스트 로드, 10 패턴 v2 — iframe 임베드)** 기준으로 작성. 이전 가이드(사이트 분석 Flow Mode v2, Mirror Mode, Tier-A, inline 데모 v1)는 모두 폐기. 이 문서가 유일한 표준.

---

## 🚨 자동화 실행 프로토콜

AI 에이전트는 사용자의 반복 지시 없이도 다음 4대 원칙을 **무조건 자동 수행**한다.

1. **언어 100% 한국어** — 사고 과정·진행 보고·오류·최종 답변 전부
2. **채팅창 코드 금지** — 산출물은 파일 시스템에 직접 저장. 실행 가능한 형태로
3. **선 실측 후 코딩** — Playwright로 참고 사이트(예: Framer 마켓플레이스)의 실측 데이터를 수집한 후 카탈로그 디자인/구조를 결정
4. **자가 검증 루프 강제** — "확인했습니다" 텍스트 자기보고 금지. preview_start로 로컬 서버 띄우고 모든 패턴 페이지를 직접 진입해 사이드바·라이브 데모·코드 스니펫 가시성·.on 클래스 부여까지 정량 검증

---

## 프로젝트 개요

실제 운영 중인 웹사이트 / Framer·GSAP·Codrops 등에서 발견되는 인터랙션 애니메이션 패턴을 디자이너용 카탈로그로 정리.

### 단일 작업 표준 — Category Mode v1

| 항목 | 사양 |
|------|------|
| 분석 단위 | 한 카테고리(예: 스크롤 텍스트 로드 / 호버 카드 / 가로 스크롤 / 패럴랙스 등) |
| 카테고리당 패턴 수 | 8~12종이 적정 (10종 권장) |
| 사이드바 | `system.json.references[].type === 'category'` 자동 분리 → "인터랙션 카탈로그" 그룹 위쪽 배치 |
| 펼침 | `categoryMode: true` 플래그 → 모든 패턴이 sub-link로 일자 나열 (사이트 분석의 flowMode와 동일 메커니즘 재활용) |
| 라이브 데모 | **standalone HTML 페이지를 iframe으로 임베드** (Framer 마켓플레이스 스타일). 검정 배경(#000) + Pretendard Variable + 한국어 본문 + ▶ 다시 재생 버튼 |
| 패턴마다 (15 블록) | 요약 + iframe 데모 + 작동 원리 + 정량 메타(KV) + 코드 스니펫 3개(HTML/CSS/JS) + **사용 가이드** + **활용 추천** 4건 + 트레이드오프 |
| 활용 추천 | 히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개 — 4가지 컨텍스트에 어떻게 적용할지 구체 사용처 |
| 디자인 톤 | 카탈로그 본문은 라이트 모드 + Pretendard. 라이브 데모 카드(다크 #0a0a0a) + 코드 블록(다크 #0a0a0a) + iframe 콘텐츠(검정 #000) |
| 참고 자료 | Framer 마켓플레이스 컴포넌트 페이지 (Inter 다크 톤 + iframe 라이브 데모 + H2 섹션 분할 구조) |

### 산출 위치

```
analyses/{category-id}/analysis.json          ← 보고서 데이터 (overview + N 패턴 섹션)
demos/{category-id}/{pattern-id}.html         ← standalone 라이브 데모 (검정 + 한국어 + Pretendard)
scripts/generate-{category-id}.mjs            ← 패턴 정의 → demos + analysis.json 동시 생성기
system.json                                   ← references[]에 type: 'category' 엔트리 추가
```

캡처 디렉토리(`.playwright-mcp/`)는 카탈로그 작업에선 임시 디버그 용도로만. git 추적 금지.

---

## 절대 규칙

### 0. 측정·검증 도구는 Playwright MCP 1종 (Chrome MCP 사용 금지)

**참고 사이트 실측 (카탈로그 디자인 결정 전):**
```
mcp__playwright__browser_navigate({ url })
mcp__playwright__browser_wait_for({ time: 4 })
mcp__playwright__browser_evaluate({ function: '() => ({ ... })', filename: 'temp.json' })
mcp__playwright__browser_close()
```

**자가 검증 (카탈로그 완성 후):**
```
mcp__Claude_Preview__preview_start({ name: 'web-reference-lab' })
mcp__Claude_Preview__preview_eval({ serverId, expression: '(async()=>{ location.hash="..."; await new Promise(r=>setTimeout(r,2500)); return {...}; })()' })
mcp__Claude_Preview__preview_screenshot({ serverId })
mcp__Claude_Preview__preview_stop({ serverId })
```

**Preview 환경의 한계** — Claude Preview는 headless로 `document.visibilityState === 'hidden'` 상태가 될 수 있어, CSS transition·requestAnimationFrame이 정상 동작 안 할 수 있다. 자가 검증은 정량 가능한 영역까지(JS 실행 확인, .on 클래스 부여, CSS rule 적용, DOM 구조)만. transition 시각 효과는 실제 사용자 브라우저(visible)에서 검증된다고 신뢰.

### 1. references[].type = 'category' 패러다임

`system.json`의 references 배열에 카테고리 엔트리:

```json
{
  "id": "scroll-text-reveal",
  "title": "스크롤 텍스트 로드",
  "type": "category",
  "categoryMode": true,
  "date": "2026-05-27",
  "analysis": "analyses/scroll-text-reveal/analysis.json",
  "patternCount": 10,
  "sections": [
    { "id": "overview",         "num": "00", "title": "카테고리 개요",        "desc": "..." },
    { "id": "word-fade",        "num": "01", "title": "단어별 페이드 인",     "desc": "..." },
    { "id": "line-slide",       "num": "02", "title": "줄별 슬라이드 업",     "desc": "..." }
  ]
}
```

- `type: 'category'` → `assets/js/main.js`의 `buildSidebar`가 자동으로 별도 "인터랙션 카탈로그" 그룹으로 분리. 일반 사이트 분석 references(type !== 'category')는 기존 "레퍼런스 보고서" 그룹.
- `categoryMode: true` → `flowMode`와 동일 메커니즘으로 모든 sections를 사이드바 sub-link로 일자 펼침.
- URL: `#ref/{category-id}` → overview / `#ref/{category-id}/{pattern-id}` → 단일 패턴 페이지

### 2. 패턴 섹션의 표준 15 블록

```
[1]  text       — 한 줄 인터랙션 의도 요약
[2]  heading    — "라이브 데모"
[3]  component  — embed: 'demos/{category-id}/{pattern-id}.html' (iframe 임베드)
                  embedHeight 옵션 (기본 480, 시그니처 sticky 패턴은 560)
                  embedLabel 옵션 (예: "01 · 단어별 페이드 인")
[4]  heading    — "작동 원리"
[5]  text       — 1~2 문단으로 메커니즘 설명
[6]  kv         — columns: 2. 의존성·트리거·이징·간격·시간·권장 글자 수 등 6항목
[7]  heading    — "코드 스니펫"
[8]  code       — lang: 'HTML'. snippetHTML (boilerplate 제외한 핵심만)
[9]  code       — lang: 'CSS'.  snippetCSS
[10] code       — lang: 'JS'.   snippetJS
[11] heading    — "사용 가이드"
[12] text       — 어떻게 사용하나 (길이·이징·접근성·주의점 1~2문단)
[13] heading    — "활용 추천"
[14] structure  — 4건 고정: 히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개
[15] note       — 트레이드오프 (성능 / 접근성 / 권장 사용처)
```

### 3. standalone 라이브 데모 HTML 규칙

각 패턴은 `demos/{category-id}/{pattern-id}.html`에 **자급자족 HTML 페이지**로 작성. iframe 임베드 시 부모 페이지와 완전히 격리.

**표준 페이지 구조** (generator의 `buildDemoHTML(p)` 참고):
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{num}. {title} — Live Demo</title>
  <link href=".../pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <style>
    body { background: #000; color: #fff;
           font-family: "Pretendard Variable", "Pretendard", system-ui; }
    .demo-controls { position: fixed; top: 16px; left: 16px; z-index: 10; }
    .demo-replay { /* 좌상단 ▶ 다시 재생 pill 버튼 */ }
    .demo-label  { /* "{num} · {title}" 라벨 */ }
    {patternCSS}   /* .reveal { ... } 패턴별 */
  </style>
</head>
<body>
  <div class="demo-controls">
    <button class="demo-replay" onclick="window.__replay && window.__replay()">▶ 다시 재생</button>
    <span class="demo-label">{num} · {title}</span>
  </div>
  {patternBodyHTML}   <!-- .stage > .reveal -->
  <script>
    {patternJS}       /* function play(){...} ; window.__replay = play; play(); */
  </script>
</body>
</html>
```

**JS 패턴 (standalone 페이지 안)**:
```js
var el = document.querySelector(".reveal");
function play(){
  /* ... 인터랙션 실행 ... */
}
window.__replay = play;   // ▶ 다시 재생 버튼이 이걸 호출
play();                   // 페이지 로드 시 자동 1회 재생
```

**`requestAnimationFrame` 회피** — 미리보기/headless 환경에서 안 떨어지는 케이스가 있어, `.on` 클래스 토글에는 `setTimeout(fn, 50)` 사용. 단, 스크럽 같은 frame-by-frame 애니메이션에는 `window.addEventListener('scroll', ...)` 또는 `setInterval(fn, 33)` 사용.

**시그니처 sticky 패턴 (scrub-color)** — `position: sticky` + 부모에 `.spacer { height: 60vh }`를 위·아래에 두어 스크롤 공간을 만들고, `window.addEventListener('scroll', ...)`로 진행률(0~1) → 단어 인덱스 매핑. iframe height는 480 대신 560으로 늘림.

### 4. 코드 블록 타입 (`code`)

`main.js`의 `renderBlock`에 `code` 타입. `lang` (HTML/CSS/JS), `title`, `value` 필드. 다크 톤(#0a0a0a 배경)으로 코드를 보여줌. `escapeHtml`로 안전.

### 5. iframe 임베드 블록 (`component` + `embed`)

`main.js`의 `renderComponent`에 `embed` 옵션. inline iframe 임베드 (modal 형태인 `preview`와 구분).

```json
{
  "type": "component",
  "embed": "demos/scroll-text-reveal/word-fade.html",
  "embedHeight": 480,
  "embedLabel": "01 · 단어별 페이드 인",
  "title": "단어별 페이드 인 라이브 데모"
}
```

렌더링 결과 (Framer 마켓플레이스 스타일):
- 검정 카드 (#0a0a0a) + 둥근 모서리 + 어두운 테두리
- 상단 바: 🟢 LIVE DEMO 펄스 라벨 + embedLabel + [새 탭] 아이콘 버튼
- viewport: 검정 배경 iframe (height = embedHeight)

CSS 클래스: `.blk-iframe-card`, `.blk-iframe-bar`, `.blk-iframe-pill`, `.blk-iframe-viewport`, `.blk-iframe-frame`.

---

## 카테고리 작업 절차 (5단계)

### Step 1 — 참고 사이트 실측

대표 패턴이 있는 사이트(Framer 마켓플레이스, GSAP, Codrops, Awwwards) 1~2건을 Playwright MCP로 navigate + 정량 데이터 수집. 페이지 톤(다크/라이트), 폰트, 섹션 구조 파악.

실측 후 임시 파일은 삭제.

### Step 2 — 패턴 8~12종 정의

카테고리에 들어갈 대표 패턴 목록을 결정. 각 패턴은:
- 인터랙션 의도가 명확히 구별
- 의존성(CSS only / Vanilla JS / GSAP)이 분명
- 라이브 사용 사례가 3건 이상 존재

스크롤 텍스트 로드 카테고리 사례 (10종):
1. 단어별 페이드 인 (word-fade)
2. 줄별 슬라이드 업 (line-slide)
3. 글자별 stagger (char-stagger)
4. 블러 해제 (blur-reveal)
5. 회색 → 본 색 (color-fade)
6. 스크롤 스크럽 컬러 (scrub-color)
7. 가로 마스크 스윕 (mask-sweep)
8. 글자 폭포 (letter-cascade)
9. Variable Font 변형 (variable-morph)
10. 밑줄 동반 진입 (underline-reveal)

### Step 3 — Generator 스크립트 작성

`scripts/generate-{category-id}.mjs`를 작성. 표준 구성 (`scripts/generate-scroll-text-reveal.mjs` 참고):

1. `CATEGORY` 메타 (id, title, type, date, url, summary)
2. `PATTERNS` 배열 — 각 패턴마다:
   - 메타: `id, num, title, summary`
   - **데모**: `demo: { bodyHTML, css, js, height }` (standalone 페이지 핵심부)
   - **코드 스니펫**: `snippetHTML, snippetCSS, snippetJS` (boilerplate 제외)
   - 분석: `explain, kv` (6항목)
   - **가이드**: `guide` (사용 방법 1~2문단)
   - **활용 추천**: `recommendations[4]` (히어로/랜딩/제품/포트폴리오 4건 고정)
   - **트레이드오프**: `tradeoff`
3. `buildDemoHTML(p)` — standalone HTML 페이지 생성 (검정 + Pretendard + ▶ 다시 재생 + 패턴 콘텐츠)
4. `buildPatternSection(p)` — 표준 15 블록 자동 생성
5. `buildOverview()` — 00 카테고리 개요 (인덱스 + 공통 토큰 + 읽기 가이드)
6. `main()` — demos/{id}/*.html 10개 저장 + analysis.json 저장

```bash
node scripts/generate-{category-id}.mjs
```

### Step 4 — system.json 등록 + validate

references[]에 type:'category' 엔트리 추가. `validate.mjs`는 `type: 'category'` 엔트리에 대해 `url` 필드를 옵셔널로 처리.

```bash
node scripts/validate.mjs                       # 5 OK / 0 warn / 0 error 통과 필수
```

### Step 5 — preview_start + 자가 검증

검증 항목:
1. 사이드바 "인터랙션 카탈로그" 그룹 자동 생성 + 메인 링크 + N+1 sub-link
2. 모든 패턴 페이지 `#ref/{category-id}/{pattern-id}` 직접 진입 시 정상 렌더
3. demos/{id}/{pattern}.html 직접 fetch 200 + 한국어 본문 + Pretendard + ▶ 다시 재생 포함
4. iframe 카드 렌더링 (LIVE DEMO pill + 새 탭 버튼 + iframe height 480~560)
5. 5개 헤딩 표시: 라이브 데모 / 작동 원리 / 코드 스니펫 / 사용 가이드 / 활용 추천
6. 활용 추천 structure 4건 (히어로 / 랜딩 / 제품 / 포트폴리오)
7. 코드 블록 3개 (HTML/CSS/JS) 다크 톤 정상 표시

Transition 시각 효과는 preview 환경의 `visibility: hidden` 한계로 검증 불가. 실제 사용자 브라우저(visible)에서 정상 작동한다고 신뢰.

---

## 데이터 모델 (analysis.json)

```json
{
  "id": "scroll-text-reveal",
  "title": "스크롤 텍스트 로드",
  "type": "category",
  "url": "https://www.framer.com/marketplace/components/text-reveal/",
  "date": "2026-05-27",
  "summary": "텍스트가 viewport에 진입할 때 어떻게 시각적으로 드러나는가...",
  "patternCount": 10,
  "sections": {
    "overview":       { "title": "00. 카테고리 개요", "blocks": [] },
    "word-fade":      { "title": "01. 단어별 페이드 인", "blocks": [] }
  }
}
```

### 블록 타입 (`assets/js/main.js`의 `renderBlock()`)

| 타입 | 용도 |
|------|------|
| `heading` | h2 헤딩 |
| `text` | 단락 텍스트 |
| `note` | i 아이콘 노트 — 트레이드오프 메모 |
| `kv` | 키-값 리스트 (`columns: 2` 권장) |
| `structure` | 순번 + 라벨 + 태그 + 설명 — 사용 사례·인덱스 |
| `component` | 라이브 데모 — `fullWidth: true`, `html`/`css`/`js` 필드 |
| `code` | 코드 스니펫 — `lang`, `title`, `value` 필드. 다크 톤 |
| `palette` / `typo` / `spacingScale` / `radiusScale` | 디자인 토큰 (잘 안 쓰지만 호환) |

---

## 핵심 인프라 파일

| 파일 | 역할 |
|------|------|
| `index.html` | 사이드바 + 메인 컨테이너 + 홈 섹션 |
| `assets/js/main.js` | 라우터(`#ref/{id}/{section}`) + `buildSidebar`(categories vs sites 자동 분리) + `renderBlock`(code 포함) + `activateComponents`(IO 진입 시 라이브 데모 JS 실행) |
| `assets/css/main.css` | 사이드바 + 블록 스타일 + `.blk-component-preview > [class*="demo-"]` 자동 박스 + `.blk-code` 다크 톤 |
| `system.json` | 단일 진입점. analysisSections + references[](type별 분리) + counts |
| `scripts/validate.mjs` | 5 OK / 0 warn / 0 error 검증. type='category'는 url 옵셔널 |

---

## 첫 카테고리 사례: 스크롤 텍스트 로드 (2026-05-27, v2 iframe 임베드)

| 항목 | 결과 |
|------|------|
| 카테고리 ID | `scroll-text-reveal` |
| 패턴 수 | 10 (word-fade, line-slide, char-stagger, blur-reveal, color-fade, scrub-color, mask-sweep, letter-cascade, variable-morph, underline-reveal) |
| 섹션 수 | 11 (00 overview + 01~10 패턴) |
| 블록 수 | 159 (각 패턴 15 블록 × 10 + overview 9) |
| standalone 데모 | 10개 (`demos/scroll-text-reveal/*.html`, 평균 3.5KB) |
| 데모 콘텐츠 | 한국어 (Framer 영문 본문의 한국어 의역) + Pretendard Variable |
| 사이드바 | 카테고리 그룹 + 11 sub-link 자동 펼침 |
| 참고 자료 | Framer 마켓플레이스 "Text Reveal" 컴포넌트 (https://www.framer.com/marketplace/components/text-reveal/) |
| validate | 5 OK / 0 warn / 0 error |

**구현 파일**:
- `scripts/generate-scroll-text-reveal.mjs` — 표준 generator (demos + analysis.json 동시 생성)
- `analyses/scroll-text-reveal/analysis.json` — 카탈로그 데이터 본문
- `demos/scroll-text-reveal/*.html` — 10개 standalone 라이브 데모 페이지
- `system.json` references[]에 type: 'category' 엔트리 1개

---

## 신규 카테고리 추가 절차

```
[ ] 카테고리 슬러그 ID 결정 (예: hover-card-tilt, horizontal-scroll, parallax-layer)
[ ] Step 1: 대표 사이트 1~2건 Playwright 실측 (디자인 톤 / 폰트 / 섹션 구조)
[ ] Step 2: 패턴 8~12종 정의 (id, num, title, summary)
[ ] Step 3: scripts/generate-{category-id}.mjs 작성
    [ ] CATEGORY 메타 (id, title, type, date, url, summary)
    [ ] PATTERNS 배열 — 각 패턴: id, num, title, summary, demo{bodyHTML,css,js,height}, snippetHTML/CSS/JS, explain, kv[6], guide, recommendations[4], tradeoff
    [ ] buildDemoHTML(p) — standalone 페이지 boilerplate
    [ ] buildPatternSection(p) — 표준 15 블록
    [ ] buildOverview() — 00 카테고리 개요
    [ ] main() — demos/*.html 저장 + analysis.json 저장
    [ ] node scripts/generate-{category-id}.mjs 실행
[ ] Step 4: system.json references[]에 type:'category' 엔트리 추가
    [ ] node scripts/validate.mjs 통과 (5 OK / 0 warn / 0 error)
[ ] Step 5: preview_start + Playwright 자가 검증
    [ ] 사이드바 카테고리 그룹 + N+1 sub-link 확인
    [ ] 각 패턴 페이지 진입 + iframe 카드 + LIVE DEMO pill + 새 탭 버튼
    [ ] demos/{id}/*.html 직접 fetch 200 + 한국어 본문
    [ ] 5개 헤딩 (라이브 데모 / 작동 원리 / 코드 스니펫 / 사용 가이드 / 활용 추천)
    [ ] 활용 추천 structure 4건 (히어로/랜딩/제품/포트폴리오)
[ ] 의미 있는 단일 커밋 + push
```

---

## QA 안티패턴 (절대 금지)

- ❌ **"QA 확인 완료" 텍스트 자기보고** — 정량 데이터 또는 스크린샷 비교만
- ❌ **`validate.mjs` 통과 = 자가 검증으로 간주** — JSON 스키마 검증일 뿐
- ❌ **standalone 데모 HTML에서 외부 의존성(jQuery, GSAP 등) 사용** — 가능한 한 Vanilla. GSAP가 본질인 패턴은 코드 스니펫에서만 (CDN 임포트는 demo 페이지에서 직접)
- ❌ **데모 JS에 `requestAnimationFrame` 의존** — preview 환경에서 안 떨어질 수 있음. `setTimeout` 또는 `setInterval` 사용. scrub은 scroll 이벤트
- ❌ **▶ 다시 재생 버튼 누락** — 사용자가 재생 못함. 모든 데모 HTML에 `.demo-replay` + `window.__replay` 함수 노출
- ❌ **standalone 데모 페이지에 한국어 본문 누락** — Framer는 영문이지만 우리 카탈로그는 한국어 본문이 표준
- ❌ **사이드바에 카테고리·사이트 그룹 수동 추가** — `buildSidebar`가 `type` 필드로 자동 분리
- ❌ **`.playwright-mcp/` 폴더를 git에 추가** — `.gitignore`에 무조건 포함
- ❌ **자동 hook 자동 커밋으로 거대 임시 파일 push** — 단일 의미 커밋으로 push

---

## 안전 / 보안

- `analysis.json`의 모든 사용자 텍스트는 `escapeHtml()`을 거쳐 렌더링됨
- `escapeHtml`은 `<`·`>`·`&`·`"`·`'` 모두 escape — attribute 안전
- `component` 블록의 `html`/`css`/`js` 필드 + `code` 블록의 `value` 필드는 attribute에 들어갔다가 풀려나옴
- `<script>` 직접 삽입 금지 — JS는 반드시 `js` 필드를 통해

---

## 컨벤션

### 파일 경로

```
analyses/{category-id}/analysis.json          ← 보고서 본문
scripts/generate-{category-id}.mjs            ← 패턴 정의 + 생성기
```

### 네이밍

- 카테고리 ID: `^[a-z0-9][a-z0-9-]*$` (예: `scroll-text-reveal`, `hover-card-tilt`)
- 패턴 ID: kebab-case (예: `word-fade`, `line-slide`)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 섹션 번호: 두 자리 0-패드 (`00`, `01`, …)

### 브라우저 호환

- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용
- `background-clip: text` 사용 시 `-webkit-` prefix 필수 (iOS Safari)
- Variable font 사용 시 `font-variation-settings` + `font-weight` 둘 다 적어주기 (폴백)

### git 운영

- `.playwright-mcp/` 폴더는 **무조건 .gitignore**
- 단일 의미 커밋으로 push. 자동 hook 자동 커밋이 누적되면 백업 + `git reset --hard origin/main` + 의미 파일 복원 + 단일 commit + push로 정리
- 커밋 메시지: `feat(scroll-text-reveal): 스크롤 텍스트 로드 카테고리 v1 — 10 패턴 라이브 데모 + 코드 스니펫` 형태

---

## 작업 순서 요약 (한 줄 정리)

```
참고 사이트 실측 → 패턴 8-12종 정의 → generate-{id}.mjs 작성 →
system.json references[]에 type:'category' 등록 → validate 통과 →
preview_start + 자가 검증 → 단일 의미 commit + push
```
