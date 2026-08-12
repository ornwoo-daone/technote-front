// 문서 레지스트리 — 알림/읽음 추적의 단일 소스.
// 새 덱을 만들면 여기 맨 위에 추가한다 (at = 생성일, 최신순 정렬 기준).
window.DBX_DOCS = [
  { u: 'db2/db2-savingplan-design.html', c: 'DB2', at: '2026-08-12',
    t: 'SavingPlan 구현 설계 · 데이터 플로우',
    d: 'Oracle 구조 대조 → 변경 파일 5개 → DB2 고유 난점 3가지' },

  { u: 'db2/savingplan-prereq.html', c: 'DB2', at: '2026-08-12',
    t: 'SavingPlan에 필요한 DB2 지식',
    d: 'section·package cache·EXPLAIN 프로시저의 쓰기 부작용·plan 해시 부재' },

  { u: 'aws/iam.html', c: 'AWS', at: '2026-08-11',
    t: 'AWS IAM 인증 (DocumentDB · ElastiCache)',
    d: '대기업 보안 규정 대응. mongo 드라이버 4.1+ 필요' },

  { u: 'sqlserver/alwayson.html', c: 'SQL Server', at: '2026-08-11',
    t: 'AlwaysOn · HADR 토폴로지 수집',
    d: 'replica 동기화 상태 + HADR wait delta. FCI는 개념만' },

  { u: 'db2/plan-refactor.html', c: 'DB2', at: '2026-08-11',
    t: 'Plan 코드 리팩터 (공용화·스레드 안전)',
    d: '3경로 중복 제거 + static 가변맵 제거로 스레드 안전 확보' },

  { u: 'db2/disk-retention.html', c: 'DB2', at: '2026-08-11',
    t: 'Plan 저장 disk 누적 이슈 (실측)',
    d: '이벤트모니터·EXPLAIN 테이블 자동삭제 없음, 가득 차면 중단' },

  { u: 'db2/db2-plan-depth-deck.html', c: 'DB2', at: '2026-08-11',
    t: 'Plan depth 슬라이드 덱',
    d: '예제·도식·코드 단계별 (인터랙티브)' },

  { u: 'db2/plan.html', c: 'DB2', at: '2026-08-11',
    t: 'Plan 수집 · depth · SavingPlan',
    d: 'executable_id → EXPLAIN_FROM_SECTION → 트리/depth → 서버. 설계 포함' },

  { u: 'postgresql/encoding-sqlascii.html', c: 'PostgreSQL', at: '2026-08-11',
    t: '인코딩 / SQL_ASCII 깨짐',
    d: '인코딩 무검증 타입에서 조용히 깨지는 원리' }
];
