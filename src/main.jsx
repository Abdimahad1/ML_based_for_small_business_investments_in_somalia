// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; // ✅ import theme context
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* ✅ Theme provider wraps your entire app */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
