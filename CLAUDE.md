# CLAUDE.md — 기여 가이드라인 (v3 인터랙션 카탈로그)

Web Reference Lab — 디자이너용 **인터랙션 애니메이션 카탈로그**. 한 카테고리(예: "스크롤 텍스트 로드") 안에 그 카테고리의 대표 패턴 N종을 디자인 시스템 형태로 저장한다. 각 패턴은 카드 안에서 실제로 동작하는 라이브 데모 + 분석 + 코드 스니펫 + 라이브 사용 사례 + 트레이드오프로 구성된다.

본 문서는 **2026-05-27 첫 카테고리(스크롤 텍스트 로드, 10 패턴)** 기준으로 작성. 이전 가이드(사이트 분석 Flow Mode v2, Mirror Mode, Tier-A)는 모두 폐기. 이 문서가 유일한 표준.

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
| 패턴마다 | 라이브 데모(HTML/CSS/JS) + 작동 원리 + 정량 메타(KV) + 코드 스니펫 3개(HTML/CSS/JS) + 라이브 사용 사례 + 트레이드오프 |
| 디자인 톤 | 흑백 + Pretendard. 데모 박스 흰 배경 + 검정 텍스트. 코드 블록만 다크(#0a0a0a) |
| 참고 자료 | Framer 마켓플레이스 컴포넌트 페이지 (Inter 다크 톤 + iframe 라이브 데모 + H2 섹션 분할 구조) |

### 산출 위치

```
analyses/{category-id}/analysis.json          ← 보고서 데이터 (overview + N 패턴 섹션)
scripts/generate-{category-id}.mjs            ← 패턴 정의 → analysis.json 생성기
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

### 2. 패턴 섹션의 표준 13 블록

```
[1]  text       — 한 줄 인터랙션 의도 요약
[2]  heading    — "라이브 데모"
[3]  component  — fullWidth: true. .demo-{pattern-id} 박스 안에서 실제 동작 (HTML + CSS + JS)
[4]  heading    — "작동 원리"
[5]  text       — 1~2 문단으로 메커니즘 설명
[6]  kv         — columns: 2. 의존성·트리거·이징·간격·시간·권장 글자 수 등 6항목
[7]  heading    — "코드 스니펫"
[8]  code       — lang: 'HTML'. html field 그대로
[9]  code       — lang: 'CSS'.  css field 그대로
[10] code       — lang: 'JS'.   js field 그대로
[11] heading    — "라이브 사용 사례"
[12] structure  — 3~4건의 (사이트, 사용 부위, 어떻게 활용했나)
[13] note       — 트레이드오프 (성능 / 접근성 / 권장 사용처)
```

### 3. 라이브 데모 박스 격리 규칙

**클래스 prefix `demo-{pattern-id}`** 로 자체 격리. CSS 셀렉터는 `.demo-{pattern-id}` 또는 그 자식만. 글로벌 selector(`p { ... }`, `button { ... }`) 절대 금지.

**자동 박스 스타일링** (`assets/css/main.css`):
```css
.blk-component-preview > [class^="demo-"],
.blk-component-preview > [class*=" demo-"] {
  position: relative;
  min-height: 220px;
  padding: 56px 32px 40px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 24px;
  background: var(--sm-surface-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}
```

데모 박스에 `.demo-*` 클래스만 부여하면 자동으로 220px min-height + 패딩 + 가운데 정렬.

**▶ 다시 재생 버튼** — 모든 데모 HTML에 첫 자식으로 `<button class="pattern-replay" type="button">▶ 다시 재생</button>` 포함. CSS는 박스 좌상단(`position: absolute; top:12; left:12`) 자동 배치.

**JS 패턴**:
```js
(function(){
  var box = document.querySelector(".demo-{id}");
  if (!box) return;
  function play(){
    /* ... 인터랙션 실행 ... */
  }
  play();
  box.querySelector(".pattern-replay").addEventListener("click", play);
})();
```

**`requestAnimationFrame` 회피** — 미리보기 환경에서 안 떨어지는 케이스가 있어, `.on` 클래스 토글에는 `setTimeout(fn, 20~30)` 사용. 단, 스크럽 같은 frame-by-frame 애니메이션에는 `setInterval(fn, 33)` 사용 (Date.now() 기반).

### 4. 코드 블록 타입 (`code`)

`main.js`의 `renderBlock`에 `code` 타입. `lang` (HTML/CSS/JS), `title`, `value` 필드. 다크 톤(#0a0a0a 배경)으로 코드를 보여줌. `escapeHtml`로 안전.

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
2. `PATTERNS` 배열 — 각 패턴마다 { id, num, title, summary, html, css, js, explain, kv, examples, tradeoff }
3. `buildPatternSection(p)` — 표준 13 블록 자동 생성
4. `buildOverview()` — 00 카테고리 개요 (인덱스 + 공통 토큰 + 읽기 가이드)
5. `main()` — sections 객체 합성 → analysis.json 저장

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
3. 라이브 데모 박스 220px min-height + ▶ 다시 재생 버튼 가시성
4. JS가 IO 진입 시 자동 실행 (preview.dataset.animated === '1')
5. CSS rule이 attribute escape 거쳐 정상 적용 (`.demo-*` 격리 동작)
6. 코드 블록 3개 (HTML/CSS/JS) 정상 표시

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

## 첫 카테고리 사례: 스크롤 텍스트 로드 (2026-05-27)

| 항목 | 결과 |
|------|------|
| 카테고리 ID | `scroll-text-reveal` |
| 패턴 수 | 10 (word-fade, line-slide, char-stagger, blur-reveal, color-fade, scrub-color, mask-sweep, letter-cascade, variable-morph, underline-reveal) |
| 섹션 수 | 11 (00 overview + 01~10 패턴) |
| 블록 수 | 139 |
| 사이드바 | 카테고리 그룹 + 11 sub-link 자동 펼침 |
| 참고 자료 | Framer 마켓플레이스 "Text Reveal" 컴포넌트 (https://www.framer.com/marketplace/components/text-reveal/) |
| validate | 5 OK / 0 warn / 0 error |

**구현 파일**:
- `scripts/generate-scroll-text-reveal.mjs` — 표준 generator (다른 카테고리도 이 구조를 복제)
- `analyses/scroll-text-reveal/analysis.json` — 카탈로그 데이터 본문
- `system.json` references[]에 type: 'category' 엔트리 1개

---

## 신규 카테고리 추가 절차

```
[ ] 카테고리 슬러그 ID 결정 (예: hover-card-tilt, horizontal-scroll, parallax-layer)
[ ] Step 1: 대표 사이트 1~2건 Playwright 실측 (디자인 톤 / 폰트 / 섹션 구조)
[ ] Step 2: 패턴 8~12종 정의 (id, num, title, summary)
[ ] Step 3: scripts/generate-{category-id}.mjs 작성
    [ ] CATEGORY 메타
    [ ] PATTERNS 배열 — 각 패턴: id, num, title, summary, html, css, js, explain, kv, examples, tradeoff
    [ ] 표준 buildPatternSection / buildOverview / main 함수
    [ ] node scripts/generate-{category-id}.mjs 실행
[ ] Step 4: system.json references[]에 type:'category' 엔트리 추가
    [ ] node scripts/validate.mjs 통과 (5 OK / 0 warn / 0 error)
[ ] Step 5: preview_start + Playwright 자가 검증
    [ ] 사이드바 카테고리 그룹 + N+1 sub-link 확인
    [ ] 각 패턴 페이지 진입 + 라이브 데모 박스 + ▶ 다시 재생 버튼 가시성
    [ ] preview.dataset.animated === '1' (IO 진입 시 JS 실행)
    [ ] 코드 블록 3개 (HTML/CSS/JS) 정상 표시
[ ] 의미 있는 단일 커밋 + push
```

---

## QA 안티패턴 (절대 금지)

- ❌ **"QA 확인 완료" 텍스트 자기보고** — 정량 데이터 또는 스크린샷 비교만
- ❌ **`validate.mjs` 통과 = 자가 검증으로 간주** — JSON 스키마 검증일 뿐
- ❌ **패턴 데모 CSS에 글로벌 셀렉터(`p { ... }`, `button { ... }`) 사용** — 다른 카드에 누출. `.demo-{id}` prefix 필수
- ❌ **데모 JS에 `requestAnimationFrame` 의존** — preview 환경에서 안 떨어질 수 있음. `setTimeout` 또는 `setInterval` 사용
- ❌ **`.pattern-replay` 버튼 누락** — 사용자가 재생 못함. 모든 데모 HTML에 첫 자식으로
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
