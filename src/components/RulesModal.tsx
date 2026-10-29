import React from 'react';
import { Language } from '../types/ludo';
import { TRANSLATIONS } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import { X, BookOpen, Star, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              {t.rulesTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'স্ট্যান্ডার্ড আন্তর্জাতিক নিয়ম' : 'Official Standard International Rules'}
            </p>
          </div>
        </div>

        {/* Rules Content */}
        <div className="space-y-3.5 overflow-y-auto pr-1 text-sm text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </span>
            <p>{t.rule1}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </span>
            <p>{t.rule2}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </span>
            <p>{t.rule3}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              4
            </span>
            <p>{t.rule4}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              5
            </span>
            <p>{t.rule5}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-blue-950/40 border border-amber-500/30 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
              6
            </span>
            <div>
              <div className="text-xs font-bold text-amber-300 mb-0.5">
                {lang === 'bn' ? '২ বনাম ২ টিম মোডের নিয়ম' : '2v2 Team Mode Rules'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{t.rule6}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              7
            </span>
            <div>
              <div className="text-xs font-bold text-amber-300 mb-0.5">
                {lang === 'bn' ? 'সর্বোচ্চ দানের নিয়ম (দুই ছয় পাঁচ)' : 'Maximum Roll Rule (Two 6s & Max 5)'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{t.rule7}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
          >
            {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
