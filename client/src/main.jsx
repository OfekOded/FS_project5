import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CacheProvider } from './context/CacheContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CacheProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);