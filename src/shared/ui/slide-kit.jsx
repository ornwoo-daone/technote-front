// 덱 슬라이드 컴포넌트 킷 — guide.css 의 기존 클래스를 그대로 사용 (디자인 무변경)

export function Slide({ kick, err, children }) {
  return (
    <section className="slide">
      {kick && <div className={err ? 'kick err' : 'kick'}>{kick}</div>}
      {children}
    </section>
  );
}

export const Lead = ({ children }) => <p className="lead">{children}</p>;
export const Muted = ({ children }) => <p className="muted">{children}</p>;
export const Note = ({ children }) => <div className="note">{children}</div>;
export const Warn = ({ children }) => <div className="warn-box">{children}</div>;

export const G = ({ children }) => <span className="good">{children}</span>;
export const B = ({ children }) => <span className="bad">{children}</span>;
export const W = ({ children }) => <span className="warn">{children}</span>;

export function Flow({ steps, col }) {
  return (
    <div className={col ? 'flow col' : 'flow'}>
      {steps.map((s, i) => (
        <FlowItem key={i} step={s} last={i === steps.length - 1} col={col} />
      ))}
    </div>
  );
}

function FlowItem({ step, last, col }) {
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
function CodeBlock({ children }) {
  const raw = typeof children === 'string' ? children
    : (children && children.props && children.props.children) || '';
  const lines = String(raw).replace(/\n$/, '').split('\n');
  return (
    <pre className="code">
      {lines.map((ln, i) => {
        const m = ln.match(/^(\s*)(\/\/|--|#)(.*)$/);
        const mid = !m && ln.match(/^(.*?\S)(\s+)(\/\/|--)( .*)$/);
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
export const mdxComponents = {
  Slide, Lead, Muted, Note, Warn, Flow, G, B, W,
  table: (p) => <div className="tscroll"><table {...p} /></div>,
  ul: (p) => <ul className="bul" {...p} />,
  pre: CodeBlock,
};
