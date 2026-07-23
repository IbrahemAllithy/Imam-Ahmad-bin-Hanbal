import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
