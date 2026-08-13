// 한 글자씩 늘고 주는 규칙과 타이밍이 레거시(dbpage.js tw())와 같은지 고정한다.
// 어긋나도 에러가 없다 — 글자가 튀거나 애니메이션이 멈춘 것처럼 보일 뿐이다.
import { describe, it, expect } from 'vitest';
import { step, START, CURSOR } from './typewriter';
import type { TypeState } from './typewriter';

const WORDS = ['ab', 'cd'];

/** n 단계를 돌려 (텍스트, 지연) 목록을 얻는다 */
function run(n: number, words: readonly string[] = WORDS): [string, number][] {
  let s: TypeState = START;
  const out: [string, number][] = [];
  for (let i = 0; i < n; i++) {
    const r = step(s, words);
    out.push([r.text, r.delay]);
    s = r.next;
  }
  return out;
}

describe('타이핑', () => {
  it('한 글자씩 늘어나고 커서가 따라붙는다', () => {
    expect(run(2)).toEqual([[`a${CURSOR}`, 95], [`ab${CURSOR}`, 1200]]);
  });

  it('다 치면 1200ms 멈춘다', () => {
    expect(run(2)[1]?.[1]).toBe(1200);
  });
});

describe('지우기', () => {
  it('다 친 다음엔 한 글자씩 줄어든다', () => {
    expect(run(4)).toEqual([
      [`a${CURSOR}`, 95],
      [`ab${CURSOR}`, 1200],
      [`a${CURSOR}`, 45],
      [CURSOR, 420],
    ]);
  });

  it('다 지우면 다음 문구로 넘어간다', () => {
    expect(run(5)[4]).toEqual([`c${CURSOR}`, 95]);
  });

  it('마지막 문구 다음엔 처음으로 돌아온다', () => {
    const texts = run(9).map(([t]) => t);
    expect(texts[8]).toBe(`a${CURSOR}`);
  });
});

describe('가장자리', () => {
  it('문구가 하나뿐이어도 계속 돈다', () => {
    expect(run(5, ['a'])).toEqual([
      [`a${CURSOR}`, 1200],
      [CURSOR, 420],
      [`a${CURSOR}`, 1200],
      [CURSOR, 420],
      [`a${CURSOR}`, 1200],
    ]);
  });

  it('빈 문자열이 섞여도 터지지 않는다', () => {
    expect(() => run(4, [''])).not.toThrow();
  });
});
