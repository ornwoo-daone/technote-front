---
description: 타입 검사 + 테스트 + 양쪽 빌드(Vite/webpack)를 돌려 현재 상태를 확인한다
allowed-tools: Bash, Read, Grep, Glob
---

현재 작업 상태를 검증한다.

1. `npm run typecheck`
2. `npm run test` — 레지스트리 정합성 + 순수 로직
3. `npx vite build --logLevel warn` (dev 파이프라인)
4. `npx webpack --mode production` (prod 파이프라인)

넷 다 통과해야 정상이다. 하나라도 실패하면 **출력 원문과 함께** 어디서 깨졌는지 보고한다.
통과한 것처럼 요약하지 않는다.

## 이미 자동으로 잡히는 것 — 따로 확인하지 말 것

- **`load` 경로의 `.mdx` 실존**: 번들러가 동적 import 를 빌드 타임에 해석하므로
  파일이 없으면 양쪽 빌드가 `Module not found` 로 실패한다.
- **`cat` 오타**: `CatId` 유니온이라 `typecheck` 에서 잡힌다.
- **`session` 불일치 / `at` 형식 / 아이콘 파일 누락 / 미등록 orphan mdx**: `npm run test` 가 잡는다.

수동 점검 항목을 늘리기 전에, 그게 위 셋 중 하나로 자동화되는지 먼저 본다.
