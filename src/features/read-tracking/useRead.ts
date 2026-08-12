import { useSyncExternalStore } from 'react';

// localStorage 'dbxRead' — 기존 vanilla(unread.js/notify.js)와 같은 키 공유
const KEY = 'dbxRead';
const listeners = new Set<() => void>();

function get(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
  } catch { return []; }
}
let cache = get();

function emit(): void {
  cache = get();
  listeners.forEach((fn) => fn());
}

export function markRead(key: string): void {
  const l = get();
  if (!l.includes(key)) {
    l.push(key);
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* 저장 실패는 무시 */ }
    emit();
  }
}

export function markAllRead(keys: readonly string[]): void {
  const l = get();
  let dirty = false;
  keys.forEach((k) => { if (!l.includes(k)) { l.push(k); dirty = true; } });
  if (dirty) {
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* 저장 실패는 무시 */ }
    emit();
  }
}

export function useReadList(): readonly string[] {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    () => cache,
  );
}
