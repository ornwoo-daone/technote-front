// 덱 슬라이드 컴포넌트 킷 — guide.css 의 기존 클래스를 그대로 사용 (디자인 무변경)
import type { ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';

interface Kids { children?: ReactNode }

export function Slide({ kick, err, children }: { kick?: ReactNode; err?: boolean } & Kids) {
  return (
    <section className="slide">
      {kick && <div className={err ? 'kick err' : 'kick'}>{kick}</div>}
      {children}
    </section>
  );
}

export const Lead = ({ children }: Kids) => <p className="lead">{children}</p>;
export const Muted = ({ children }: Kids) => <p className="muted">{children}</p>;
export const Note = ({ children }: Kids) => <div className="note">{children}</div>;
export const Warn = ({ children }: Kids) => <div className="warn-box">{children}</div>;

export const G = ({ children }: Kids) => <span className="good">{children}</span>;
export const B = ({ children }: Kids) => <span className="bad">{children}</span>;
export const W = ({ children }: Kids) => <span className="warn">{children}</span>;

export interface Step {
  /** 제목 */
  t: string;
  /** 부연 */
  d?: string;
  accent?: boolean;
  bad?: boolean;
}

export function Flow({ steps, col }: { steps: readonly Step[]; col?: boolean }) {
  return (
    <div className={col ? 'flow col' : 'flow'}>
      {steps.map((s, i) => (
        <FlowItem key={i} step={s} last={i === steps.length - 1} col={col} />
      ))}
    </div>
  );
}

function FlowItem({ step, last, col }: { step: Step; last: boolean; col?: boolean }) {
  const cls = 'fb' + (step.accent ? ' acc' : '') + (step.bad ? ' bad' : '');
  const style = step.bad ? { borderColor: 'var(--bad)', background: 'var(--bad-soft)' } : undefined;
  return (
    <>
      <div className={cls} style={style}>
        <b>{step.t}</b>
        {step.d && <span>{step.d}</span>}
      </div>
      {!last && !col && <div className="fa">→</div>}
    </>
  );
}

// 코드 펜스: // -- # 주석을 .cm 으로 자동 색칠
function CodeBlock({ children }: Kids) {
  // MDX 는 <pre><code>…</code></pre> 로 넘겨서 한 겹 벗겨야 한다
  const inner = children as { props?: { children?: unknown } } | string | undefined;
  const raw = typeof inner === 'string' ? inner : inner?.props?.children ?? '';
  const lines = String(raw).replace(/\n$/, '').split('\n');
  return (
    <pre className="code">
      {lines.map((ln, i) => {
        const m = ln.match(/^(\s*)(\/\/|--|#)(.*)$/);
        const mid = !m ? ln.match(/^(.*?\S)(\s+)(\/\/|--)( .*)$/) : null;
        return (
          <span key={i}>
            {m ? <span className="cm">{ln}</span>
              : mid ? <>{mid[1]}{mid[2]}<span className="cm">{mid[3]}{mid[4]}</span></>
              : ln}
            {i < lines.length - 1 ? '\n' : ''}
          </span>
        );
      })}
    </pre>
  );
}

// MDXProvider 매핑: 마크다운 기본 요소 → 기존 디자인 클래스
export const mdxComponents: MDXComponents = {
  Slide, Lead, Muted, Note, Warn, Flow, G, B, W,
  table: (p) => <div className="tscroll"><table {...p} /></div>,
  ul: (p) => <ul className="bul" {...p} />,
  pre: CodeBlock,
};
