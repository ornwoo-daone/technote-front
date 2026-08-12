---
name: react-component
description: 이 프로젝트에서 React 컴포넌트를 새로 만들거나 고칠 때 사용. 훅·상태·이벤트·전역 상태 공유 패턴과 이 repo 고유의 제약(레거시 localStorage 계약, MDX 슬라이드 DOM 조작)을 담고 있다. "컴포넌트 추가", "상태 관리", "훅 만들어줘" 같은 요청에 해당.
---

# React 컴포넌트 작성 (technote-front)

React 19. 상태 관리 라이브러리 없음 — **추가하지 않는다.**
여기 적은 건 일반 React 상식이 아니라 **이 repo 고유의 결정**이다.

## 전역 상태는 useSyncExternalStore 로 공유한다

Context 를 새로 만들지 않는다. `features/read-tracking/useRead.ts` 가 표준 패턴이다:

```ts
const listeners = new Set<() => void>();
let cache = get();                       // 모듈 스코프 캐시 — 스냅샷이 안정적이어야 한다
function emit() { cache = get(); listeners.forEach((fn) => fn()); }

export function useReadList(): readonly string[] {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    () => cache,
  );
}
```

**`cache` 를 반드시 거칠 것.** getSnapshot 이 매번 새 배열을 만들면 무한 렌더가 난다.
localStorage 를 직접 읽어 반환하는 실수가 흔하다.

## localStorage 키는 레거시와 공유한다

`dbxRead` `dbxSeenAt` `dbxToasted` `dbxPalette` 는 `public/assets/` 의 vanilla 스크립트
(`unread.js` `notify.js` `theme.js`)와 **같이 쓰는 키**다. 형식을 바꾸면 레거시 페이지가 깨지고
사용자 기록이 날아간다. 접근은 항상 try/catch 로 감싼다(사파리 프라이빗 모드 등에서 throw).

```ts
try { localStorage.setItem(K, v); } catch { /* 저장 실패는 무시 */ }
```

## 이벤트·타입

- 이벤트 타깃은 좁혀서 쓴다: `const t = e.target as HTMLElement | null;`
  그 뒤 `t?.closest(...)`. `noUncheckedIndexedAccess` 때문에 옵셔널 체이닝이 필요하다.
- React 이벤트 타입은 별칭으로 import: `import type { MouseEvent as ReactMouseEvent } from 'react'`
  (전역 DOM `MouseEvent` 와 이름이 겹친다).
- 문서 전역 리스너(`document.addEventListener`)는 반드시 cleanup 에서 해제한다.
  `theme/ThemeButton.tsx`, `notify/NotifyBell.tsx` 의 바깥 클릭 닫기 패턴을 따른다.

## 덱 슬라이드는 예외적으로 DOM 을 직접 만진다

`widgets/DeckViewer.tsx` 는 자식이 MDX 로 lazy 로딩돼서 **슬라이드 개수를 렌더 시점에 모른다.**
그래서 `MutationObserver` 로 세고 `classList.toggle('active')` 로 직접 조작한다.

이건 의도된 예외다. 여기를 "React 답게" 고치려면 MDX 를 슬라이드 배열로 파싱해야 하는데
그러면 `guide.css` 의 기존 `.slide` 스타일 계약이 깨진다. **건드리지 말 것.**

## MDX 문서용 컴포넌트는 slide-kit 에 추가한다

`shared/ui/slide-kit.tsx` 의 `mdxComponents` 에 등록해야 MDX 에서 import 없이 쓸 수 있다.
새 컴포넌트를 추가했으면 `.claude/rules/mdx-authoring.md` 의 대응표도 같이 갱신한다.

## 하지 말 것

- 상태 관리 라이브러리·CSS-in-JS 추가. 스타일은 `guide.css` 의 기존 클래스를 재사용한다.
- 근거 없는 `memo` / `useCallback`. 이 규모에선 순수 비용이다.
- `key={index}` — 목록이 재정렬되는 곳에선 안정적인 id 를 쓴다
  (`key={docKey(d)}`, `key={d.cat + d.slug}`).
- 컴포넌트 안에서 `registry.ts` 의 데이터를 복제·가공해 들고 있기. 헬퍼(`docsOf` `findDoc`)를 쓴다.

## 완료 기준

`npm run typecheck` 통과 + `npm run dev` 로 실제 화면 확인.
