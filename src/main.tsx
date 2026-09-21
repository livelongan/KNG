import '@fontsource/ibm-plex-sans/300.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app-router';
import './index.css';
import { RootStoreProvider } from './store';
import { AppThemeProvider } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootStoreProvider>
      <AppThemeProvider>
        <AppRouter />
      </AppThemeProvider>
    </RootStoreProvider>
  </StrictMode>,
);
