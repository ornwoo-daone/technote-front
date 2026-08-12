import { Suspense, lazy, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { findDoc, docKey } from '../entities/docs/registry';
import { markRead } from '../features/read-tracking/useRead';
import { mdxComponents } from '../shared/ui/slide-kit';
import DeckViewer from '../widgets/DeckViewer';

export default function DeckPage() {
  const { cat, slug } = useParams<{ cat: string; slug: string }>();
  const doc = findDoc(cat ?? '', slug ?? '');

  const load = doc?.load;
  const Content = useMemo(() => (load ? lazy(load) : null), [load]);

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
