---
description: 새 문서(덱)를 레지스트리에 등록하고 MDX 뼈대를 만든다
argument-hint: <카테고리> <제목 또는 주제>
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

새 문서를 추가한다: **$ARGUMENTS**

`.claude/rules/registry.md` 와 `.claude/rules/mdx-authoring.md` 를 먼저 읽고 따를 것.

1. `src/entities/docs/registry.ts` 의 `CAT_LIST` 에서 대상 카테고리를 확인한다.
   없으면 만들지 말고 먼저 물어본다.
2. `slug` 를 정한다 — 소문자 케밥, 카테고리 안에서 유일해야 한다. 기존 `DOCS` 와 대조한다.
3. `session` 은 그 카테고리의 `sessions[].key` 중 하나를 고른다.
   학습 카테고리면 basic/practice/deep/issue, DB 카테고리면 work/concept/verify/support.
4. `content/<cat>/<slug>.mdx` 를 만든다. 내용을 모르면 `<Slide>` 뼈대만 두고 채우지 않는다 —
   **없는 내용을 지어내지 않는다.**
5. `DOCS` 배열 **맨 앞**에 항목을 추가한다 (`at` 은 오늘 날짜, `k` 는 검색 키워드 공백 구분).
6. `npm run typecheck` 로 확인하고 보고한다.
