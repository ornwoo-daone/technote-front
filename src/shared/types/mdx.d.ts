// .mdx 를 React 컴포넌트로 인식시킨다 (@mdx-js/rollup · @mdx-js/loader 양쪽 공통)
declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';
  const MDXComponent: (props: MDXProps) => JSX.Element;
  export default MDXComponent;
}
