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
5. **시그니처 컴포넌트** — 해당 사이트만의 독특한 패턴을 🟢 emoji로 표시하고 별도 상세 설명

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

권장 워크플로:
1. `navigate` → 페이지 로드
2. `javascript_tool`로 색상(`getComputedStyle().backgroundColor` 등) 빈도 채집, 폰트 패밀리/사이즈/웨이트 채집
3. 페이지 스크롤 높이 측정 (`document.body.scrollHeight`) — 보고서 sH 값
4. 주요 클래스명, 셀렉터 패턴, 인터랙션 트랜지션 채집
5. 비디오·SVG·이미지 src 직접 캡쳐 (이후 `component` 블록에서 실제 이미지 임베드용)

여러 작업은 `mcp__Claude_in_Chrome__browser_batch` 한 호출로 묶어 빠르게 실행.

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
2. Chrome MCP로 메인 + 서브 10페이지 이상 라이브 인스펙션
3. `analyses/{id}/` 폴더 생성, `analysis.json` 작성 (30섹션 + 블록)
4. `system.json.references[]` 엔트리 추가 (`id`, `title`, `url`, `date`, `analysis` 경로, `pagesAnalyzed`, 30개 커스텀 `sections`, 가능하면 `subpages`)
5. `system.json.counts.references` 갱신
6. `node scripts/validate.mjs` 통과
7. 브라우저에서 `#ref/{id}` 진입해 모든 섹션 렌더 확인
8. 커밋 메시지에 영향받은 계층 명시
