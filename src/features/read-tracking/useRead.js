import { useSyncExternalStore } from 'react';

// localStorage 'dbxRead' — 기존 vanilla(unread.js/notify.js)와 같은 키 공유
const KEY = 'dbxRead';
const listeners = new Set();

function get() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
let cache = get();

function emit() {
  cache = get();
  listeners.forEach((fn) => fn());
}

export function markRead(key) {
  const l = get();
  if (!l.includes(key)) {
    l.push(key);
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {}
    emit();
  }
}

export function markAllRead(keys) {
  const l = get();
  let dirty = false;
  keys.forEach((k) => { if (!l.includes(k)) { l.push(k); dirty = true; } });
  if (dirty) {
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {}
    emit();
  }
}

export function useReadList() {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => cache,
  );
}
