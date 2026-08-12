---
name: new-category
description: technote-front 에 새 카테고리(기술·DB) 타일을 추가할 때 사용. "카테고리 추가", "Rust 타일 만들어줘", "새 기술 섹션" 같은 요청에 해당. 레지스트리 등록·아이콘 배치·홈 섹션 배정까지 한 번에 처리한다.
---

# 카테고리 추가

## 1. 어느 섹션인지 정한다

`GROUPS` 의 key 가 홈 화면 섹션이다.

| g | 섹션 라벨 | 대상 |
|---|---|---|
| `db` (생략 시 기본) | DATABASE · DBX | DB 엔진, 클라우드, DBX 공통 |
| `lang` | LANGUAGE | 프로그래밍 언어 |
| `stack` | BACKEND · FRONTEND | 프레임워크·라이브러리 |
| `infra` | INFRA · TOOLS | 형상관리·OS·배포 도구 |

어디에도 안 맞으면 `GROUPS` 에 새 섹션을 추가한다. `GroupKey` 는 `GROUPS` 에서
자동 파생되므로 타입은 따로 손댈 필요가 없다.

## 2. 아이콘을 배치한다

`public/assets/icons/<name>.png` 에 둔다.

⚠️ `public/` 은 `C:\htmls\dbx-guide` 로의 junction이다 — 쓰는 즉시 실서비스에 반영된다.
같은 이름의 파일이 이미 있는지 **먼저 확인**하고, 덮어쓰지 않는다.

로고가 없으면 `icon` 대신 `mono` 에 글리프 한 글자를 넣는다. 나중에 로고가 생기면
`mono` 를 `icon` 으로 교체하면 된다.

## 3. `CAT_LIST` 에 등록한다

`src/entities/docs/registry.ts`:

```ts
{ f: 'rust', name: 'Rust', g: 'lang', icon: '/assets/icons/rust.png',
  sessions: STUDY_SESSIONS, lead: '소유권·라이프타임·에러 처리.' },
```

- `f` 가 URL 경로(`/#/rust`)이자 `CatId` 유니온의 멤버가 된다. 소문자 영숫자로.
- 학습 카테고리는 `sessions: STUDY_SESSIONS`. DB 카테고리는 `sessions` 를 생략해
  기본 `SESSIONS`(work/concept/verify/support)를 쓴다.
- `lead` 는 카테고리 페이지 상단 한 줄. 생략하면 "…에이전트 기능·개념·검증된 이슈."가 나온다.

## 4. 확인

- `npm run typecheck` — `f` 오타나 잘못된 `g` 는 여기서 잡힌다.
- 문서가 0개인 카테고리는 홈에서 "준비 중"으로 흐리게 표시된다. 정상이다.
- 타일 아이콘 크기가 어색하면 `iconCls` 로 조정한다 (`ci-big` `ci-mid` 등, guide.css 정의).

## 하지 말 것

- 홈/검색/알림 쪽 컴포넌트를 건드리는 것. 전부 `CATS` 에서 파생되므로 레지스트리만 고치면 된다.
- `CAT_LIST` 와 `CATS` 를 하나로 합치는 것 — 옵셔널 필드 접근이 막힌다.
