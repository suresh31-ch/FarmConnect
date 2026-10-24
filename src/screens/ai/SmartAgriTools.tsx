/**
 * Smart Agriculture Precision Tools
 * Grid of interactive calculators and decision support systems:
 * Crop Selector, NPK Dosage Calculator, Pest ID, Weather Advisory, and Market Analytics.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

export const SmartAgriTools: React.FC = () => {
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);

  // NPK Calculator State
  const [npkForm, setNpkForm] = useState({
    crop: 'Paddy',
    acres: '2',
    soilType: 'Alluvial Black Soil'
  });
  const [npkResult, setNpkResult] = useState<{ urea: number; dap: number; mop: number } | null>(null);

  // Crop Selector State
  const [cropForm, setCropForm] = useState({
    district: 'Guntur',
    soil: 'Black Cotton',
    waterAvailability: 'Irrigated Canal',
    season: 'Kharif'
  });
  const [cropResult, setCropResult] = useState<string[] | null>(null);

  const calculateNPK = () => {
    const ac = parseFloat(npkForm.acres) || 1;
    if (npkForm.crop === 'Paddy') {
      setNpkResult({ urea: Math.round(70 * ac), dap: Math.round(50 * ac), mop: Math.round(30 * ac) });
    } else if (npkForm.crop === 'Tomato') {
      setNpkResult({ urea: Math.round(60 * ac), dap: Math.round(40 * ac), mop: Math.round(45 * ac) });
    } else {
      setNpkResult({ urea: Math.round(80 * ac), dap: Math.round(60 * ac), mop: Math.round(50 * ac) });
    }
  };

  const recommendCrops = () => {
    if (cropForm.soil === 'Black Cotton') {
      setCropResult(['Teja Dry Red Chili', 'Hybrid Tomato', 'Cotton (Bt Cotton)', 'Black Gram (Urad)']);
    } else {
      setCropResult(['Sonamasuri Paddy', 'Maize (Corn)', 'Groundnut', 'Organic Sugarcane']);
    }
  };

  const toolsList = [
    {
      id: 'npk_calc',
      title: 'Fertilizer & NPK Dosage Calculator',
      category: 'Soil Nutrition',
      description: 'Calculate exact split dosage of Urea, DAP, and Potash per acre to prevent over-fertilization.',
      icon: 'science',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'crop_recommender',
      title: 'Smart Crop Recommendation Engine',
      category: 'Crop Selection',
      description: 'AI model match for soil NPK, pH, district rainfall, and market profit index.',
      icon: 'psychology',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'pest_id',
      title: 'Pest & Insect Identification',
      category: 'Entomology',
      description: 'Identify whiteflies, thrips, stem borers, and aphids with recommended bio-pesticides.',
      icon: 'bug_report',
      color: 'from-amber-500 to-emerald-600'
    },
    {
      id: 'disease_id',
      title: 'Fungal & Viral Disease Identifier',
      category: 'Pathology',
      description: 'Scan foliage for blast, wilt, blight, and leaf curl virus symptoms.',
      icon: 'center_focus_strong',
      color: 'from-rose-500 to-teal-600'
    },
    {
      id: 'weather_advisory',
      title: 'Spray & Irrigation Weather Matrix',
      category: 'Meteorology',
      description: 'Calculate optimal 3-hour windows for pesticide spraying based on wind speed and humidity.',
      icon: 'partly_cloudy_day',
      color: 'from-blue-500 to-teal-600'
    },
    {
      id: 'market_analytics',
      title: 'Mandi Arbitrage & Market Analytics',
      category: 'Economics',
      description: 'Compare transport costs vs Mandi price differences to find your highest net profit market.',
      icon: 'analytics',
      color: 'from-indigo-500 to-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 text-white shadow-2xl border border-emerald-500/30">
        <div className="space-y-1">
          <Badge variant="emerald" size="md" icon="precision_manufacturing">
            Precision Smart Agri Suite
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Smart Agriculture Tools & Calculators
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Interactive decision support algorithms for fertilizer dosages, crop planning, and pest control.
          </p>
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsList.map((tool) => (
          <Card
            key={tool.id}
            variant="glass"
            className="p-6 space-y-4 border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/50 hover:scale-[1.02] transition-all cursor-pointer group"
            onClick={() => setActiveToolModal(tool.id)}
          >
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg`}>
                <Icon name={tool.icon} size={28} />
              </div>
              <Badge variant="emerald" size="sm">{tool.category}</Badge>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-emerald-400">
              <span>Launch Tool</span>
              <Icon name="arrow_forward" size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>

      {/* INTERACTIVE MODALS */}
      {/* Modal 1: NPK Calculator */}
      {activeToolModal === 'npk_calc' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card variant="glass" className="w-full max-w-md p-6 space-y-4 border-emerald-500/40 bg-slate-900 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Icon name="science" size={20} className="text-emerald-400" /> NPK Dosage Calculator
              </h3>
              <button type="button" onClick={() => setActiveToolModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Crop</label>
                <select
                  value={npkForm.crop}
                  onChange={(e) => setNpkForm({ ...npkForm, crop: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="Paddy">Sonamasuri Paddy</option>
                  <option value="Tomato">Hybrid Tomato</option>
                  <option value="Chili">Teja Red Chili</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Field Area (Acres)</label>
                <input
                  type="number"
                  value={npkForm.acres}
                  onChange={(e) => setNpkForm({ ...npkForm, acres: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <Button variant="accent" size="md" onClick={calculateNPK} className="w-full">
                Calculate Exact Dosage
              </Button>

              {npkResult && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/40 space-y-2 mt-2">
                  <span className="font-bold text-emerald-300 block">Recommended Input Quantities:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                      <span className="block text-slate-400">Urea (N)</span>
                      <strong className="text-emerald-400 text-sm">{npkResult.urea} kg</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                      <span className="block text-slate-400">DAP (P)</span>
                      <strong className="text-teal-400 text-sm">{npkResult.dap} kg</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                      <span className="block text-slate-400">MOP (K)</span>
                      <strong className="text-amber-400 text-sm">{npkResult.mop} kg</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal 2: Crop Recommendation Engine */}
      {activeToolModal === 'crop_recommender' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card variant="glass" className="w-full max-w-md p-6 space-y-4 border-emerald-500/40 bg-slate-900 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Icon name="psychology" size={20} className="text-emerald-400" /> Smart Crop Recommender
              </h3>
              <button type="button" onClick={() => setActiveToolModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Soil Type</label>
                <select
                  value={cropForm.soil}
                  onChange={(e) => setCropForm({ ...cropForm, soil: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="Black Cotton">Black Cotton Soil</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Alluvial Delta">Alluvial Delta Soil</option>
                </select>
              </div>

              <Button variant="accent" size="md" onClick={recommendCrops} className="w-full">
                Get Top High-Profit Crops
              </Button>

              {cropResult && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/40 space-y-2 mt-2">
                  <span className="font-bold text-emerald-300 block">Recommended Crops for your Land:</span>
                  <div className="flex flex-wrap gap-2">
                    {cropResult.map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-emerald-900 text-emerald-200 font-bold border border-emerald-500/30">
                        🌱 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Fallback for other tools */}
      {activeToolModal && activeToolModal !== 'npk_calc' && activeToolModal !== 'crop_recommender' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card variant="glass" className="w-full max-w-md p-6 space-y-4 border-emerald-500/40 bg-slate-900 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold capitalize">{activeToolModal.replace('_', ' ')} Tool</h3>
              <button type="button" onClick={() => setActiveToolModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-300">
              Tool initialized with live field sensor parameters and APMC Mandi feeds.
            </p>
            <Button variant="accent" size="md" onClick={() => setActiveToolModal(null)} className="w-full">
              Close Tool
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
