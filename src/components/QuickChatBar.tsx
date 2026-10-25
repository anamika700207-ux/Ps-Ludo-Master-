import React, { useState } from 'react';
import { QuickReaction, Language } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import { MessageSquare, Sparkles } from 'lucide-react';

interface QuickChatBarProps {
  onSendReaction: (text: string, emoji: string) => void;
  lang: Language;
  activeReactions: QuickReaction[];
}

export const QuickChatBar: React.FC<QuickChatBarProps> = ({
  onSendReaction,
  lang,
  activeReactions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const quickEmojis = ['🔥', '🎲', '👑', '👏', '😭', '😅', '🤝', '🍀'];

  const handleSend = (text: string, emoji: string) => {
    sounds.playClick();
    onSendReaction(text, emoji);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Active Reactions on the board/screen */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
        {activeReactions.slice(-3).map((r) => {
          const colorCfg = COLOR_CONFIG[r.senderColor];
          return (
            <div
              key={r.id}
              className="animate-bounce flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-xs font-semibold text-white max-w-xs"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${colorCfg.bg}`} />
              <span className="text-slate-400 font-normal">{r.senderName}:</span>
              <span className="text-lg">{r.emoji}</span>
              <span>{r.text}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Reaction Button & Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            sounds.playClick();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold shadow-md transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">
            {lang === 'bn' ? 'চ্যাট / ইমোজি' : 'Chat / Emote'}
          </span>
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 sm:w-72 p-3 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl z-50 animate-fade-in">
            {/* Quick Emojis Row */}
            <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-slate-800">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSend('', emoji)}
                  className="text-lg hover:scale-130 transition p-1 hover:bg-slate-800 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Phrases */}
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {t.quickMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(msg, '')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-between"
                >
                  <span>{msg}</span>
                  <Sparkles className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
