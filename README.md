# Web Design System

웹사이트 분석 카탈로그형 디자인시스템.

[dohoon0505/desgin_system](https://github.com/dohoon0505/desgin_system) (APP 기반 vanilla HTML/CSS/JS 디자인시스템)의 **시스템 골격**(레이아웃, 좌측 네비게이터, MD 다운로드, 라우팅, 검증 스크립트)을 미러링하되, **목적이 완전히 다릅니다**.

## 컨셉

- 사용자가 웹페이지 URL을 제공
- 어시스턴트가 해당 사이트를 분석 (기술 스택, 색상, 타이포그래피, 레이아웃, 컴포넌트, 아이코노그래피, 인터랙션, 접근성)
- 분석 결과가 `analyses/{id}/` 폴더에 `analysis.json` + `analysis.md`로 저장됨
- `system.json` 매니페스트에 등록되면 좌측 네비게이터에 카테고리로 누적
- 누적된 분석들이 디자인시스템 카탈로그를 형성

## 빠른 시작

브라우저에서 `index.html`을 직접 열면 동작합니다. 빌드 도구나 의존성 설치가 필요하지 않습니다.

`file://` 프로토콜로 열 때 fetch 제약이 있는 브라우저(Chrome 등)에서는 간단한 로컬 서버를 사용하세요:

```bash
# Python
python -m http.server 8080
# Node (npx)
npx serve .
```

브라우저에서 `http://localhost:8080`을 엽니다.

## 디렉터리 구조

```
web_design_system/
├── index.html                  # 단일 진입점 (레이아웃 셸)
├── assets/
│   ├── css/main.css           # 시스템 스타일
│   └── js/main.js             # 라우터 + 동적 사이드바 + MD 다운로드 + 테마
├── analyses/                   # 분석된 사이트별 폴더
│   └── {id}/
│       ├── analysis.json       # 구조화된 분석 데이터
│       ├── analysis.md         # 사람이 읽는 리포트
│       └── screenshots/        # 선택
├── schemas/
│   └── analysis.schema.json    # 분석 데이터 JSON Schema
├── scripts/
│   └── validate.mjs            # JSON 무결성 + 매니페스트 일치 검증
├── system.json                 # 매니페스트 (analyses 배열)
├── AGENTS.md                   # 어시스턴트 분석 워크플로
├── CLAUDE.md                   # 기여자 가이드라인
└── README.md
```

## 분석 추가 방법

1. 사용자가 어시스턴트에게 URL 전달 (예: "amazon.com 분석해줘")
2. 어시스턴트가 `AGENTS.md` 절차에 따라 사이트 분석
3. `analyses/{id}/analysis.json`과 `analysis.md` 생성
4. `system.json`에 entry 추가
5. 사용자 브라우저 새로고침 → 사이드바에 새 카테고리 표시

## 명령어

```bash
# 매니페스트 ↔ 파일 일치 검증
npm run validate
```

## 기능

- **좌측 네비게이터**: `system.json`에서 동적 렌더링, 확장/접기, 활성 표시
- **해시 라우팅**: `#analyses/{id}/{section}` 형식 SPA 라우팅
- **MD 다운로드**: 각 분석 상세 페이지에서 마크다운 리포트 다운로드
- **테마 토글**: 라이트/다크 (`data-theme`), localStorage 저장
- **반응형**: 1099px 이하 햄버거 사이드바 + 오버레이
- **검증 스크립트**: JSON 무결성, 매니페스트 ↔ 파일 일치, 스키마 준수
