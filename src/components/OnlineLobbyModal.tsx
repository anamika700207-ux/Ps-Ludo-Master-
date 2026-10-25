import React, { useState } from 'react';
import { PlayerColor, Language, OnlineRoomState } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import { X, Copy, Check, Users, Play, Crown, Wifi } from 'lucide-react';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: OnlineRoomState | null;
  currentUserId: string;
  userName: string;
  userColor: PlayerColor;
  lang: Language;
  onCreateRoom: (maxPlayers: 2 | 3 | 4) => void;
  onJoinRoom: (roomId: string) => void;
  onStartOnlineGame: () => void;
  onSelectColor: (color: PlayerColor) => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  roomState,
  currentUserId,
  userName,
  userColor,
  lang,
  onCreateRoom,
  onJoinRoom,
  onStartOnlineGame,
  onSelectColor,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const isHost = roomState?.hostId === currentUserId;

  const handleCopyCode = () => {
    if (!roomState?.roomId) return;
    navigator.clipboard.writeText(roomState.roomId);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onCreateRoom(maxPlayers);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    sounds.playClick();
    onJoinRoom(roomCodeInput.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden">
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
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow">
            <Wifi className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              {t.playOnline}
            </h2>
            <p className="text-xs text-slate-400">
              {roomState ? t.shareRoomHint : t.tagline}
            </p>
          </div>
        </div>

        {/* If user is NOT currently inside a room, show Create / Join tabs */}
        {!roomState ? (
          <div>
            <div className="flex border-b border-slate-800 mb-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('create');
                }}
                className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
                  activeTab === 'create'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.createRoom}
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('join');
                }}
                className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
                  activeTab === 'join'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.joinRoom}
              </button>
            </div>

            {activeTab === 'create' ? (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    {t.playersCount}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setMaxPlayers(count as 2 | 3 | 4);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                          maxPlayers === count
                            ? 'bg-slate-800 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {count === 2 ? t.twoPlayers : count === 3 ? t.threePlayers : t.fourPlayers}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-display font-bold text-sm shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                >
                  {t.createRoom}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    {t.enterRoomCode}
                  </label>
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. LUDO99"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!roomCodeInput.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-display font-bold text-sm shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
                >
                  {t.joinRoom}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* User is inside a room lobby */
          <div className="space-y-5">
            {/* Room Code Display Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">{t.enterRoomCode}</span>
                <span className="text-2xl font-mono font-bold tracking-widest text-amber-400">
                  {roomState.roomId}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyCode}</span>
              </button>
            </div>

            {/* Players List */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                <span>{t.playersCount}</span>
                <span>
                  {Object.keys(roomState.players).length}/{roomState.maxPlayers}
                </span>
              </div>

              <div className="space-y-2">
                {Object.values(roomState.players).map((p) => {
                  const colorCfg = COLOR_CONFIG[p.color];
                  const isMe = p.id === currentUserId;
                  const isPlayerHost = p.id === roomState.hostId;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${colorCfg.bg} shadow-sm`} />
                        <span className="text-sm font-medium text-white truncate max-w-[140px]">
                          {p.name} {isMe && '(You)'}
                        </span>
                        {isPlayerHost && (
                          <span title="Host">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {lang === 'bn' ? colorCfg.nameBn : colorCfg.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Ready
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Change Color in Lobby */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t.selectYourColor}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((c) => {
                  const cfg = COLOR_CONFIG[c];
                  const isSelected = userColor === c;
                  const isTaken = Object.values(roomState.players).some(
                    (p) => p.id !== currentUserId && p.color === c
                  );

                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isTaken}
                      onClick={() => {
                        sounds.playClick();
                        onSelectColor(c);
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-xs font-semibold transition ${
                        isSelected
                          ? `bg-slate-800 border-white text-white ring-2 ${cfg.ring}`
                          : isTaken
                          ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} />
                      <span>{lang === 'bn' ? cfg.nameBn : cfg.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Game Button (Host Only) */}
            {isHost ? (
              <button
                onClick={() => {
                  sounds.playClick();
                  onStartOnlineGame();
                }}
                disabled={Object.keys(roomState.players).length < 2}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-display font-extrabold text-sm shadow-xl hover:shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.startGame}</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-amber-300 font-medium">
                  {t.waitingForHost}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
