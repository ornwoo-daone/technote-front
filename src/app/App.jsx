import { useEffect } from 'react';

// 기존 사이트(public/ = C:\htmls\dbx-guide junction)는 그대로 서빙된다.
// 이 React 셸은 루트(/) 진입 시 기존 홈으로 보내는 역할만 한다.
// 이후 페이지를 React 컴포넌트로 옮길 때 여기서부터 확장하면 된다.
export default function App() {
  useEffect(() => {
    window.location.replace('/dbx-guide.html');
  }, []);

  return (
    <p style={{ fontFamily: 'sans-serif', padding: 24 }}>
      Tech Note 로 이동 중… <a href="/dbx-guide.html">바로 가기</a>
    </p>
  );
}
