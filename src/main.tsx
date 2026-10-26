import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { CustomMusicProvider } from './context/CustomMusicContext';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <CustomMusicProvider>
    <App />
  </CustomMusicProvider>
);

