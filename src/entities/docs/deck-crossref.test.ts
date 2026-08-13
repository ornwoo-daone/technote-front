// 덱 상호 참조 검증.
//
// 덱은 서로를 «제목» 으로 가리킨다 — 예: "보안 · «TLS · 인증서 · AES 기초» 를 먼저 읽어라".
// 그런데 덱을 다른 카테고리로 옮기면 그 문구가 조용히 틀어진다. 빌드도 타입도 못 잡고,
// 읽는 사람이 없는 카테고리를 뒤지게 된다. 실제로 두 번 발생했다.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATS, DOCS, GROUPS } from './registry';

const contentDir = join(dirname(fileURLToPath(import.meta.url)), 'content');

/** content/**.mdx 전부 { cat, slug, text } 로 읽는다 */
function readDecks(): { cat: string; slug: string; text: string }[] {
  const out: { cat: string; slug: string; text: string }[] = [];
  for (const cat of readdirSync(contentDir)) {
    const dir = join(contentDir, cat);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.mdx')) continue;
      out.push({ cat, slug: file.replace(/\.mdx$/, ''), text: readFileSync(join(dir, file), 'utf8') });
    }
  }
  return out;
}

const decks = readDecks();
const catName = (f: string): string => CATS.find((c) => c.f === f)?.name ?? f;

/** 'INFRA · TOOLS' → ['INFRA · TOOLS', 'INFRA', 'TOOLS'] — 덱 본문은 보통 앞부분만 쓴다 */
const parts = (label: string): string[] => [label, ...label.split('·').map((s) => s.trim())];

/** 사람이 «카테고리 라벨»로 쓸 법한 모든 토큰 (카테고리 이름 + 홈 섹션 라벨) */
const KNOWN_LABELS = [...CATS.map((c) => c.name), ...GROUPS.flatMap((g) => parts(g.label))]
  .filter((s) => s.length >= 2);

/** 그 덱을 가리킬 때 «맞는» 라벨들 — 카테고리 이름이거나, 그 카테고리가 속한 섹션 라벨 */
function acceptableLabels(cat: string): string[] {
  const c = CATS.find((x) => x.f === cat);
  const g = GROUPS.find((x) => x.key === (c?.g ?? 'db'));
  return [catName(cat), ...(g ? parts(g.label) : [])];
}

describe('덱 상호 참조', () => {
  it('참조 옆에 붙인 카테고리 이름이 그 덱의 실제 카테고리와 같다', () => {
    // 예: "보안 · «TLS · 인증서 · AES 기초»" — 앞의 «보안» 이 실제 카테고리여야 한다.
    const bad: string[] = [];
    for (const deck of decks) {
      for (const target of DOCS) {
        if (target.slug === deck.slug) continue; // 자기 자신은 제외
        let from = 0;
        for (;;) {
          const at = deck.text.indexOf(target.t, from);
          if (at < 0) break;
          from = at + target.t.length;
          // 제목 앞 40자 안에서 라벨을 찾는다
          const before = deck.text.slice(Math.max(0, at - 40), at);
          const ok = acceptableLabels(target.cat);
          if (ok.some((n) => before.includes(n))) continue;          // 맞게 가리킴
          const wrong = KNOWN_LABELS.filter((n) => before.includes(n))
            .sort((a, b) => b.length - a.length)[0];
          if (!wrong) continue;                                      // 라벨 없이 제목만 언급 — 검사 대상 아님
          bad.push(
            `${deck.cat}/${deck.slug}.mdx: «${target.t}» 를 "${wrong}" 로 가리키는데 ` +
            `실제는 "${catName(target.cat)}" (${ok.join(' / ')})`,
          );
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('덱이 참조하는 전용 CSS 를 실제로 import 한다', () => {
    // css 파일만 두고 import 를 빠뜨리면 스타일이 통째로 안 먹는다 (빌드는 통과)
    const bad: string[] = [];
    for (const deck of decks) {
      const cssPath = join(contentDir, deck.cat, `${deck.slug}.css`);
      let hasCss = true;
      try { statSync(cssPath); } catch { hasCss = false; }
      if (!hasCss) continue;
      if (!deck.text.includes(`./${deck.slug}.css`)) {
        bad.push(`${deck.cat}/${deck.slug}.mdx: 옆에 css 가 있는데 import 가 없다`);
      }
    }
    expect(bad).toEqual([]);
  });
});
