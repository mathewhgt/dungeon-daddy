import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PlayerDisplayView } from './components/player/PlayerDisplayView';
import { AppProvider } from './context/AppContext';
import './index.css';

const isPlayerView = 
  window.location.search.includes('view=player') || 
  window.location.pathname.endsWith('/player') || 
  window.location.hash.includes('player');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      {isPlayerView ? <PlayerDisplayView /> : <App />}
    </AppProvider>
  </React.StrictMode>,
);
