# AGENTS.md — 어시스턴트 분석 워크플로

본 문서는 사용자가 웹페이지 URL을 제공했을 때 어시스턴트(AI 코딩 에이전트)가 따라야 할 절차를 정의합니다.

## 입력
- 형식: 사용자가 URL을 포함한 자연어 요청 (예: "https://amazon.com 분석해줘", "notion.so 디자인시스템으로 등록")
- 한 번에 하나의 URL을 처리합니다 (여러 URL은 순차 처리).

## 출력 (산출물)
다음 두 파일이 생성되고, `system.json`에 항목이 등록되어야 합니다.

1. `analyses/{id}/analysis.json` — 구조화된 분석 데이터 (단일 진실 공급원)
2. `analyses/{id}/analysis.md` — 사람이 읽는 마크다운 리포트 (자동 생성, 다운로드용)

추가로 `system.json`의 `groups.analyses.items` 배열에 다음 형태의 entry가 추가됩니다:

```json
{ "id": "amazon-com", "title": "Amazon", "url": "https://amazon.com", "summary": "...", "analyzedAt": "2026-05-13" }
```

## 절차

### 1. ID 결정
URL에서 슬러그 형태의 ID를 생성합니다. 규칙:
- 도메인 기준 (서브도메인 제외 또는 포함은 맥락에 맞게 결정)
- 소문자, 숫자, 하이픈만 사용
- 점(`.`)은 하이픈으로 변환
- 예: `https://www.amazon.com` → `amazon-com`, `https://notion.so` → `notion-so`
- 이미 동일 ID가 있으면 날짜 접미사 추가: `amazon-com-2026-05-13`

### 2. 페이지 가져오기
`WebFetch` 도구로 HTML 및 가능한 경우 주요 CSS/JS를 가져옵니다.

### 3. 분석 항목 추출
9개 섹션을 각각 채웁니다 (정보가 없으면 해당 필드 생략):

| 섹션 | 추출 대상 |
|------|----------|
| Overview | URL, 사이트명, 1~2문장 요약 |
| Tech Stack | `<meta name="generator">`, `<script src>` 패턴 (React/Vue/Next 등), `<link rel="stylesheet">` (Tailwind/Bootstrap), `data-*` 속성, 호스팅 헤더, 폰트 소스 |
| Color Palette | CSS variables, 인라인/외부 CSS의 빈도 높은 색상, 명명된 역할 (primary, background, text) |
| Typography | `font-family`, `font-size` 스케일, `font-weight` 변형, `@font-face` 또는 외부 폰트 링크 |
| Layout & Grid | container max-width, grid/flex 패턴, spacing scale 단서, breakpoint (`@media`) |
| Components | 감지된 UI 패턴 (Button, Card, Nav, Form, Modal 등)과 변형 |
| Iconography | SVG 인라인, 아이콘 라이브러리 (Font Awesome, Material, Lucide 등) |
| Interactions | CSS transition/animation, hover 효과, JS 라이브러리 (GSAP, framer-motion) |
| Accessibility | ARIA 속성 사용, 시멘틱 HTML 비율, 색 대비 추정 |

### 4. `analysis.json` 작성
`schemas/analysis.schema.json` 구조를 준수합니다. 필수 필드: `id`, `url`, `title`, `analyzedAt` (YYYY-MM-DD).

예시 골격:

```json
{
  "id": "example-com",
  "url": "https://example.com",
  "title": "Example",
  "analyzedAt": "2026-05-13",
  "summary": "심플한 도메인 예약 페이지.",
  "techStack": { "frameworks": [], "cssFrameworks": [], "fonts": ["system-ui"] },
  "colors": {
    "primary": "#38488f",
    "background": "#f0f0f2",
    "text": "#000000",
    "extracted": [{ "hex": "#38488f", "role": "link" }]
  },
  "typography": {
    "headingFont": "system-ui",
    "bodyFont": "system-ui",
    "sizes": [{ "name": "h1", "value": "2.5em" }]
  },
  "layout": { "maxWidth": "600px" }
}
```

### 5. `analysis.md` 작성
어시스턴트는 `analysis.json` 기반의 사람이 읽는 마크다운 버전을 만들어 함께 저장합니다. 구조는 시스템 내부 `generateAnalysisMarkdown()` 출력과 일치하도록 합니다 (사용자가 시스템 다운로드 기능을 쓸 때 동일한 결과). 사용자가 다른 마크다운 표현을 선호하면 거기에 맞춥니다.

### 6. `system.json` 등록
`groups[id=="analyses"].items` 배열 끝에 다음을 추가:

```json
{ "id": "example-com", "title": "Example", "url": "https://example.com", "summary": "심플한 도메인 예약 페이지.", "analyzedAt": "2026-05-13" }
```

### 7. 검증
`node scripts/validate.mjs`를 실행해 일관성 확인:
- `system.json` 등록 ↔ `analyses/{id}/analysis.json` 존재 여부
- `analysis.json` 필수 필드 / 포맷 검사
- 고아 폴더 감지 (경고)

### 8. 사용자 안내
브라우저 새로고침 시 좌측 네비게이터에 새 카테고리가 나타남을 알립니다. 분석 결과 요약을 함께 제공합니다.

## 결정 트리

```
사용자가 URL 제공 →
  ├─ 이미 등록된 ID인가? ──아니오──┐
  │                                ↓
  │                      ID 결정 → 페이지 가져오기 → 9섹션 추출
  │                                ↓
  │                      analysis.json 작성 → analysis.md 작성
  │                                ↓
  │                      system.json 등록 → 검증 실행 → 사용자 안내
  │
  └──예──→ 사용자에게 알림: "이미 등록됨, 재분석하시겠습니까?"
             ├─ 재분석 → 동일 절차로 덮어쓰기 (analyzedAt 갱신)
             └─ 신규 ID → {id}-{date}로 별도 entry 생성
```

## 주의사항
- `WebFetch`로 가져온 데이터의 한계를 명시할 것 (서버사이드 렌더링/동적 로딩 부분은 누락 가능).
- 색상은 가능하면 hex로 통일 (rgb()/hsl()은 hex로 변환).
- "감지된" 정보와 "추정된" 정보를 `notes` 필드에서 구분.
- 사용자가 별도 분석 깊이를 요청하면 적절히 조정.

## 비분석 요청 대응
- "사이드바 메뉴 정리해줘", "특정 분석 삭제해줘" 같은 메타 요청은 `system.json`만 갱신.
- "다 같이 다운로드" 요청은 모든 `analysis.md`를 결합한 단일 파일을 만들어 제공.
