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

## ⚠️ public/ 은 junction

`public/` → `C:\htmls\dbx-guide` 의 junction이다. **복사본이 아니라 같은 실체.**

- 여기 쓰면 실서비스 원본이 즉시 바뀐다. 삭제·이동 금지.
- 파일을 덮어쓰기 전에 반드시 대상이 뭔지 먼저 확인한다.
- 원본 쪽에 git 자동 스냅샷(`serve_guide.py`, 30초 주기)이 돈다 → 되돌리기: `git -C C:\htmls log`
- junction 재생성: `cmd /c mklink /J C:\projects\technote-front\public C:\htmls\dbx-guide`

## 레거시와 공존 중

`C:\htmls\serve_guide.py` (port 8777) 가 바탕화면 "Tech Note" 앱이 쓰는 서버로 계속 살아 있다.
`public/assets/` 의 vanilla 스크립트(`theme.js` `notify.js` `unread.js` `docs.js` `deck.js`)도
그대로 동작한다. React 셸은 **같은 localStorage 키를 공유**하므로 키 계약을 깨지 않는다
(→ [registry 규칙](registry.md) 마지막 절).

## 테스트

`npm run test` (Vitest). **레지스트리를 고쳤으면 반드시 돌린다.**

- `src/entities/docs/registry.test.ts` — 타입·빌드가 못 잡는 정합성 구멍
  (slug 중복, session 불일치, `at` 형식, 아이콘 파일 누락, 미등록 orphan mdx, `docKey` 형식 고정)
- `src/features/read-tracking/useRead.test.ts` — localStorage 저장 형식 계약

테스트는 **자동으로 안 잡히는 것만** 검사한다. 빌드나 타입이 이미 막는 걸 또 검사하지 않는다
(없는 `.mdx` 경로는 번들러가 빌드 에러로 잡으므로 테스트 대상이 아니다).
새 테스트를 추가할 때도 이 기준을 지킨다 — 결함을 일부러 주입해 **실제로 실패하는지 확인**할 것.

컴포넌트 테스트(RTL)와 E2E 는 의도적으로 두지 않았다. 지금 규모에선 유지비가 더 크다.

## 완료 기준

`npm run build` 통과. 이 명령이 `typecheck` → `test` 를 먼저 돌리므로,
타입 에러나 정합성 오류가 있으면 빌드 산출물이 나오지 않는다.
통과 못 했으면 통과 못 했다고 출력과 함께 보고한다.
