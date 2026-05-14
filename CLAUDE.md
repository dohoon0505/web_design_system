# CLAUDE.md — 기여 가이드라인

본 프로젝트(Web Reference Lab)에 변경을 가할 때 따라야 할 원칙입니다.

## 프로젝트 개요

실제 운영 중인 웹사이트의 디자인 시스템을 연구원 수준으로 분석하는 레퍼런스 카탈로그. **단순 디자인 메모가 아니라, 다른 프로젝트에서 곧바로 꺼내 쓸 수 있는 컴포넌트 라이브러리**를 산출물로 만든다. 한 사이트당 메인 + 서브 카테고리 페이지를 모두 크롤링하고, 디자이너+퍼블리셔가 동시에 활용할 수 있는 30섹션 보고서로 정리한다.

기존 두 레퍼런스가 품질의 기준선이다:
- [analyses/asinsam/analysis.json](analyses/asinsam/analysis.json) — 안성인삼농협 명삼원 (21페이지, 804줄)
- [analyses/miracell/analysis.json](analyses/miracell/analysis.json) — 미라셀 (28페이지, 1103줄)

## 산출물 품질 기준

새 레퍼런스를 추가할 때는 위 두 보고서 수준을 충족해야 한다:

1. **다중 페이지 크롤링** — 메인 + 카테고리 서브페이지 10개 이상을 실제 인스펙션 (Chrome MCP 권장)
2. **30섹션 구조** — 메타(3) + 페이지 분석(5-8) + 비주얼 시스템(4) + 레이아웃(2) + 컴포넌트 라이브러리(8-10) + 인터랙션(3) + 퍼블리싱(2)
3. **재사용 가능한 컴포넌트** — 각 라이브러리 섹션당 8-12종, 실제 사이트 클래스명을 따와 외부에서 바로 복사 가능한 HTML+CSS 페어로 구현 (가능하면 실제 사이트 이미지 URL 그대로 임베드)
4. **실측 값** — 색상은 hex, 폰트는 family/size/weight 정확히, 페이지 높이(sH)도 기록
5. **시그니처 컴포넌트** — 해당 사이트만의 독특한 패턴을 🟢 emoji로 표시하고 별도 상세 설명 (단, 섹션 **타이틀**에는 emoji 금지 — 본문·KV value 안에서만 사용. system.json의 사이드바 메뉴에 깨질 수 있음)
6. **부드러운 인터랙션 카탈로그** (필수 추가 섹션) — 정적 분석이 잡지 못하는 라이브 동작을 별도 섹션으로 정리. transition 통계 + named animation + 헤더 스크롤 변환 + 슬라이더 자동 재생 + 사이드 네비 단계별 활성화 등을 정량적으로 기록 (자세한 점검 방법은 아래 "라이브 인스펙션" 섹션 참조)

## 보고서 데이터 모델

각 분석은 `analyses/{id}/analysis.json` 한 파일이다. 최상위 구조:

```json
{
  "id": "kdnavien-co-kr",
  "title": "경동나비엔",
  "url": "https://www.kdnavien.co.kr/ko",
  "date": "2026-05-14",
  "summary": "1-2 문단 요약",
  "crawledPages": 12,
  "sections": {
    "overview":   { "title": "01. 개요 · 사이트맵", "blocks": [...] },
    "philosophy": { "title": "02. 디자인 철학",     "blocks": [...] },
    "tokens":     { "title": "03. 디자인 토큰",     "blocks": [...] },
    ...
  }
}
```

`system.json.references[]`에 등록할 때 동일 `id`와 `sections` 배열(`{id, num, title, desc}`)을 함께 추가한다. 사이트별로 카테고리 구조가 다르므로 `analysisSections`의 기본 10섹션을 그대로 쓰지 말고 30섹션 커스텀 배열로 정의한다.

## 블록 타입 카탈로그

`assets/js/main.js`의 `renderBlock()`이 처리하는 블록 타입(다른 타입을 쓰면 렌더되지 않음):

| 타입 | 용도 | 키 |
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

## 30섹션 권장 템플릿

| 그룹 | 섹션 ID 예시 | 내용 |
|------|--------------|------|
| **A. 메타 (01-03)** | `overview` `philosophy` `tokens` | 사이트 프로필+사이트맵 / 비주얼 6원칙+결정 패턴 / CSS Variables+토큰 |
| **B. 페이지 분석 (04-09)** | `main-page` `{category}-pages` × 5 | 메인 페이지 흐름 + 카테고리별 5-7페이지 정밀 분석 (각 페이지 sH·구조·실측 텍스트) |
| **C. 비주얼 시스템 (10-13)** | `color-system` `typography-system` `icon-system` `image-system` | 팔레트+사용비율+WCAG / 타입스케일+가이드 / 아이콘 인벤토리 / 이미지 전략 |
| **D. 레이아웃 (14-15)** | `layout-grid` `layout-responsive` | 컨테이너+섹션 그리드 / 브레이크포인트+여백+둥글기 |
| **E. 컴포넌트 라이브러리 (16-25)** | `lib-buttons` `lib-cards` `lib-banners` `lib-navigation` `lib-forms` `lib-data` `lib-content` `lib-utility` `lib-embed` `lib-media` | 각 8-12종 `component` 블록, 외부 사용 가능한 HTML+CSS |
| **F. 인터랙션 (26-28)** | `ix-hover` `ix-scroll` `ix-cursor` | 호버 카탈로그 / 스크롤 애니메이션 / 마우스/터치 분기 |
| **G. 퍼블리싱 (29-30)** | `pub-semantic` `pub-perf-seo` | 시멘틱+WCAG+키보드 / 성능+SEO+개발협업 |

사이트별로 카테고리가 적으면 B 그룹을 줄이고 E 그룹을 늘리는 식으로 30섹션을 유지한다.

## 라이브 인스펙션 — Chrome MCP

`mcp__Claude_in_Chrome__*` 도구로 실제 렌더된 페이지의 computed style을 직접 채집한다. WebFetch는 Next.js처럼 클라이언트 하이드레이션이 필요한 사이트에서 색상·폰트·레이아웃을 거의 잡지 못한다.

웹사이트는 **정적 mockup이 아니라 라이브 인터랙션 시스템**이다. 헤더는 스크롤 시 색이 바뀌고, 헤딩은 단어별로 fade-in 하고, 슬라이더는 자동 재생하고, 카운터는 동적으로 증가한다. **'스크롤 → 멈춤 → 한 번 캡쳐'** 방식으로는 이런 디테일을 절대 잡을 수 없다. 아래의 다중 패스 점검을 반드시 거친다.

### 1차 패스 — 정적 구조 (1분)
1. `navigate` → 페이지 로드
2. `wait` 3-5초 (인트로 애니메이션·하이드레이션 완료까지)
3. `javascript_tool`로 sH (`document.body.scrollHeight`), title, headings, 메타데이터 채집
4. `getComputedStyle`로 body 폰트 스택·기본 크기 채집

### 2차 패스 — 디자인 토큰 채집 (`browser_batch` 한 호출)
한 호출에 묶어 토큰 데이터를 한꺼번에 수집:
- 색상 빈도: `document.querySelectorAll('*').forEach(el => getComputedStyle(el).color/backgroundColor)`로 Map에 누적해 top 20
- 폰트 크기·웨이트: `['h1','h2','h3','h4','h5','p','a','button','li','span'].forEach`로 sel:fontSize:fontWeight 키 누적
- 미디어 쿼리: `document.styleSheets`를 순회하며 `CSSMediaRule.conditionText` 수집 → 브레이크포인트 파악
- 이미지·비디오 URL: `<img>` `<video>` 전체 src + `currentSrc` + `<source>` 캡쳐 (Next.js Image는 `url=` 쿼리 디코드)

### 3차 패스 — **부드러운 스크롤 인터랙션 점검** (필수)
정적 분석이 잡지 못하는 라이브 동작을 캡쳐하는 핵심 단계. **한 번에 3-4 ticks씩만 스크롤**하고 매번 캡쳐한다 (한 번에 10+ ticks 절대 금지 — 그 사이에 발생하는 모든 트랜지션을 놓침).

```
// 스크롤 단위 패턴
1. computer scroll (down, 3-4 ticks)
2. computer wait (2-3초)  ← 애니메이션 완료 대기
3. computer screenshot
4. javascript_tool로 현재 상태 채집 (헤더 클래스, 활성 슬라이드, fade 클래스 등)
```

각 스크롤 위치에서 점검할 것:
- **헤더 클래스 변화**: `header.className` — 스크롤 시 `down` `header_down` `is-scrolled` `at-top` 등이 토글되는지 (스크롤 트리거 헤더 변환)
- **활성 요소**: `[class*=active]`, `[class*=is-visible]`, `[class*=is-on]`, `[class*=current]`, `[class*=fade]` 검색
- **슬라이더 상태**: `[class*=swiper-slide-active]`, `[class*=slick-active]`, `.current.num` 등 현재 슬라이드 인디케이터
- **fixed 요소 인벤토리**: 좌측 사이드 라디오 네비, 우하단 FAB, 우하단 Floating Popup, Scroll-to-top — 모두 fixed라서 정적 첫 캡쳐에 빠질 수 있음

### 4차 패스 — **트랜지션·애니메이션 통계 수집** (라이브 디테일의 정량적 근거)
정적 분석이 절대 잡지 못하는 가장 결정적인 데이터.

```javascript
// transition 빈도 Map 누적 — top 12 출력
const trans = new Map();
document.querySelectorAll('*').forEach((el,i) => {
  if (i > 800) return; // 성능 캡
  const cs = getComputedStyle(el);
  if (cs.transition && cs.transition !== 'all 0s ease 0s' && cs.transition !== 'none') {
    const key = cs.transition.slice(0, 60);
    trans.set(key, (trans.get(key) || 0) + 1);
  }
});
// 정렬해서 top 12 출력
[...trans.entries()].sort((a,b) => b[1] - a[1]).slice(0, 12)

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
- **`all` 빈도**: 사이트의 인터랙티브 강도 지표 (500 이하 = 정적, 700+ = 매우 인터랙티브)
- **`cubic-bezier(0.4, 0, 0.2, 1)`**: Material Design Standard Easing 명시 채택
- **`color 0.6s` 같은 긴 컬러 전환**: 단어별 fade-in 헤딩 패턴
- **`transform 2s` 같은 매우 긴 변환**: 정적처럼 보이나 미세하게 살아있는 ambient 모션
- **명명된 `animation-name`**: `slideInLeft` / `arrowBounceFade` / `circle_move` / `rolling` / `logo-seq` — 사이트의 시그니처 named animation. 이름 자체가 디자인 의도를 드러냄
- **`splitting` / `cm-word-split-JS` 클래스명**: Splitting.js 글자별 분할 애니메이션 채택

### 5차 패스 — Hover·Click 테스트
- `computer hover` (`coordinate` 지정)로 마우스를 GNB·카드·버튼 위에 올린 후 캡쳐 → 호버 상태 색·변환 정확히 확인
- 사이드 라디오 네비, 4-Accordion, 게시판 필터 등은 클릭으로 직접 펼쳐 본 후 캡쳐

### 6차 패스 — 페이지 새로고침 후 재점검
**핵심**: 페이지를 새로고침하고 처음부터 다시 본다. 사용자가 처음 페이지에 들어오는 순간 가장 강한 인상을 받기 때문이다.
- 인트로 애니메이션 (페이지 진입 시 텍스트가 어떻게 등장하는지)
- 첫 5초 동안만 보이는 모달·팝업
- Hero 슬라이드의 첫 슬라이드 → 두 번째 슬라이드 전환 타이밍
- 5초 후·10초 후·30초 후 상태 비교

### 통합: `browser_batch`로 묶어 실행
3-4 액션을 한 호출로 묶으면 빠르다. 단, `screenshot` 사이에 `wait`를 반드시 끼워 애니메이션 완료 후 캡쳐되도록 한다:

```
[
  {name: "computer", input: {action: "scroll", coordinate: [960, 400], scroll_direction: "down", scroll_amount: 3, tabId: X}},
  {name: "computer", input: {action: "wait", duration: 2, tabId: X}},
  {name: "computer", input: {action: "screenshot", tabId: X}},
  {name: "javascript_tool", input: {action: "javascript_exec", tabId: X, text: "(()=>{ /* 상태 채집 */ })()"}}
]
```

### 라이브 인터랙션 카탈로그 섹션
3-6차 패스에서 발견한 모든 라이브 동작은 분석 보고서 마지막에 **별도 섹션 "부드러운 인터랙션 카탈로그 (페이지 새로고침·점진 스크롤 재점검)"** 으로 정리한다. 정적 디자인 스펙으로는 잡히지 않는 모든 디테일이 한 곳에 모이도록 한다. 이 섹션 ID는 `smooth-interaction-catalog`로 통일 (5개 기존 보고서 모두 채택).

## 컴포넌트 작성 규칙

`component` 블록의 HTML/CSS는 외부에서 그대로 복사해서 쓸 수 있어야 한다:

- 클래스명 접두사로 사이트를 구별 (예: `kn-` for kdnavien, `ai-` for asinsam, `b1-` for miracell `lib-buttons`)
- `html` 안 인라인 스타일은 데모 컨테이너용으로만 사용, 컴포넌트 자체는 클래스 기반 CSS
- 가능하면 실제 사이트의 이미지 URL을 그대로 `background-image: url(//domain.com/path)` 또는 `<img src>`로 임베드 (출력물의 비주얼 충실도가 높아짐)
- 색상은 토큰 hex (CSS variable 노출 없는 사이트에서도 보고서에서는 hex 사용)
- 폰트는 분석된 사이트의 실 폰트 (예: Pretendard, Outfit) — 시스템에 없어도 OK
- 인터랙션이 필요하면 `js` 필드에 vanilla JS 한 줄짜리 IIFE로 작성

## 시그니처 컴포넌트 표기

해당 사이트의 정체성을 만드는 독특한 패턴 — 다른 사이트에는 거의 없는 — 은 섹션 안에서 🟢 emoji로 표시한다. 예:
- miracell의 마우스 스포트라이트 마스크 → `🟢 마우스 스포트라이트 Hero`
- asinsam의 페이드인 헤딩 → `🟢 Fade-In Headline (회색→초록)`
- kdnavien의 4개 라이프스타일 솔루션 카드 → `🟢 Lifestyle Solution Card`

## 검증

```bash
node scripts/validate.mjs
```

기대 결과: `5 OK / 0 warn / 0 error`. 추가 검증:

- `system.json.references[]` 엔트리의 `id`가 `analyses/{id}/analysis.json`의 `id`와 동일한지
- `system.json.counts.references`가 실제 등록된 수와 일치하는지 (수동 갱신)
- 브라우저 라이브 확인: `pwsh scripts/serve.ps1` → `http://localhost:8080/#ref/{id}` 사이드바·섹션 렌더 점검

## 안전 / 보안

- `analysis.json`의 사용자 제공 텍스트는 모두 `escapeHtml()`을 거쳐 렌더링됨 (main.js)
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 적용
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
- 섹션 번호: 두 자리 0-패드 (`01`, `02`, ... `30`)

### 브라우저 호환
- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용

## 기여 절차

1. 분석 대상 URL 결정 → 슬러그 ID 생성 (예: `kdnavien-co-kr`)
2. Chrome MCP **1차 패스** (정적 구조) + **2차 패스** (디자인 토큰 채집): 메인 + 서브 10페이지 이상 라이브 인스펙션
3. Chrome MCP **3차 패스** (부드러운 스크롤 인터랙션) + **4차 패스** (transition·animation 통계) + **5차 패스** (Hover·Click 테스트) + **6차 패스** (페이지 새로고침 재점검)
4. `analyses/{id}/` 폴더 생성, `analysis.json` 작성 (30+섹션 + 블록 + `smooth-interaction-catalog` 섹션)
5. `system.json.references[]` 엔트리 추가 (`id`, `title`, `url`, `date`, `analysis` 경로, `pagesAnalyzed`, 30+개 커스텀 `sections`, 가능하면 `subpages`). **섹션 타이틀에는 🟢 같은 emoji 금지** — 사이드바 텍스트만 들어가는 자리이므로 깨질 수 있다 (emoji는 본문 안에서만)
6. `system.json.counts.references` 갱신
7. `node scripts/validate.mjs` 통과
8. 브라우저에서 `#ref/{id}` 진입해 모든 섹션 렌더 확인 — `smooth-interaction-catalog` 섹션의 kv·heading 카운트 정상 출력 확인
9. 커밋 메시지에 영향받은 계층 명시 (실측 sH·transition·animation 수치 포함)
