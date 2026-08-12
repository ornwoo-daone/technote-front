# 표기·네이밍 규칙

## 한국어가 기본이다

- **UI 문자열, 주석, 커밋 메시지, 문서 전부 한국어.** 영어로 쓰지 않는다.
- 기술 용어는 원어를 그대로 둔다: "훅", "리액트" 가 아니라 `hook`, `React`.
  억지로 번역하면 검색이 안 걸린다.
- 코드 식별자(변수·함수·타입)만 영어. 한글 식별자를 쓰지 않는다.

## 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 파일 | PascalCase `.tsx` | `DeckViewer.tsx` |
| 훅·유틸 파일 | camelCase `.ts` | `useRead.ts` |
| feature 디렉토리 | kebab-case, **동사** | `read-tracking/` `search/` |
| 카테고리 id (`f`) | 소문자 영숫자, URL 이 된다 | `typescript` `orm` |
| 문서 slug | 소문자 케밥 | `hook-rules` `gc-basics` |
| CSS 클래스 | 기존 `guide.css` 관례를 따른다 (짧은 약어) | `cat-btn` `ci-mono` |

카테고리 id 와 slug 는 **URL 이자 localStorage 키의 일부**다(`docKey()`).
한 번 공개한 뒤 바꾸면 읽음 기록이 끊긴다. 정할 때 신중히.

## 커밋 메시지

```
<type>: <한국어 요약>
```

`feat` `fix` `refactor` `chore` `docs`. 타입 뒤에 scope 를 붙이지 않는다.
본문이 필요하면 한 줄 띄우고 쓴다. 기존 로그와 형식을 맞춘다:

```
feat: depth 덱 MDX 변환 + DeckViewer lazy 로딩 대응
refactor: FSD 6층 완성 (widgets 층 추가)
chore: 서브에이전트 4종 추가
```

**커밋·푸시는 요청받았을 때만 한다.** 작업을 끝냈다고 알아서 커밋하지 않는다.

## 접근성 최소선

기존 코드가 지키고 있는 선이다. 새로 만드는 것도 맞춘다.

- 아이콘만 있는 버튼·링크에는 `aria-label` 필수 (`.back` `.deck-back` `.nt-btn` `.theme-btn`).
- 장식용 이미지·SVG 는 `alt=""` + `aria-hidden="true"`.
- 클릭 가능한 건 `<button>` / `<a>` 로 만든다. `<div onClick>` 을 쓰지 않는다.
  (`DeckViewer` 의 슬라이드 영역 클릭은 키보드 네비게이션이 따로 있어서 예외)
