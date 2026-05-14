# CLAUDE.md — 기여 가이드라인

Web Reference Lab(웹 디자인 레퍼런스 연구소)에 변경을 가할 때 따라야 할 원칙. 본 문서는 운영자(/DH)와 AI 코딩 에이전트가 공동으로 따르는 단일 합의 문서다.

## 프로젝트 개요

실제 운영 중인 웹사이트의 디자인 시스템을 연구원 수준으로 분석하는 레퍼런스 카탈로그. **단순 디자인 메모가 아니라, 다른 프로젝트에서 곧바로 꺼내 쓸 수 있는 컴포넌트 라이브러리**가 산출물이다. 한 사이트당 메인 + 서브 카테고리 페이지를 모두 라이브로 점검하고, 디자이너와 퍼블리셔가 동시에 활용할 수 있는 30+ 섹션 보고서로 정리한다.

## 기준선: 5개 기존 보고서

신규 분석은 아래 5개 보고서의 평균 품질을 충족해야 한다.

| 레퍼런스 | 페이지 분석 | 섹션 수 | 줄 수 |
|----------|------------|--------|------|
| [analyses/kdnavien-co-kr/analysis.json](analyses/kdnavien-co-kr/analysis.json) | 경동나비엔 (12페이지) | 34 | 1,384 |
| [analyses/miracell/analysis.json](analyses/miracell/analysis.json) | 미라셀 (28페이지) | 34 | 1,273 |
| [analyses/asinsam/analysis.json](analyses/asinsam/analysis.json) | 안성인삼농협 (24페이지) | 33 | 974 |
| [analyses/plantym-com/analysis.json](analyses/plantym-com/analysis.json) | 플랜티엠 (11페이지) | 27 | 810 |
| [analyses/dcamp-kr/analysis.json](analyses/dcamp-kr/analysis.json) | 디캠프 (6페이지) | 28 | 787 |

5개 모두 31번째 이후 섹션에 `smooth-interaction-catalog`(부드러운 인터랙션 카탈로그)를 포함한다.

## 절대 규칙 (반드시 지킬 것)

### 0. 무조건 Chrome MCP를 통해 실제 웹사이트에 직접 접근

**모든 분석은 예외 없이 `mcp__Claude_in_Chrome__*` 도구로 실제 라이브 사이트를 방문해서 진행한다.** WebFetch / 학습 데이터 / 외부 캐시 / 검색 결과 추정은 보조 정보로만 사용하며, 디자인 토큰(색상·폰트·여백·둥글기) · 컴포넌트 클래스명 · 페이지 구조 · 인터랙션 · 이미지 URL · transition·animation 통계는 **반드시 라이브 페이지에서 직접 채집한 실측값**을 사용한다.

이 규칙이 있는 이유:

- WebFetch는 HTML 정적 텍스트만 가져옴 — 클라이언트 하이드레이션(Next.js · React · Vue 등) 후의 실제 DOM·CSS를 잡지 못한다
- 색상·폰트는 `getComputedStyle()`로만 정확히 채집 가능
- 스크롤·hover·click 같은 라이브 인터랙션은 정적 HTML에 존재하지 않음
- transition·animation 통계는 살아있는 페이지에서만 측정 가능
- 학습 데이터 추정으로 작성된 보고서는 사실과 다를 위험이 매우 높다 (이미지 경로 오류, 존재하지 않는 클래스명 등)

**Chrome MCP 워크플로**:

```
1. mcp__Claude_in_Chrome__tabs_context_mcp({ createIfEmpty: true })
2. mcp__Claude_in_Chrome__navigate({ url, tabId })
3. wait 3-5초 (하이드레이션 완료)
4. javascript_tool 또는 screenshot으로 실측 데이터 채집
5. browser_batch로 여러 액션 묶어 실행
```

WebFetch는 **사이트맵 URL 패턴 추정** 같은 보조 용도로만 허용. 그 외 분석 콘텐츠 전체는 Chrome MCP 실측이 단일 source of truth.

### 1. 섹션 타이틀에 이모지 금지

사이드바·report-section-card에 노출되는 **section title 문자열에는 🟢 같은 이모지를 절대 넣지 않는다**. 사이드바 메뉴의 모노스페이스 정렬·페이지 인쇄·접근성에 깨질 수 있다.

```json
// 잘못된 예
{ "id": "lib-cards", "num": "16", "title": "🟢 카드 라이브러리", "desc": "..." }
// 올바른 예
{ "id": "lib-cards", "num": "16", "title": "카드 라이브러리", "desc": "..." }
```

본문(블록 안 `value`, `label`, `text` 등) 안에서는 이모지를 강조용으로 사용해도 무방하다. 단 남발은 피한다.

### 2. 섹션 수 자유 (30+ 권장, 상한 없음)

기존엔 "정확히 30섹션" 규칙이 있었으나 폐기. 사이트마다 발견되는 패턴 수가 달라 강제 제한이 무의미하다. **콘텐츠가 30섹션 이상 펼쳐질 만하면 자유롭게 늘린다**. 최소 25 이상은 유지 권장 (메타 3 + 페이지 분석 5 + 비주얼 4 + 레이아웃 2 + 컴포넌트 라이브러리 8 + 인터랙션 2 + 퍼블리싱 1).

### 3. 실제 사이트 이미지 적극 사용

연구·내부 참조 용도이므로 **분석 대상 사이트의 실제 이미지·영상 URL을 그대로 `<img src>`, `background-image: url(...)`로 임베드해도 된다**. 비주얼 충실도가 극적으로 올라간다.

```css
/* 권장 패턴 */
.kn-md1-smart .kn-md1-bg{background-image:url(https://www.kdnavien.co.kr/images/main/home1.webp)}

/* 외부 호스트도 OK (S3, CDN 등) */
.dc-im1-img img{src:"https://s3-ap-northeast-2.amazonaws.com/dcamp-web-public/styles/max_650x650/s3-public/2026-04/배치8기.png"}
```

상업 배포가 아니라 비공개 연구 자료이므로 저작권·CDN 비용 이슈는 고려하지 않는다.

### 4. 부드러운 인터랙션 카탈로그 섹션 필수

마지막 섹션은 `smooth-interaction-catalog`라는 ID로 통일하며, 정적 분석으로는 잡히지 않는 라이브 동작을 정리한다. 5개 기존 보고서 모두 채택. (점검 방법은 아래 "라이브 인스펙션" 참조)

## 보고서 데이터 모델

각 분석은 `analyses/{id}/analysis.json` 한 파일.

```json
{
  "id": "kdnavien-co-kr",
  "title": "경동나비엔",
  "url": "https://www.kdnavien.co.kr/ko",
  "date": "2026-05-14",
  "summary": "2-3 문단 — 사이트 정체성, 기술 스택, 시그니처 패턴 압축",
  "crawledPages": 12,
  "sections": {
    "overview":   { "title": "01. 개요 · 사이트맵", "blocks": [...] },
    "philosophy": { "title": "02. 디자인 철학",     "blocks": [...] },
    ...
    "smooth-interaction-catalog": { "title": "34. 부드러운 인터랙션 카탈로그 (라이브 재점검)", "blocks": [...] }
  }
}
```

`system.json.references[]`에 등록할 때 동일 `id` + 커스텀 `sections` 배열(`{id, num, title, desc}`)을 함께 추가한다. `analysisSections`의 기본 10섹션은 사용하지 않고 사이트별 커스텀 30+ 섹션을 사용한다.

## 블록 타입 카탈로그

`assets/js/main.js`의 `renderBlock()`이 처리하는 블록 타입. 다른 타입을 쓰면 렌더되지 않는다.

| 타입 | 용도 | 필수/선택 키 |
|------|------|-----|
| `heading` | h2 헤딩 | `value` |
| `text` | 단락 텍스트 | `value` |
| `note` | i 아이콘 노트 | `value` |
| `kv` | 키-값 리스트 (1/2/3 컬럼) | `title?`, `columns?`, `items[{label, value}]` |
| `stats` | 큰 숫자 카드 그리드 | `items[{number, suffix?, label}]` |
| `sitemap` | 부모 + 자식 그룹 | `items[{label, children[]}]` |
| `structure` | 순번 + 라벨 + 태그 + 설명 | `items[{label, tag?, desc}]` |
| `palette` | 컬러 스와치 표 | `title?`, `colors[{name, hex, usage}]` |
| `typo` | 폰트 샘플 표 | `items[{label, size, weight, sample, tracking?}]` |
| `component` | HTML/CSS/JS 라이브 프리뷰 | `title?`, `html`, `css`, `js?`, `fullWidth?` |
| `spacingScale` | 여백 바 | `items[{label, px}]` |
| `radiusScale` | 둥글기 박스 | `items[{label, px, usage?, note?}]` |

## 권장 섹션 템플릿 (30+ 섹션)

| 그룹 | 섹션 ID 예시 | 섹션 수 | 내용 |
|------|--------------|--------|------|
| **A. 메타 (01-03)** | `overview` `philosophy` `tokens` | 3 | 사이트 프로필+사이트맵 / 비주얼 6원칙+결정 패턴 / CSS Variables+토큰 |
| **B. 페이지 분석 (04-09)** | `main-page` `{category}-pages` × 5 | 5-7 | 메인 페이지 흐름 + 카테고리별 5-7페이지 정밀 분석 |
| **C. 비주얼 시스템 (10-13)** | `color-system` `typography-system` `icon-system` `image-system` | 4 | 팔레트·사용비율·WCAG / 타입스케일 / 아이콘 인벤토리 / 이미지·영상 전략 |
| **D. 레이아웃 (14-15)** | `layout-grid` `layout-responsive` | 2 | 컨테이너+섹션 그리드 / 브레이크포인트+여백+둥글기 |
| **E. 컴포넌트 라이브러리 (16-25)** | `lib-buttons` `lib-cards` `lib-banners` `lib-navigation` `lib-forms` `lib-data` `lib-content` `lib-utility` `lib-embed` `lib-media` | 8-10 | 각 8-12종 `component` 블록, HTML+CSS 페어 |
| **F. 시그니처 패턴 (개수 가변)** | `signature-*` | 2-5 | 해당 사이트만의 독특한 시각·인터랙션 패턴 (오비탈 다이어그램, Animated Counter, Drive Typo 등) |
| **G. 인터랙션 (26-28)** | `ix-hover` `ix-scroll` `ix-cursor` (또는 `ix-video` 등) | 2-3 | 호버 카탈로그 / 스크롤 애니메이션 / 마우스·터치 분기 |
| **H. 퍼블리싱 (29-30)** | `pub-semantic` `pub-perf-seo` | 2 | 시멘틱+WCAG+키보드 / 성능+SEO+개발협업 |
| **I. 부드러운 인터랙션 (필수 마지막)** | `smooth-interaction-catalog` | 1 | 라이브 재점검에서 발견한 모든 라이브 동작 통합 |

총합 = 27-34 섹션 정도가 자연스럽다. 사이트가 풍부하면 더 많아져도 좋다.

## 라이브 인스펙션 — Chrome MCP

`mcp__Claude_in_Chrome__*` 도구로 실제 렌더된 페이지의 computed style을 직접 채집한다. WebFetch는 Next.js·React 같은 클라이언트 하이드레이션이 필요한 사이트에서 색상·폰트·레이아웃을 거의 잡지 못한다.

**웹사이트는 정적 mockup이 아니라 라이브 인터랙션 시스템**이다. 헤더는 스크롤 시 색이 바뀌고, 헤딩은 단어별로 fade-in 하고, 슬라이더는 자동 재생하고, 카운터는 동적으로 증가한다. **'한 번에 10+ ticks 스크롤 후 캡쳐'** 방식으로는 이런 디테일을 절대 잡을 수 없다. 아래의 다중 패스 점검을 반드시 거친다.

### 1차 패스 — 정적 구조 (3분)

1. `navigate` → 페이지 로드
2. `wait` 3-5초 (인트로 애니메이션·하이드레이션 완료까지)
3. `javascript_tool`로 sH (`document.body.scrollHeight`), title, meta 채집
4. `getComputedStyle`로 body 폰트 스택·기본 크기 채집

### 2차 패스 — 디자인 토큰 채집

`browser_batch` 한 호출로 다음을 동시에 수집:

- **색상 빈도**: `getComputedStyle(el).color/backgroundColor`를 Map에 누적 → top 25
- **폰트 크기·웨이트**: `['h1','h2','h3','h4','h5','p','a','button','li','span']`별 sel:fontSize:fontWeight 키 누적
- **미디어 쿼리**: `document.styleSheets`를 순회하며 `CSSMediaRule.conditionText` → 브레이크포인트 파악
- **이미지·비디오 URL**: `<img>` `<video>` 전체 + `<source>`. Next.js Image는 `url=` 쿼리 디코드
- **fixed 요소 인벤토리**: 좌측 사이드 네비, 우하단 FAB, Floating Popup, Scroll-to-top — 모두 fixed라서 정적 캡쳐에 빠질 수 있음

### 3차 패스 — 부드러운 스크롤 인터랙션 점검 (필수, 가장 중요)

정적 분석이 잡지 못하는 라이브 동작을 캡쳐. **한 번에 3-4 ticks씩만 스크롤**하고 매번 캡쳐한다. **한 번에 10+ ticks 절대 금지** — 그 사이에 발생하는 모든 트랜지션을 놓친다.

```json
// 표준 스크롤 단위 (browser_batch 묶음)
[
  {"name": "computer", "input": {"action": "scroll", "scroll_direction": "down", "scroll_amount": 3, "coordinate": [960, 400], "tabId": X}},
  {"name": "computer", "input": {"action": "wait", "duration": 2, "tabId": X}},
  {"name": "computer", "input": {"action": "screenshot", "tabId": X}},
  {"name": "javascript_tool", "input": {"action": "javascript_exec", "tabId": X, "text": "(()=>{ /* 상태 채집 */ })()"}}
]
```

각 스크롤 위치에서 점검할 것:

- **헤더 클래스 변화**: `header.className`을 채집 — 스크롤 시 `down` / `header_down` / `is-scrolled` / `at-top` 등이 토글되는지
- **활성 요소**: `[class*=active]`, `[class*=is-visible]`, `[class*=is-on]`, `[class*=current]`, `[class*=fade]` 검색
- **슬라이더 상태**: `[class*=swiper-slide-active]`, `[class*=slick-active]`, `.current.num` 등 현재 인디케이터
- **사이드 네비 단계별 활성**: 좌측 라디오 네비가 viewport 진입 섹션에 따라 어떻게 활성 도트가 이동하는지

### 4차 패스 — Transition·Animation 통계 (정량적 라이브 근거)

```javascript
// transition 빈도 Map 누적 — top 12 출력
const trans = new Map();
document.querySelectorAll('*').forEach((el, i) => {
  if (i > 800) return;
  const cs = getComputedStyle(el);
  if (cs.transition && cs.transition !== 'all 0s ease 0s' && cs.transition !== 'none') {
    const key = cs.transition.slice(0, 60);
    trans.set(key, (trans.get(key) || 0) + 1);
  }
});
[...trans.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

// animation 캡쳐 — animationName !== 'none'
const animEls = Array.from(document.querySelectorAll('*')).filter(el => {
  const cs = getComputedStyle(el);
  return cs.animationName && cs.animationName !== 'none';
}).slice(0, 12).map(el => ({
  tag: el.tagName,
  cls: (el.className?.toString?.() || '').slice(0, 60),
  anim: getComputedStyle(el).animationName,
  dur: getComputedStyle(el).animationDuration
}));
```

해석 가이드:

| 패턴 | 의미 |
|------|------|
| `all` 빈도 500↓ | 정적 사이트 |
| `all` 빈도 700↑ | 매우 인터랙티브 사이트 |
| `cubic-bezier(0.4, 0, 0.2, 1)` | Material Design Standard Easing 명시 채택 |
| `cubic-bezier(0, 0, 0.2, 1)` | Material Design Decelerate Easing |
| `color 0.6s` 같은 긴 컬러 전환 | 단어별 fade-in 헤딩 패턴 |
| `transform 2s` 같은 매우 긴 변환 | 정적처럼 보이나 미세하게 살아있는 ambient 모션 |
| 명명된 `animation-name` (`slideInLeft` / `arrowBounceFade` / `circle_move` / `rolling` / `logo-seq`) | 사이트의 시그니처 named animation |
| `splitting` / `cm-word-split-JS` 클래스명 | Splitting.js 글자별 분할 애니메이션 |

### 5차 패스 — Hover·Click 테스트

```json
// 호버
{"name": "computer", "input": {"action": "hover", "coordinate": [780, 400], "tabId": X}}
// 클릭
{"name": "computer", "input": {"action": "left_click", "coordinate": [780, 400], "tabId": X}}
```

`computer hover`로 마우스를 GNB·카드·버튼 위에 올린 후 캡쳐 → 호버 상태 색·변환 정확히 확인. 사이드 라디오 네비, 4-Accordion, 게시판 필터 등은 클릭으로 직접 펼친 후 캡쳐.

### 6차 패스 — 페이지 새로고침 후 재점검 (가장 자주 놓침)

**핵심**: 페이지를 새로고침하고 처음부터 다시 본다. 사용자가 처음 페이지에 들어오는 순간 가장 강한 인상을 받기 때문이다.

- 인트로 애니메이션 (페이지 진입 시 텍스트가 어떻게 등장하는지)
- 첫 5초 동안만 보이는 모달·팝업
- Hero 슬라이드의 첫→두 번째 전환 타이밍
- 5초·10초·30초 후 상태 비교

## 컴포넌트 작성 규칙

`component` 블록의 HTML/CSS는 외부에서 그대로 복사해서 쓸 수 있어야 한다.

### 클래스명 접두사로 사이트 구별

| 사이트 | 접두사 | 예시 |
|--------|--------|------|
| kdnavien | `kn-` | `kn-bn1` (banner 1), `kn-md1` (media 1) |
| miracell | `b1-` / `c1-` / `bn1-` / `mr-` | 라이브러리 번호 기반 |
| asinsam | `ai-` / `ai-bt1` | 라이브러리 번호 기반 |
| plantym | `pm-` | `pm-bt1`, `pm-c1`, `pm-bn1` |
| dcamp | `dc-` | `dc-bt1`, `dc-c1`, `dc-bn1` |

### 작성 규칙

- `html` 안 인라인 스타일은 데모 컨테이너용으로만 사용. 컴포넌트 자체는 클래스 기반 CSS
- **실제 사이트의 이미지 URL을 그대로 임베드** (비주얼 충실도가 극적으로 올라감)
- 색상은 토큰 hex (CSS variable 노출 없는 사이트에서도 보고서에서는 hex 사용)
- 폰트는 분석된 사이트의 실 폰트 명시 (예: `Pretendard, SUIT` — 시스템에 없어도 OK, 폴백 적용)
- 인터랙션이 필요하면 `js` 필드에 vanilla JS 한 줄짜리 IIFE로 작성
- `fullWidth: true` 옵션으로 큰 데모 컴포넌트는 풀폭 가능

## 시그니처 컴포넌트 표기

해당 사이트의 정체성을 만드는 독특한 패턴(다른 사이트에는 거의 없는)은 본문 안에서 🟢 emoji로 표시한다. 단 **섹션 타이틀에는 절대 금지**.

```json
// 잘못된 예
{ "title": "20. 🟢 시그니처 - Orbital Diagram", ... }
// 올바른 예
{ "title": "20. 시그니처 - Planty 그룹 오비탈 다이어그램",
  "blocks": [
    { "type": "kv", "items": [
      { "label": "🟢 시그니처 특징", "value": "..." }
    ]}
  ]
}
```

## 안전 / 보안

- `analysis.json`의 사용자 제공 텍스트는 모두 `escapeHtml()`을 거쳐 렌더링됨 (main.js)
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 적용 (renderer가 자동 적용)
- 컴포넌트 블록 안 HTML/CSS는 안전한 표준 마크업만 — `<script>` 직접 삽입 금지(`js` 필드 사용)

## 컨벤션

### 파일 경로
- 단일 진입점: `index.html`
- 정적 자원: `assets/css/`, `assets/js/`
- 분석 데이터: `analyses/{id}/analysis.json`
- 스크립트: `scripts/` (validate.mjs, serve.ps1)

### 네이밍
- 분석 ID: `^[a-z0-9][a-z0-9-]*$` (영소문자 시작)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 색상: hex (`#RRGGBB` 또는 `#RRGGBBAA`)
- 섹션 번호: 두 자리 0-패드 (`01`, `02`, ..., `34`)
- 섹션 ID: kebab-case (`signature-orbital`, `smooth-interaction-catalog`)

### 브라우저 호환
- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용

## 검증

```bash
node scripts/validate.mjs
```

기대 결과: `5 OK / 0 warn / 0 error`.

추가 검증:

- `system.json.references[]` 엔트리의 `id`가 `analyses/{id}/analysis.json`의 `id`와 동일한지
- `system.json.counts.references`가 실제 등록된 수와 일치하는지 (수동 갱신)
- 섹션 ID가 `system.json.references[].sections[].id`와 `analyses/{id}/analysis.json`의 `sections` 키와 일치하는지
- **섹션 타이틀에 이모지가 없는지 확인** (사이드바 렌더 시 깨질 수 있음)
- 브라우저 라이브 확인: `pwsh scripts/serve.ps1` → `http://localhost:8080/#ref/{id}` 사이드바·섹션 렌더 점검

## 기여 절차 (신규 분석 추가 시)

**모든 단계는 Chrome MCP로 실제 라이브 사이트에 직접 접근해서 진행**한다 (절대 규칙 0번 참조). 학습 데이터 추정·WebFetch HTML·외부 검색은 보조 정보로만.

1. 분석 대상 URL 결정 → 슬러그 ID 생성 (예: `kdnavien-co-kr`)
2. Chrome MCP **1차 패스** (정적 구조) + **2차 패스** (디자인 토큰 채집)
3. Chrome MCP **3차 패스** (부드러운 스크롤 — 3-4 ticks 단위) + **4차 패스** (transition·animation 통계 채집)
4. Chrome MCP **5차 패스** (Hover·Click 테스트) + **6차 패스** (페이지 새로고침 재점검)
5. `analyses/{id}/` 폴더 생성
6. `analyses/{id}/analysis.json` 작성:
   - 30+ 섹션 (콘텐츠가 많으면 더 늘려도 OK, 상한 없음)
   - 마지막 섹션은 반드시 `smooth-interaction-catalog`
   - 실제 사이트 이미지 URL을 컴포넌트 블록에 임베드
   - **섹션 타이틀에 이모지 금지** (본문 안에서만 사용)
   - 컴포넌트 클래스명 접두사 부착 (`kn-`, `mr-`, `ai-`, `pm-`, `dc-` 등)
7. `system.json.references[]` 엔트리 추가:
   - `id`, `title`, `url`, `date`, `analysis` 경로, `pagesAnalyzed`
   - 30+ 개 커스텀 `sections` 배열 (각 `{id, num, title, desc}`)
   - `subpages` 배열 (분석된 페이지 URL 목록)
8. `system.json.counts.references` 갱신 + `totalComponents` 추정 갱신
9. `node scripts/validate.mjs` 통과
10. 브라우저에서 `#ref/{id}` 진입 → 모든 섹션 렌더 확인. 특히 `smooth-interaction-catalog`의 kv·heading 카운트 출력 확인
11. 커밋 메시지에 영향받은 계층(analyses/system.json/docs) 명시. 실측 sH·transition·animation 수치 포함 권장

## 신규 분석 시 체크리스트

```
[ ] **무조건 Chrome MCP로 실제 사이트 직접 접근** (절대 규칙 0)
[ ] Chrome MCP 1-6차 패스 완료 (정적·토큰·스크롤·통계·hover·새로고침)
[ ] 모든 색상·폰트·이미지 URL이 라이브 페이지 실측값
[ ] 30+ 섹션 작성
[ ] smooth-interaction-catalog 섹션 포함
[ ] 섹션 타이틀에 이모지 없음 (본문은 OK)
[ ] 실제 사이트 이미지 URL 컴포넌트 임베드
[ ] 컴포넌트 클래스명 접두사 부착
[ ] system.json.references[] 엔트리 추가
[ ] system.json.counts.references 갱신
[ ] node scripts/validate.mjs 통과
[ ] 브라우저 렌더 확인
```
