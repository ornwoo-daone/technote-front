# Tech Note

DB & DBX 개념 지침서. React 19 + Node 22.

## 구조

```
technote/
├─ public/            ← ⚠️ junction → C:\htmls\dbx-guide (복사본 아님, 같은 실체)
│                        기존 사이트 전체가 여기서 그대로 서빙된다
├─ src/               FSD-lite 구조 (위층은 아래층만 import: app→pages→features→entities→shared)
│  ├─ app/            엔트리·전역 설정 (main.jsx, App.jsx)
│  ├─ pages/          라우트 단위 페이지 (조립만)
│  ├─ features/       사용자 행동 단위 기능 (notify/ theme/ search/ …)
│  ├─ entities/       도메인 모델 (docs/ = 문서 레지스트리)
│  └─ shared/         공용 최하층 (ui / lib=훅·유틸 / config / assets)
├─ index.html         Vite 진입점 (/ → /dbx-guide.html 리다이렉트)
├─ vite.config.js     개발 서버 (port 5173)
└─ webpack.config.js  운영 빌드 (dist/)
```

## 명령

```
npm run dev       # 개발: Vite. public 파일 수정 시 자동 리로드
npm run build     # 운영: webpack → dist/ (React 번들 + 기존 사이트 복사)
npm run preview   # dist/ 를 로컬에서 확인
```

## ⚠️ public 은 junction

`public\` 을 지우거나 안의 파일을 수정하면 **원본 `C:\htmls\dbx-guide` 가 그대로 바뀐다.**
- 원본 쪽엔 git 자동 스냅샷(serve_guide.py, 30초)이 돌고 있다 — 되돌리기: `git -C C:\htmls log`
- junction 재생성: `cmd /c mklink /J C:\projects\technote\public C:\htmls\dbx-guide`

## 기존 인프라와의 관계 (그대로 살아 있음)

- `C:\htmls\serve_guide.py` (port 8777): 바탕화면 "Tech Note" 앱 바로가기가 쓰는 서버. 부팅 시 자동 시작
- Vite(5173)는 개발용. 같은 파일을 서빙하므로 어느 쪽으로 봐도 내용 동일
- 새 덱 등록 절차는 기존과 동일: html 생성 + `public/assets/docs.js` 등록 (+ index 카드/카운트)
