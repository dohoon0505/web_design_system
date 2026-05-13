# analyses/

각 분석된 웹사이트는 이 폴더 하위에 슬러그-ID 폴더로 보관됩니다.

```
analyses/
└── {id}/
    ├── analysis.json        # 구조화된 분석 데이터 (필수)
    ├── analysis.md          # 사람이 읽는 리포트 (자동 생성, 다운로드용)
    └── screenshots/         # 선택: 사이트 스크린샷
```

데이터 구조는 `schemas/analysis.schema.json`에 정의되어 있습니다.

분석 추가 절차는 `../AGENTS.md`를 참조하세요. 추가 후에는 `system.json`의 `groups.analyses.items`에 entry를 등록해야 사이드바에 나타납니다.

매니페스트와 폴더 일관성은 `npm run validate`로 확인합니다.
