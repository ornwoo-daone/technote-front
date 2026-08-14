---
name: new-deck
description: 새 덱(슬라이드 문서)을 만들 때 사용. "덱 만들어줘", "이 내용 정리해서 덱으로", "고객 문의 대응 자료 만들어줘", "이슈 분석한 거 문서로" 같은 요청 전부. DB·DBX 실무, CS 기반 지식, 고객 대응 어느 카테고리든 해당한다. 학습 카테고리(Java·React 등)는 study-note 가 더 구체적이니 그쪽을 먼저 본다. 기존 HTML 덱을 옮기는 변환은 rules/mdx-authoring.md.
---

# 새 덱 만들기

## ⛔ 먼저 — 형식은 MDX 하나뿐이다

```
src/entities/docs/content/<cat>/<slug>.mdx     ← 내용
src/entities/docs/registry.ts                  ← 등록 한 줄
```

**레거시 HTML(`public/` = `C:\htmls\dbx-guide`)로 새 덱을 쓰지 않는다.**
거기 쓰면 레거시 홈에만 보이고 React 셸에는 존재하지 않는 문서가 된다.
홈 카운트·카테고리 목록·검색·알림 어디에도 안 잡히고, **에러가 안 나서 아무도 모른다.**
2026-08-13 에 실제로 덱 2개가 이 상태로 방치됐다.

둘 중 하나만 하면 라우트가 깨진다. **파일과 등록은 항상 같이.**

## 1. 어느 카테고리인가

`registry.ts` 의 `CAT_LIST` 에서 고른다. **계기가 아니라 내용으로 분류한다** —
고객 문의에서 시작했어도 내용이 우리 제품 설명이면 그 제품 카테고리다.

`session` 은 그 카테고리의 탭 중 하나여야 한다. 타입이 강제하지 않으니 직접 확인할 것.

| 카테고리 | 세션 |
|---|---|
| DB·DBX (`db2` `dbx` `aws`…) | `work` `concept` `verify` `support` |
| 학습 (`java` `react`…) | `basic` `practice` `deep` `issue` |
| CS (`cs` `algorithm` `network` `security`) | `basic` `theory` `applied` `case` |

카테고리 자체가 없으면 `new-category` 스킬.

## 2. 쓴다

문법·컴포넌트 규약은 `.claude/rules/mdx-authoring.md` 를 읽는다(분량이 커서 필요할 때만 읽는 파일).
자주 걸리는 것만 여기 옮겨 둔다:

- 표를 쓰면 **`remark-gfm` 이 필요**하다. 이미 양쪽 빌드에 들어 있지만, 표가 파이프 문자로
  보이면 그게 빠진 것이다.
- **컴포넌트 안에 빈 줄을 두면 «닫는 태그가 없다»고 컴파일 에러**가 난다.
- **코드 펜스 «안»에서는 이스케이프하지 않는다.** `\{` 를 쓰면 백슬래시가 화면에 그대로 보인다.
- 다른 덱을 가리킬 때는 `**<카테고리 이름> · «제목»**` 형식. 상대 HTML 경로(`href="plan.html"`)는
  React 라우팅에서 안 먹는다.

## 3. 등록한다

```ts
{ cat: 'db2', slug: 'plan-from-activity', session: 'work', at: '2026-08-14', time: '17:54',
  t: '제목', d: '한 줄 요약',
  k: '검색 키워드 공백구분 — 한글·영문 둘 다 넣는다(검색이 단순 부분일치)',
  load: () => import('./content/db2/plan-from-activity.mdx') },
```

- `at` 은 오늘 날짜(`YYYY-MM-DD`), `time` 은 `HH:mm`. 알림의 신규 감지가 이 값을 쓴다.
- 나중에 내용을 크게 고치면 `up: 'YYYY-MM-DD HH:mm'` 을 넣는다 — 안 넣으면 «수정됨» 알림이 안 뜬다.
- `deploy` 는 DB 실무 노트 전용. 학습 노트엔 넣지 않는다.

## 4. 검증하고 보고한다

```
npm run build      # typecheck → test → webpack
```

테스트가 잡는 것: 미등록 mdx, 레거시에만 있는 덱, session 불일치, slug 중복, 시각 형식.

그다음 `deck-review` 스킬의 절차를 따른다 — 특히 **사실 근거**(코드를 인용했으면 파일을
다시 열어 줄번호 확인)와 **렌더 결과**(표가 `_components.table` 로 컴파일됐는지)를 본다.

통과 못 했으면 통과 못 했다고 출력과 함께 보고한다.
