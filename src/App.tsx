import React, { useState, useEffect } from 'react';
import { TopAppBar } from './components/TopAppBar';
import { EligibilityWizard } from './components/EligibilityWizard';
import { MatchedSchemesView } from './components/MatchedSchemesView';
import { SchemeDetailModal } from './components/SchemeDetailModal';
import { ApplicationFormModal } from './components/ApplicationFormModal';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { SchemeDirectory } from './components/SchemeDirectory';
import { Scheme, UserProfile, ApplicationRecord } from './types';
import { ALL_SCHEMES } from './data/schemes';
import { matchAllSchemes } from './utils/matcher';

export default function App() {
  const [currentView, setCurrentView] = useState<'wizard' | 'matched' | 'explore' | 'applications'>('wizard');

  // User demographic and socio-economic profile
  const [profile, setProfile] = useState<UserProfile>({
    age: 35,
    gender: '',
    state: '',
    district: '',
    area: 'rural',
    employment: '',
    annualIncome: 250000,
    category: '',
    hasDisability: false,
    isMinority: false,
    maritalStatus: '',
    isBplOrRationCard: true,
    hasAgriculturalLand: true,
    landHoldingAcres: 2.5,
    isStudent: false,
    selectedSectors: ['agriculture', 'healthcare', 'business_loans'],
    matchPriority: 'all',
  });

  const [allSchemes, setAllSchemes] = useState<Scheme[]>(ALL_SCHEMES);
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<Scheme | null>(null);
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState<Scheme | null>(null);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('govscheme_bookmarks');
      return saved ? JSON.parse(saved) : ['pm-kisan', 'pm-jay-ayushman'];
    } catch {
      return ['pm-kisan', 'pm-jay-ayushman'];
    }
  });

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);

  // Fetch initial schemes & applications
  useEffect(() => {
    fetch('/api/schemes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllSchemes(data);
        }
      })
      .catch((err) => console.log('Using local schemes:', err));

    fetchApplications();
  }, []);

  const fetchApplications = () => {
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setApplications(data);
        }
      })
      .catch((err) => console.log('Error fetching applications:', err));
  };

  const handleToggleBookmark = (schemeId: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(schemeId)
        ? prev.filter((id) => id !== schemeId)
        : [...prev, schemeId];
      try {
        localStorage.setItem('govscheme_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCompleteWizard = () => {
    // Run eligibility matcher
    fetch('/api/schemes/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.schemes) {
          setMatchedSchemes(data.schemes);
        } else {
          setMatchedSchemes(matchAllSchemes(allSchemes, profile));
        }
        setCurrentView('matched');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => {
        setMatchedSchemes(matchAllSchemes(allSchemes, profile));
        setCurrentView('matched');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  const handleAskAiAboutScheme = (scheme: Scheme) => {
    setAiInitialPrompt(
      `Please explain the benefits, documents needed, and application process for ${scheme.title} (${scheme.shortTitle || scheme.title}).`
    );
    setIsAiAdvisorOpen(true);
  };

  const handleApplicationSubmitted = (newApp: ApplicationRecord) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased flex flex-col pt-16 relative selection:bg-[#003366] selection:text-white">
      {/* Subtle Dot Grid Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC6SpJd7X2CyBokSXrT2MVsggIF6MKV9AQ7OOLBHNaH6U_OCEXu67kULYvfpMMddnTJBo4PtPrynojIFaaEZ00PqewZkW4pgFYCOCsy48UTagvdn6AHnhIptR0KLob7CBZwCZ-DxSyw8E3uZpId7l3feBBDrvcQteEFTtJMgdceaH80lIMY_5u7tTPZ59AqdoOnQHe0MJ-4kXjP2OBcNXEFmCKunUUkpqoDAtjH9iXnxidODu7wolq7yw')`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover',
        }}
      />

      {/* Top App Bar */}
      <TopAppBar
        currentView={currentView}
        onBack={
          currentView === 'matched'
            ? () => setCurrentView('wizard')
            : currentView !== 'wizard'
            ? () => setCurrentView('wizard')
            : undefined
        }
        canGoBack={currentView !== 'wizard'}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAiAdvisor={() => {
          setAiInitialPrompt(null);
          setIsAiAdvisorOpen(true);
        }}
        savedCount={bookmarkedIds.length}
        applicationsCount={applications.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentView === 'wizard' && (
          <EligibilityWizard
            profile={profile}
            setProfile={setProfile}
            onComplete={handleCompleteWizard}
          />
        )}

        {currentView === 'matched' && (
          <MatchedSchemesView
            schemes={matchedSchemes.length > 0 ? matchedSchemes : matchAllSchemes(allSchemes, profile)}
            profile={profile}
            onSelectScheme={(scheme) => setSelectedSchemeForModal(scheme)}
            onApplyScheme={(scheme) => setSelectedSchemeForApply(scheme)}
            onAskAi={handleAskAiAboutScheme}
            onEditProfile={() => setCurrentView('wizard')}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentView === 'explore' && (
          <SchemeDirectory
            schemes={allSchemes}
            onSelectScheme={(scheme) => setSelectedSchemeForModal(scheme)}
            onApplyScheme={(scheme) => setSelectedSchemeForApply(scheme)}
            onAskAi={handleAskAiAboutScheme}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onStartEligibilityCheck={() => setCurrentView('wizard')}
          />
        )}

        {currentView === 'applications' && (
          <ApplicationTrackerView
            applications={applications}
            onRefreshApplications={fetchApplications}
          />
        )}
      </main>

      {/* Scheme Detail Dossier Modal */}
      <SchemeDetailModal
        scheme={selectedSchemeForModal}
        onClose={() => setSelectedSchemeForModal(null)}
        onApply={(scheme) => {
          setSelectedSchemeForModal(null);
          setSelectedSchemeForApply(scheme);
        }}
        onAskAi={handleAskAiAboutScheme}
        isBookmarked={selectedSchemeForModal ? bookmarkedIds.includes(selectedSchemeForModal.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Scheme Direct Application Modal */}
      <ApplicationFormModal
        scheme={selectedSchemeForApply}
        profile={profile}
        onClose={() => setSelectedSchemeForApply(null)}
        onApplicationSubmitted={handleApplicationSubmitted}
      />

      {/* AI Scheme Advisor Slide-Over Chat */}
      <AiAdvisorDrawer
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        profile={profile}
        onSelectScheme={(scheme) => setSelectedSchemeForModal(scheme)}
        onApplyScheme={(scheme) => setSelectedSchemeForApply(scheme)}
        initialPrompt={aiInitialPrompt}
      />
    </div>
  );
}
