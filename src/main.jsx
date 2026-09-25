import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { DebateProvider } from './context/DebateContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DebateProvider>
      <App />
    </DebateProvider>
  </React.StrictMode>
);
