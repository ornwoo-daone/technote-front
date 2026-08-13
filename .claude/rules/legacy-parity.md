# 레거시 ↔ React 기능 대조표

`public/assets/` 의 vanilla 스크립트가 React 셸로 이식되는 중이다. **CSS(`guide.css`)는
레거시·React 가 공유**하므로, 스타일은 있는데 그걸 만들던 JS 가 이식되지 않으면
**아무 에러 없이 기능만 조용히 사라진다.** 실제로 `.tab-slider` 가 그렇게 누락됐다.

빌드도 타입 검사도 테스트도 이 종류를 잡지 못한다. 그래서 표로 관리한다.

## 대조표

| 레거시 | React | 상태 |
|---|---|---|
| `theme.js` 팔레트 10종·localStorage | `features/theme/ThemeButton.tsx` | ✅ |
| `unread.js` 읽음 추적 | `features/read-tracking/useRead.ts` | ✅ |
| `notify.js` 알림·토스트·OS 알림 | `features/notify/NotifyBell.tsx` | ✅ |
| `docs.js` 문서 레지스트리 | `entities/docs/registry.ts` | ✅ 대체 완료 |
| `deck.js` 슬라이드 네비·키보드·점 | `widgets/DeckViewer.tsx` | ✅ |
| `dbpage.js` 스코프 검색 | `features/search/SearchBox.tsx` | ✅ |
| `dbpage.js` 슬라이딩 pill (`.tab-slider`) | `pages/CategoryPage.tsx` | ✅ 2026-08-12 이식 |
| `dbpage.js` 카드 스태거 애니메이션 (`.filt-show`) | — | ❌ **미이식** |
| `dbpage.js` 검색창 플레이스홀더 타이핑 | `features/search/useTypedPlaceholder.ts` | ✅ 2026-08-13 이식 |
| `deck.js` 슬라이드 이동 시 `scrollTo(0,0)` | — | ❌ **미이식** |
| `deck.js` `location.hash` 로 시작 슬라이드 지정 | — | 🚫 이식 불가 (HashRouter 가 hash 를 씀) |
| `deck.js` 화면 좌우 절반 클릭으로 넘김 | — | 🚫 의도적으로 제거 (오작동 유발) |

## 미이식 항목 상세

- **카드 스태거 애니메이션** — `guide.css` 의 `.filt-show{animation:cardin .3s ease both}` +
  `animationDelay: index*45ms`. 탭을 바꿀 때 카드가 순차로 나타나던 효과.
  React 는 배열을 필터링만 하므로 즉시 나타난다.
- **`scrollTo(0,0)`** — 긴 슬라이드에서 아래로 스크롤한 채 다음 장으로 넘기면
  스크롤 위치가 유지된다. 레거시는 맨 위로 올렸다.

## 새 기능을 이식할 때

1. 해당 레거시 스크립트를 **끝까지 읽는다.** DOM 을 직접 만들어 붙이는 부분
   (`createElement` · `innerHTML`)이 이식에서 가장 잘 빠진다.
2. `guide.css` 에서 그 클래스를 검색해 **스타일만 남아 있는 게 없는지** 확인한다.
3. 이 표를 갱신한다. 이식했으면 ✅, 일부러 뺐으면 🚫 와 이유를 적는다.
