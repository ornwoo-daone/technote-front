import { Suspense, lazy, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { findDoc, docKey } from '../entities/docs/registry.js';
import { markRead } from '../features/read-tracking/useRead.js';
import { mdxComponents } from '../shared/ui/slide-kit.jsx';
import DeckViewer from '../widgets/DeckViewer.jsx';

export default function DeckPage() {
  const { cat, slug } = useParams();
  const doc = findDoc(cat, slug);

  const Content = useMemo(() => (doc && doc.load ? lazy(doc.load) : null), [doc]);

  useEffect(() => {
    if (doc) markRead(docKey(doc));
    document.title = doc ? doc.t : 'Tech Note';
  }, [doc]);

  if (!doc || !Content) return <div className="wrap"><h1>문서를 찾을 수 없습니다</h1></div>;

  return (
    <MDXProvider components={mdxComponents}>
      <DeckViewer backTo={`/${cat}`} backLabel={cat}>
        <Suspense fallback={<section className="slide active"><p className="lead muted">불러오는 중…</p></section>}>
          <Content />
        </Suspense>
      </DeckViewer>
    </MDXProvider>
  );
}
