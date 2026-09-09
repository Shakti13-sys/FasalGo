import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, X, Volume2, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processVoiceQuery, sampleQueries } from '@/services/voiceService';
import type { VoiceResponse } from '@/types';
import { useApp } from '@/context/AppContext';

type VoiceState = 'idle' | 'listening' | 'processing' | 'response';

export function VoiceAssistant() {
  const [state, setState] = useState<VoiceState>('idle');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const navigate = useNavigate();
  const { showToast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleAsk = async (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setState('processing');
    setOpen(true);
    const res = await processVoiceQuery(text);
    setResponse(res);
    setState('response');
  };

  const handleAction = () => {
    if (response?.action?.startsWith('navigate:')) {
      const route = response.action.replace('navigate:', '/');
      navigate(route);
      setOpen(false);
      reset();
    }
  };

  const reset = () => {
    setState('idle');
    setQuery('');
    setResponse(null);
  };

  const startListening = () => {
    setState('listening');
    setTimeout(() => {
      const sample = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      handleAsk(sample);
    }, 2500);
  };

  return (
    <>
      {/* Floating Button — Premium microphone */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!open) {
            setOpen(true);
            startListening();
          } else {
            setOpen(false);
            reset();
          }
        }}
        className="fixed bottom-6 left-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-xl shadow-primary-600/30 flex items-center justify-center group"
        aria-label="Voice Assistant"
      >
        {state === 'listening' && (
          <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-60" />
        )}
        {state === 'listening' ? (
          <span className="flex gap-1 items-center relative z-10">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{ height: [8, 20, 8] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </span>
        ) : open ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <Mic className="w-6 h-6 relative z-10" />
        )}
      </motion.button>

      {/* Voice Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-6 z-[90] w-[min(400px,calc(100vw-3rem))] bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-100 dark:border-ink-800 overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-forest px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">AI Voice Assistant</p>
                <p className="text-primary-100 text-xs">Ask in your language</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[400px] overflow-y-auto scrollbar-thin">
              {state === 'listening' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                      <Mic className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="absolute inset-0 rounded-full border-2 border-primary-400 dark:border-primary-500 animate-ping opacity-60" />
                  </div>
                  <p className="text-ink-700 dark:text-ink-200 font-semibold">Listening...</p>
                  <p className="text-ink-500 dark:text-ink-400 text-sm text-center">Speak your question in Hindi or English</p>
                </div>
              )}

              {state === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 animate-spin" />
                  <p className="text-ink-700 dark:text-ink-200 font-semibold">Processing...</p>
                  <p className="text-ink-500 dark:text-ink-400 text-sm">"{query}"</p>
                </div>
              )}

              {state === 'response' && response && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-ink-600 dark:text-ink-400">You</span>
                    </div>
                    <p className="text-sm text-ink-700 dark:text-ink-300 bg-ink-50 dark:bg-ink-800 rounded-xl rounded-tl-none px-4 py-2.5 flex-1">
                      {response.query}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-ink-800 dark:text-ink-200 bg-primary-50 dark:bg-primary-950/30 rounded-xl rounded-tl-none px-4 py-2.5">
                        {response.response}
                      </p>
                      {response.action && (
                        <button
                          onClick={handleAction}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {state === 'idle' && (
                <div className="space-y-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk(query)}
                    placeholder="Type or speak your question..."
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 focus:border-primary-400 dark:focus:border-primary-600 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-500"
                  />
                  <button
                    onClick={startListening}
                    className="w-full py-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-semibold text-sm hover:bg-primary-100 dark:hover:bg-primary-950/60 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" /> Tap to Speak
                  </button>
                  <div>
                    <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-2">Try asking:</p>
                    <div className="space-y-1.5">
                      {sampleQueries.slice(0, 3).map((q) => (
                        <button
                          key={q}
                          onClick={() => handleAsk(q)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700 text-sm text-ink-700 dark:text-ink-300 transition-colors"
                        >
                          "{q}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
