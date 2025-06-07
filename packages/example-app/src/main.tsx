import { StrictMode, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
// import App from './App2';

const Wrap = StrictMode;

createRoot(document.getElementById('root')!).render(
  <Wrap>
    <App test={'test'} />
  </Wrap>,
);
