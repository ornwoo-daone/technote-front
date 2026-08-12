// 읽음 추적 — 레거시 vanilla(unread.js/notify.js)와 localStorage 'dbxRead' 를 공유한다.
// 저장 형식이 바뀌면 양쪽이 다 깨지고 사용자 기록이 날아가므로 형식 자체를 고정한다.
import { describe, it, expect, beforeEach } from 'vitest';
import { markRead, markAllRead } from './useRead';

const KEY = 'dbxRead';
const stored = (): unknown => JSON.parse(localStorage.getItem(KEY) || '[]');

beforeEach(() => {
  localStorage.clear();
});

describe('저장 형식', () => {
  it('문자열 배열 JSON 으로 저장한다', () => {
    markRead('db2/plan.html');
    expect(stored()).toEqual(['db2/plan.html']);
    expect(localStorage.getItem(KEY)).toBe('["db2/plan.html"]');
  });
});

describe('markRead', () => {
  it('같은 키를 두 번 넣어도 중복되지 않는다', () => {
    markRead('db2/plan.html');
    markRead('db2/plan.html');
    expect(stored()).toEqual(['db2/plan.html']);
  });

  it('기존 항목을 지우지 않고 덧붙인다', () => {
    localStorage.setItem(KEY, JSON.stringify(['aws/iam.html']));
    markRead('db2/plan.html');
    expect(stored()).toEqual(['aws/iam.html', 'db2/plan.html']);
  });
});

describe('markAllRead', () => {
  it('아직 없는 것만 추가한다', () => {
    localStorage.setItem(KEY, JSON.stringify(['aws/iam.html']));
    markAllRead(['aws/iam.html', 'db2/plan.html', 'db2/plan.html']);
    expect(stored()).toEqual(['aws/iam.html', 'db2/plan.html']);
  });

  it('빈 목록으로 호출해도 기존 값을 건드리지 않는다', () => {
    localStorage.setItem(KEY, JSON.stringify(['aws/iam.html']));
    markAllRead([]);
    expect(stored()).toEqual(['aws/iam.html']);
  });
});

describe('저장값이 깨져 있을 때', () => {
  it('JSON 이 아니면 빈 목록에서 다시 시작한다 (throw 하지 않는다)', () => {
    localStorage.setItem(KEY, '{깨진 JSON');
    expect(() => markRead('db2/plan.html')).not.toThrow();
    expect(stored()).toEqual(['db2/plan.html']);
  });

  it('배열이 아니면 무시한다', () => {
    localStorage.setItem(KEY, '{"a":1}');
    markRead('db2/plan.html');
    expect(stored()).toEqual(['db2/plan.html']);
  });

  it('배열 안의 비문자열은 걸러낸다', () => {
    localStorage.setItem(KEY, JSON.stringify(['aws/iam.html', 42, null]));
    markRead('db2/plan.html');
    expect(stored()).toEqual(['aws/iam.html', 'db2/plan.html']);
  });
});
