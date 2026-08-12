# 아키텍처 규칙 (FSD 6층)

```
app → pages → widgets → features → entities → shared
```

**import 은 오른쪽(아래층) 방향으로만.** 역방향·같은 층 횡단 import 금지.

| 층 | 책임 | 현재 내용 |
|---|---|---|
| `app/` | 라우팅·전역 부트스트랩 | `App.tsx`, `main.tsx` |
| `pages/` | 라우트 단위. **조립만** 한다 | `HomePage` `CategoryPage` `DeckPage` |
| `widgets/` | 페이지를 구성하는 큰 UI 블록 | `DeckViewer` |
| `features/` | 사용자 행동 단위 기능 | `search/` `theme/` `notify/` `read-tracking/` |
| `entities/` | 도메인 모델 | `docs/` (registry + content/*.mdx) |
| `shared/` | 공용 최하층 | `ui/slide-kit.tsx`, `assets/shell.css`, `types/` |

## 자주 틀리는 판단

- 페이지에 로직이 쌓이기 시작하면 `features/` 로 내린다. 페이지는 조립만.
- 여러 페이지가 쓰는 UI 조각은 `widgets/`, 여러 기능이 쓰는 무상태 UI 는 `shared/ui/`.
- `entities/docs/registry.ts` 는 어느 층에서든 import 해도 된다(최하층 취급).
- 새 층을 만들지 않는다. 6층 안에서 해결한다.

## 스타일

- 전역 스타일은 `public/assets/guide.css`(레거시 공유) + `src/shared/assets/shell.css`(React 셸 전용).
  기존 클래스명을 재사용해 디자인을 유지한다 — 새 클래스는 꼭 필요할 때만.
- 문서 전용 CSS 는 해당 `.mdx` 옆에 두고 스코프 클래스를 붙인다.
- 주석은 최소한으로. 자명한 코드에 주석 금지, **제약사항·이유**만 1줄로.
