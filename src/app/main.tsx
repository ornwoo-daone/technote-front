import { createRoot } from 'react-dom/client';
import App from './App';
import '../shared/assets/shell.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root 엘리먼트가 없습니다');

createRoot(root).render(<App />);
