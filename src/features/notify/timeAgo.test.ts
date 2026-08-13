// 경계값과 «UTC 로 읽혀 9시간 밀리는» 함정만 검사한다.
import { describe, it, expect } from 'vitest';
import { timeAgo, parseStamp } from './timeAgo';

const now = new Date(2026, 7, 13, 15, 0); // 2026-08-13 15:00 로컬

describe('parseStamp', () => {
  it('날짜만 있어도 로컬 자정으로 읽는다', () => {
    // new Date('2026-08-13') 은 UTC 자정 → KST 기준 09:00. 그 함정을 피했는지 본다.
    const d = parseStamp('2026-08-13');
    expect(d?.getHours()).toBe(0);
    expect(d?.getDate()).toBe(13);
  });

  it('형식이 아니면 null', () => {
    expect(parseStamp('2026/08/13')).toBeNull();
    expect(parseStamp('2026-08-13 25:00')).toBeNull();
  });
});

describe('timeAgo', () => {
  it.each([
    ['2026-08-13 15:00', '방금'],
    ['2026-08-13 14:59', '1분 전'],
    ['2026-08-13 14:01', '59분 전'],
    ['2026-08-13 14:00', '1시간 전'],
    ['2026-08-12 16:00', '23시간 전'],
    ['2026-08-12 15:00', '1일 전'],
    ['2026-08-07 15:00', '6일 전'],
    ['2026-08-06 15:00', '2026-08-06'], // 7일부터는 날짜로
  ])('%s → %s', (stamp, want) => {
    expect(timeAgo(stamp, now)).toBe(want);
  });

  it('미래 시각은 방금으로 (시계 오차 방어)', () => {
    expect(timeAgo('2026-08-14 09:00', now)).toBe('방금');
  });

  it('형식이 깨지면 원본을 그대로 돌려준다', () => {
    expect(timeAgo('언젠가', now)).toBe('언젠가');
  });
});
