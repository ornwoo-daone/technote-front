import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCS, CATS, docKey } from '../../entities/docs/registry.js';
import { useReadList, markRead, markAllRead } from '../read-tracking/useRead.js';

// localStorage 키는 기존 notify.js 와 동일 (dbxSeenAt / dbxToasted)
const catName = Object.fromEntries(CATS.map((c) => [c.f, c.name]));
const sorted = DOCS.slice().sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
const fmt = (d) => d.replace(/^\d{4}-/, '').replace('-', '/');

function ls(k, dflt) { try { return JSON.parse(localStorage.getItem(k) || dflt); } catch { return JSON.parse(dflt); } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function NotifyBell() {
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [ring, setRing] = useState(false);
  const read = useReadList();
  const nav = useNavigate();
  const panelRef = useRef(null);

  const unread = sorted.filter((d) => !read.includes(docKey(d))).length;

  const go = (d) => {
    markRead(docKey(d));
    setOpen(false);
    if (d.legacy) window.location.href = d.legacy;
    else nav(`/${d.cat}/${d.slug}`);
  };

  // 새 덱 감지 → 중앙 토스트 + Windows 알림
  useEffect(() => {
    const demo = /notify-demo/.test(location.search + location.hash);
    let seen = null;
    try { seen = localStorage.getItem('dbxSeenAt'); } catch {}
    const toasted = ls('dbxToasted', '[]');
    const today = new Date().toISOString().slice(0, 10);

    let fresh = [];
    if (demo) fresh = sorted.slice(0, 2);
    else if (!seen) save('dbxToasted', sorted.map((x) => docKey(x)));
    else {
      fresh = sorted.filter((x) => x.at > seen && !toasted.includes(docKey(x))).slice(0, 3);
      if (fresh.length) save('dbxToasted', toasted.concat(fresh.map(docKey)));
    }
    try { localStorage.setItem('dbxSeenAt', today); } catch {}

    if (!fresh.length) return;
    setRing(true);
    setTimeout(() => setRing(false), 1000);
    let i = 0;
    const next = () => {
      if (i >= fresh.length) return;
      const d = fresh[i++];
      setToasts([d]);
      osNotify(d);
      setTimeout(() => { setToasts([]); setTimeout(next, 500); }, 3000);
    };
    next();
  }, []);

  const osNotify = (d) => {
    if (!window.Notification || Notification.permission !== 'granted') return;
    try {
      const n = new Notification('새로운 덱 · ' + catName[d.cat], {
        body: d.t + '\n' + d.d, icon: '/assets/favicon.png', tag: docKey(d),
      });
      n.onclick = () => { window.focus(); go(d); n.close(); };
    } catch {}
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.nt-btn')) setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const [perm, setPerm] = useState(() => (window.Notification ? Notification.permission : 'unsupported'));

  return (
    <>
      <button className={'nt-btn' + (ring ? ' ring' : '')} aria-label="알림" title="알림" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
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
              <button className="nt-allread" onClick={() => Notification.requestPermission().then(setPerm)}>Windows 알림</button>
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
                  <span>{fmt(d.at)}</span>
                  {!isRead && (
                    <button className="nt-mark" onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(docKey(d)); }}>읽음</button>
                  )}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {toasts.map((d) => (
        <div key={docKey(d)} className="nt-toast on" onClick={() => { setToasts([]); go(d); }}>
          <div className="tk"><i />새로운 덱</div>
          <h3>{d.t}</h3>
          <p>{d.d}</p>
          <div className="tf">클릭하면 바로 이동합니다</div>
        </div>
      ))}
    </>
  );
}
