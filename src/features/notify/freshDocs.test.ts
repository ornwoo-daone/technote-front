// 실제로 놓쳤던 두 가지를 고정한다.
//  ① 같은 날 올라온 덱을 못 잡던 문제 (마지막 방문을 «날짜» 로만 기록 → at === seen 이라 탈락)
//  ② 덱을 고쳐도 안 잡던 문제 (수정 시각을 아예 안 봄)
// 둘 다 에러가 나지 않고 «알림이 안 뜬다» 로만 드러나서 사람이 눈치채기 어렵다.
import { describe, it, expect } from 'vitest';
import { freshDocs, notifyKey } from './freshDocs';
import type { Doc } from '../../entities/docs/registry';

const doc = (slug: string, at: string, time?: string, up?: string): Doc => ({
  cat: 'db2', slug, session: 'work', at, time, up, t: slug, d: '', k: '',
});

describe('신규 감지', () => {
  it('마지막 방문 이후에 올라온 덱을 잡는다', () => {
    const found = freshDocs([doc('a', '2026-08-13', '14:00')], '2026-08-13 10:00', []);
    expect(found.map((f) => f.doc.slug)).toEqual(['a']);
    expect(found[0]?.updated).toBe(false);
  });

  it('«같은 날» 방문 뒤에 올라온 덱도 잡는다', () => {
    // 예전 구현은 날짜만 비교해서(at > seen) 이 경우가 항상 탈락했다
    const found = freshDocs([doc('a', '2026-08-13', '17:44')], '2026-08-13 10:00', []);
    expect(found.map((f) => f.doc.slug)).toEqual(['a']);
  });

  it('방문 전에 있던 덱은 안 잡는다', () => {
    expect(freshDocs([doc('a', '2026-08-12', '09:00')], '2026-08-13 10:00', [])).toEqual([]);
  });

  it('시각을 모르는 덱은 그날 00:00 로 본다', () => {
    expect(freshDocs([doc('a', '2026-08-13')], '2026-08-13 10:00', [])).toEqual([]);
    expect(freshDocs([doc('a', '2026-08-13')], '2026-08-12 23:00', [])).toHaveLength(1);
  });
});

describe('수정 감지', () => {
  it('방문 전에 만들어졌어도 그 뒤에 고쳤으면 잡는다', () => {
    const found = freshDocs([doc('a', '2026-08-12', '17:01', '2026-08-13 12:38')], '2026-08-13 10:00', []);
    expect(found).toHaveLength(1);
    expect(found[0]?.updated).toBe(true);
    expect(found[0]?.stamp).toBe('2026-08-13 12:38');
  });

  it('수정도 방문 전이면 안 잡는다', () => {
    expect(freshDocs([doc('a', '2026-08-11', '10:00', '2026-08-12 09:00')], '2026-08-13 10:00', [])).toEqual([]);
  });

  it('새로 올라온 덱은 수정이 아니라 신규다', () => {
    const found = freshDocs([doc('a', '2026-08-13', '11:00', '2026-08-13 12:00')], '2026-08-13 10:00', []);
    expect(found[0]?.updated).toBe(false);
  });
});

describe('중복 알림 방지', () => {
  it('이미 알린 건 다시 안 잡는다', () => {
    const d = doc('a', '2026-08-13', '14:00');
    const found = freshDocs([d], '2026-08-13 10:00', []);
    const again = freshDocs([d], '2026-08-13 10:00', found.map(notifyKey));
    expect(again).toEqual([]);
  });

  it('같은 덱이라도 «다시 고치면» 또 알린다', () => {
    // 시각을 붙이지 않으면 한 번 알린 덱은 영영 다시 못 알린다
    const before = doc('a', '2026-08-12', '17:01', '2026-08-13 12:20');
    const sent = freshDocs([before], '2026-08-13 10:00', []).map(notifyKey);
    const after = doc('a', '2026-08-12', '17:01', '2026-08-13 12:38');
    expect(freshDocs([after], '2026-08-13 10:00', sent)).toHaveLength(1);
  });
});

describe('정렬', () => {
  it('최근에 움직인 것부터', () => {
    const found = freshDocs(
      [doc('a', '2026-08-13', '11:00'), doc('c', '2026-08-13', '15:00'), doc('b', '2026-08-13', '13:00')],
      '2026-08-13 10:00', [],
    );
    expect(found.map((f) => f.doc.slug)).toEqual(['c', 'b', 'a']);
  });
});
