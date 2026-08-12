# .claude/ 구조

```
CLAUDE.md            ← 루트. 매 세션 자동 로드 + rules/ 를 @import
.claude/
├─ rules/            규칙 문서. CLAUDE.md 가 @import 로 끌어온다
│  ├─ architecture.md    FSD 6층·import 방향·스타일
│  ├─ typescript.md      strict 설정·금지 사항·import 관례
│  ├─ registry.md        문서/카테고리 등록·타입 파생·localStorage 키 계약
│  ├─ build.md           이중 빌드·public junction 경고
│  ├─ conventions.md     한국어 표기·네이밍·커밋·접근성 최소선
│  └─ mdx-authoring.md   덱 HTML→MDX 변환 규약 (분량이 커서 @import 하지 않음)
├─ agents/           서브에이전트. 작업 위임 시 격리된 컨텍스트로 실행
│  ├─ react-coder.md     기능 구현·수정
│  ├─ front-reviewer.md  구조 변경 후 리뷰
│  ├─ mdx-converter.md   덱 HTML → MDX 변환
│  └─ deck-verifier.md   변환 결과 원본 대조 검증
├─ skills/           모델이 상황을 보고 알아서 꺼내 쓰는 절차서
│  ├─ fsd-placement/     어느 층에 둘지 결정·위반 탐지
│  ├─ react-component/   컴포넌트·훅·전역 상태 패턴
│  ├─ build-tooling/     Vite/webpack 양쪽 반영 체크리스트
│  ├─ new-category/      카테고리 타일 추가
│  └─ study-note/        학습 노트(덱) 작성
├─ commands/         사용자가 `/이름` 으로 직접 부르는 명령
│  ├─ add-doc.md         `/add-doc <카테고리> <주제>`
│  └─ check.md           `/check` — 타입검사 + 양쪽 빌드
├─ settings.json     팀 공유 설정 (권한 등). 커밋 대상
└─ launch.json       VSCode 디버그 설정
```

## rules / skills / commands / agents 구분

| | 언제 로드되나 | 쓰는 기준 |
|---|---|---|
| **rules** | 항상 (CLAUDE.md 의 `@import`) | 모든 작업에 적용되는 제약. 짧게 유지 — 매번 컨텍스트를 먹는다 |
| **skills** | 모델이 `description` 을 보고 필요할 때 | 특정 작업의 절차. 길어도 됨 |
| **commands** | 사용자가 `/이름` 을 칠 때 | 사람이 반복해서 시키는 정형 작업 |
| **agents** | 작업을 위임할 때 | 컨텍스트를 따로 쓰는 게 나은 큰 작업 |

**항상 필요한 게 아니면 rules 에 넣지 않는다.** rules 가 비대해지면 매 요청의 컨텍스트가
낭비된다. 절차성 내용은 skills 로 내린다 (mdx-authoring.md 를 `@import` 하지 않는 이유).

## 추가할 때

- 규칙: `rules/*.md` 생성 → **`CLAUDE.md` 의 `@import` 목록에 추가해야 로드된다.**
- 스킬: `skills/<이름>/SKILL.md`. frontmatter 의 `name` + `description` 이 발동 조건이므로
  "언제 쓰는지"를 구체적으로 쓴다.
- 명령: `commands/<이름>.md` → `/<이름>` 으로 호출. `$ARGUMENTS` / `$1` 로 인자를 받는다.
- 에이전트: `agents/<이름>.md`. frontmatter 에 `name` `description` `tools` `model`.
