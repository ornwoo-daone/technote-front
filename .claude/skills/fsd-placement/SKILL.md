---
name: fsd-placement
description: 새 코드를 FSD 6층 중 어디에 둘지 정하거나, 층 배치가 잘못된 코드를 옮길 때 사용. "이거 어디에 만들지", "구조 정리", "컴포넌트 분리", "import 방향이 이상하다" 같은 상황. 순환 import·역방향 의존을 찾아 고치는 절차 포함.
---

# FSD 배치 결정

```
app → pages → widgets → features → entities → shared
```

import 은 **오른쪽으로만**. 역방향도, 같은 층끼리도 금지.

## 배치 결정 트리

새 코드가 생기면 위에서부터 답한다. 처음 "예"가 나온 층에 둔다.

1. **라우트 정의·전역 프로바이더인가?** → `app/`
2. **URL 하나에 대응하는 화면인가?** → `pages/`
   조립만 한다. 로직이 20줄 넘게 쌓이면 아래층으로 내린다.
3. **여러 페이지가 쓰는 큰 UI 덩어리이고, 자체 상태를 가지는가?** → `widgets/`
   예: `DeckViewer` (슬라이드 인덱스·키보드 네비게이션을 스스로 관리)
4. **사용자의 행동 하나를 담당하는가?** → `features/<행동>/`
   예: `search/` `theme/` `notify/` `read-tracking/`
   "검색한다" "테마를 바꾼다" 처럼 **동사**로 이름이 나오면 feature 다.
5. **도메인 데이터·그 데이터의 규칙인가?** → `entities/<도메인>/`
   예: `docs/` — 문서 목록, 카테고리, 조회 헬퍼
6. **그 외 전부** → `shared/` (`ui/` `lib/` `config/` `assets/` `types/`)
   도메인을 모르는 무상태 조각만 여기 온다.

## 애매할 때의 판단

| 상황 | 답 |
|---|---|
| 페이지가 점점 커진다 | 상태·핸들러를 `features/` 로, 마크업 덩어리를 `widgets/` 로 뺀다 |
| 두 feature 가 서로를 필요로 한다 | 잘못 쪼갠 것이다. 하나로 합치거나, 공통분모를 `entities`/`shared` 로 내린다 |
| feature 가 다른 feature 의 UI 를 쓴다 | 그 UI 를 `shared/ui/` 로 내린다 |
| 도메인 타입을 여러 곳에서 쓴다 | `entities/<도메인>/` 에 두고 거기서 import (최하층처럼 취급해도 된다) |
| 딱 한 페이지에서만 쓰는 컴포넌트 | 페이지 파일 안에 그냥 둔다. 미리 쪼개지 않는다 |

## 위반 찾기

역방향 import 를 훑는다 (각 층에서 자기보다 위층을 부르는지):

```bash
grep -rn "from '.*\.\./\(app\|pages\)/" src/features src/entities src/shared src/widgets
grep -rn "from '.*\.\./widgets/"        src/features src/entities src/shared
grep -rn "from '.*\.\./features/"       src/entities src/shared
grep -rn "from '.*\.\./entities/"       src/shared
```

하나라도 걸리면 그 코드는 층을 잘못 잡은 것이다. 예외를 만들지 말고 옮긴다.

## 옮길 때

1. 파일을 새 위치로 이동하고, 그 파일이 부르던 상대경로를 전부 갱신한다.
2. 그 파일을 부르던 쪽의 import 경로도 갱신한다 (`grep -rn "옛파일명" src`).
3. `npm run typecheck` — 경로가 하나라도 틀리면 여기서 잡힌다.
4. 층을 옮기면 의존 방향이 뒤집히는 경우가 있다. 위 grep 을 **다시** 돌려 확인한다.

## 이 repo 의 현재 배치

- `app/` — `App.tsx`(라우트) `main.tsx`(부트스트랩)
- `pages/` — `HomePage` `CategoryPage` `DeckPage`
- `widgets/` — `DeckViewer`
- `features/` — `search/` `theme/` `notify/` `read-tracking/`
- `entities/docs/` — `registry.ts` + `content/*.mdx`
- `shared/` — `ui/slide-kit.tsx` `assets/shell.css` `types/mdx.d.ts`

`entities/docs/registry.ts` 는 어느 층에서든 import 한다. 의도된 것이다 —
셸 전체의 단일 소스라서 최하층처럼 취급한다.
