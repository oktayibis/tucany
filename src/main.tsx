import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from './components/ui/provider';
import './fonts.css';

const root = document.getElementById('root');
if (root === null) throw new Error('#root bulunamadı');

createRoot(root).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
