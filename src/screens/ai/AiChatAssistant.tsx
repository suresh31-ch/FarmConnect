/**
 * AI Agriculture Chat Assistant (Krishi Mitra AI)
 * Multi-lingual conversational AI tailored for Indian agriculture.
 * Features: Chat history, voice/image attachments, suggested question chips,
 * bookmarking, response copying, and simulated typing delay.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language: 'en' | 'te' | 'hi';
  isBookmarked?: boolean;
  imageAttachment?: string;
  isQuotaError?: boolean;
  lastFailedQuery?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: 'Namaste! I am your AI Krishi Mitra Assistant. I can help you with crop disease diagnosis, weather advisories, market price trends, and government schemes in English, Telugu, or Hindi. How can I assist your farm today?',
    timestamp: 'Just now',
    language: 'en'
  }
];

const suggestedQuestions = [
  { label: '🍅 Increase Tomato Yield', query: 'What are the best fertigation and organic management steps to maximize tomato yield per acre?' },
  { label: '🌾 Paddy Fertilizer Schedule', query: 'Give me a split NPK fertilizer dosage schedule for 2 acres Sonamasuri Paddy.' },
  { label: '🌿 Chili Leaf Curl Cure', query: 'How to control Chili leaf curl virus and thrips using organic bio-pesticides?' },
  { label: '📜 PM-KISAN Subsidy Eligibility', query: 'What documents are required to apply for PM-KISAN and Drip Irrigation Subsidy in AP?' },
  { label: '📈 Today Tomato Market Price', query: 'What is today market price for Hybrid Tomato in Guntur and Madanapalle Mandi?' },
  { label: '🌧️ Spray Timing Weather Advisory', query: 'Is today weather suitable for pesticide spraying in Tenali region?' }
];

export const AiChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // TODO: Connect OpenAI GPT-4o or Gemini 2.5 Flash API endpoint
  // Example API Integration Code:
  // const callGeminiAPI = async (userPrompt: string, lang: string) => {
  //   const response = await fetch('/api/ai/chat', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ prompt: userPrompt, language: lang })
  //   });
  //   const data = await response.json();
  //   return data.text;
  // };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLanguage,
      imageAttachment: attachedImage || undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedImage(null);
    setIsTyping(true);

    try {
      // Build conversation history for Gemini context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language: selectedLanguage,
          history: historyPayload
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const rawErrStr = typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson);
        if (res.status === 429 || /quota|429|RESOURCE_EXHAUSTED|limit|exceeded/i.test(rawErrStr)) {
          throw new Error('AI service is temporarily busy due to daily usage limits.\nPlease try again later.');
        }
        throw new Error(errJson.error || 'AI service is temporarily busy due to daily usage limits.\nPlease try again later.');
      }

      const data = await res.json();
      let responseText = data.text || 'Apologies, no response was returned by Krishi Mitra AI.';
      if (/quota|429|RESOURCE_EXHAUSTED|GoogleGenerativeAI/i.test(responseText) || (responseText.startsWith('{') && responseText.includes('error'))) {
        responseText = 'AI service is temporarily busy due to daily usage limits.\nPlease try again later.';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedLanguage,
        isQuotaError: responseText.includes('daily usage limits'),
        lastFailedQuery: query,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak the response if TTS is available
      if ('speechSynthesis' in window && !aiMsg.isQuotaError) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(responseText.replace(/[*#]/g, ''));
        utterance.lang = selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      console.error('Error calling /api/ai/chat:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'AI service is temporarily busy due to daily usage limits.\nPlease try again later.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedLanguage,
        isQuotaError: true,
        lastFailedQuery: query,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleBookmark = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isBookmarked: !m.isBookmarked } : m))
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Response copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* TOP CHAT HEADER & LANGUAGE SELECTOR - DARK GREEN GRADIENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] text-white border border-[#66BB6A]/30 shadow-xl shadow-[#1B5E20]/15">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFB300] text-[#1B5E20] flex items-center justify-center font-black shadow-lg shadow-[#FFB300]/20">
            <Icon name="psychology" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2.5 text-white">
              <span>Krishi Mitra AI Chat Assistant</span>
              <span className="bg-[#FFB300]/20 text-[#FFB300] border border-[#FFB300]/40 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Online
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
              Powered by Multi-Lingual Agricultural LLM & Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-black/20 p-1.5 rounded-2xl border border-white/20 text-xs">
            {(['en', 'te', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-[#FFB300] text-[#1B5E20] shadow-md scale-105'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 transition-all cursor-pointer"
            title="Chat History"
          >
            <Icon name="history" size={22} />
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA - WHITE CARDS & DARK TEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
        {/* Chat Drawer / History (If toggled open on desktop) */}
        {historyOpen && (
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#2E7D32]/20 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)] space-y-4 overflow-y-auto">
            <h3 className="text-sm font-black text-[#1B5E20] dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>Bookmarked Conversations</span>
              <Icon name="bookmark" size={20} className="text-[#FFB300]" />
            </h3>
            <div className="space-y-2.5">
              {messages.filter(m => m.isBookmarked).length === 0 ? (
                <p className="text-xs text-[#37474F] dark:text-slate-400 py-6 text-center font-medium">No bookmarked messages yet. Click the bookmark icon on any answer!</p>
              ) : (
                messages.filter(m => m.isBookmarked).map(m => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-[#F7FAF5] dark:bg-slate-800 text-xs text-[#37474F] dark:text-slate-200 space-y-1 border border-[#2E7D32]/20">
                    <p className="font-bold line-clamp-2">{m.text}</p>
                    <span className="text-[10px] text-[#2E7D32] font-semibold">{m.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Chat Messages Container */}
        <div
          className={`${
            historyOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          } flex flex-col h-full p-5 sm:p-6 bg-white dark:bg-slate-900 border border-[#2E7D32]/20 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)] rounded-3xl overflow-hidden`}
        >
          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white'
                      : 'bg-gradient-to-br from-[#FFB300] to-amber-500 text-[#1B5E20]'
                  }`}
                >
                  {msg.sender === 'user' ? <Icon name="person" size={20} /> : <Icon name="psychology" size={22} />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-md whitespace-pre-line font-medium ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-tr-none'
                        : 'bg-[#F7FAF5] dark:bg-slate-800 text-[#37474F] dark:text-slate-100 border border-[#2E7D32]/20 rounded-tl-none'
                    }`}
                  >
                    {msg.imageAttachment && (
                      <img
                        src={msg.imageAttachment}
                        alt="Attached"
                        className="w-48 h-32 object-cover rounded-2xl mb-3 border border-[#2E7D32]/30 shadow-sm"
                      />
                    )}
                    {msg.text}
                  </div>

                  {/* Actions for AI Message */}
                  {msg.sender === 'ai' && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#37474F] dark:text-slate-400 font-bold px-2">
                      <span>{msg.timestamp}</span>
                      {(msg.isQuotaError || msg.text.includes('daily usage limits')) && (
                        <button
                          type="button"
                          onClick={() => handleSendMessage(msg.lastFailedQuery || inputText)}
                          className="px-3 py-1 rounded-xl bg-[#FFB300] hover:bg-amber-400 text-[#1B5E20] font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Icon name="refresh" size={14} />
                          <span>Retry</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(msg.id)}
                        className={`hover:text-[#1B5E20] transition-colors cursor-pointer ${
                          msg.isBookmarked ? 'text-[#E65100] font-black' : ''
                        }`}
                      >
                        {msg.isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.text)}
                        className="hover:text-[#1B5E20] transition-colors cursor-pointer"
                      >
                        📋 Copy Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 mr-auto">
                <div className="w-10 h-10 rounded-2xl bg-[#FFB300] text-[#1B5E20] flex items-center justify-center font-black">
                  <Icon name="psychology" size={22} />
                </div>
                <div className="p-4 rounded-3xl bg-[#F7FAF5] border border-[#2E7D32]/20 text-[#1B5E20] flex items-center gap-2 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-black text-[#1B5E20] ml-2">Krishi Mitra AI is processing your query...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* SUGGESTED QUESTION CHIPS */}
          <div className="py-3 overflow-x-auto flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.query)}
                className="shrink-0 px-3.5 py-2 rounded-2xl bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 text-[#1B5E20] dark:text-emerald-300 border border-[#2E7D32]/20 text-xs font-black transition-all hover:scale-105 cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setAttachedImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80');
                alert('Demo image attached to chat input!');
              }}
              className="p-3 rounded-2xl bg-[#F7FAF5] hover:bg-[#2E7D32]/10 text-[#1B5E20] border border-[#2E7D32]/30 transition-colors cursor-pointer"
              title="Upload Image"
            >
              <Icon name="add_a_photo" size={22} />
            </button>

            {attachedImage && (
              <span className="text-xs bg-[#2E7D32]/10 text-[#1B5E20] border border-[#2E7D32]/20 px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold">
                <span>Image attached</span>
                <button type="button" onClick={() => setAttachedImage(null)} className="font-black text-red-600">×</button>
              </span>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                selectedLanguage === 'en'
                  ? 'Ask Krishi Mitra anything about crops, soil, prices...'
                  : selectedLanguage === 'te'
                  ? 'పంటలు, ఎరువులు, మార్కెట్ ధరల గురించి అడగండి...'
                  : 'फसल, उर्वरक, मौसम या मंडी भाव के बारे में पूछें...'
              }
              className="flex-1 bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/30 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-[#37474F]/60 dark:placeholder-slate-400 font-semibold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#2E7D32]/20"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#144718] hover:to-[#1B5E20] text-white font-black transition-all shadow-lg shadow-[#1B5E20]/20 cursor-pointer"
            >
              <Icon name="send" size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
