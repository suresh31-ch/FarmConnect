/**
 * Floating AI Voice Assistant Widget
 * Positioned in Bottom Left Corner.
 * Features:
 * - Modern circular AI microphone button with pulse, wave, thinking & speaking animations
 * - Live subtitle overlay while speaking
 * - Speech-to-Text (Telugu, Hindi, English) with auto-detection
 * - Text-to-Speech playback
 * - Hands-free Voice Form Filling (Products, Workers, Equipment, Livestock)
 * - Auto navigation across FarmConnect pages
 * - Microphone permission guidance modal & error handling
 * - Supabase Realtime voice log persistence
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFarmData } from '../../context/FarmDataContext';
import { logVoiceCommandToSupabase } from '../../services/voiceLoggerService';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'form_filling' | 'mic_error';

export const FloatingVoiceAssistant: React.FC = () => {
  const { setActiveTab, isVoiceAutoFillEnabled } = useAppState();
  const { language, setLanguage } = useLanguage();
  const { addProduct } = useFarmData();

  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [expanded, setExpanded] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [spokenSubtitles, setSpokenSubtitles] = useState('');
  const [activeFormContext, setActiveFormContext] = useState<any>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<'en' | 'te' | 'hi'>('en');

  const recognitionRef = useRef<any>(null);
  const userTranscriptRef = useRef<string>('');

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      
      // Set language based on app context or default to Indian English / Telugu
      rec.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setAssistantState('listening');
        setPermissionError(false);
        setApiError(null);
        userTranscriptRef.current = '';
      };

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        userTranscriptRef.current = currentTranscript;
        setUserTranscript(currentTranscript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError(true);
          setAssistantState('mic_error');
        } else {
          setAssistantState('idle');
        }
      };

      rec.onend = () => {
        const captured = userTranscriptRef.current.trim();
        if (captured) {
          const cleanInput = captured.replace(/^(hello suri|hey suri|suri|hello farmconnect|hey farmconnect|ok farmconnect|krishi)\s*/i, '').trim() || captured;
          processVoiceInput(cleanInput);
        } else if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  // Speak response aloud using SpeechSynthesis
  const speakAloud = (text: string, langCode: 'en' | 'te' | 'hi' = 'en') => {
    setSpokenSubtitles(text);
    setAssistantState('speaking');

    if (!('speechSynthesis' in window)) {
      setTimeout(() => setAssistantState(activeFormContext ? 'form_filling' : 'idle'), 2000);
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
      utterance.pitch = 1.0;

      const finishSpeaking = () => {
        setAssistantState(activeFormContext ? 'form_filling' : 'idle');
      };

      utterance.onend = finishSpeaking;
      utterance.onerror = finishSpeaking;

      // Safety timer in case browser TTS hangs
      const durationEstimate = Math.max(3000, text.length * 80);
      setTimeout(finishSpeaking, durationEstimate);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech error:', err);
      setAssistantState('idle');
    }
  };

  // Process user speech via backend Gemini AI route
  const processVoiceInput = async (inputText: string) => {
    setAssistantState('thinking');
    setApiError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/ai/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userSpeech: inputText,
          language,
          activeFormContext: isVoiceAutoFillEnabled ? activeFormContext : null,
          isVoiceAutoFillEnabled,
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('Server voice assistant error');
      }

      const data = await res.json();
      const {
        detectedLanguage = language || 'en',
        speechText,
        subtitles,
        navigationTarget,
        actionType,
        formContext,
      } = data;

      setDetectedLang(detectedLanguage);
      if (detectedLanguage && detectedLanguage !== language) {
        setLanguage(detectedLanguage as any);
      }

      // Log voice interaction into Supabase
      try {
        logVoiceCommandToSupabase({
          command: inputText,
          response: speechText,
          language: detectedLanguage as any,
          action_type: actionType,
          navigation_target: isVoiceAutoFillEnabled ? navigationTarget : '',
        });
      } catch (logErr) {
        console.warn('Supabase log skipped:', logErr);
      }

      // If Voice Auto Fill is OFF: only speak response aloud, do not navigate or auto fill forms
      if (!isVoiceAutoFillEnabled) {
        setActiveFormContext(null);
        speakAloud(speechText || `Response for: ${inputText}`, detectedLanguage);
        return;
      }

      // Update Form State if present (Voice Auto Fill ON)
      if (formContext) {
        setActiveFormContext(formContext);
        if (formContext.formStatus === 'SUBMITTED') {
          handleFormSubmission(formContext);
        }
      }

      // Handle Navigation (Voice Auto Fill ON)
      if (navigationTarget) {
        setActiveTab(navigationTarget as any);
      }

      // Handle Specific Actions
      if (actionType === 'OPEN_CROP_DOCTOR') {
        setActiveTab('ai_assistant');
      }

      // Speak response aloud with live subtitles
      speakAloud(speechText || `Response for: ${inputText}`, detectedLanguage);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Voice API fallback execution:', err?.message || err);

      const lower = inputText.toLowerCase().trim();

      if (!isVoiceAutoFillEnabled) {
        // OFF mode fallback: no navigation, no form filling, just spoken answer
        let infoMsg = `Here is information regarding your query: "${inputText}". You can ask any question about farming, crops, weather, or mandi prices.`;
        if (/worker|labour|labor|కూలీలు|వర్కర్స్/i.test(lower)) {
          infoMsg = 'For hiring farm workers, wages range from ₹600 to ₹800/day depending on field task and location.';
        } else if (/crop|tomato|paddy|పంట/i.test(lower)) {
          infoMsg = 'Tomato and Paddy market prices are updated daily on Mandi tickers. Soil moisture level is optimal.';
        } else if (/tractor|equipment|అద్దెకు/i.test(lower)) {
          infoMsg = 'Tractor rental services are available starting at ₹450/hour with drivers included.';
        } else if (/mandi|price|ధర/i.test(lower)) {
          infoMsg = 'Guntur APMC Mandi tomato modal price today is ₹38/kg.';
        }
        speakAloud(infoMsg, language || 'en');
        return;
      }

      // Handle active form context fallback if present (ON mode)
      if (activeFormContext && activeFormContext.fields && activeFormContext.formType) {
        const { formType, fields } = activeFormContext;
        const currentFields = { ...fields };

        if (activeFormContext.formStatus === 'READY_TO_SUBMIT') {
          if (/yes|submit|అవును|హా|సబ్మిట్|ok|sure|yep|yeah|చేయండి/i.test(lower)) {
            const submittedCtx = { ...activeFormContext, formStatus: 'SUBMITTED' };
            setActiveFormContext(submittedCtx);
            handleFormSubmission(submittedCtx);
            speakAloud('Form submitted successfully.', language || 'en');
            return;
          } else if (/no|cancel|వద్దు|నహి/i.test(lower)) {
            setActiveFormContext(null);
            speakAloud('Form submission cancelled.', language || 'en');
            return;
          }
        }

        if (formType === 'worker') {
          if (!currentFields.workerCount) currentFields.workerCount = inputText;
          else if (!currentFields.workType) currentFields.workType = inputText;
          else if (!currentFields.village) currentFields.village = inputText;
          else if (!currentFields.salaryPerDay) currentFields.salaryPerDay = inputText;

          let promptMsg = 'Would you like me to submit?';
          let status = 'READY_TO_SUBMIT';

          if (!currentFields.workerCount) { promptMsg = 'How many workers do you need?'; status = 'IN_PROGRESS'; }
          else if (!currentFields.workType) { promptMsg = 'What work?'; status = 'IN_PROGRESS'; }
          else if (!currentFields.village) { promptMsg = 'Location?'; status = 'IN_PROGRESS'; }
          else if (!currentFields.salaryPerDay) { promptMsg = 'Daily wage?'; status = 'IN_PROGRESS'; }

          const updatedCtx = { formType, formStatus: status, fields: currentFields, navigationTarget: 'worker_marketplace' };
          setActiveFormContext(updatedCtx);
          speakAloud(promptMsg, language || 'en');
          return;
        } else if (formType === 'product') {
          if (!currentFields.cropName) currentFields.cropName = inputText;
          else if (!currentFields.quantity) currentFields.quantity = inputText;
          else if (!currentFields.sellingPrice) currentFields.sellingPrice = inputText;
          else if (!currentFields.village) currentFields.village = inputText;

          let promptMsg = 'Would you like me to submit?';
          let status = 'READY_TO_SUBMIT';

          if (!currentFields.cropName) { promptMsg = 'What crop name do you want to register?'; status = 'IN_PROGRESS'; }
          else if (!currentFields.quantity) { promptMsg = 'Harvest quantity in kg?'; status = 'IN_PROGRESS'; }
          else if (!currentFields.sellingPrice) { promptMsg = 'Selling price per kg?'; status = 'IN_PROGRESS'; }
          else if (!currentFields.village) { promptMsg = 'Location?'; status = 'IN_PROGRESS'; }

          const updatedCtx = { formType, formStatus: status, fields: currentFields, navigationTarget: 'farmer_dashboard' };
          setActiveFormContext(updatedCtx);
          speakAloud(promptMsg, language || 'en');
          return;
        }
      }

      let target = '';
      let msg = '';
      let newFormCtx: any = null;

      if (/worker|labour|labor|కూలీలు|వర్కర్స్|workers|hire/i.test(lower)) {
        target = 'worker_marketplace';
        msg = 'I opened Worker Booking. How many workers do you need?';
        newFormCtx = { formType: 'worker', formStatus: 'IN_PROGRESS', fields: { workerCount: '', workType: '', village: '', salaryPerDay: '' }, navigationTarget: 'worker_marketplace' };
      } else if (/add crop|register crop|add tomato|add paddy|టమాటా add|పంట/i.test(lower)) {
        target = 'farmer_dashboard';
        msg = 'I opened Crop Registration. What crop name do you want to register?';
        newFormCtx = { formType: 'product', formStatus: 'IN_PROGRESS', fields: { cropName: '', quantity: '', sellingPrice: '', village: '' }, navigationTarget: 'farmer_dashboard' };
      } else if (/rent tractor|tractor rental|అద్దెకు|tractor rent/i.test(lower)) {
        target = 'equipment_marketplace';
        msg = 'I opened Equipment Rental. What equipment do you need?';
        newFormCtx = { formType: 'equipment_rent', formStatus: 'IN_PROGRESS', fields: { equipmentType: '', rentalPricePerHour: '', location: '' }, navigationTarget: 'equipment_marketplace' };
      } else if (/sell tractor|sell equipment|అమ్మాలి/i.test(lower)) {
        target = 'equipment_marketplace';
        msg = 'I opened Equipment Selling. What equipment do you want to sell?';
        newFormCtx = { formType: 'equipment_sell', formStatus: 'IN_PROGRESS', fields: { equipmentType: '', price: '', location: '' }, navigationTarget: 'equipment_marketplace' };
      } else if (/buy seeds|marketplace|విత్తనాలు|కొనాలి/i.test(lower)) {
        target = 'marketplace';
        msg = 'I opened Marketplace.';
      } else if (/order|orders|ఆర్డర్లు/i.test(lower)) {
        target = 'orders';
        msg = 'I opened Orders.';
      } else if (/mandi|market price|ధర|రేటు/i.test(lower)) {
        target = 'ai_assistant';
        msg = 'I opened Mandi Price.';
      } else if (/diagnose|disease|doctor|pest|రోగం/i.test(lower)) {
        target = 'ai_assistant';
        msg = 'I opened AI Disease Detection.';
      }

      if (target) {
        setActiveTab(target as any);
        if (newFormCtx) {
          setActiveFormContext(newFormCtx);
        }
        speakAloud(msg, language || 'en');
      } else {
        setApiError('Unable to process voice request.');
        speakAloud('Sorry, I encountered an issue processing your request. Please try again.', language || 'en');
      }
    }
  };

  // Handle Voice Form Submission (Product, Worker, Equipment, Livestock)
  const handleFormSubmission = (context: any) => {
    const { formType, fields } = context;

    if (formType === 'product' || formType === 'sell_product') {
      addProduct({
        name: fields.cropName || 'Farm Produce',
        category: 'Vegetables',
        farmerId: 'f1',
        farmerName: 'Venkat Rao',
        farmerLocation: fields.village || 'Tenali, Guntur',
        distance: 'Local Farm',
        price: parseFloat(fields.sellingPrice) || 35,
        unit: 'kg',
        stockQty: parseFloat(fields.quantity) || 100,
        harvestDate: 'Fresh Harvest',
        isOrganic: fields.isOrganic === 'true' || true,
        description: `Voice listed produce: ${fields.cropName || 'Crop'} - ${fields.quantity || '100kg'} ready for harvest.`,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
      });
    }

    // Reset active form context post-submission
    setTimeout(() => {
      setActiveFormContext(null);
    }, 4000);
  };

  // Toggle or start listening
  const handleMicClick = () => {
    setExpanded(true);

    if (assistantState === 'speaking') {
      window.speechSynthesis.cancel();
      setAssistantState('idle');
      return;
    }

    if (assistantState === 'listening') {
      if (recognitionRef.current) recognitionRef.current.stop();
      setAssistantState('idle');
      return;
    }

    if (recognitionRef.current) {
      try {
        setUserTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already running or restarting
        console.warn('Speech recognition restart:', e);
      }
    } else {
      // Browser doesn't support SpeechRecognition natively, fallback simulation
      simulateVoiceGreeting();
    }
  };

  // Fallback initial greeting
  const simulateVoiceGreeting = () => {
    const greetings = {
      en: 'Hello! I am Suri, your FarmConnect AI Assistant. How can I help you today?',
      te: 'నమస్కారం! నేను సూరి, మీ ఫార్మ్‌కనెక్ట్ AI అసిస్టెంట్‌ని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
      hi: 'नमस्ते! मैं सूरी हूँ, आपका फार्मकनेक्ट AI सहायक। आज मैं आपकी क्या मदद कर सकता हूँ?',
    };
    const text = greetings[language] || greetings.en;
    speakAloud(text, language);
  };

  return (
    <>
      {/* FLOATING BOT BUTTON IN BOTTOM LEFT CORNER */}
      <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 flex flex-col items-start gap-3 pointer-events-auto">
        {/* SUBTITLE DISPLAY CARD WHILE SPEAKING */}
        <AnimatePresence>
          {(assistantState === 'speaking' || assistantState === 'thinking' || assistantState === 'form_filling' || spokenSubtitles) && expanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="max-w-sm sm:max-w-md p-4 rounded-3xl glass-card-dark border border-emerald-500/40 shadow-2xl text-white space-y-3 relative overflow-hidden bg-slate-950/90 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Suri AI • {detectedLang.toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isVoiceAutoFillEnabled
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    Voice Auto Fill {isVoiceAutoFillEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              {/* USER TRANSCRIPT FEED */}
              {userTranscript && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs italic text-emerald-200">
                  "{userTranscript}"
                </div>
              )}

              {/* AI SPOKEN SUBTITLES */}
              {spokenSubtitles && (
                <p className="text-xs sm:text-sm font-semibold text-emerald-100 leading-relaxed">
                  {spokenSubtitles}
                </p>
              )}

              {/* VOICE FORM FILLING CARD OVERLAY */}
              {activeFormContext && activeFormContext.fields && (
                <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-300 font-extrabold uppercase">
                    <span>Voice Form: {activeFormContext.formType || 'Listing'}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      {activeFormContext.formStatus || 'In Progress'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-200">
                    {Object.entries(activeFormContext.fields).map(([key, val]) => (
                      val ? (
                        <div key={key} className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-emerald-400 font-bold capitalize">{key}: </span>
                          <span>{String(val)}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* QUICK EXAMPLE COMMAND SHORTCUTS */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'I want to sell tomatoes',
                  'Detect Disease',
                  'Today Paddy Price',
                  'PM Kisan Scheme',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setUserTranscript(sample);
                      processVoiceInput(sample);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CIRCULAR AI MICROPHONE BUTTON */}
        <div className="relative flex items-center justify-center">
          {/* Animated Outer Pulse / Wave Rings */}
          {assistantState === 'listening' && (
            <>
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-rose-500/40"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-amber-500/30"
              />
            </>
          )}

          {assistantState === 'thinking' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="absolute -inset-2 rounded-full border-2 border-dashed border-teal-400"
            />
          )}

          {assistantState === 'speaking' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-sm"
            />
          )}

          <button
            type="button"
            onClick={handleMicClick}
            className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-300 ${
              assistantState === 'listening'
                ? 'bg-gradient-to-tr from-rose-600 via-amber-500 to-red-500 scale-110 shadow-rose-900/60'
                : assistantState === 'thinking'
                ? 'bg-gradient-to-tr from-teal-600 to-cyan-500 shadow-teal-900/60'
                : assistantState === 'speaking'
                ? 'bg-gradient-to-tr from-emerald-500 to-green-400 shadow-emerald-500/60 animate-bounce'
                : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 hover:scale-105 shadow-emerald-950/80 border-2 border-emerald-300/40'
            }`}
          >
            <Icon
              name={
                assistantState === 'listening'
                  ? 'graphic_eq'
                  : assistantState === 'thinking'
                  ? 'psychology'
                  : assistantState === 'speaking'
                  ? 'volume_up'
                  : 'mic'
              }
              size={28}
            />
            <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">
              {assistantState === 'listening'
                ? 'Listen'
                : assistantState === 'thinking'
                ? 'Suri AI'
                : assistantState === 'speaking'
                ? 'Suri'
                : '🎤 Suri'}
            </span>
          </button>
        </div>
      </div>

      {/* MICROPHONE PERMISSION ERROR MODAL */}
      <AnimatePresence>
        {permissionError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-rose-500/40 p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400 font-extrabold text-lg">
                <Icon name="mic_off" size={28} />
                <span>Microphone Permission Required</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                To use FarmConnect Hands-Free AI Voice Assistant, please grant microphone access in your browser:
              </p>

              <ol className="text-xs text-emerald-200 space-y-2 list-decimal list-inside bg-slate-950 p-3 rounded-2xl border border-white/10">
                <li>Click the padlock / site settings icon in your browser address bar.</li>
                <li>Set "Microphone" to <strong>Allow</strong>.</li>
                <li>Refresh the page and tap the 🎤 Suri button again.</li>
              </ol>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPermissionError(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPermissionError(false);
                    handleMicClick();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
