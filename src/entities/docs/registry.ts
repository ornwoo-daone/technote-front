// 문서 레지스트리 — 셸 전체(홈/리스트/검색/알림)의 단일 소스.
// 새 덱 등록 = content/ 에 mdx 추가 + DOCS 에 한 줄.
import type { ComponentType } from 'react';

// ── 타입 ────────────────────────────────────────────────────────────────
export type GroupKey = (typeof GROUPS)[number]['key'];

/** CAT_LIST 의 f 값 유니온. 오타 난 cat 은 컴파일 단계에서 걸린다. */
export type CatId = (typeof CAT_LIST)[number]['f'];

export interface Session {
  readonly key: string;
  readonly label: string;
}

export interface Cat {
  readonly f: string;
  readonly name: string;
  /** 홈 허브 섹션. 생략하면 'db' */
  readonly g?: GroupKey;
  readonly icon?: string;
  readonly iconCls?: string;
  /** icon 이 없을 때 쓰는 임시 글리프 */
  readonly mono?: string;
  readonly lead?: string;
  /** 생략하면 SESSIONS(기본 DB 탭) */
  readonly sessions?: readonly Session[];
}

export interface Doc {
  readonly cat: CatId;
  readonly slug: string;
  /** 해당 카테고리의 sessions[].key 중 하나 */
  readonly session: string;
  /** YYYY-MM-DD */
  readonly at: string;
  readonly t: string;
  readonly d: string;
  /** 검색 키워드 */
  readonly k: string;
  readonly deploy?: string;
  /** 아직 MDX 로 안 옮긴 레거시 HTML 경로 */
  readonly legacy?: string;
  readonly load?: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
}

// ── 데이터 ──────────────────────────────────────────────────────────────
// 홈 허브 섹션. 카테고리의 g 값이 곧 섹션 키 (없으면 'db').
export const GROUPS = [
  { key: 'db', label: 'DATABASE · DBX' },
  { key: 'lang', label: 'LANGUAGE' },
  { key: 'stack', label: 'BACKEND · FRONTEND' },
  { key: 'infra', label: 'INFRA · TOOLS' },
] as const satisfies readonly { key: string; label: string }[];

// 학습 카테고리 공통 세션 탭. 기술마다 탭을 따로 만들 이유가 없어서 문서 성격으로 나눈다.
const STUDY_SESSIONS = [
  { key: 'all', label: 'ALL' },
  { key: 'basic', label: '기초' },
  { key: 'practice', label: '실습' },
  { key: 'deep', label: '심화' },
  { key: 'issue', label: '이슈' },
] as const satisfies readonly Session[];

// as const 로 f 리터럴을 살려 CatId 를 뽑고, 소비 측에는 아래에서 Cat 으로 넓혀 내보낸다.
// (as const 인 채로 export 하면 일부 멤버에만 있는 옵셔널 필드 접근이 막힌다)
const CAT_LIST = [
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

  // ── 학습: 언어 ──
  { f: 'java', name: 'Java', g: 'lang', icon: '/assets/icons/java.png', sessions: STUDY_SESSIONS,
    lead: '문법·JVM 동작·컬렉션·동시성. DBX 에이전트의 주 언어.' },
  { f: 'javascript', name: 'JavaScript', g: 'lang', icon: '/assets/icons/javascript.png', sessions: STUDY_SESSIONS,
    lead: '이벤트 루프·비동기·프로토타입·모듈.' },
  { f: 'typescript', name: 'TypeScript', g: 'lang', icon: '/assets/icons/typescript.png', sessions: STUDY_SESSIONS,
    lead: '타입 시스템·제네릭·유틸리티 타입. 이 프로젝트에 바로 적용.' },
  { f: 'python', name: 'Python', g: 'lang', icon: '/assets/icons/python.png', sessions: STUDY_SESSIONS,
    lead: '스크립트·자동화·데이터 검증.' },
  { f: 'c', name: 'C', g: 'lang', icon: '/assets/icons/c.png', sessions: STUDY_SESSIONS,
    lead: '포인터·메모리 레이아웃. DB 클라이언트 라이브러리·JNI 이해용.' },

  // ── 학습: 백엔드 · 프론트엔드 ──
  { f: 'spring', name: 'Spring', g: 'stack', icon: '/assets/icons/spring.png', sessions: STUDY_SESSIONS,
    lead: 'DI·AOP·Boot 자동설정·트랜잭션.' },
  { f: 'orm', name: 'JPA · MyBatis', g: 'stack', icon: '/assets/icons/mybatis.png', sessions: STUDY_SESSIONS,
    lead: '영속성 컨텍스트·N+1·매퍼 XML·쿼리 튜닝 연계.' },
  { f: 'node', name: 'Node.js', g: 'stack', icon: '/assets/icons/nodejs.png', sessions: STUDY_SESSIONS,
    lead: '런타임·npm·번들러 툴체인.' },
  // react 로고 파일이 없어서 임시 글리프. public/assets/icons/react.png 를 넣고
  // mono 를 icon: '/assets/icons/react.png' 로 바꾸면 된다.
  { f: 'react', name: 'React', g: 'stack', mono: '⚛', sessions: STUDY_SESSIONS,
    lead: '컴포넌트·훅·렌더링 모델. 이 사이트가 React 19.' },
  { f: 'css', name: 'CSS', g: 'stack', icon: '/assets/icons/css.png', sessions: STUDY_SESSIONS,
    lead: '레이아웃·반응형·커스텀 프로퍼티.' },

  // ── 학습: 인프라 · 도구 ──
  { f: 'git', name: 'Git', g: 'infra', icon: '/assets/icons/git.png', sessions: STUDY_SESSIONS,
    lead: '브랜치 전략·rebase·충돌 해결.' },
  { f: 'linux', name: 'Linux', g: 'infra', icon: '/assets/icons/linux.png', sessions: STUDY_SESSIONS,
    lead: '셸·프로세스·네트워크·로그 추적.' },
  { f: 'docker', name: 'Docker', g: 'infra', icon: '/assets/icons/docker.png', sessions: STUDY_SESSIONS,
    lead: '이미지·컨테이너·컴포즈·배포 파이프라인.' },
] as const satisfies readonly Cat[];

export const CATS: readonly Cat[] = CAT_LIST;

export const DOCS: readonly Doc[] = [
  { cat: 'react', slug: 'fsd-architecture', session: 'deep', at: '2026-08-12',
    t: 'FSD 아키텍처 · 왜 이 구조를 쓰나',
    d: '6층 의존 규칙 · features 판단 기준 · 다른 아키텍처와의 차이 · 단점',
    k: 'fsd feature sliced design 아키텍처 구조 층 레이어 layer slice 의존 방향 import features entities widgets shared 판단 기준 atomic design clean architecture hexagonal bulletproof react mvc 폴더 구조 단점 순환 참조',
    load: () => import('./content/react/fsd-architecture.mdx') },

  { cat: 'db2', slug: 'calcdepth-parentmap', session: 'work', at: '2026-08-12',
    t: 'calcDepth — tree DFS vs parentMap',
    d: '다중 뎁스에서 depth가 운에 좌우되는 이유와 parent_id 정합 해법. 도식+라인바이라인',
    k: 'calcdepth parentmap tree dfs depth 다중 뎁스 다이아몬드 순환 자기참조 고아 노드 들여쓰기 불일치 stackoverflow 무한재귀 가드',
    load: () => import('./content/db2/calcdepth-parentmap.mdx') },

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

// DB/DBX 카테고리 기본 세션. 학습 카테고리는 CATS 의 sessions 를 쓴다.
export const SESSIONS: readonly Session[] = [
  { key: 'all', label: 'ALL' },
  { key: 'work', label: 'DBX' },
  { key: 'concept', label: 'DB' },
  { key: 'verify', label: 'TEST' },
  { key: 'support', label: 'Support' },
];

// ── 조회 헬퍼 ───────────────────────────────────────────────────────────
export const docsOf = (cat: string): readonly Doc[] => DOCS.filter((d) => d.cat === cat);
export const findDoc = (cat: string, slug: string): Doc | undefined =>
  DOCS.find((d) => d.cat === cat && d.slug === slug);
export const docKey = (d: Doc): string => d.cat + '/' + d.slug + '.html'; // 기존 dbxRead 키와 호환

export const sessionsOf = (meta: Cat | undefined): readonly Session[] => meta?.sessions ?? SESSIONS;
export const catsOfGroup = (g: GroupKey): readonly Cat[] => CATS.filter((c) => (c.g ?? 'db') === g);
