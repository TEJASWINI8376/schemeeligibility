import React from 'react';
import { ArrowLeft, Bookmark, FileText, Bot, Compass, ShieldCheck } from 'lucide-react';

interface TopAppBarProps {
  currentView: 'wizard' | 'matched' | 'explore' | 'applications';
  onBack?: () => void;
  canGoBack?: boolean;
  onNavigate: (view: 'wizard' | 'matched' | 'explore' | 'applications') => void;
  onOpenAiAdvisor: () => void;
  savedCount: number;
  applicationsCount: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentView,
  onBack,
  canGoBack = false,
  onNavigate,
  onOpenAiAdvisor,
  savedCount,
  applicationsCount,
}) => {
  return (
    <header
      id="topAppBar"
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left: Back button & Brand */}
        <div className="flex items-center gap-3">
          {canGoBack && onBack ? (
            <button
              id="backButton"
              aria-label="Go back"
              onClick={onBack}
              className="flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 duration-100 transition-all text-slate-700"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#003366] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#8df9a8]" />
            </div>
          )}

          <div className="cursor-pointer" onClick={() => onNavigate('wizard')}>
            <h1 className="font-bold text-lg tracking-tight text-[#003366] flex items-center gap-2">
              GovScheme
              <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-[#003366] border border-blue-200/60 rounded-full hidden sm:inline-block">
                Citizen Portal
              </span>
            </h1>
          </div>
        </div>

        {/* Center / Navigation items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <button
            id="navCheckEligibility"
            onClick={() => onNavigate('wizard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'wizard'
                ? 'bg-white text-[#003366] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-[#003366] hover:bg-white/60'
            }`}
          >
            Check Eligibility
          </button>
          <button
            id="navExploreSchemes"
            onClick={() => onNavigate('explore')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'explore'
                ? 'bg-white text-[#003366] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-[#003366] hover:bg-white/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#008744]" />
            All Schemes
          </button>
          <button
            id="navTrackApplications"
            onClick={() => onNavigate('applications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'applications'
                ? 'bg-white text-[#003366] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-[#003366] hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Track Applications
            {applicationsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#008744] text-white text-[10px] font-semibold flex items-center justify-center">
                {applicationsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right action items */}
        <div className="flex items-center gap-2">
          <button
            id="openAiAdvisorBtn"
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#003366] hover:bg-[#002244] text-white text-xs font-medium shadow-xs transition-all"
            title="Ask AI Scheme Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-[#8df9a8]" />
            <span>AI Advisor</span>
          </button>

          <button
            id="mobileNavApplicationsBtn"
            onClick={() => onNavigate('applications')}
            className="md:hidden relative p-2 rounded-lg border border-slate-200 bg-white text-slate-700"
            title="Applications"
          >
            <FileText className="w-4 h-4" />
            {applicationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#008744] text-white text-[10px] font-bold flex items-center justify-center">
                {applicationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
