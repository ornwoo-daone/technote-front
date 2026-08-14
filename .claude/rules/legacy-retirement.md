# 레거시 은퇴 계획

## 왜 하나

지금까지 터진 사고가 전부 **같은 사이트를 두 벌 유지한다**는 하나의 원인에서 나왔다.

- `.tab-slider` 누락 — CSS 는 공유하는데 그걸 만들던 vanilla JS 가 이식 안 됨
- `.theme-pop` 글래스 누락 — `guide.css` 의 하드코딩된 선택자 목록에서 빠짐
- junction 파손 — 두 git 저장소가 같은 파일을 추적
- `remark-gfm` 누락 — 레거시는 HTML 표라 멀쩡, React 만 깨짐

**콘텐츠 중복은 이미 0이다.** 레거시 덱 9개가 전부 MDX 로 이식됐고,
오히려 React 에만 있는 문서가 4개다(레거시로 보면 낡은 내용을 본다).

## 현재 배선 (2026-08-13 확인)

| 무엇 | 어디 |
|---|---|
| 데스크톱 앱 바로가기 | Edge `--app="file:///C:/htmls/dbx-guide/dbx-guide.html"` (서버 경유 아님) |
| `serve_guide.py` | port 8777, `C:\htmls\dbx-guide` 서빙 + **30초 git 자동 스냅샷** |
| 부팅 자동 시작 | `start_guide_server.vbs` → `start_guide_server.bat` (시작프로그램 등록) |
| `public/` | `C:\htmls\dbx-guide` 로의 junction |

⚠️ **자동 스냅샷이 `serve_guide.py` 에 붙어 있다.** 이 서버를 내리면 백업이 같이 사라진다.
junction 파손 사고 때 복구 근거가 된 게 이 스냅샷이다. 은퇴 시 대체 수단을 먼저 확보할 것.

## 1단계 — React 자립 ✅ 완료 (2026-08-13)

실서비스 무영향. React 빌드가 `public/`(junction) 없이도 성립하게 만들었다.

- repo 가 소유하는 `static/` 신설 — `guide.css` · favicon 2종 · 아이콘 29개 · manifest
- `vite.config.js` 의 `publicDir: 'static'`
- `webpack.config.js` 의 CopyWebpackPlugin 소스를 `static` 으로
- 결과: `dist/` 에 레거시 HTML 이 더 이상 섞이지 않는다

이제 `guide.css` 는 **`static/assets/guide.css` 가 React 의 것**이고,
`public/assets/guide.css` 는 레거시 전용으로 동결됐다. 두 파일은 앞으로 갈라진다 —
React 쪽 스타일 수정은 `static/assets/guide.css` 나 `src/shared/assets/shell.css` 에 한다.

## 2단계 — 데스크톱 앱을 React 빌드로 전환 (실서비스 영향, 미착수)

1. `npm run build` → `dist/`
2. 바로가기 URL 을 `dist/index.html` 로 변경.
   ⚠️ HashRouter 라 `file://` 에서도 라우팅은 되지만, webpack `output.publicPath` 가
   절대경로(`/`)면 자산을 못 찾는다. `publicPath: './'` 로 바꾸고 실제로 열어 확인할 것.
   서버 경유가 안전하면 `serve_guide.py` 의 `BASE` 를 `dist` 로 돌리는 쪽이 낫다.
3. 기존 URL(`dbx-guide.html`, `<cat>/index.html`)로 들어오는 북마크용 리다이렉트를 남긴다.
4. **자동 스냅샷 대체 확보** — 이 repo 는 GitHub 원격이 있으므로 push 로 대체 가능하나,
   `C:\htmls` 쪽 이력은 별도로 보관할지 결정해야 한다.

## 3단계 — 레거시 제거 (미착수)

1. `C:\htmls\dbx-guide` 의 HTML 9개 + `<cat>/index.html` 16개 + vanilla JS 6종 제거
2. junction 해제 → `public/` 삭제
3. `.gitignore` 에서 `public/` 제외 항목 제거 (더 이상 필요 없음)
4. `rules/build.md` 의 junction 경고, `rules/legacy-parity.md` 폐기
5. `registry.test.ts` 의 junction 검사 제거

완료되면 CSS 소유자가 하나가 되고, "이식 누락"이라는 개념 자체가 사라진다.

## 그 전까지의 규칙

- ⚠️ **새 덱은 반드시 MDX(`src/entities/docs/content/`)로 쓰고 `registry.ts` 에 등록한다.**
  레거시 HTML 로 쓰면 레거시 홈에만 보이고 React 셸에는 «존재하지 않는 문서»가 된다 —
  카운트·검색·알림 어디에도 안 잡히고 에러도 없다. 2026-08-13 에 실제로 덱 2개가 이 상태였다.
  `registry.test.ts` 의 «레거시에만 있고 React 에 없는 덱이 없다» 가 이제 이걸 잡는다.
- **React 스타일 수정은 `static/` 과 `src/` 에만 한다.** `public/` 은 건드리지 않는다.
- 레거시에서 뭔가 안 보인다는 보고가 오면 고치지 말고 **은퇴 일정을 당길지 먼저 묻는다.**
- 남은 미이식 기능 목록은 `legacy-parity.md` 참고 — 은퇴하면 이식할 필요가 없어지는 항목도 있다.
