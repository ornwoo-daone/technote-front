import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCS, CATS, docKey, docWhen, docUpdated, docStamp, docTouched } from '../../entities/docs/registry';
import type { Doc } from '../../entities/docs/registry';
import { useReadList, markRead, markAllRead } from '../read-tracking/useRead';
import { timeAgo, formatStamp } from './timeAgo';
import { freshDocs, notifyKey } from './freshDocs';
import type { Fresh } from './freshDocs';

// 마지막 방문 시각(분 단위)과 «이미 알린» 목록. 레거시 notify.js 의 dbxSeenAt / dbxToasted 는
// 날짜 단위라 같은 날 추가를 못 잡는다 → React 는 별도 키를 쓰고, 레거시 키는 계약 유지용으로만 갱신한다.
const SEEN = 'dbxSeenStamp';
const SENT = 'dbxNotified';

// localStorage 키는 기존 notify.js 와 동일 (dbxSeenAt / dbxToasted)
const catName: Record<string, string> = Object.fromEntries(CATS.map((c) => [c.f, c.name]));
// 알림은 «언제 올라왔나»만 본다 — 수정 이력은 카테고리 리스트 쪽에서 보여준다
const sorted: readonly Doc[] = DOCS.slice()
  .sort((a, b) => (docStamp(a) < docStamp(b) ? 1 : docStamp(a) > docStamp(b) ? -1 : 0));

type Perm = NotificationPermission | 'unsupported';

function readKeys(k: string): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(k) || '[]');
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
  } catch { return []; }
}
function save(k: string, v: unknown): void {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 실패는 무시 */ }
}

export default function NotifyBell() {
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<readonly Fresh[]>([]);
  const [ring, setRing] = useState(false);
  const [perm, setPerm] = useState<Perm>(() => (window.Notification ? Notification.permission : 'unsupported'));
  const read = useReadList();
  const nav = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = sorted.filter((d) => !read.includes(docKey(d))).length;

  const go = (d: Doc): void => {
    markRead(docKey(d));
    setOpen(false);
    if (d.legacy) window.location.href = d.legacy;
    else nav(`/${d.cat}/${d.slug}`);
  };

  const osNotify = ({ doc: d, updated }: Fresh): void => {
    if (!window.Notification || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(`${updated ? '수정된' : '새로운'} 덱 · ${catName[d.cat]}`, {
        body: d.t + '\n' + d.d, icon: '/assets/favicon.png', tag: docKey(d),
      });
      n.onclick = () => { window.focus(); go(d); n.close(); };
    } catch { /* 알림 실패는 무시 */ }
  };

  // 신규·수정 덱 감지 → 중앙 토스트 + Windows 알림
  useEffect(() => {
    const demo = /notify-demo/.test(location.search + location.hash);
    const now = formatStamp(new Date());
    const notified = readKeys(SENT);

    let seen: string | null = null;
    try { seen = localStorage.getItem(SEEN); } catch { /* 접근 불가 */ }
    if (!seen) {
      // 분 단위 기록이 없던 시절의 사용자 — 날짜만 있던 레거시 키에서 이어받는다.
      // 그날 00:00 부터 보므로, 마지막 방문일에 올라온 덱을 한 번 몰아서 알려준다.
      let legacy: string | null = null;
      try { legacy = localStorage.getItem('dbxSeenAt'); } catch { /* 접근 불가 */ }
      seen = legacy ? `${legacy} 00:00` : now;
    }

    const found = demo
      ? sorted.slice(0, 2).map((d) => ({ doc: d, stamp: docTouched(d), updated: false }))
      : freshDocs(sorted, seen, notified).slice(0, 3);

    if (!demo && found.length) save(SENT, notified.concat(found.map(notifyKey)));
    try {
      localStorage.setItem(SEEN, now);
      localStorage.setItem('dbxSeenAt', now.slice(0, 10)); // 레거시 notify.js 와의 계약 유지
    } catch { /* 저장 실패는 무시 */ }

    if (!found.length) return;
    setRing(true);
    setTimeout(() => setRing(false), 1000);
    let i = 0;
    const next = (): void => {
      const f = found[i++];
      if (!f) return;
      setToasts([f]);
      osNotify(f);
      setTimeout(() => { setToasts([]); setTimeout(next, 500); }, 3000);
    };
    next();
    // 마운트 시 1회만 — sorted 는 모듈 상수라 의존성이 없다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 패널을 열어둔 채로 두면 «1분 전» 이 멈춘다 → 열려 있는 동안만 1분마다 다시 그린다
  const [, retick] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => retick((v) => v + 1), 60_000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (panelRef.current && t && !panelRef.current.contains(t) && !t.closest('.nt-btn')) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const toggle = (e: ReactMouseEvent<HTMLButtonElement>): void => { e.stopPropagation(); setOpen(!open); };

  return (
    <>
      <button className={'nt-btn' + (ring ? ' ring' : '')} aria-label="알림" title="알림" onClick={toggle}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5Z" />
          <path d="M13.7 20a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="nt-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      <div className={'nt-panel' + (open ? ' on' : '')} ref={panelRef}>
        <div className="nt-head">
          <b>알림</b>
          <span style={{ display: 'flex', gap: 6 }}>
            {perm === 'default' && (
              <button className="nt-allread" onClick={() => { void Notification.requestPermission().then(setPerm); }}>Windows 알림</button>
            )}
            {perm === 'granted' && <button className="nt-allread" disabled style={{ opacity: 0.55 }}>Windows 알림 ✓</button>}
            <button className="nt-allread" onClick={() => markAllRead(sorted.map(docKey))}>모두 읽음</button>
          </span>
        </div>
        <div className="nt-list">
          {sorted.map((d) => {
            const isRead = read.includes(docKey(d));
            return (
              <a key={docKey(d)} className={'nt-item' + (isRead ? ' read' : '')}
                href={d.legacy || `#/${d.cat}/${d.slug}`}
                onClick={(e) => { e.preventDefault(); go(d); }}>
                <span className="nt-dot" />
                <span className="nt-t">{d.t}</span>
                <span className="nt-d">{d.d}</span>
                <span className="nt-m">
                  <span className="nt-c">{catName[d.cat]}</span>
                  <span title={docUpdated(d) ? `생성 ${docWhen(d)} · 수정 ${docUpdated(d)}` : `생성 ${docWhen(d)}`}>
                    {timeAgo(docTouched(d))}
                  </span>
                  {docUpdated(d) && <span className="nt-upd">수정</span>}
                  {!isRead && (
                    <button className="nt-mark" onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(docKey(d)); }}>읽음</button>
                  )}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {toasts.map((f) => (
        <div key={notifyKey(f)} className="nt-toast on" onClick={() => { setToasts([]); go(f.doc); }}>
          <div className="tk"><i />{f.updated ? '수정된 덱' : '새로운 덱'}</div>
          <h3>{f.doc.t}</h3>
          <p>{f.doc.d}</p>
          <div className="tf">클릭하면 바로 이동합니다</div>
        </div>
      ))}
    </>
  );
}
