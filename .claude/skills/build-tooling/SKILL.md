---
name: build-tooling
description: Vite·webpack·babel·npm 등 빌드 설정을 바꿀 때 사용. 로더/플러그인 추가, 확장자 지원, 환경변수, 경로 별칭, 의존성 추가·업그레이드. 이 프로젝트는 dev(Vite)와 prod(webpack) 빌드가 분리돼 있어 한쪽만 고치면 배포가 깨진다.
---

# 빌드 툴체인 변경

## 핵심 위험: 빌드가 둘이다

| | 도구 | 진입점 | 트랜스파일 | MDX |
|---|---|---|---|---|
| dev | Vite (5173) | `index.html` → `/src/app/main.tsx` | esbuild | `@mdx-js/rollup` |
| prod | webpack → `dist/` | `webpack.config.js` 의 `entry` | babel | `@mdx-js/loader` |

**dev 에서 되는 게 배포에서 된다는 보장이 없다.** 설정을 바꾸면 반드시 양쪽 다 반영하고
양쪽 다 빌드해서 확인한다.

```bash
npm run typecheck
npx vite build --logLevel warn      # dev 파이프라인
npx webpack --mode production       # prod 파이프라인
```

## 변경 유형별 체크리스트

### 새 확장자 지원 추가 (예: `.svg` 를 컴포넌트로)
- [ ] Vite: `vite.config.js` 에 플러그인 추가
- [ ] webpack: `module.rules` 에 로더 규칙 추가
- [ ] webpack: `resolve.extensions` 에도 추가 (import 에서 확장자를 생략한다면)
- [ ] TypeScript: `src/types/*.d.ts` 에 `declare module '*.확장자'` 선언
      — 없으면 `tsc` 만 따로 깨진다

### 경로 별칭 (예: `@/` → `src/`)
- [ ] Vite: `resolve.alias`
- [ ] webpack: `resolve.alias`
- [ ] tsconfig: `compilerOptions.paths` + `baseUrl`
  세 곳이 전부 일치해야 한다. 하나만 빠지면 에디터·dev·prod 중 하나가 깨진다.

### babel preset/plugin 추가
`webpack.config.js` 상단의 `babel` 객체 하나를 `.[jt]sx?` 규칙과 `.mdx` 규칙이 **공유**한다.
여기 손대면 MDX 컴파일에도 영향이 간다. Vite 쪽은 esbuild 라 babel 설정과 무관하므로
**동작이 갈릴 수 있다** — 양쪽 빌드 결과를 실제로 확인할 것.

### 의존성 추가
- 런타임에 필요하면 `dependencies`, 빌드에만 필요하면 `devDependencies`.
  현재 `dependencies` 는 react/react-dom/react-router-dom 셋뿐이다. 늘리기 전에 정말 필요한지 본다.
- 타입 정의가 별도 패키지인지 확인 (`@types/*`). 없으면 `src/types/` 에 직접 선언한다.

## `public/` 은 junction — 빌드 산출물과 헷갈리지 말 것

`public/` → `C:\htmls\dbx-guide` (실서비스 원본). webpack 은 `CopyWebpackPlugin` 으로
`public` 전체를 `dist/` 에 복사한다.

- `public/` 에 쓰면 **실서비스가 즉시 바뀐다.** `dist/` 에 쓰는 것과 전혀 다르다.
- `dist/` 는 `clean: true` 라 빌드마다 통째로 지워진다. 여기에 수동으로 뭘 두지 않는다.
- `public/assets/` 의 vanilla 스크립트(`theme.js` `notify.js` `unread.js` `docs.js` `deck.js`)는
  레거시 페이지가 아직 쓴다. 지우지 않는다.

## typecheck 게이트를 풀지 않는다

`npm run build` = `npm run typecheck && webpack`. babel 과 esbuild 는 타입을 **지우기만** 하고
검사하지 않기 때문에, 이 게이트가 없으면 타입 에러가 그대로 배포된다.
빌드가 느리다는 이유로 떼지 않는다.
