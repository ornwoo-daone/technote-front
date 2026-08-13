import { useSyncExternalStore } from 'react';

// localStorage 'dbxBookmark' — 레거시에 없던 새 키다(공유 계약 없음).
// 값은 docKey(`<cat>/<slug>.html`) 배열 — dbxRead 와 같은 형식이라 서로 대조가 된다.
const KEY = 'dbxBookmark';
const listeners = new Set<() => void>();

function get(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
  } catch { return []; }
}
let cache = get();

function write(list: readonly string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* 저장 실패는 무시 */ }
  cache = get();
  listeners.forEach((fn) => fn());
}

export function toggleBookmark(key: string): void {
  const l = get();
  write(l.includes(key) ? l.filter((k) => k !== key) : [...l, key]);
}

export function useBookmarks(): readonly string[] {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    () => cache,
  );
}
