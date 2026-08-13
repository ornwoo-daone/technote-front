import type { CSSProperties } from 'react';

// 아이콘 PNG 는 노랑 고정이라 팔레트(Ocean·Neon…)와 부딪힌다.
// 알파 채널을 마스크로만 쓰고 색은 CSS 의 var(--accent) 가 칠한다 → 테마를 따라간다.
//
// ⚠️ 경로를 shell.css 의 url() 에 두면 css-loader 가 절대경로를 모듈로 해석하려 해
// webpack 만 «Module not found» 로 깨진다(Vite 는 통과 → dev 에서는 안 보이는 고장).
// 그래서 경로는 인라인 스타일로 준다.
const SRC = {
  empty: '/assets/icons/bookmark.png',
  fill: '/assets/icons/bookmark-fill.png',
} as const;

export default function BookmarkIcon({ on, className = '' }: { on: boolean; className?: string }) {
  const url = `url(${on ? SRC.fill : SRC.empty})`;
  return (
    <span className={'bm-ico' + (on ? ' on' : '') + (className ? ' ' + className : '')}
      aria-hidden="true"
      style={{ maskImage: url, WebkitMaskImage: url } as CSSProperties} />
  );
}
