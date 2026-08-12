// 문서 레지스트리 — 셸 전체(홈/리스트/검색/알림)의 단일 소스.
// 새 덱 등록 = content/ 에 mdx 추가 + 여기 한 줄.
export const DOCS = [
  { cat: 'db2', slug: 'db2-savingplan-design', session: 'work', at: '2026-08-12', deploy: 'pending',
    t: 'SavingPlan 구현 설계 · 데이터 플로우',
    d: 'Oracle 구조 대조 → 변경 파일 5개 → DB2 고유 난점 3가지',
    k: 'db2 savingplan 구현 설계 데이터 플로우 subcountcollector instancesub activesessionlist 큐 delete staging plan change 오탐 버전가드 configure db2_plan_saving',
    load: () => import('./content/db2/db2-savingplan-design.mdx') },

  { cat: 'db2', slug: 'savingplan-prereq', session: 'concept', at: '2026-08-12',
    t: 'SavingPlan에 필요한 DB2 지식',
    d: 'section·package cache·EXPLAIN 프로시저의 쓰기 부작용·plan 해시 부재',
    k: 'savingplan 개념 section executable_id package cache evict explain from section activity 5-key stream rank 권한 sysinstallobjects 버전',
    load: () => import('./content/db2/savingplan-prereq.mdx') },

  { cat: 'aws', slug: 'iam', session: 'work', at: '2026-08-11', deploy: 'v2.63.04',
    t: 'AWS IAM 인증 (DocumentDB · ElastiCache)',
    d: '대기업 보안 규정 대응. mongo 드라이버 4.1+ 필요',
    k: 'aws iam 인증 documentdb elasticache mongodb-aws createawscredential 드라이버 lg 유플러스 보안 규정',
    load: () => import('./content/aws/iam.mdx') },

  { cat: 'sqlserver', slug: 'alwayson', session: 'work', at: '2026-08-11', deploy: 'v2.63.04',
    t: 'AlwaysOn · HADR 토폴로지 수집',
    d: 'replica 동기화 상태 + HADR wait delta. FCI는 개념만',
    k: 'sqlserver mssql alwayson hadr topology 동기화 replica wait fci listener 역할변경',
    load: () => import('./content/sqlserver/alwayson.mdx') },

  { cat: 'db2', slug: 'plan-refactor', session: 'work', at: '2026-08-11', deploy: 'pending',
    t: 'Plan 코드 리팩터 (공용화·스레드 안전)',
    d: '3경로 중복 제거 + static 가변맵 제거로 스레드 안전 확보',
    k: 'refactor 리팩터 공용화 static thread safe collectrow plancontext 중복제거 -184',
    load: () => import('./content/db2/plan-refactor.mdx') },

  { cat: 'db2', slug: 'disk-retention', session: 'verify', at: '2026-08-11',
    t: 'Plan 저장 disk 누적 이슈 (실측)',
    d: '이벤트모니터·EXPLAIN 테이블 자동삭제 없음, 가득 차면 중단',
    k: 'disk 누적 event monitor explain table pctdeactivate retention 자동삭제 sql1630',
    load: () => import('./content/db2/disk-retention.mdx') },

  { cat: 'db2', slug: 'db2-plan-depth-deck', session: 'work', at: '2026-08-11', deploy: 'v2.63.04',
    t: 'Plan depth 슬라이드 덱',
    d: '예제·도식·코드 단계별 (인터랙티브)',
    k: 'depth 계산 tree parentmap calcdepth 예제 슬라이드 덱',
    load: () => import('./content/db2/db2-plan-depth-deck.mdx') },

  { cat: 'db2', slug: 'plan', session: 'work', at: '2026-08-11', deploy: 'pending',
    t: 'Plan 수집 · depth · SavingPlan',
    d: 'executable_id → EXPLAIN_FROM_SECTION → 트리/depth → 서버. 설계 포함',
    k: 'plan 수집 executable_id explain from section depth tree parentmap savingplan',
    load: () => import('./content/db2/plan.mdx') },

  { cat: 'postgresql', slug: 'encoding-sqlascii', session: 'concept', at: '2026-08-11',
    t: '인코딩 / SQL_ASCII 깨짐',
    d: '인코딩 무검증 타입에서 조용히 깨지는 원리',
    k: '인코딩 encoding sql_ascii mojibake euckr utf8 깨짐 nls_lang latin1',
    load: () => import('./content/postgresql/encoding-sqlascii.mdx') },
];

export const CATS = [
  { f: 'db2', name: 'DB2', icon: '/assets/icons/db2.png', iconCls: 'ci-big' },
  { f: 'postgresql', name: 'PostgreSQL', icon: '/assets/icons/postgresql.png' },
  { f: 'sqlserver', name: 'SQL Server', icon: '/assets/icons/sqlserver.png' },
  { f: 'aws', name: 'AWS', icon: '/assets/icons/aws.png' },
  { f: 'oracle', name: 'Oracle', icon: '/assets/icons/oracle.png', iconCls: 'ci-big' },
  { f: 'mysql', name: 'MySQL', icon: '/assets/icons/mysql.png', iconCls: 'ci-mid' },
  { f: 'tibero', name: 'Tibero', icon: '/assets/icons/tibero.png', iconCls: 'ci-tib' },
  { f: 'cubrid', name: 'CUBRID', icon: '/assets/icons/cubrid.png' },
  { f: 'mongo', name: 'MongoDB', icon: '/assets/icons/mongo.svg' },
  { f: 'redis', name: 'Redis', icon: '/assets/icons/redis.svg' },
  { f: 'gcp', name: 'Google Cloud Platform', icon: '/assets/icons/gcp.png', iconCls: 'ci-gcp' },
  { f: 'ncp', name: 'Naver Cloud Platform', icon: '/assets/icons/ncp.png', iconCls: 'ci-ncp' },
  { f: 'singlestore', name: 'SingleStore', icon: '/assets/icons/singlestore.png', iconCls: 'ci-ss' },
  { f: 'hana', name: 'SAP HANA', icon: '/assets/icons/hana.png', iconCls: 'ci-hana' },
  { f: 'scailium', name: 'Scailium', icon: '/assets/icons/scailium.png', iconCls: 'ci-sca' },
  { f: 'dbx', name: 'DBX 공통', icon: '/assets/icons/whatap.png', iconCls: 'ci-wt' },
];

export const SESSIONS = [
  { key: 'all', label: 'ALL' },
  { key: 'work', label: 'DBX' },
  { key: 'concept', label: 'DB' },
  { key: 'verify', label: 'TEST' },
  { key: 'support', label: 'Support' },
];

export const docsOf = (cat) => DOCS.filter((d) => d.cat === cat);
export const findDoc = (cat, slug) => DOCS.find((d) => d.cat === cat && d.slug === slug);
export const docKey = (d) => d.cat + '/' + d.slug + '.html';   // 기존 dbxRead 키와 호환
