/**
 * AI Voice Assistant - Complete Voice-Controlled Smart Agriculture Portal
 * Supports Telugu, English, and Hindi with automatic speech detection,
 * Web Speech API recognition, Gemini API backend reasoning, Text-to-Speech playback,
 * live subtitles, voice form filling, Crop Doctor scanner trigger, and Supabase database logging.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFarmData } from '../../context/FarmDataContext';
import { logVoiceCommandToSupabase } from '../../services/voiceLoggerService';

export interface CommandPreset {
  category: string;
  command: string;
  response: string;
  targetTab?: string;
  actionType: string;
  icon: string;
  lang?: 'en' | 'te' | 'hi';
}

const COMMAND_PRESETS: CommandPreset[] = [
  {
    category: 'Worker Booking',
    command: 'I need workers',
    response: 'I opened Worker Booking.',
    targetTab: 'worker_marketplace',
    actionType: 'OPEN_WORKERS',
    icon: 'groups',
  },
  {
    category: 'Worker Booking',
    command: 'నాకు workers కావాలి',
    response: 'I opened Worker Booking.',
    targetTab: 'worker_marketplace',
    actionType: 'OPEN_WORKERS',
    icon: 'groups',
    lang: 'te',
  },
  {
    category: 'Add Crop',
    command: 'Add crop',
    response: 'I opened Crop Registration.',
    targetTab: 'farmer_dashboard',
    actionType: 'FILL_PRODUCT_FORM',
    icon: 'add_circle',
  },
  {
    category: 'Add Crop',
    command: 'టమాటా add చేయాలి',
    response: 'I opened Crop Registration.',
    targetTab: 'farmer_dashboard',
    actionType: 'FILL_PRODUCT_FORM',
    icon: 'add_circle',
    lang: 'te',
  },
  {
    category: 'Equipment Rental',
    command: 'Rent tractor',
    response: 'I opened Equipment Rental.',
    targetTab: 'equipment_marketplace',
    actionType: 'FILL_EQUIPMENT_FORM',
    icon: 'precision_manufacturing',
  },
  {
    category: 'Equipment Selling',
    command: 'Sell tractor',
    response: 'I opened Equipment Selling.',
    targetTab: 'equipment_marketplace',
    actionType: 'FILL_EQUIPMENT_FORM',
    icon: 'sell',
  },
  {
    category: 'Marketplace',
    command: 'Buy seeds',
    response: 'I opened Marketplace.',
    targetTab: 'marketplace',
    actionType: 'NAVIGATE',
    icon: 'shopping_bag',
  },
  {
    category: 'Orders',
    command: 'Open orders',
    response: 'I opened Orders.',
    targetTab: 'orders',
    actionType: 'OPEN_ORDERS',
    icon: 'local_shipping',
  },
  {
    category: 'Mandi Price',
    command: 'Check mandi price',
    response: 'I opened Mandi Price.',
    targetTab: 'ai_assistant',
    actionType: 'TELL_MARKET_PRICE',
    icon: 'trending_up',
  },
  {
    category: 'Disease Detection',
    command: 'Diagnose crop',
    response: 'I opened AI Disease Detection.',
    targetTab: 'ai_assistant',
    actionType: 'OPEN_CROP_DOCTOR',
    icon: 'center_focus_strong',
  },
  {
    category: 'Weather',
    command: 'Can I spray pesticide?',
    response: 'I opened Weather Intelligence.',
    targetTab: 'weather',
    actionType: 'TELL_WEATHER',
    icon: 'partly_cloudy_day',
  },
  {
    category: 'Government Schemes',
    command: 'PM Kisan eligibility',
    response: 'I opened Government Schemes.',
    targetTab: 'govt_schemes',
    actionType: 'EXPLAIN_SCHEME',
    icon: 'account_balance',
  },
];

export const AiVoiceAssistant: React.FC = () => {
  const { setActiveTab, isVoiceAutoFillEnabled, toggleVoiceAutoFill } = useAppState();
  const { language, setLanguage } = useLanguage();
  const { addProduct } = useFarmData();

  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Tap 'Start Listening' or speak a wake word like 'Hello Suri'...");
  const [spokenResponse, setSpokenResponse] = useState<string>('');
  const [subtitles, setSubtitles] = useState<string>('');
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callTarget, setCallTarget] = useState('Farmer (Venkat Rao - +91 98490 54321)');
  const [activeFormState, setActiveFormState] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        setIsThinking(false);
        setIsSpeaking(false);
        transcriptRef.current = '';
      };

      rec.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        transcriptRef.current = currentText;
        setTranscript(currentText);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        const captured = transcriptRef.current.trim();
        if (captured && !captured.startsWith("Tap 'Start Listening'")) {
          // Clean wake words if present
          const cleanQuery = captured.replace(/^(hello suri|hey suri|suri|hello farmconnect|hey farmconnect|ok farmconnect|krishi)\s*/i, '').trim() || captured;
          executeVoiceQuery(cleanQuery);
        }
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const speakText = (text: string, langCode: 'en' | 'te' | 'hi' = 'en') => {
    setSpokenResponse(text);
    setSubtitles(text);
    setIsSpeaking(true);

    if (!('speechSynthesis' in window)) {
      setTimeout(() => setIsSpeaking(false), 2000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;

      const finishSpeech = () => {
        setIsSpeaking(false);
      };

      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;

      // Safety timeout to reset speaking state if browser TTS hangs
      const durationEstimate = Math.max(3000, text.length * 80);
      setTimeout(finishSpeech, durationEstimate);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      setIsSpeaking(false);
    }
  };

  const executeVoiceQuery = async (queryText: string) => {
    setIsThinking(true);
    setSpokenResponse('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/ai/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userSpeech: queryText,
          language,
          activeFormContext: isVoiceAutoFillEnabled ? activeFormState : null,
          isVoiceAutoFillEnabled,
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('API server error');

      const data = await res.json();
      const {
        detectedLanguage = language || 'en',
        speechText,
        navigationTarget,
        actionType,
        callTargetRole,
        formContext,
      } = data;

      setIsThinking(false);

      if (detectedLanguage && detectedLanguage !== language) {
        setLanguage(detectedLanguage as any);
      }

      // Log to Supabase asynchronously
      try {
        logVoiceCommandToSupabase({
          command: queryText,
          response: speechText,
          language: detectedLanguage as any,
          action_type: actionType,
          navigation_target: isVoiceAutoFillEnabled ? navigationTarget : '',
        });
      } catch (logErr) {
        console.warn('Supabase log skipped:', logErr);
      }

      setSpokenResponse(speechText);
      setSubtitles(speechText);

      // If Voice Auto Fill is OFF: do NOT navigate or auto fill forms
      if (!isVoiceAutoFillEnabled) {
        setActiveFormState(null);
        speakText(speechText, detectedLanguage);
        return;
      }

      // Form Filling
      if (formContext) {
        setActiveFormState(formContext);
        if (formContext.formStatus === 'SUBMITTED') {
          if (formContext.formType === 'product' || formContext.formType === 'sell_product') {
            addProduct({
              name: formContext.fields?.cropName || 'Fresh Tomatoes',
              category: 'Vegetables',
              farmerId: 'f1',
              farmerName: 'Venkat Rao',
              farmerLocation: 'Tenali, Guntur',
              distance: 'Local Farm',
              price: parseFloat(formContext.fields?.sellingPrice) || 35,
              unit: 'kg',
              stockQty: parseFloat(formContext.fields?.quantity) || 500,
              harvestDate: 'Fresh Harvest',
              isOrganic: true,
              description: 'Voice submitted crop listing.',
              image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
            });
          }
        }
      }

      // Call action
      if (actionType === 'TRIGGER_CALL') {
        setCallTarget(callTargetRole || 'Farmer Venkat Rao (+91 98490 54321)');
        setCallModalOpen(true);
      }

      // Speak response
      speakText(speechText || `Response generated for: ${queryText}`, detectedLanguage);

      // Auto Navigation immediately
      if (navigationTarget) {
        setActiveTab(navigationTarget as any);
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.warn('Voice API fallback execution:', e?.message || e);
      setIsThinking(false);

      // Match command preset or default
      const matched = COMMAND_PRESETS.find(p => queryText.toLowerCase().includes(p.command.toLowerCase().split(' ')[0])) || COMMAND_PRESETS[0];

      if (matched.targetTab) {
        setActiveTab(matched.targetTab as any);
      }
      speakText(matched.response, language);
    } finally {
      setIsThinking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setTranscript("Listening... Speak into your microphone");
        transcriptRef.current = '';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    } else {
      // Direct simulation greeting
      const text = language === 'te' 
        ? 'నమస్కారం! నేను సూరి, మీ ఫార్మ్‌కనెక్ట్ AI అసిస్టెంట్‌ని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?'
        : language === 'hi'
        ? 'नमस्ते! मैं सूरी हूँ, आपका फार्मकनेक्ट AI सहायक। आज मैं आपकी क्या मदद कर सकता हूँ?'
        : 'Hello! I am Suri, your FarmConnect AI Assistant. How can I help you today?';
      speakText(text, language);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* HEADER BANNER WITH LANGUAGE SELECTOR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/30">
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <Badge variant="emerald" size="md" icon="graphic_eq">
              Hands-Free Smart Agriculture Assistant
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              FarmConnect Voice AI Engine
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Operate the complete application using hands-free voice commands in Telugu (తెలుగు), English, or Hindi.
            </p>
          </div>

          {/* CONTROLS: VOICE AUTO FILL & LANGUAGE */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Voice Auto Fill Toggle */}
            <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-2xl border border-emerald-500/30">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                  Voice Auto Fill
                </span>
                <span className={`text-xs font-black ${isVoiceAutoFillEnabled ? 'text-amber-300' : 'text-slate-400'}`}>
                  Voice Auto Fill {isVoiceAutoFillEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceAutoFill}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVoiceAutoFillEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Voice Auto Fill"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isVoiceAutoFillEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* LANGUAGE TOGGLE PILLS */}
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-emerald-500/30">
              {[
                { code: 'te', label: 'తెలుగు' },
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    language === l.code
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg scale-105'
                      : 'text-emerald-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORTED WAKE WORDS BANNER */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          <Icon name="record_voice_over" size={20} />
          <span>Wake Words Supported:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {['"Hello Suri"', '"Hey Suri"', '"Hello Farmer Assistant"'].map((ww) => (
            <span key={ww} className="px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 font-bold border border-emerald-700/50">
              {ww}
            </span>
          ))}
        </div>
      </div>

      {/* CENTRAL AI MIC POD & SOUNDWAVE CANVAS */}
      <Card variant="glass" className="p-8 sm:p-12 text-center space-y-8 border-emerald-500/30 bg-emerald-950/20 backdrop-blur-2xl relative overflow-hidden">
        {/* Animated Circular Microphone Button */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          {/* Wave animation while listening */}
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-rose-500/40"
              />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-amber-500/30"
              />
            </>
          )}

          {/* Thinking animation while processing */}
          {isThinking && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="absolute -inset-3 rounded-full border-4 border-dashed border-teal-400"
            />
          )}

          {/* Speaking animation */}
          {isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute -inset-2 rounded-full bg-emerald-400/30 blur-md"
            />
          )}

          <button
            type="button"
            onClick={startListening}
            className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-br from-rose-500 via-red-500 to-amber-500 text-white scale-110 shadow-rose-900/60'
                : isThinking
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-teal-900/60'
                : isSpeaking
                ? 'bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 scale-105 shadow-emerald-500/60 animate-bounce'
                : 'bg-gradient-to-br from-emerald-500 via-teal-600 to-green-600 hover:from-emerald-400 hover:to-teal-500 text-white hover:scale-105 shadow-emerald-900/60 border-2 border-emerald-300/40'
            }`}
          >
            <Icon
              name={
                isListening
                  ? 'graphic_eq'
                  : isThinking
                  ? 'psychology'
                  : isSpeaking
                  ? 'volume_up'
                  : 'mic'
              }
              size={52}
            />
            <span className="text-[11px] font-black uppercase tracking-widest mt-1">
              {isListening ? 'Listening' : isThinking ? 'Thinking' : isSpeaking ? 'Speaking' : 'Tap Mic'}
            </span>
          </button>
        </div>

        {/* Dynamic Waveform Graphic */}
        <div className="flex items-center justify-center gap-1.5 h-10">
          {[40, 80, 30, 90, 60, 100, 50, 85, 25, 65, 95, 45, 75, 35].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 transition-all duration-300 ${
                isListening || isSpeaking || isThinking ? 'animate-pulse' : 'opacity-30'
              }`}
              style={{
                height: isListening || isSpeaking || isThinking ? `${h}%` : '20%',
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>

        {/* Transcript Feed */}
        <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 max-w-xl mx-auto space-y-2 text-left">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Speech Recognition Feed</span>
            <span className="text-emerald-300/80">{language.toUpperCase()} Engine</span>
          </p>
          <p className="text-sm font-semibold text-white italic">
            "{transcript}"
          </p>
        </div>

        {/* Spoken Response Banner with Subtitles */}
        {subtitles && (
          <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-400/40 max-w-2xl mx-auto space-y-3 text-left shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Icon name="volume_up" size={18} /> Suri Voice Readout & Subtitles
              </span>
              <button
                type="button"
                onClick={() => speakText(subtitles, language)}
                className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
              >
                <Icon name="replay" size={16} /> Replay
              </button>
            </div>

            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {subtitles}
            </p>
          </div>
        )}

        {/* VOICE FORM WIZARD CARD OVERLAY */}
        {activeFormState && activeFormState.fields && (
          <div className="p-6 rounded-2xl bg-emerald-900/60 border border-emerald-400/50 max-w-xl mx-auto text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Icon name="edit_note" size={18} /> Active Voice Form Assistant
              </span>
              <Badge variant="emerald" size="sm">
                {activeFormState.formStatus || 'Filling Fields'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(activeFormState.fields).map(([key, value]) => (
                <div key={key} className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">{key}</span>
                  <span className="font-bold text-white">{String(value || 'Awaiting Voice Input...')}</span>
                </div>
              ))}
            </div>

            {activeFormState.nextMissingFieldPrompt && (
              <p className="text-xs font-bold text-amber-300 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                "{activeFormState.nextMissingFieldPrompt}"
              </p>
            )}
          </div>
        )}
      </Card>

      {/* PRESET VOICE COMMAND CATEGORY TILES */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="touch_app" size={20} className="text-emerald-400" />
          Click Any Voice Command Below to Test Instantly
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMAND_PRESETS.map((preset, idx) => (
            <Card
              key={idx}
              variant="glass"
              onClick={() => {
                setTranscript(preset.command);
                executeVoiceQuery(preset.command);
              }}
              className="p-4 space-y-2.5 hover:border-emerald-500/60 cursor-pointer transition-all hover:scale-[1.02] bg-emerald-950/20 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {preset.category}
                </span>
                <Icon name={preset.icon} size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>

              <p className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                "{preset.command}"
              </p>

              <p className="text-xs text-slate-300 line-clamp-2 italic">
                {preset.response}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* PHONE CALL DIALER MODAL */}
      <AnimatePresence>
        {callModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-emerald-500/50 p-6 text-white text-center space-y-5 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                <Icon name="call" size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">Initiating Phone Call</h3>
                <p className="text-xs font-bold text-emerald-300">{callTarget}</p>
              </div>

              <p className="text-xs text-slate-300">
                Connecting hands-free direct voice call via FarmConnect Kisan Helpline bridge...
              </p>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setCallModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Icon name="call_end" size={18} /> End Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
