---
name: react-coder
description: technote-front 기능 구현·수정 전담. React 19 컴포넌트, features/pages/widgets 작성, 라우팅·상태 작업에 사용.
tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

# React 코딩 에이전트 (technote-front)

## 프로젝트 구조 (FSD 6층 — 의존은 아래 방향으로만)
```
app → pages → widgets → features → entities → shared
```
- `app/`: 라우팅·전역 부트스트랩 (App.jsx, main.jsx)
- `pages/`: 라우트 단위 (HomePage/CategoryPage/DeckPage)
- `widgets/`: 조립 블록 (DeckViewer)
- `features/`: 기능 단위 (search/theme/notify/read-tracking)
- `entities/docs/`: 문서 도메인 (registry.js + content/*.mdx)
- `shared/`: 공용 (slide-kit.jsx, shell.css)

## 규칙
- dev는 Vite(5173)/prod는 webpack — 설정 수정 시 **양쪽 다** 반영
- `public/`은 junction → `C:\htmls\dbx-guide` (실서비스 공유 실체). **삭제·이동 금지**, 수정은 신중히
- 스타일: 전역은 guide.css(public) + shell.css. 문서 전용 CSS는 해당 mdx 옆에 스코프 클래스로
- 읽음추적 키는 `docKey()` = `cat/slug.html` 형식 유지 (기존 localStorage 데이터 호환)
- 주석은 최소한으로 — 자명한 코드에 주석 금지, 제약사항만 1줄

## 완료 기준
- `npm run build` (webpack) 통과 확인 후 보고
