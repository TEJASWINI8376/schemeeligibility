import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  ArrowRight,
  Compass,
  Sparkles,
} from 'lucide-react';
import { Scheme } from '../types';
import { STATES_AND_UTS } from '../data/districts';

interface SchemeDirectoryProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  onApplyScheme: (scheme: Scheme) => void;
  onAskAi: (scheme: Scheme) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (schemeId: string) => void;
  onStartEligibilityCheck: () => void;
}

export const SchemeDirectory: React.FC<SchemeDirectoryProps> = ({
  schemes,
  onSelectScheme,
  onApplyScheme,
  onAskAi,
  bookmarkedIds,
  onToggleBookmark,
  onStartEligibilityCheck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedState, setSelectedState] = useState('');

  const categories = [
    'All',
    'Agriculture & Rural Welfare',
    'Healthcare & Insurance',
    'Housing & Shelter',
    'Business & Entrepreneurship',
    'Women & Child Development',
    'Education & Scholarships',
    'Skill Development & Artisans',
    'Social Security & Pension',
  ];

  const filteredSchemes = schemes.filter((s) => {
    // Category match
    if (selectedCategory !== 'All' && !s.category.includes(selectedCategory)) {
      return false;
    }
    // Level match
    if (selectedLevel !== 'All' && s.level !== selectedLevel) {
      return false;
    }
    // State match
    if (selectedState && s.stateSpecific && s.stateSpecific !== selectedState) {
      return false;
    }
    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = s.title.toLowerCase().includes(q) || (s.shortTitle && s.shortTitle.toLowerCase().includes(q));
      const matchesDesc = s.shortDescription.toLowerCase().includes(q);
      const matchesTags = s.tags.some((t) => t.toLowerCase().includes(q));
      const matchesMinistry = s.ministry.toLowerCase().includes(q);
      return matchesTitle || matchesDesc || matchesTags || matchesMinistry;
    }
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24">
      {/* Hero Explorer Card */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs text-[#8df9a8] rounded-full text-xs font-semibold tracking-wide mb-3">
            <Compass className="w-3.5 h-3.5" />
            Central & State Welfare Registry
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Government Welfare & Citizen Benefits
          </h2>
          <p className="text-blue-100 text-sm mb-5">
            Explore public welfare programs across healthcare, agriculture, business credits, housing, and social security.
          </p>

          <button
            onClick={onStartEligibilityCheck}
            className="px-5 py-2.5 rounded-xl bg-white text-[#003366] font-semibold text-xs hover:bg-slate-50 transition-all inline-flex items-center gap-2 shadow-xs active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#008744]" />
            <span>Check My Eligibility in 4 Steps</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search schemes, ministries, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm placeholder-slate-400 focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Level Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:border-[#003366] focus:outline-none cursor-pointer"
            >
              <option value="All">All Govt Levels</option>
              <option value="Central">Central Govt</option>
              <option value="State">State Specific</option>
              <option value="Centrally Sponsored">Centrally Sponsored</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:border-[#003366] focus:outline-none cursor-pointer"
            >
              <option value="">All States / UTs</option>
              {STATES_AND_UTS.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-50 text-[#003366] border-blue-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemes.map((scheme) => {
          const isBookmarked = bookmarkedIds.includes(scheme.id);
          return (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003366] text-xs font-medium border border-blue-100">
                    {scheme.level === 'State' ? `State (${scheme.stateSpecific?.toUpperCase()})` : 'Central'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(scheme.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isBookmarked
                        ? 'bg-blue-50 text-[#003366] border-blue-200'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-[#003366] mb-1 line-clamp-2 hover:text-[#0284c7] transition-colors">
                  {scheme.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
                  {scheme.ministry}
                </p>

                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-3">
                  <span className="text-xs text-slate-500 block font-medium">
                    Financial Benefit
                  </span>
                  <span className="text-sm font-bold text-[#008744] block line-clamp-1">
                    {scheme.benefitAmount}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {scheme.shortDescription}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskAi(scheme);
                  }}
                  className="text-xs text-[#003366] font-semibold hover:text-[#0284c7]"
                >
                  Ask AI Advisor
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyScheme(scheme);
                  }}
                  className="px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <span>Apply</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <Search className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800 mb-1">No Schemes Found</h4>
          <p className="text-xs">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </div>
  );
};
