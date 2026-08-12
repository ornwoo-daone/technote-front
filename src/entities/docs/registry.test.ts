// 레지스트리 정합성 — 타입도 빌드도 못 잡는 구멍만 검사한다.
// (없는 .mdx 를 가리키는 load 경로는 번들러가 이미 빌드 에러로 잡으므로 여기서 안 본다)
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, statSync, lstatSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATS, DOCS, GROUPS, SESSIONS, docKey, docsOf, findDoc, sessionsOf, catsOfGroup } from './registry';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, 'content');
const iconsDir = join(here, '../../../public/assets/icons');

const publicDir = join(here, '../../../public');

const catOf = (f: string) => CATS.find((c) => c.f === f);

describe('public junction', () => {
  // 과거 사고: 브랜치 전환 중 git 이 junction 을 끊고 일반 디렉토리로 갈아치웠다.
  // 아이콘·guide.css·레거시 HTML 이 통째로 안 보이게 되는데, 아래 아이콘 테스트만으로는
  // "파일이 없다"고만 나와 원인을 찾기 어렵다. 그래서 링크 자체를 따로 본다.
  it('public 이 C:\\htmls\\dbx-guide 로의 링크로 살아 있다', () => {
    if (process.platform !== 'win32') return; // 윈도우 전용 로컬 셋업
    expect(existsSync(publicDir), 'public 디렉토리가 없다').toBe(true);
    expect(
      lstatSync(publicDir).isSymbolicLink(),
      'public 이 junction 이 아니라 일반 디렉토리다 — README 의 mklink 명령으로 재생성할 것',
    ).toBe(true);
  });
});

describe('CATS', () => {
  it('카테고리 id(f) 가 중복되지 않는다', () => {
    const seen = CATS.map((c) => c.f);
    expect(seen).toHaveLength(new Set(seen).size);
  });

  it('모든 카테고리에 icon 또는 mono 중 하나가 있다', () => {
    // 둘 다 없으면 홈 타일이 빈 칸으로 렌더된다
    const empty = CATS.filter((c) => !c.icon && !c.mono).map((c) => c.f);
    expect(empty).toEqual([]);
  });

  it('g 값이 GROUPS 에 정의된 섹션이다', () => {
    const keys = new Set<string>(GROUPS.map((g) => g.key));
    const bad = CATS.filter((c) => c.g !== undefined && !keys.has(c.g)).map((c) => c.f);
    expect(bad).toEqual([]);
  });

  it('icon 파일이 public/assets/icons 에 실제로 있다', () => {
    // public/ 은 번들 대상이 아니라 빌드가 못 잡는다 → 깨진 이미지로만 드러남
    const missing = CATS
      .filter((c) => c.icon)
      .map((c) => ({ f: c.f, path: join(iconsDir, c.icon!.replace('/assets/icons/', '')) }))
      .filter((x) => !existsSync(x.path))
      .map((x) => x.f);
    expect(missing).toEqual([]);
  });

  it('세션 목록의 첫 항목이 all 이다', () => {
    // CategoryPage 가 유효하지 않은 필터를 all 로 되돌린다 — all 이 없으면 탭이 빈다
    for (const c of CATS) {
      expect(sessionsOf(c)[0]?.key, `${c.f} 의 첫 세션`).toBe('all');
    }
  });
});

describe('DOCS', () => {
  it('cat + slug 조합이 중복되지 않는다', () => {
    // 중복되면 docKey 가 겹쳐 읽음 처리가 엉뚱한 문서에 섞인다
    const keys = DOCS.map(docKey);
    expect(keys).toHaveLength(new Set(keys).size);
  });

  it('cat 이 실재하는 카테고리다', () => {
    const bad = DOCS.filter((d) => !catOf(d.cat)).map(docKey);
    expect(bad).toEqual([]);
  });

  it('session 이 그 카테고리의 탭에 존재한다', () => {
    // 안 맞으면 탭 카운트가 0 이고 ALL 에서만 보인다 — 에러 없이 조용히 어긋남
    const bad = DOCS.filter((d) => {
      const keys = sessionsOf(catOf(d.cat)).map((s) => s.key);
      return !keys.includes(d.session);
    }).map((d) => `${docKey(d)} (session: ${d.session})`);
    expect(bad).toEqual([]);
  });

  it('at 이 유효한 YYYY-MM-DD 다', () => {
    // 알림 정렬·신규 감지가 문자열 비교라 형식이 틀려도 에러가 안 난다
    const bad = DOCS.filter((d) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d.at)) return true;
      return Number.isNaN(Date.parse(d.at));
    }).map((d) => `${docKey(d)} (at: ${d.at})`);
    expect(bad).toEqual([]);
  });

  it('load 가 있으면 content/<cat>/<slug>.mdx 규약을 따른다', () => {
    const bad = DOCS
      .filter((d) => d.load)
      .filter((d) => !existsSync(join(contentDir, d.cat, `${d.slug}.mdx`)))
      .map(docKey);
    expect(bad).toEqual([]);
  });

  it('load 도 legacy 도 없는 문서가 없다', () => {
    const bad = DOCS.filter((d) => !d.load && !d.legacy).map(docKey);
    expect(bad).toEqual([]);
  });
});

describe('content 디렉토리', () => {
  it('등록되지 않은 .mdx 파일이 없다', () => {
    // 파일만 있고 DOCS 에 없으면 화면 어디에도 안 나온다 — 아무도 모르게 사라짐
    const registered = new Set(DOCS.map((d) => `${d.cat}/${d.slug}.mdx`));
    const found: string[] = [];
    for (const cat of readdirSync(contentDir)) {
      const dir = join(contentDir, cat);
      if (!statSync(dir).isDirectory()) continue;
      for (const file of readdirSync(dir)) {
        if (file.endsWith('.mdx')) found.push(`${cat}/${file}`);
      }
    }
    expect(found.filter((f) => !registered.has(f))).toEqual([]);
  });
});

describe('헬퍼', () => {
  it('docKey 형식은 `cat/slug.html` 이다', () => {
    // ⚠️ 레거시 localStorage(dbxRead)와 공유하는 키 형식.
    // 이 테스트가 깨진다면 사용자의 읽음 기록이 전부 날아간다는 뜻이다.
    expect(docKey({ cat: 'db2', slug: 'plan', session: 'work', at: '2026-08-11', t: '', d: '', k: '' }))
      .toBe('db2/plan.html');
  });

  it('docsOf 는 해당 카테고리 문서만 준다', () => {
    for (const d of docsOf('db2')) expect(d.cat).toBe('db2');
    expect(docsOf('__없는카테고리__')).toEqual([]);
  });

  it('findDoc 은 cat 과 slug 를 모두 본다', () => {
    const first = DOCS[0]!;
    expect(findDoc(first.cat, first.slug)).toBe(first);
    expect(findDoc(first.cat, '__없는slug__')).toBeUndefined();
  });

  it('sessionsOf 는 sessions 가 없으면 기본 SESSIONS 로 떨어진다', () => {
    expect(sessionsOf(undefined)).toBe(SESSIONS);
    expect(sessionsOf(catOf('db2'))).toBe(SESSIONS);
    expect(sessionsOf(catOf('java'))).not.toBe(SESSIONS);
  });

  it('catsOfGroup 은 g 가 없는 카테고리를 db 로 취급한다', () => {
    expect(catsOfGroup('db').map((c) => c.f)).toContain('db2');
    expect(catsOfGroup('lang').map((c) => c.f)).toContain('java');
    expect(catsOfGroup('db').map((c) => c.f)).not.toContain('java');
  });

  it('모든 카테고리가 어느 한 섹션에는 속한다', () => {
    const total = GROUPS.reduce((n, g) => n + catsOfGroup(g.key).length, 0);
    expect(total).toBe(CATS.length);
  });
});
