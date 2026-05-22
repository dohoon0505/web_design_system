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

### 두 가지 작업 모드

| 모드 | 사용 시점 | 페이지 분석 | 섹션 수 | 산출물 |
|------|----------|------------|---------|--------|
| **일반 카탈로그** | "사이트 전체 분석" 요청 | 메인 + 서브 30+ 페이지 | 30+ | 인라인 `component` 블록 라이브러리 |
| **Mirror Mode** | "100% 동일 재현 / 정밀 클론 / 메인만" 요청 | 단일 페이지 정밀 | 10-15 | `component` 블록 70%+ 비중 + Tier-A 프리뷰 모달 |

## 절대 규칙

### 0. Playwright MCP로 라이브 사이트 직접 측정

`.mcp.json`에 등록된 `@playwright/mcp` 서버를 통해 모든 실측을 수행한다. 학습 데이터 추정·외부 캐시·WebFetch는 **사이트맵 URL 패턴 추정** 같은 보조 용도로만.

```
1. mcp__playwright__browser_navigate({ url })
2. wait 3-5초 (하이드레이션 완료)
3. mcp__playwright__browser_evaluate({ function: '() => { ... }' })
4. mcp__playwright__browser_take_screenshot
5. mcp__playwright__browser_hover/click (인터랙션 측정)
```

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

### Mirror Mode 작업 체크리스트

```
[ ] 사용자 요청에 "100% 동일 / 정밀 재현 / 메인만" → Mirror Mode 진입
[ ] 기존 analysis.json 백업 (analysis.backup.json)
[ ] crawledPages: 1, subpages 배열은 메인 1개만
[ ] :root CSS Variables 전수 추출 (document.styleSheets → CSSRule selectorText ':root')
[ ] 페이지 차원 (sH, sW, viewport) + 각 article/section 좌표(top/h) 정밀 측정
[ ] 8가지 히든 패턴 의도적 탐색 (Slot Counter / FAB / Particle / Rotating SVG / Marquee / Splitting / Dual Logo / Mouse Pointer)
[ ] 모든 섹션에 component 블록 1개+ 포함 (kv 표만 늘어놓기 금지)
[ ] 실제 이미지 CDN URL 직접 임베드
[ ] 5-Round E2E 양 사이트 대조 완료 (라이브 N장 + 보고서 N장)
[ ] 마지막 섹션에 5-Round 검증 결과 표 + 발견 패턴 정리
[ ] 일치율 90%+ 달성 못하면 Tier-A 적용 검토
[ ] node scripts/validate.mjs 5 OK / 0 error 통과
```

## Tier-A 아키텍처 — 별도 프로젝트 + 프리뷰 모달

### 언제 Tier-A를 적용하는가

인라인 `component` 블록은 보고서 컨테이너의 overflow/축소 비율 때문에 라이브 절대 픽셀(1080×1905 같은)을 100% 재현 불가능하다. 다음 중 하나라도 해당되면 Tier-A:

- Mirror Mode 5-Round 후에도 일치율이 95% 미만
- 라이브의 viewport 풀폭(1920px) / 풀높이(1080px) 섹션이 핵심
- `position: sticky` / `scroll-driven` / WebGL / Three.js / 라이브 ticker
- 보고서 컨테이너의 `overflow:hidden` 영향받는 sticky 패턴

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

### Tier-A 체크리스트

```
[ ] {site}-app/ 프로젝트 생성 (라이브 기술 스택)
[ ] components/{site}/*.html 정적 HTML 8개+ (각 섹션 1:1)
[ ] styles/globals.css에 :root 디자인 토큰
[ ] 모든 height를 라이브 정확한 px로 (100vh 금지)
[ ] 라이브 CDN 자산 직접 임베드
[ ] analysis.json component 블록에 block.preview / thumbBg / thumbLabel 추가
[ ] 보고서 모달 동작 검증 ([프리뷰 열기] → 모달 → ESC 닫기)
[ ] {site}-app/README.md에 빌드 명령 + 디자이너 가이드
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

## 미라셀 Mirror Mode 사례 (2026-05-22 기준)

| 항목 | 결과 |
|------|------|
| 작업 모드 | Mirror Mode (단일 페이지 100% 재현) |
| 섹션 수 | 15 |
| component 블록 | 14개 |
| 발견 히든 패턴 | 8가지 모두 발견 |
| 5-Round E2E 일치율 | Round 1 87.5% → Round 5 94.75% |
| Tier-A 적용 여부 | ✅ miracell-app + components/miracell/*.html |
| 인프라 버그 수정 | escapeHtml `"`/`'` escape 추가 (다른 보고서에도 영향) |

100% 도달 불가 사유: 보고서 컨테이너 안에 demo가 비례 축소되어 들어가므로 절대 픽셀 일치는 구조상 어려움. 디자인 토큰(폰트·color·radius·키프레임)은 100% 일치. **풀폭 라이브 정확 px**가 필요하면 Tier-A 모달로 분리.

## 기여 절차

1. 분석 대상 URL 결정 → 슬러그 ID 생성 (예: `miracell`)
2. 작업 모드 결정: 일반 카탈로그 vs Mirror Mode
3. Playwright MCP로 라이브 사이트 측정 (1차 패스)
4. `analyses/{id}/analysis.json` 작성:
   - 일반: 30+ 섹션, 컴포넌트 라이브러리 중심
   - Mirror Mode: 10-15 섹션, `component` 비중 70%+
   - 마지막은 `smooth-interaction-catalog`
   - 섹션 타이틀에 이모지 금지
5. `system.json.references[]` 엔트리 추가 + `counts.references` 갱신
6. Mirror Mode: 5-Round E2E 양 사이트 대조 → 일치율 표 기록
7. 일치율 95% 미만이면 Tier-A 적용 (`{id}-app/` + `components/{id}/*.html`)
8. `node scripts/validate.mjs` 통과 + 로컬 서버 렌더 확인
9. 커밋 메시지에 영향받은 계층 + 실측 수치 포함
