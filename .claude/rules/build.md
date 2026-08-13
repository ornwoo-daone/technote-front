# 빌드 · 환경 규칙

## 빌드가 둘이다

| | 도구 | 진입점 | 트랜스파일 |
|---|---|---|---|
| dev | Vite (5173) | `index.html` → `/src/app/main.tsx` | esbuild |
| prod | webpack → `dist/` | `webpack.config.js` entry | babel |

**설정을 건드리면 양쪽 다 반영한다.** 한쪽만 고치면 dev 에선 되는데 배포가 깨진다.
특히 새 확장자를 추가할 때 webpack 은 `resolve.extensions` 와 `module.rules` 둘 다 손봐야 한다.

MDX 는 dev `@mdx-js/rollup`, prod `@mdx-js/loader` 로 서로 다른 플러그인을 쓴다 —
`providerImportSource: '@mdx-js/react'` 옵션이 양쪽에 다 있어야 `MDXProvider` 매핑이 먹는다.

### CSS 안의 절대경로 `url()` 은 prod 만 깨진다

`src/` 의 CSS 에 `url('/assets/icons/x.png')` 를 쓰면 **webpack 만** 실패한다.

- Vite: `/` 로 시작하는 URL 은 `publicDir` 기준이라 그대로 통과 → **dev 는 멀쩡하다**
- webpack: `css-loader` 가 이걸 모듈로 해석하려 든다 → `Module not found`

로더 설정(`css-loader` 의 `url.filter`)을 풀어 맞추지 말 것 — 두 빌드가 갈라지는 걸 늘리는 방향이다.
**경로는 컴포넌트의 인라인 스타일로 옮긴다.** `BookmarkIcon.tsx` 의 `mask-image` 가 그 사례다.

## ⚠️ public/ 은 junction

`public/` → `C:\htmls\dbx-guide` 의 junction이다. **복사본이 아니라 같은 실체.**

- 여기 쓰면 실서비스 원본이 즉시 바뀐다. 삭제·이동 금지.
- 파일을 덮어쓰기 전에 반드시 대상이 뭔지 먼저 확인한다.
- 원본 쪽에 git 자동 스냅샷(`serve_guide.py`, 30초 주기)이 돈다 → 되돌리기: `git -C C:\htmls log`
- junction 재생성: `cmd /c mklink /J C:\projects\technote-front\public C:\htmls\dbx-guide`

### git 이 junction 을 끊는다 — 실제로 발생한 사고

**`public/` 은 이 저장소에서 추적하지 않는다**(`.gitignore`). 파일의 주인은 `C:\htmls` 저장소다.
같이 추적하면 같은 파일에 주인이 둘이 되고, **Git for Windows 는 junction 을 이해하지 못해
링크를 통과해 쓰는 대신 링크 자체를 끊고 일반 디렉토리로 갈아치운다.**

- 방아쇠가 된 명령: `git checkout <다른 브랜치>` (그 외 `stash` `reset --hard` `clean` `pull` 도 동일)
- 증상: 아이콘·`guide.css`·레거시 HTML 이 통째로 사라진 것처럼 보인다. 실제 원본은 멀쩡하다.
- 진단: `(Get-Item public -Force).LinkType` 이 비어 있으면 링크가 끊긴 것
- 회복: 가짜 디렉토리 제거 → 위 `mklink` 재실행. `npm run test` 가 이 상태를 잡는다.

**그래서 이 저장소는 브랜치를 파지 않고 `master` 에 직접 커밋한다.**
브랜치 전환 자체가 위험 요인이라, 일반적인 권장(브랜치 우선)보다 이 제약이 우선한다.

## 레거시와 공존 중

`C:\htmls\serve_guide.py` (port 8777) 가 바탕화면 "Tech Note" 앱이 쓰는 서버로 계속 살아 있다.
`public/assets/` 의 vanilla 스크립트(`theme.js` `notify.js` `unread.js` `docs.js` `deck.js` `dbpage.js`)도
그대로 동작한다. React 셸은 **같은 localStorage 키를 공유**하므로 키 계약을 깨지 않는다
(→ [registry 규칙](registry.md) 마지막 절).

**레거시는 은퇴 예정이다** (→ `.claude/rules/legacy-retirement.md`). 1단계로 React 빌드는
`public/` 에서 분리됐다 — 정적 자원은 repo 가 소유하는 `static/` 에서 온다.
**React 스타일·자산 수정은 `static/` 과 `src/` 에만 한다. `public/` 은 건드리지 않는다.**

⚠️ **`public/assets/guide.css` 는 이제 레거시 전용으로 동결됐다.** 스타일은 있는데 그걸 만들던 vanilla JS 가
이식되지 않으면 기능이 아무 에러 없이 사라진다. 이식 현황과 남은 누락은
`.claude/rules/legacy-parity.md` 에 표로 관리한다 — 레거시 동작을 건드릴 때 먼저 볼 것.

## 테스트

`npm run test` (Vitest). **레지스트리를 고쳤으면 반드시 돌린다.**

- `src/entities/docs/registry.test.ts` — 타입·빌드가 못 잡는 정합성 구멍
  (slug 중복, session 불일치, `at` 형식, 아이콘 파일 누락, 미등록 orphan mdx, `docKey` 형식 고정)
- `src/features/read-tracking/useRead.test.ts` — localStorage 저장 형식 계약
- `src/entities/docs/mdx-pipeline.test.ts` — dev/prod MDX 플러그인 설정 일치
- `src/entities/docs/deck-crossref.test.ts` — 덱이 서로를 가리키는 문구의 카테고리 라벨 정합성

덱을 새로 쓰거나 크게 고쳤으면 `deck-review` 스킬의 검증 절차를 따른다.

테스트는 **자동으로 안 잡히는 것만** 검사한다. 빌드나 타입이 이미 막는 걸 또 검사하지 않는다
(없는 `.mdx` 경로는 번들러가 빌드 에러로 잡으므로 테스트 대상이 아니다).
새 테스트를 추가할 때도 이 기준을 지킨다 — 결함을 일부러 주입해 **실제로 실패하는지 확인**할 것.

컴포넌트 테스트(RTL)와 E2E 는 의도적으로 두지 않았다. 지금 규모에선 유지비가 더 크다.

## 완료 기준

`npm run build` 통과. 이 명령이 `typecheck` → `test` 를 먼저 돌리므로,
타입 에러나 정합성 오류가 있으면 빌드 산출물이 나오지 않는다.
통과 못 했으면 통과 못 했다고 출력과 함께 보고한다.
