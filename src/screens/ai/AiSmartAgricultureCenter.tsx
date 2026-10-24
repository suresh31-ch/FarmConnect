/**
 * Central AI Smart Agriculture Center Hub
 * Master orchestrator connecting all 10 AI Smart Agriculture modules:
 * Crop Doctor, Chat Assistant, Voice Assistant, Price Prediction, Weather,
 * Crop Calendar, Precision Tools, Government Schemes, Knowledge Hub, and Analytics.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

// Sub-Module Imports
import { AiCropDoctor } from './AiCropDoctor';
import { AiChatAssistant } from './AiChatAssistant';
import { AiVoiceAssistant } from './AiVoiceAssistant';
import { MarketPricePrediction } from './MarketPricePrediction';
import { WeatherIntelligence } from './WeatherIntelligence';
import { CropCalendar } from './CropCalendar';
import { SmartAgriTools } from './SmartAgriTools';
import { GovernmentSchemes } from './GovernmentSchemes';
import { KnowledgeHub } from './KnowledgeHub';
import { AiAnalyticsDashboard } from './AiAnalyticsDashboard';

export type AiModuleId =
  | 'hub'
  | 'crop_doctor'
  | 'chat_assistant'
  | 'voice_assistant'
  | 'price_prediction'
  | 'weather'
  | 'crop_calendar'
  | 'smart_tools'
  | 'govt_schemes'
  | 'knowledge_hub'
  | 'analytics';

export interface AiModuleCard {
  id: AiModuleId;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  gradient: string;
  accentBorder: string;
  badgeClass: string;
  metricColor: string;
  metric: string;
}

const aiModulesList: AiModuleCard[] = [
  {
    id: 'crop_doctor',
    title: 'AI Crop Doctor',
    subtitle: 'Upload leaf snapshot for disease diagnosis, organic cure & pesticide dosage',
    icon: 'center_focus_strong',
    badge: 'Vision AI',
    gradient: 'from-[#1B5E20] to-[#2E7D32]',
    accentBorder: 'border-[#2E7D32]/30 hover:border-[#2E7D32]',
    badgeClass: 'bg-[#2E7D32]/10 text-[#1B5E20] border-[#2E7D32]/20',
    metricColor: 'text-[#1B5E20]',
    metric: '98.4% Accuracy'
  },
  {
    id: 'chat_assistant',
    title: 'AI Agriculture Chat Assistant',
    subtitle: 'Ask questions about fertigation, pest control & schemes in English, Telugu or Hindi',
    icon: 'psychology',
    badge: 'LLM Chat',
    gradient: 'from-[#3F51B5] to-[#5C6BC0]',
    accentBorder: 'border-indigo-500/30 hover:border-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    metricColor: 'text-indigo-700',
    metric: 'Multilingual AI'
  },
  {
    id: 'voice_assistant',
    title: 'AI Voice Assistant',
    subtitle: 'Hands-free voice commands to check prices, hire workers, and rent tractors',
    icon: 'mic',
    badge: 'Voice AI',
    gradient: 'from-[#E65100] to-[#F57C00]',
    accentBorder: 'border-orange-500/30 hover:border-orange-500',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
    metricColor: 'text-orange-700',
    metric: 'Speech-to-Action'
  },
  {
    id: 'price_prediction',
    title: 'Market Price Prediction',
    subtitle: '7-day ML price forecasting, APMC Mandi comparisons & Sell/Hold advisory',
    icon: 'trending_up',
    badge: 'ML Forecast',
    gradient: 'from-[#FF8F00] to-[#FFB300]',
    accentBorder: 'border-amber-500/30 hover:border-amber-500',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    metricColor: 'text-amber-800',
    metric: '₹38/kg Tomato'
  },
  {
    id: 'weather',
    title: 'Weather Intelligence',
    subtitle: 'Hyperlocal rainfall forecasts, soil moisture sensors & spray timing alerts',
    icon: 'partly_cloudy_day',
    badge: 'Meteorology',
    gradient: 'from-[#0288D1] to-[#00ACC1]',
    accentBorder: 'border-cyan-500/30 hover:border-cyan-500',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    metricColor: 'text-cyan-800',
    metric: 'Rain at 4 PM'
  },
  {
    id: 'crop_calendar',
    title: 'Smart Crop Calendar',
    subtitle: 'Timeline guidance from sowing to harvest with automated SMS task reminders',
    icon: 'calendar_month',
    badge: 'Schedule',
    gradient: 'from-[#00796B] to-[#009688]',
    accentBorder: 'border-teal-500/30 hover:border-teal-500',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
    metricColor: 'text-teal-800',
    metric: 'Day 44 / 125'
  },
  {
    id: 'smart_tools',
    title: 'Smart Agriculture Tools',
    subtitle: 'Precision NPK dosage calculators, crop selection models & pest identifiers',
    icon: 'precision_manufacturing',
    badge: 'Calculators',
    gradient: 'from-[#7B1FA2] to-[#AB47BC]',
    accentBorder: 'border-purple-500/30 hover:border-purple-500',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    metricColor: 'text-purple-800',
    metric: '6 Tools'
  },
  {
    id: 'govt_schemes',
    title: 'Government Schemes',
    subtitle: 'PM-KISAN, Rythu Bharosa & 90% Drip Irrigation subsidies with direct application',
    icon: 'account_balance',
    badge: 'Govt Portal',
    gradient: 'from-[#1565C0] to-[#1E88E5]',
    accentBorder: 'border-blue-500/30 hover:border-blue-500',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
    metricColor: 'text-blue-800',
    metric: '₹13,500 Benefit'
  },
  {
    id: 'knowledge_hub',
    title: 'Agri Knowledge Hub',
    subtitle: 'Zero Budget Natural Farming (ZBNF), Jeevamrutha recipes & expert video guides',
    icon: 'menu_book',
    badge: 'Education',
    gradient: 'from-[#C2185B] to-[#E91E63]',
    accentBorder: 'border-rose-500/30 hover:border-rose-500',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
    metricColor: 'text-rose-800',
    metric: '120+ Guides'
  },
  {
    id: 'analytics',
    title: 'AI Analytics Dashboard',
    subtitle: 'Crop health scores, farm productivity trends, and net profit forecasting',
    icon: 'analytics',
    badge: 'Scorecard',
    gradient: 'from-[#2E7D32] to-[#43A047]',
    accentBorder: 'border-emerald-500/30 hover:border-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    metricColor: 'text-emerald-800',
    metric: '94/100 Health'
  }
];

interface AiSmartAgricultureCenterProps {
  initialModule?: AiModuleId;
}

export const AiSmartAgricultureCenter: React.FC<AiSmartAgricultureCenterProps> = ({
  initialModule = 'hub'
}) => {
  const [activeModule, setActiveModule] = useState<AiModuleId>(initialModule);

  return (
    <div className="space-y-6">
      {/* BREADCRUMB NAVIGATION & TOP APP BAR (IF INSIDE SUB-MODULE) */}
      {activeModule !== 'hub' && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] text-white border border-[#66BB6A]/30 shadow-xl shadow-[#1B5E20]/15">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveModule('hub')}
              className="flex items-center gap-1.5 text-white hover:text-[#FFB300] bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/20 transition-all hover:scale-105 cursor-pointer font-extrabold"
            >
              <Icon name="arrow_back" size={16} />
              <span>AI Center Hub</span>
            </button>
            <span className="text-emerald-200/60">/</span>
            <span className="text-white uppercase tracking-wider font-black text-sm">
              {aiModulesList.find((m) => m.id === activeModule)?.title || 'AI Module'}
            </span>
          </div>

          {/* Quick Sub-module Switcher Pills */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-xl no-scrollbar">
            {aiModulesList.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModule(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeModule === m.id
                    ? 'bg-[#FFB300] text-[#1B5E20] font-black shadow-md shadow-[#FFB300]/30 scale-105'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {m.title.replace('AI ', '').replace('Agriculture ', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RENDER ACTIVE MODULE OR MAIN HUB */}
      {activeModule === 'hub' ? (
        <div className="space-y-8">
          {/* MAIN HERO HUB BANNER - DARK GREEN GRADIENT */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] p-6 sm:p-10 text-white shadow-2xl border border-[#66BB6A]/40">
            {/* Glowing Ambient Orbs */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#81C784]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#FFB300]/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB300]/20 text-[#FFB300] border border-[#FFB300]/40 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                  <Icon name="psychology" size={16} className="animate-pulse text-[#FFB300]" />
                  FarmConnect AI Super-App Suite
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                  AI Krishi Mitra Super Center
                </h1>

                <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-medium">
                  Unified AI ecosystem bringing vision crop doctor pathology, multi-lingual LLM chat, speech recognition, market trend forecasting, and weather telemetry to every Indian farmer.
                </p>

                {/* Quick Action Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    variant="accent"
                    size="lg"
                    leftIcon="center_focus_strong"
                    onClick={() => setActiveModule('crop_doctor')}
                    className="shadow-xl bg-[#FFB300] text-[#1B5E20] hover:bg-amber-400 font-black cursor-pointer"
                  >
                    Scan Crop Leaf
                  </Button>
                  <Button
                    variant="glass"
                    size="lg"
                    leftIcon="mic"
                    onClick={() => setActiveModule('voice_assistant')}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/40 backdrop-blur-md font-extrabold cursor-pointer"
                  >
                    Voice Assistant
                  </Button>
                </div>
              </div>

              {/* QUICK LIVE SNAPSHOT CARDS - WHITE CARDS WITH DARK TEXT */}
              <div className="grid grid-cols-2 gap-3.5 shrink-0 w-full lg:w-auto">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#2E7D32]/20 shadow-lg space-y-1">
                  <span className="text-[10px] text-[#37474F] font-black uppercase tracking-wider">Crop Health</span>
                  <div className="text-2xl font-black text-[#1B5E20] dark:text-emerald-400">94 / 100</div>
                  <span className="text-[11px] text-[#2E7D32] font-extrabold">Optimal Field Biomarkers</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#2E7D32]/20 shadow-lg space-y-1">
                  <span className="text-[10px] text-[#37474F] font-black uppercase tracking-wider">Tomato Mandi</span>
                  <div className="text-2xl font-black text-[#E65100]">₹38 / kg</div>
                  <span className="text-[11px] text-[#E65100] font-extrabold">+18% Weekly Surge</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#2E7D32]/20 shadow-lg space-y-1">
                  <span className="text-[10px] text-[#37474F] font-black uppercase tracking-wider">Rain Forecast</span>
                  <div className="text-2xl font-black text-[#0288D1]">65% Rain</div>
                  <span className="text-[11px] text-[#0288D1] font-extrabold">Showers @ 4 PM</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#2E7D32]/20 shadow-lg space-y-1">
                  <span className="text-[10px] text-[#37474F] font-black uppercase tracking-wider">Govt Subsidy</span>
                  <div className="text-2xl font-black text-[#1B5E20] dark:text-emerald-300">₹13,500</div>
                  <span className="text-[11px] text-[#2E7D32] font-extrabold">Rythu Bharosa Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* 10 COLOURFUL AI TOOL CARDS GRID */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#2E7D32]/15 pb-3">
              <h2 className="text-xl font-black text-[#1B5E20] dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold">
                  <Icon name="grid_view" size={20} />
                </div>
                Select AI Agriculture Module
              </h2>
              <span className="text-xs font-black bg-[#2E7D32]/10 text-[#1B5E20] px-3 py-1 rounded-full border border-[#2E7D32]/20">
                10 Active AI Tools
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {aiModulesList.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-5 border ${module.accentBorder} shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                >
                  {/* Colorful Top Border Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${module.gradient}`} />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {/* Vibrant Gradient Icon Box */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon name={module.icon} size={30} />
                      </div>

                      {/* Colorful Domain Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${module.badgeClass}`}>
                        {module.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-[#1B5E20] dark:text-white group-hover:text-[#2E7D32] transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-[#37474F] dark:text-slate-300 leading-relaxed font-semibold">
                        {module.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black">
                    <span className={`${module.metricColor} font-black`}>{module.metric}</span>
                    <div className="flex items-center gap-1.5 text-[#1B5E20] dark:text-emerald-400 group-hover:translate-x-1.5 transition-transform font-black">
                      <span>Launch AI</span>
                      <Icon name="arrow_forward" size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SUB-MODULE SCREEN RENDERER */
        <div className="space-y-6">
          {activeModule === 'crop_doctor' && <AiCropDoctor />}
          {activeModule === 'chat_assistant' && <AiChatAssistant />}
          {activeModule === 'voice_assistant' && <AiVoiceAssistant />}
          {activeModule === 'price_prediction' && <MarketPricePrediction />}
          {activeModule === 'weather' && <WeatherIntelligence />}
          {activeModule === 'crop_calendar' && <CropCalendar />}
          {activeModule === 'smart_tools' && <SmartAgriTools />}
          {activeModule === 'govt_schemes' && <GovernmentSchemes />}
          {activeModule === 'knowledge_hub' && <KnowledgeHub />}
          {activeModule === 'analytics' && <AiAnalyticsDashboard />}
        </div>
      )}
    </div>
  );
};
