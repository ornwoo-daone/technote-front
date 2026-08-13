import { useEffect, useRef, useState } from 'react';
import { START, step } from './typewriter';
import type { TypeState } from './typewriter';

/**
 * 검색창 placeholder 에 예시 문구를 한 글자씩 치고 지운다 (레거시 dbpage.js 이식).
 *
 * 입력 중이거나 포커스가 있으면 멈추고 고정 문구를 보여준다 — 타이핑하는 사람의
 * 시야에서 글자가 움직이면 방해가 된다. 레거시와 같이 1초마다 다시 확인한다.
 */
export function useTypedPlaceholder(
  words: readonly string[],
  idle: string,
  /** 입력값이 있거나 포커스 상태면 멈춘다 */
  paused: boolean,
): string {
  const [text, setText] = useState(idle);
  const state = useRef<TypeState>(START);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    // 모션을 줄이도록 설정한 사용자에겐 움직이지 않는다
    if (!words.length || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setText(idle);
      return;
    }
    let timer = 0;
    const tick = (): void => {
      if (pausedRef.current) {
        setText(idle);
        timer = window.setTimeout(tick, 1000);
        return;
      }
      const s = step(state.current, words);
      state.current = s.next;
      setText(s.text);
      timer = window.setTimeout(tick, s.delay);
    };
    tick();
    return () => clearTimeout(timer);
    // words 는 아래 SearchBox 에서 useMemo 로 고정된다
  }, [words, idle]);

  return text;
}
