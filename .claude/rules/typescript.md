# TypeScript 규칙

`tsconfig.json` 은 `strict` + `noUncheckedIndexedAccess` + `noUnusedLocals` +
`noUnusedParameters` + `verbatimModuleSyntax` 까지 켜져 있다. **완화하지 않는다.**
타입이 걸리면 설정을 푸는 게 아니라 코드를 고친다.

## 금지

- `any` — 모르면 `unknown` 으로 받고 좁힌다.
- `as` 남용 — DOM 이벤트 타깃(`e.target as HTMLElement | null`)처럼 타입 시스템이
  구조적으로 알 수 없는 곳에만. 로직상의 타입 불일치를 `as` 로 덮지 않는다.
- `@ts-ignore` / `@ts-expect-error` — 붙여야 할 상황이면 먼저 설계를 의심한다.
- 타입 검사 없이 커밋. `npm run build` 가 `typecheck` 를 먼저 돌린다.

## 관례

- **import 에 확장자를 쓰지 않는다.** `from './registry'` (O) / `'./registry.ts'` (X).
  `.mdx` 만 예외로 확장자를 붙인다 — 로더가 확장자로 구분한다.
- 타입 전용 import 는 `import type { … }`. `verbatimModuleSyntax` 라 섞어 쓰면 에러.
- 이벤트 핸들러는 React 타입을 쓴다: `MouseEvent as ReactMouseEvent`,
  `KeyboardEvent as ReactKeyboardEvent`. DOM 리스너(`addEventListener`)는 전역 타입 그대로.
- CSS 커스텀 프로퍼티는 `style={{ '--a': v } as CSSProperties}`.
- 데이터 배열에서 타입을 파생시킨다. 유니온을 손으로 유지하지 말 것 — [registry 규칙](registry.md) 참고.
- 빈 `catch {}` 에는 이유를 한 줄 남긴다: `catch { /* 저장 실패는 무시 */ }`.

## 타입 검사와 번들링은 별개

Babel(`@babel/preset-typescript`)과 esbuild 는 **타입을 지우기만** 하고 검사하지 않는다.
그래서 검사는 `tsc --noEmit` 이 전담한다. 빌드가 통과했다고 타입이 맞는 게 아니다.
