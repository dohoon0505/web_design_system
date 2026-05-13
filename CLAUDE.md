# CLAUDE.md — 기여 가이드라인

본 프로젝트(Web Reference Lab)에 변경을 가할 때 따라야 할 원칙입니다.

## 프로젝트 개요

실제 운영 중인 웹사이트의 디자인 시스템을 연구원 수준으로 분석하는 레퍼런스 카탈로그입니다. URL을 전달하면 10가지 관점(개요, 레이아웃, 타이포그래피, 컬러, 컴포넌트, 인터랙션, 스크롤, 둥글기, 여백, 접근성)에서 심층 분석한 레퍼런스 보고서를 생성합니다.

## 3계층 동시 갱신

어떤 변경이든 다음 세 계층을 동시에 갱신해야 일관성이 깨지지 않습니다.

| 계층 | 위치 | 역할 |
|------|------|------|
| **운영 소스** | `index.html`, `assets/css/main.css`, `assets/js/main.js` | 실제 동작하는 셸과 로직 |
| **데이터 매니페스트** | `system.json`, `analyses/{id}/analysis.json` | 시스템 메타데이터 + 분석 결과 |
| **문서** | `README.md`, `AGENTS.md`, 본 파일 | 기여자/에이전트 가이드 |

예시: 새 레퍼런스 분석 추가 시 → `system.json.references[]` 추가 + `analyses/{id}/analysis.json` 생성 + 사이드바 자동 반영.

## 컨벤션

### 파일 경로
- 단일 진입점: `index.html`
- 정적 자원: `assets/css/`, `assets/js/`
- 분석 데이터: `analyses/{id}/` (id는 슬러그)
- 스크립트: `scripts/` (ESM, Node 18+)

### 네이밍
- 분석 ID: `^[a-z0-9][a-z0-9-]*$` (영소문자 시작, 영소문자/숫자/하이픈만)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 색상: hex (`#RRGGBB` 또는 `#RRGGBBAA`)

### CSS 토큰
- Primitive: `--p-{family}-{step}` (예: `--p-neutral-100`)
- Semantic: `--sm-{role}-{variant}` (예: `--sm-content-primary`)

### JavaScript
- ES6+ vanilla, 외부 의존성 없음
- 단일 IIFE `(function(){ 'use strict'; ... })();`
- HTML 삽입 시 사용자 데이터는 반드시 `escapeHtml()` 적용

## 안전 / 보안
- `analysis.json`의 사용자 제공 텍스트(`url`, `title`, `summary` 등)는 모두 escape 후 렌더링.
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 적용.
- 스크린샷 등 외부 자원은 분석 폴더 내 상대 경로로만 참조.

## 검증

```bash
node scripts/validate.mjs
```

수정 시 예상되는 동작:
- `system.json` 등록과 실제 폴더가 어긋나면 error
- 폴더는 있는데 등록 안 됨 → warning
- 필수 필드 누락 → error

## 브라우저 호환
- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용

## 기여 절차
1. 변경하려는 영역 식별 (셸/데이터/문서)
2. 위 3계층 중 영향받는 모든 계층을 같은 커밋으로 묶기
3. `scripts/validate.mjs` 통과 확인
4. `index.html`을 브라우저에서 열어 라이트/다크 + 모바일 토글 동작 확인
5. 커밋 메시지에 영향받은 계층 명시
