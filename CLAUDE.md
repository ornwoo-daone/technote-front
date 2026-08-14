# technote-front

DB·DBX 실무 노트 + 언어/프레임워크 학습 노트를 한 셸에서 보는 정적 사이트.
React 19 + TypeScript, FSD 6층. dev는 Vite(5173), prod는 webpack → `dist/`.

## 명령

```
npm run dev         # Vite 개발 서버
npm run typecheck   # tsc --noEmit
npm run test        # Vitest (레지스트리 정합성 + 순수 로직)
npm run build       # typecheck → test → webpack (앞이 실패하면 빌드 중단)
```

## 작업 전 반드시 알 것

- **`public/` 은 junction** → `C:\htmls\dbx-guide`. 여기 쓴 내용은 실서비스 원본에 즉시 반영된다.
  복사본이 아니다. 삭제·이동 금지, 덮어쓰기 전 반드시 대상 확인.
- **빌드가 둘**이다. 빌드 설정을 건드리면 `vite.config.js` 와 `webpack.config.js` **양쪽 다** 반영.
- **문서 등록의 단일 소스는 [registry.ts](src/entities/docs/registry.ts)** 하나뿐이다.
  화면(홈/카테고리/검색/알림)은 전부 여기서 파생된다.
- ⛔ **덱은 반드시 MDX 로 만든다.** `src/entities/docs/content/<cat>/<slug>.mdx` +
  `registry.ts` 에 한 줄. **레거시 HTML(`public/` = `C:\htmls\dbx-guide`)로 새 덱을 쓰지 않는다.**
  거기 쓰면 레거시 홈에만 보이고 React 셸에는 «존재하지 않는 문서»가 된다 — 카운트·검색·알림
  어디에도 안 잡히고 에러도 안 난다. 2026-08-13 에 실제로 덱 2개가 이 상태로 방치됐다.
  절차는 `new-deck` 스킬. `npm run test` 가 미등록 덱을 잡는다.

## 규칙 (상세)

@.claude/rules/architecture.md
@.claude/rules/typescript.md
@.claude/rules/registry.md
@.claude/rules/build.md
@.claude/rules/conventions.md

MDX 덱 작성·변환 규약은 분량이 커서 필요할 때만 읽는다 → `.claude/rules/mdx-authoring.md`

## 스킬

절차가 필요한 작업은 `.claude/skills/` 가 자동으로 붙는다 — 구조 배치(`fsd-placement`),
컴포넌트 작성(`react-component`), 빌드 설정(`build-tooling`), 카테고리 추가(`new-category`),
학습 노트 작성(`study-note`). 목록·기준은 `.claude/README.md` 참고.

## 완료 기준

기능 변경 후 `npm run build` 통과를 확인하고 보고한다. 통과 못 하면 통과 못 했다고 말한다.
