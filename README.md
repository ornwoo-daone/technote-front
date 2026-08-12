# Tech Note

DB·DBX 실무 노트 + 언어/프레임워크 학습 노트를 한 셸에서 보는 정적 사이트.
React 19 + TypeScript, Node 22.

> 에이전트(Claude Code)용 작업 규칙은 [CLAUDE.md](CLAUDE.md) 와 `.claude/` 에 있다.
> 이 문서는 사람이 읽는 프로젝트 소개다.

## 구조

```
technote-front/
├─ public/            ← ⚠️ junction → C:\htmls\dbx-guide (복사본 아님, 같은 실체)
│                        기존 사이트 전체가 여기서 그대로 서빙된다
├─ src/               FSD (Feature-Sliced Design) 6층
│  │                  import 방향: app→pages→widgets→features→entities→shared (위층은 아래층만)
│  ├─ app/            엔트리·전역 설정 (main.tsx, App.tsx)
│  ├─ pages/          라우트 단위 페이지 (HomePage / CategoryPage / DeckPage — 조립만)
│  ├─ widgets/        페이지를 구성하는 큰 UI 블록 (DeckViewer)
│  ├─ features/       사용자 행동 단위 기능 (notify/ theme/ search/ read-tracking/)
│  ├─ entities/       도메인 모델 (docs/ = registry.ts + content/*.mdx)
│  └─ shared/         공용 최하층 (ui/slide-kit.tsx, assets/shell.css, types/mdx.d.ts)
├─ CLAUDE.md          에이전트 작업 규칙 (rules/ 를 @import)
├─ .claude/           rules / agents / skills / commands  → .claude/README.md
├─ index.html         Vite 진입점 (#root 마운트 + 테마 부트스트랩)
├─ tsconfig.json      strict + noUncheckedIndexedAccess
├─ vite.config.js     개발 서버 (port 5173)
└─ webpack.config.js  운영 빌드 (dist/)
```

## 명령

```
npm run dev        # 개발: Vite (5173). public 파일 수정 시 자동 리로드
npm run typecheck  # tsc --noEmit (babel/esbuild 는 타입을 검사하지 않는다)
npm run test       # Vitest — 레지스트리 정합성 + 순수 로직
npm run test:watch # 감시 모드
npm run build      # 운영: typecheck → test 통과 후 webpack → dist/
npm run preview    # dist/ 를 로컬에서 확인
```

`build` 는 `typecheck` 와 `test` 를 먼저 돌린다. 하나라도 실패하면 배포 산출물이 나오지 않는다.

## 테스트

빌드나 타입이 **이미 잡는 것은 검사하지 않는다.** 없는 `.mdx` 경로는 번들러가 빌드 에러로,
`cat` 오타는 `CatId` 유니온이 타입 에러로 막는다. 테스트는 그 그물을 빠져나가는 것만 본다:

- `src/entities/docs/registry.test.ts` — slug 중복, `session` 불일치, `at` 형식,
  아이콘 파일 누락, 미등록 orphan `.mdx`, `docKey` 형식 고정
- `src/features/read-tracking/useRead.test.ts` — localStorage `dbxRead` 저장 형식 계약

## 문서(덱) 추가

**등록의 단일 소스는 `src/entities/docs/registry.ts` 하나다.**
홈 타일·카테고리 목록·검색·알림이 전부 여기서 파생된다. 화면 쪽에 따로 추가할 것은 없다.

1. `src/entities/docs/content/<cat>/<slug>.mdx` 작성
2. `registry.ts` 의 `DOCS` 맨 앞에 한 줄 추가

```ts
{ cat: 'react', slug: 'hook-rules', session: 'basic', at: '2026-08-12',
  t: '제목', d: '한 줄 요약', k: '검색 키워드 공백구분',
  load: () => import('./content/react/hook-rules.mdx') },
```

`cat` 은 `CAT_LIST` 에서 파생된 `CatId` 유니온이라 오타가 나면 `npm run typecheck` 에서 잡힌다.
카테고리 자체를 새로 추가하려면 `CAT_LIST` 에 한 줄 + `public/assets/icons/` 에 로고.

> 레거시였던 `public/assets/docs.js` 방식은 더 이상 쓰지 않는다.
> 해당 파일은 아직 남아 있지만 기존 vanilla 페이지 전용이다.

## ⚠️ public 은 junction

`public\` 을 지우거나 안의 파일을 수정하면 **원본 `C:\htmls\dbx-guide` 가 그대로 바뀐다.**
- 원본 쪽엔 git 자동 스냅샷(serve_guide.py, 30초)이 돌고 있다 — 되돌리기: `git -C C:\htmls log`
- junction 재생성: `cmd /c mklink /J C:\projects\technote-front\public C:\htmls\dbx-guide`

**`public/` 은 이 저장소에서 추적하지 않는다**(`.gitignore`). 파일의 주인은 `C:\htmls` 저장소다.
같이 추적하면 같은 파일에 주인이 둘이 되는데, Git for Windows 는 junction 을 이해하지 못해
`checkout` · `stash` · `reset --hard` 같은 명령이 **링크 자체를 끊고 일반 디렉토리로 갈아치운다.**
실제로 한 번 발생했다. 그래서 이 저장소는 브랜치를 파지 않고 `master` 에 직접 커밋한다.

링크가 끊겼는지 확인: `(Get-Item public -Force).LinkType` — 비어 있으면 끊긴 것.
`npm run test` 도 이 상태를 잡는다.

> 새 PC 에서 클론했다면 `public/` 이 없다. 위 `mklink` 를 먼저 실행해야 빌드가 된다.

## 기존 인프라와의 관계 (그대로 살아 있음)

- `C:\htmls\serve_guide.py` (port 8777): 바탕화면 "Tech Note" 앱 바로가기가 쓰는 서버. 부팅 시 자동 시작
- Vite(5173)는 개발용. 같은 파일을 서빙하므로 어느 쪽으로 봐도 내용 동일
- `public/assets/` 의 vanilla 스크립트(theme.js / notify.js / unread.js / docs.js / deck.js)는
  레거시 페이지가 아직 쓴다. React 셸과 **localStorage 키를 공유**한다
  (`dbxRead` `dbxSeenAt` `dbxToasted` `dbxPalette`) — 키 형식을 바꾸면 양쪽이 다 깨진다
