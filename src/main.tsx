import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { UnitProvider } from './contexts/UnitContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnitProvider>
      <App />
    </UnitProvider>
  </StrictMode>
);