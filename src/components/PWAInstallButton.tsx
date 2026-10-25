import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

interface PWAInstallButtonProps {
  lang?: 'bn' | 'en';
  variant?: 'banner' | 'button' | 'icon';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'bn',
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed standalone PWA, suppress the install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowGuide(true);
    }
  };

  const titleText = lang === 'bn' ? 'মোবাইলে ইনস্টল করুন' : 'Install App';
  const subtitleText = lang === 'bn' ? 'অ্যাপ হিসেবে সরাসরি খেলুন' : 'Play directly as an app';

  return (
    <>
      {variant === 'banner' ? (
        <div className={`w-full max-w-[500px] mx-auto p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-between gap-3 shadow-lg backdrop-blur-md ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-white/30 flex items-center justify-center text-slate-950 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span>{titleText}</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">PWA</span>
              </div>
              <div className="text-[11px] text-slate-300">{subtitleText}</div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ইনস্টল' : 'Install'}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg border border-amber-300/80 hover:brightness-110 active:scale-95 transition cursor-pointer select-none ${className}`}
          title={titleText}
        >
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>{titleText}</span>
        </button>
      )}

      {/* Success Banner */}
      {installSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{lang === 'bn' ? 'Ps Ludo Master সফলভাবে ইনস্টল হয়েছে!' : 'Ps Ludo Master installed successfully!'}</span>
        </div>
      )}

      {/* Install Guide Modal (Android Chrome & iOS Safari) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border-2 border-amber-400/50 p-5 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300">
                  {lang === 'bn' ? 'মোবাইলে ইনস্টল করার নিয়ম' : 'How to Install on Mobile'}
                </h3>
                <p className="text-[11px] text-slate-400">Ps Ludo Master</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="font-semibold text-amber-200">
                  {lang === 'bn' ? 'আইফোন / আইপ্যাডের জন্য (Safari):' : 'For iPhone / iPad (Safari):'}
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">১</span>
                  <span>
                    {lang === 'bn' ? (
                      <>সাফারি ব্রাউজারের নিচে থাকা <strong className="text-white">Share (শেয়ার <Share className="w-3 h-3 inline mx-0.5" />)</strong> বাটনে ট্যাপ করুন।</>
                    ) : (
                      <>Tap the <strong className="text-white">Share (<Share className="w-3 h-3 inline mx-0.5" />)</strong> button at the bottom of Safari.</>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">২</span>
                  <span>
                    {lang === 'bn' ? (
                      <>নিচে স্ক্রোল করে <strong className="text-amber-300">'Add to Home Screen'</strong> (হোম স্ক্রিনে যোগ করুন) সিলেক্ট করুন।</>
                    ) : (
                      <>Scroll down and tap <strong className="text-amber-300">'Add to Home Screen'</strong>.</>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="font-semibold text-amber-200">
                  {lang === 'bn' ? 'অ্যান্ড্রয়েড ফোনের জন্য (Chrome/অন্যান্য):' : 'For Android Phones (Chrome/other):'}
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">১</span>
                  <span>
                    {lang === 'bn' ? (
                      <>ব্রাউজারের উপরের ডান কোনায় <strong className="text-white">তিনটি ডট (⋮)</strong> মেনু বাটনে ট্যাপ করুন।</>
                    ) : (
                      <>Tap the <strong className="text-white">three dots (⋮)</strong> in the top-right corner.</>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">২</span>
                  <span>
                    {lang === 'bn' ? (
                      <><strong className="text-amber-300">'Install app'</strong> বা <strong className="text-amber-300">'Add to Home screen'</strong>-এ চাপ দিন।</>
                    ) : (
                      <>Select <strong className="text-amber-300">'Install app'</strong> or <strong className="text-amber-300">'Add to Home screen'</strong>.</>
                    )}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium pt-1">
                  {lang === 'bn' ? '✓ ইনস্টল হলে এটি সাধারণ অ্যাপের মতো ইন্টারনেটের ডেটা বাঁচিয়ে দ্রুত চালু হবে!' : '✓ Once installed, it launches full-screen like a native app!'}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition"
            >
              {lang === 'bn' ? 'ঠিক আছে, বুঝেছি' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
