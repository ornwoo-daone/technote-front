# 덱 HTML → MDX 변환 규약

출력 위치: `src/entities/docs/content/<cat>/<slug>.mdx`

## 절대 원칙
1. **내용(텍스트)은 한 글자도 바꾸지 않는다.** 요약·수정·재작성 금지.
2. 슬라이드 순서·개수 유지.
3. 페이지 셸(테마 부트스트랩 script, deck-back 링크, deck-nav, theme.js/docs.js/notify.js/dbxRecent script)은 **버린다** — React 뷰어가 제공.

## 구조
```mdx
<Slide kick="DB2 · 개념">
<h1>제목 첫 줄<br/>둘째 줄</h1>
<Lead>리드 문장. **굵게** 와 `코드` 사용 가능.</Lead>
<Muted>회색 보조 문장</Muted>
</Slide>

<Slide kick="개념 ①">
## 슬라이드 제목

- 목록 항목 (ul.bul 로 자동 매핑)
- **굵게** 는 마크다운으로

<Note>파란 박스</Note>
<Warn>주황 경고 박스. **굵게** 가능</Warn>
</Slide>
```

## 컴포넌트 (import 불필요 — 전역 제공)
| 원본 HTML | MDX |
|---|---|
| `<section class="slide">` | `<Slide>` … `</Slide>` |
| `<div class="kick">X</div>` | `<Slide kick="X">` (에러 톤이면 `err` prop) |
| `<h1>`/`<h2>` | `<h1>` JSX 직접(줄바꿈 `<br/>` 필요 시) / `## 제목` |
| `<p class="lead">` | `<Lead>…</Lead>` |
| `<p class="muted">` | `<Muted>…</Muted>` |
| `<div class="note">` | `<Note>…</Note>` |
| `<div class="warn-box">` | `<Warn>…</Warn>` |
| `<ul class="bul">` | 마크다운 `-` 목록 |
| `<pre class="code">` | ``` 펜스. `<span class="cm">` 태그는 제거 — `//` `--` `#` 주석은 뷰어가 자동 색칠 |
| `<div class="tscroll"><table>` | 마크다운 표 |
| 셀 강조 `class="good/bad/warn"` | 셀 안 인라인 `<G>내용</G>` `<B>…</B>` `<W>…</W>` |
| `<div class="flow">` 박스+화살표 | `<Flow steps={[{t:'제목',d:'설명'},{t:'…',d:'…',accent:true},{t:'…',bad:true}]} />` (세로형은 `col` prop) |
| 인라인 SVG (`class="dg …"`) | JSX 로 그대로: `class→className`, `stroke-width→strokeWidth` 등 camelCase 변환. 내용·좌표 무변경 |

## ⚠️ 마크다운 표는 remark-gfm 에 의존한다

**MDX 는 기본적으로 GFM 을 파싱하지 않는다.** 표·취소선·자동링크는 `remark-gfm` 이 있어야 한다.
빠지면 컴파일은 성공하고 **파이프 문자가 그대로 화면에 렌더된다** — 빌드도 타입 검사도
통과하므로 사람이 화면을 볼 때까지 아무도 모른다. 실제로 덱 10개가 이 상태로 방치됐다.

설정은 `vite.config.js`(@mdx-js/rollup)와 `webpack.config.js`(@mdx-js/loader) **양쪽**에 있어야 한다.
한쪽만 넣으면 dev 는 멀쩡한데 배포가 깨진다. `src/entities/docs/mdx-pipeline.test.ts` 가 이를 감시한다.

표를 `<div className="tscroll">` 로 감싸지 않는다 — `mdxComponents.table` 이 이미 감싼다.
직접 쓴 JSX `<table>` 은 컴포넌트 매핑을 타지 않으므로 그때만 수동으로 감싼다.

## MDX 문법 함정 (중요)
- 본문 텍스트의 `{` `}` → `\{` `\}` 로 이스케이프 (코드 펜스 안은 그대로 OK)
- 본문 텍스트의 `<` 가 태그가 아니면 → `&lt;` 또는 백틱 코드로 감싸기
- HTML 엔티티 `&gt;` `&amp;` 등은 실제 문자로 풀어도 됨 (`>` `&`)
- 마크다운 표 셀 안에 `|` 문자가 있으면 `\|`
- 셀프클로징 필수: `<br/>` `<img …/>`
- 주석은 `{/* … */}`

## 검증
- 슬라이드 수가 원본 `<section class="slide">` 개수와 같은지 확인
- 표 행/열 수 일치 확인
- 변환 불가·애매한 부분은 임의로 처리하지 말고 보고에 명시
