/**
 * Dedicated Global Search Screen
 * Full-screen search engine across products, farmers, workers, equipment, schemes, and knowledge articles.
 */

import React, { useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAppState } from '../../context/AppStateContext';
import { ActiveTab } from '../../types';

export const GlobalSearchScreen: React.FC = () => {
  const { setActiveTab } = useAppState();
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Master Dataset across FarmConnect Ecosystem
  const masterDataset = [
    { id: '1', title: 'Organic Hybrid Tomatoes', category: 'Products', subtitle: 'Grade A • ₹38/kg • Guntur AP', path: 'products' },
    { id: '2', title: 'Sonamasuri Rice BPT 5204', category: 'Products', subtitle: 'Premium Raw Rice • ₹42/kg', path: 'products' },
    { id: '3', title: 'Teja Dry Red Chili', category: 'Products', subtitle: 'SHU 70000 Export Quality • ₹185/kg', path: 'products' },
    { id: '4', title: 'Harvest Labor Team (Subba Rao)', category: 'Workers', subtitle: '10 Skilled Workers • ₹700/day', path: 'worker_marketplace' },
    { id: '5', title: 'Mahindra 575 DI Tractor Rental', category: 'Equipment', subtitle: '45 HP with Rotavator • ₹800/hr', path: 'equipment_marketplace' },
    { id: '6', title: 'Ongole Breed Bull & Dairy Cows', category: 'Livestock', subtitle: 'A2 Milk Certified • Guntur District', path: 'livestock_marketplace' },
    { id: '7', title: 'YSR Rythu Bharosa Scheme', category: 'Schemes', subtitle: '₹13,500 Direct Benefit Input Support', path: 'govt_schemes' },
    { id: '8', title: 'PM Kisan Samman Nidhi', category: 'Schemes', subtitle: '₹6,000 / year Direct Transfer', path: 'govt_schemes' },
    { id: '9', title: 'Leaf Blight & Pest Control Guide', category: 'Knowledge', subtitle: 'Fungicide Spray Ratios & Neem NSKE', path: 'knowledge_hub' },
    { id: '10', title: 'Hyperlocal Weather & Rainfall Advisory', category: 'Weather', subtitle: '7-Day Forecast & Soil Moisture Telemetry', path: 'weather' }
  ];

  const popularSearches = [
    'Tomato Mandi Price',
    'PM Kisan Scheme',
    'Drip Irrigation Subsidy',
    'Paddy Harvester Rental',
    'Teja Chili Guntur',
    'Harvest Workers'
  ];

  const filteredResults = masterDataset.filter(item => {
    const matchesQuery = query === '' || item.title.toLowerCase().includes(query.toLowerCase()) || item.subtitle.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedFilter === 'All' || item.category === selectedFilter;
    return matchesQuery && matchesCategory;
  });

  const handleOpenResult = (path: string) => {
    setActiveTab(path as ActiveTab);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Search Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 dark:text-emerald-100 flex items-center gap-2">
          <Icon name="search" size={28} className="text-emerald-600 dark:text-emerald-400" />
          FarmConnect Global Search Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-emerald-400">
          Find produce, labor teams, tractor rentals, livestock, government schemes, and disease guides
        </p>
      </div>

      {/* Main Input Box */}
      <Card className="p-3 flex items-center gap-3 bg-white dark:bg-emerald-950/60 shadow-lg border-emerald-200/80 dark:border-emerald-800/80">
        <Icon name="search" size={22} className="text-emerald-600 dark:text-emerald-400 ml-2" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search crop prices, workers, tractors, schemes, diseases..."
          className="w-full bg-transparent text-base font-medium text-slate-900 dark:text-emerald-100 focus:outline-none placeholder-slate-400 dark:placeholder-emerald-500/70"
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
            <Icon name="cancel" size={20} />
          </button>
        )}
      </Card>

      {/* Popular Keyword Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Trending Agri Searches:
        </span>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5"
            >
              <Icon name="trending_up" size={14} className="text-emerald-600" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-emerald-100 dark:border-emerald-800/40">
        {['All', 'Products', 'Workers', 'Equipment', 'Livestock', 'Schemes', 'Knowledge', 'Weather'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Listing */}
      <div className="space-y-3">
        <p className="text-xs text-slate-500 dark:text-emerald-400 font-medium">
          Showing {filteredResults.length} matching entries
        </p>

        {filteredResults.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Icon name="search_off" size={48} className="mx-auto text-emerald-500 mb-2 opacity-50" />
            <p className="font-bold text-slate-700 dark:text-emerald-200">No results found</p>
            <p className="text-xs">Try searching for "Tomatoes", "Tractor", "Workers", or "PM Kisan".</p>
          </Card>
        ) : (
          filteredResults.map(item => (
            <Card
              key={item.id}
              onClick={() => handleOpenResult(item.path)}
              className="p-4 cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm">{item.category}</Badge>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-emerald-300">{item.subtitle}</p>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Icon name="arrow_forward" size={18} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
