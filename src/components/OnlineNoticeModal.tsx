import React from 'react';
import { sounds } from '../utils/soundEffects';
import { Wifi, Clock, X, Check } from 'lucide-react';

interface OnlineNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'bn' | 'en';
}

export const OnlineNoticeModal: React.FC<OnlineNoticeModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
        {/* Close icon button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pulsing Icon Emblem */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-70 animate-pulse" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
            <Wifi className="w-8 h-8 animate-pulse text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mb-2 tracking-tight">
          {lang === 'bn' ? 'অনলাইন মাল্টিপ্লেয়ার' : 'Online Multiplayer'}
        </h3>

        {/* Exact message requested by the user in Bengali */}
        <div className="w-full my-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-base sm:text-lg font-bold text-amber-300 leading-relaxed font-display">
            গেমের অনলাইন ব্যবস্থাটি এখনো সফলভাবে সম্পন্ন হয়নি অনুগ্রহ করে অপেক্ষা করুন।
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
          {lang === 'bn'
            ? 'আমাদের টিম ফিচারটি সম্পূর্ণ করার জন্য কাজ করছে। আপাতত অফলাইন পাস অ্যান্ড প্লে অথবা বট মোড খেলুন।'
            : 'Our team is working on completing the online servers. Please enjoy offline Pass & Play or Bot mode in the meantime.'}
        </p>

        {/* Confirm / Close CTA button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-lg shadow-amber-500/25 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>{lang === 'bn' ? 'ঠিক আছে' : 'Got it'}</span>
        </button>
      </div>
    </div>
  );
};
