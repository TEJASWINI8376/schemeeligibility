import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  Bookmark,
  Share2,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Scheme, UserProfile } from '../types';

interface MatchedSchemesViewProps {
  schemes: Scheme[];
  profile: UserProfile;
  onSelectScheme: (scheme: Scheme) => void;
  onApplyScheme: (scheme: Scheme) => void;
  onAskAi: (scheme: Scheme) => void;
  onEditProfile: () => void;
  bookmarkedIds: string[];
  onToggleBookmark: (schemeId: string) => void;
}

export const MatchedSchemesView: React.FC<MatchedSchemesViewProps> = ({
  schemes,
  profile,
  onSelectScheme,
  onApplyScheme,
  onAskAi,
  onEditProfile,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'eligible' | 'dbt' | 'loans' | 'central' | 'state'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const eligibleSchemes = schemes.filter((s) => s.isEligible);
  const eligibleCount = eligibleSchemes.length;

  const filteredList = schemes.filter((scheme) => {
    if (filterTab === 'eligible') return scheme.isEligible;
    if (filterTab === 'dbt') return scheme.benefitType === 'Direct Benefit Transfer';
    if (filterTab === 'loans') return scheme.benefitType === 'Loan at Low Interest';
    if (filterTab === 'central') return scheme.level === 'Central';
    if (filterTab === 'state') return scheme.level === 'State';
    return true;
  });

  const handleShare = (scheme: Scheme, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: scheme.title,
        text: `Check out ${scheme.shortTitle || scheme.title} on GovScheme: ${scheme.shortDescription}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${scheme.title} - ${scheme.benefitAmount}`);
      setCopiedId(scheme.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24">
      {/* Top Banner with Matched Results summary */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white rounded-2xl p-6 md:p-8 mb-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs text-[#8df9a8] rounded-full text-xs font-semibold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#8df9a8]" />
              Eligibility Assessment Complete
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Found {schemes.length} Matching Schemes
            </h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Based on profile: <span className="text-white font-medium">{profile.age} Yrs</span>,{' '}
              <span className="text-white font-medium capitalize">{profile.gender}</span>,{' '}
              <span className="text-white font-medium">{profile.state?.replace('_', ' ')}</span>,{' '}
              <span className="text-white font-medium">{profile.employment?.replace('_', ' ')}</span>. You qualify for{' '}
              <strong className="text-[#8df9a8] font-bold">{eligibleCount} direct schemes</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onEditProfile}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all shadow-xs"
            >
              Modify Profile
            </button>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-center min-w-[110px]">
              <span className="text-xs text-blue-200 block font-medium">
                Eligible Schemes
              </span>
              <span className="text-2xl font-bold text-[#8df9a8]">{eligibleCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {[
          { id: 'all', label: `All (${schemes.length})` },
          { id: 'eligible', label: `Eligible (${eligibleCount})`, star: true },
          { id: 'dbt', label: 'Cash DBT' },
          { id: 'loans', label: 'Loans & MSME' },
          { id: 'central', label: 'Central Schemes' },
          { id: 'state', label: 'State Specific' },
        ].map((tab) => {
          const isActive = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.star && <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-[#8df9a8]' : 'text-[#008744]'}`} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scheme Cards Grid */}
      <div className="space-y-4">
        {filteredList.map((scheme) => {
          const isBookmarked = bookmarkedIds.includes(scheme.id);

          return (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-5 md:p-6 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                {/* Header info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Match Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        scheme.isEligible
                          ? 'bg-emerald-50 text-[#008744] border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {scheme.isEligible ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#008744]" />
                          {scheme.matchScore}% Match · Eligible
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                          {scheme.matchScore}% Match · Partial
                        </>
                      )}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003366] text-xs font-medium border border-blue-100">
                      {scheme.level === 'State' ? `State (${scheme.stateSpecific?.toUpperCase()})` : 'Central'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200">
                      {scheme.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#003366] hover:text-[#0284c7] transition-colors">
                    {scheme.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {scheme.ministry}
                  </p>
                </div>

                {/* Right side benefit banner */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 md:text-right min-w-[190px]">
                  <span className="text-xs text-slate-500 block font-medium">
                    Key Benefit
                  </span>
                  <span className="text-base md:text-lg font-bold text-[#008744] block">
                    {scheme.benefitAmount}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {scheme.benefitType}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                {scheme.shortDescription}
              </p>

              {/* Eligibility Match breakdown */}
              <div className="bg-slate-50 rounded-xl p-3.5 mb-4 text-xs border border-slate-200/80">
                <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#008744]" />
                  Eligibility Match Highlights:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {scheme.matchReasons?.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-[#008744] shrink-0" />
                      <span className="font-medium">{reason}</span>
                    </div>
                  ))}
                  {scheme.unmetReasons && scheme.unmetReasons.length > 0 && (
                    <div className="flex items-center gap-1.5 text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-medium">{scheme.unmetReasons[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(scheme.id);
                    }}
                    className={`p-2 rounded-lg border transition-all ${
                      isBookmarked
                        ? 'bg-blue-50 text-[#003366] border-blue-200'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark scheme'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleShare(scheme, e)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                    title="Share Scheme"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAi(scheme);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003366] text-xs font-semibold border border-blue-200 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#008744]" />
                    <span>Ask AI</span>
                  </button>

                  {copiedId === scheme.id && (
                    <span className="text-xs text-[#008744] font-medium">Copied!</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectScheme(scheme);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                  >
                    Details & Checklist
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyScheme(scheme);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
