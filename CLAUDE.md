# CLAUDE.md — 기여 가이드라인

본 디자인시스템에 변경을 가할 때 따라야 할 원칙입니다.

## 시스템 골격 변경 시 3계층 동시 갱신

[dohoon0505/desgin_system](https://github.com/dohoon0505/desgin_system)의 원칙을 그대로 따릅니다. 어떤 변경이든 다음 세 계층을 동시에 갱신해야 일관성이 깨지지 않습니다.

| 계층 | 위치 | 역할 |
|------|------|------|
| **운영 소스** | `index.html`, `assets/css/main.css`, `assets/js/main.js` | 실제 동작하는 셸과 로직 |
| **데이터 매니페스트** | `system.json`, `schemas/analysis.schema.json` | 시스템 메타데이터 |
| **문서** | `README.md`, `AGENTS.md`, 본 파일 | 기여자/에이전트 가이드 |

예시: 분석 섹션 추가 시 → `system.json.analysisSections` 추가 + `main.js`의 섹션 렌더러 추가 + `analysis.schema.json` 갱신 + `AGENTS.md`의 추출 표 갱신.

## 컨벤션

### 파일 경로
- 단일 진입점: `index.html`
- 정적 자원: `assets/css/`, `assets/js/`
- 분석 데이터: `analyses/{id}/` (id는 슬러그)
- 스키마: `schemas/`
- 스크립트: `scripts/` (ESM, Node 18+)

### 네이밍
- 분석 ID: `^[a-z0-9][a-z0-9-]*$` (영소문자 시작, 영소문자/숫자/하이픈만)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 색상: hex (`#RRGGBB` 또는 `#RRGGBBAA`)

### CSS 토큰
- Primitive: `--p-{family}-{step}` (예: `--p-neutral-100`)
- Semantic: `--sm-{role}-{variant}` (예: `--sm-content-primary`)
- 컴포넌트 단위 토큰을 추가할 때는 `--cm-{component}-{property}` 사용

### JavaScript
- ES6+ vanilla, 외부 의존성 없음
- 단일 IIFE `(function(){ 'use strict'; ... })();`
- DOM 헬퍼: `el(tag, attrs, children)` 사용
- HTML 삽입 시 사용자 데이터는 반드시 `escapeHtml()` 적용

## 안전 / 보안
- `analysis.json`의 사용자 제공 텍스트(`url`, `title`, `summary` 등)는 모두 escape 후 렌더링.
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 적용.
- 스크린샷 등 외부 자원은 분석 폴더 내 상대 경로로만 참조.

## 검증
변경 후 반드시 실행:

```bash
node scripts/validate.mjs
```

수정 시 예상되는 동작:
- `system.json` 등록과 실제 폴더가 어긋나면 ✗ error
- 폴더는 있는데 등록 안 됨 → warning (정리 권장)
- 필수 필드 누락 → ✗ error

## 브라우저 호환
- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용
- 폴리필 없음 — 구형 IE/구버전 모바일 브라우저는 지원 대상 외

## 기여 절차
1. 변경하려는 영역 식별 (셸/데이터/문서)
2. 위 3계층 중 영향받는 모든 계층을 같은 커밋으로 묶기
3. `scripts/validate.mjs` 통과 확인
4. `index.html`을 브라우저에서 열어 라이트/다크 + 모바일 토글 동작 확인
5. 커밋 메시지에 영향받은 계층 명시

## 자주 발생하는 함정
- `system.json`에만 등록하고 `analyses/{id}/analysis.json`을 만들지 않으면 사이드바 클릭 시 에러 — 검증 스크립트가 잡아냄.
- `analysis.json`의 `id`와 폴더명이 다르면 일관성 오류 — 검증 스크립트가 잡아냄.
- 새로운 분석 섹션을 `system.json.analysisSections`에만 추가하고 `main.js`의 `renderAnalysisSection()`에 케이스를 추가하지 않으면 "No content"만 표시됨.
