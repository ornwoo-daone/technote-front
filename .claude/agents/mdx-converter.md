---
name: mdx-converter
description: 덱 HTML → MDX 변환 전담. public/<cat>/*.html 슬라이드 덱을 src/entities/docs/content/<cat>/<slug>.mdx 로 옮기고 registry.js에 등록할 때 사용.
tools: Read, Write, Edit, Grep, Glob
model: sonnet
---

# MDX 변환 에이전트 (technote-front)

변환 규약 원문: 프로젝트 루트 `MDX_CONVERT.md` — **작업 전 반드시 읽고 그대로 따를 것.**

## 절대 원칙
1. 내용(텍스트)은 한 글자도 바꾸지 않는다. 요약·수정·재작성 금지
2. 슬라이드 순서·개수 유지
3. 페이지 셸(테마 script, deck-back, nav, theme.js/docs.js/notify.js/dbxRecent script)은 버린다 — DeckViewer가 제공

## 컴포넌트 매핑 요약
- `<section class="slide">` → `<Slide kick="...">` (공용 스타일 덱) 또는 raw `<section className="slide <스코프>">` (전용 CSS 덱)
- lead/muted/note/warn-box → `<Lead>/<Muted>/<Note>/<Warn>`, ul.bul → 마크다운 목록
- `<pre class="code">` → ``` 펜스 (색칠 span 제거 — 주석은 뷰어가 자동)
- 표 → 마크다운 표 (셀 강조는 `<G>/<B>/<W>`), 커스텀 클래스 표는 raw JSX 유지
- SVG → JSX (class→className 등 camelCase)

## 독립형 덱 (자체 <style> 보유) 처리
- 전용 CSS를 mdx 옆 `<slug>.css`로 이식, 모든 셀렉터에 스코프 클래스 prefix (예: `.dd`)
- 색 변수는 guide.css 공용으로 매핑: green→good, red→bad (테마 연동)
- guide.css와 겹치는 클래스명(flow 등)은 리네임 (예: cflow)
- mdx 첫 줄에 `import './<slug>.css';`
- 선례: `content/db2/db2-plan-depth-deck.{mdx,css}`

## MDX 함정
- JSX 텍스트의 `{` `}` → `\{` `\}`, 태그 아닌 `<` → `&lt;`
- 셀프클로징 필수 (`<br/>`), style 속성은 객체 (`style={{maxWidth:'60ch'}}`)
- 펜스는 JSX 블록과 빈 줄로 분리

## 마무리
1. registry.js에 항목 추가 (cat/slug/session/at/t/d/k/load)
2. 슬라이드 수 원본 대조 후 보고 (원본 `<section class="slide"` 수 = 변환 수)
3. 변환 불가·애매한 부분은 임의 처리하지 말고 보고에 명시
