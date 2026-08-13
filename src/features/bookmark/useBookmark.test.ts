// localStorage 저장 «형식» 계약만 검사한다.
// 형식이 깨져도 화면은 «북마크가 없다»고만 보여서 조용히 잃어버린다.
import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toggleBookmark } from './useBookmark';
import { DOCS, docKey } from '../../entities/docs/registry';

const KEY = 'dbxBookmark';
const stored = (): unknown => JSON.parse(localStorage.getItem(KEY) || '[]');

beforeEach(() => {
  localStorage.clear();
});

describe('저장 형식', () => {
  it('문자열 배열 JSON 으로 저장한다', () => {
    toggleBookmark('db2/plan.html');
    expect(localStorage.getItem(KEY)).toBe('["db2/plan.html"]');
  });

  it('dbxRead 와 같은 docKey 형식이라 서로 대조된다', () => {
    const first = DOCS[0];
    if (!first) throw new Error('DOCS 가 비어 있다');
    toggleBookmark(docKey(first));
    expect(stored()).toEqual([`${first.cat}/${first.slug}.html`]);
  });
});

describe('아이콘', () => {
  it('BookmarkIcon 이 가리키는 두 아이콘이 static 에 실제로 있다', () => {
    // mask-image 경로는 문자열이라 번들러가 검사하지 않는다. 파일이 없으면
    // «깨진 이미지» 도 안 뜨고 강조색 네모만 남는다 — 실제로 그렇게 됐던 적이 있다.
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'BookmarkIcon.tsx'), 'utf8');
    const refs = [...src.matchAll(/'(\/assets\/icons\/[^']+)'/g)].map((m) => m[1] ?? '');
    expect(refs.length, 'BookmarkIcon 이 아이콘 경로를 안 갖고 있다').toBeGreaterThan(0);
    const missing = refs.filter(
      (p) => !existsSync(join(here, '../../../static', p.replace(/^\//, ''))),
    );
    expect(missing).toEqual([]);
  });
});

describe('토글', () => {
  it('같은 키를 다시 누르면 빠진다', () => {
    toggleBookmark('db2/plan.html');
    toggleBookmark('aws/iam.html');
    toggleBookmark('db2/plan.html');
    expect(stored()).toEqual(['aws/iam.html']);
  });

  it('추가 순서를 유지한다', () => {
    toggleBookmark('db2/plan.html');
    toggleBookmark('aws/iam.html');
    expect(stored()).toEqual(['db2/plan.html', 'aws/iam.html']);
  });
});

describe('깨진 저장값 방어', () => {
  it('배열이 아니면 처음부터 다시 쌓는다', () => {
    localStorage.setItem(KEY, '{"nope":1}');
    toggleBookmark('db2/plan.html');
    expect(stored()).toEqual(['db2/plan.html']);
  });

  it('문자열이 아닌 항목은 걸러낸다', () => {
    localStorage.setItem(KEY, '["db2/plan.html",42,null]');
    toggleBookmark('aws/iam.html');
    expect(stored()).toEqual(['db2/plan.html', 'aws/iam.html']);
  });

  it('JSON 이 아니어도 터지지 않는다', () => {
    localStorage.setItem(KEY, '깨진값');
    expect(() => toggleBookmark('db2/plan.html')).not.toThrow();
    expect(stored()).toEqual(['db2/plan.html']);
  });
});
