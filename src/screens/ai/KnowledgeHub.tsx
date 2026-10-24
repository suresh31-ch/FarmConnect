/**
 * Agri Knowledge Hub & Video Advisory Center
 * Rich repository of agronomic articles, ZBNF organic recipes, video guides,
 * research papers, FAQs, and search/bookmarking capabilities.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

export interface Article {
  id: string;
  title: string;
  category: 'Organic Farming' | 'Modern Technology' | 'Soil Health' | 'Water Management' | 'Crop Rotation' | 'Expert Video Guide';
  readTime: string;
  author: string;
  summary: string;
  content: string;
  imageUrl: string;
  isBookmarked?: boolean;
}

const mockArticles: Article[] = [
  {
    id: 'art-1',
    title: 'Zero Budget Natural Farming (ZBNF): Jeevamrutha Preparation Guide',
    category: 'Organic Farming',
    readTime: '5 min read',
    author: 'Dr. Subhash Palekar Agri Research Institute',
    summary: 'How to prepare fermentative microbial inoculant Jeevamrutha using indigenous cow dung and urine to eliminate chemical fertilizer costs.',
    content: `
      Jeevamrutha is a catalytic bio-formulation that promotes beneficial soil biological activity.
      
      Ingredients required for 1 Acre (200 Liters Water):
      1. Fresh Cow Dung (Desi Cow): 10 kg
      2. Cow Urine: 5 to 10 Liters
      3. Jaggery (Organic): 2 kg
      4. Pulse Flour (Besan/Gram Flour): 2 kg
      5. Undisturbed Virgin Soil: 1 Handful (from forest or farm bund)
      
      Preparation Steps:
      Mix all ingredients in a 200L plastic drum. Stir clockwise twice daily for 48 hours. Cover with wet gunny bag in shade. Apply 200L per acre with irrigation water every 15 days.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'art-2',
    title: 'Drip Irrigation Maintenance: Preventing Mineral Clogging in Hard Water',
    category: 'Water Management',
    readTime: '4 min read',
    author: 'Central Water & Soil Advisory Board',
    summary: 'Step-by-step acid treatment protocols (hydrochloric acid injection) to flush emitter clogging and ensure uniform water discharge.',
    content: `
      Hard water containing calcium and magnesium carbonates often clogs drip emitters, leading to uneven water distribution.
      
      Flushing Procedure:
      1. Open sub-main end caps and flush clean water at high pressure for 10 minutes.
      2. Inject Hydrochloric Acid (Commercial HCl 30%) into drip line to maintain pH between 2.0 and 3.0.
      3. Allow acid solution to remain inside lateral pipes for 12 to 24 hours.
      4. Flush thoroughly with clean water until pH returns to normal (6.5 - 7.5).
    `,
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'art-3',
    title: 'High-Density Plantation & Canopy Management in Mango & Citrus',
    category: 'Modern Technology',
    readTime: '6 min read',
    author: 'Indian Council of Agricultural Research (ICAR)',
    summary: 'Increasing tree population per acre from 40 trees to 200 trees using ultra-high density planting (UHDP) for 300% higher yield.',
    content: `
      Ultra High Density Planting (UHDP) in mango allows 671 plants/acre at 3m x 2m spacing compared to traditional 40 plants/acre.
      
      Key Management Steps:
      - Systematic center leader pruning after harvest to maintain height below 7 feet.
      - Paclobutrazol growth regulator soil drenching in September for uniform flowering.
      - Micro-sprinkler fertigation directly beneath root canopy.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80'
  }
];

export const KnowledgeHub: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticleModal, setActiveArticleModal] = useState<Article | null>(null);

  const categories = ['All', 'Organic Farming', 'Modern Technology', 'Soil Health', 'Water Management', 'Crop Rotation'];

  const toggleBookmark = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a))
    );
  };

  const filteredArticles = articles.filter((a) => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 text-white shadow-2xl border border-emerald-500/30">
        <div className="space-y-1 max-w-2xl">
          <Badge variant="emerald" size="md" icon="menu_book">
            Agri Knowledge & Video Advisory
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Krishi Gyan Knowledge Repository
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Learn Zero-Budget Natural Farming (ZBNF), organic pest control, soil health restoration, and modern tech guides.
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Icon name="search" size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles & videos..."
            className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* ARTICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            variant="glass"
            className="p-5 flex flex-col justify-between space-y-4 border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/50 transition-all group cursor-pointer"
            onClick={() => setActiveArticleModal(article)}
          >
            <div className="space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-500/30">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(article.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:text-amber-300 backdrop-blur-md"
                >
                  <Icon name={article.isBookmarked ? 'bookmark' : 'bookmark_border'} size={18} className={article.isBookmarked ? 'text-amber-400' : ''} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <Badge variant="emerald" size="sm">{article.category}</Badge>
                <span>{article.readTime}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                {article.title}
              </h3>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Read Full Guide</span>
              <Icon name="arrow_forward" size={16} />
            </div>
          </Card>
        ))}
      </div>

      {/* ARTICLE READING MODAL */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <Card variant="glass" className="w-full max-w-2xl p-6 sm:p-8 space-y-6 border-emerald-500/40 bg-slate-900 text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Badge variant="emerald" size="sm">{activeArticleModal.category}</Badge>
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <img
              src={activeArticleModal.imageUrl}
              alt={activeArticleModal.title}
              className="w-full h-56 object-cover rounded-2xl border border-emerald-500/30"
            />

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">{activeArticleModal.title}</h2>
              <p className="text-xs text-emerald-300 font-semibold">Author: {activeArticleModal.author} • {activeArticleModal.readTime}</p>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-black/30 border border-slate-800">
              {activeArticleModal.content}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setActiveArticleModal(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
