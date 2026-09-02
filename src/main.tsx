import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PlayerDisplayView } from './components/player/PlayerDisplayView';
import { StandaloneNotesWindow } from './components/notes/StandaloneNotesWindow';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

const isPlayerView = 
  window.location.search.includes('view=player') || 
  window.location.pathname.endsWith('/player') || 
  window.location.hash.includes('player');

const isNotesView = 
  window.location.search.includes('view=notes') || 
  window.location.search.includes('view=note') || 
  window.location.pathname.endsWith('/notes') || 
  window.location.hash.includes('notes');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        {isPlayerView ? (
          <PlayerDisplayView />
        ) : isNotesView ? (
          <StandaloneNotesWindow />
        ) : (
          <App />
        )}
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
