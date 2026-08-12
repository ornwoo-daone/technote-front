# 문서 레지스트리 규칙

`src/entities/docs/registry.ts` 가 **셸 전체의 단일 소스**다.
홈 타일, 카테고리 목록, 검색 인덱스, 알림 목록이 전부 여기서 파생된다.
화면 어딘가에 문서를 따로 하드코딩하지 않는다.

## 타입이 자동으로 따라온다

```ts
const CAT_LIST = [ … ] as const satisfies readonly Cat[];
export type CatId = (typeof CAT_LIST)[number]['f'];   // 카테고리 추가 → 유니온 자동 확장
export const CATS: readonly Cat[] = CAT_LIST;          // 소비 측엔 넓힌 타입으로
```

- `Doc.cat` 이 `CatId` 라서 **오타는 컴파일에서 잡힌다** (`'db22'` → "Did you mean 'db2'?").
- `CAT_LIST` 를 `as const` 인 채로 export 하면 일부 항목에만 있는 옵셔널 필드(`g`, `lead`,
  `mono`)에 접근이 막힌다. 그래서 리터럴(`CAT_LIST`)과 export(`CATS`)를 분리해 둔 것 —
  **합치지 말 것.**

## 문서 추가

`DOCS` 에 한 줄 + `content/<cat>/<slug>.mdx` 파일. 둘 중 하나만 하면 라우트가 깨진다.

```ts
{ cat: 'java', slug: 'gc-basics', session: 'basic', at: '2026-08-12',
  t: '제목', d: '한 줄 요약', k: '검색 키워드 공백구분',
  load: () => import('./content/java/gc-basics.mdx') },
```

- `at` 은 `YYYY-MM-DD`. 알림 정렬과 신규 감지가 이 값을 쓴다.
- `session` 은 **그 카테고리의 `sessions[].key` 중 하나**여야 한다. 학습 카테고리는
  `STUDY_SESSIONS`(basic/practice/deep/issue), DB 카테고리는 `SESSIONS`(work/concept/verify/support).
  이 대응은 타입으로 강제되지 않으니 직접 확인할 것.
- `deploy` 는 배포 버전 문자열 또는 `'pending'`. 생략하면 태그가 안 붙는다.

## 카테고리 추가

`CAT_LIST` 에 한 줄. `g` 가 홈 섹션(`GROUPS` 의 key)이며 생략하면 `'db'`.

```ts
{ f: 'rust', name: 'Rust', g: 'lang', icon: '/assets/icons/rust.png', sessions: STUDY_SESSIONS,
  lead: '한 줄 설명' },
```

- 로고가 아직 없으면 `icon` 대신 `mono: '⚛'` — 글리프 타일로 렌더된다(React 가 지금 이 상태).
- 로고는 `public/assets/icons/` 에 둔다. ⚠️ `public/` 은 junction이라 실서비스에 즉시 반영된다.
- 타일 크기가 안 맞으면 `iconCls` 로 조정 (`ci-big` `ci-mid` `ci-wt` 등, guide.css 정의).

## 건드리면 안 되는 것

`docKey(d)` = `` `${cat}/${slug}.html` ``. 이 형식이 localStorage `dbxRead` 에 이미 쌓여
있는 레거시 데이터의 키다. **바꾸면 사용자의 읽음 기록이 전부 날아간다.**
`dbxSeenAt` `dbxToasted` `dbxPalette` 도 레거시 vanilla 스크립트와 공유하는 키다.
