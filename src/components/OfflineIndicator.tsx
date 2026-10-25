import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  lang?: 'bn' | 'en';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang = 'bn' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600/90 text-white px-3.5 py-1 text-xs font-semibold shadow-xl border border-amber-300/40 backdrop-blur-sm animate-pulse pointer-events-none">
      <WifiOff className="w-3.5 h-3.5 text-white" />
      <span>{lang === 'bn' ? 'অফলাইন মোড — ক্যাশ করা ডেটায় চলছে' : 'Offline Mode — Playing locally'}</span>
    </div>
  );
};
