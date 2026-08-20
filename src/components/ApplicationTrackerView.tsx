import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { ApplicationRecord } from '../types';

interface ApplicationTrackerViewProps {
  applications: ApplicationRecord[];
  onRefreshApplications: () => void;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onRefreshApplications,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(
    applications.length > 0 ? applications[0] : null
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0]);
    }
  }, [applications, selectedApp]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) {
        throw new Error(`Application with Reference Number "${searchQuery}" not found.`);
      }
      const data = await res.json();
      setSelectedApp(data);
    } catch (err: any) {
      setSearchError(err.message || 'Application search error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#003366] rounded-full text-xs font-semibold tracking-wide mb-2 border border-blue-100">
          <Clock className="w-3.5 h-3.5 text-[#008744]" />
          Real-time Welfare Audit
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#003366] mb-1">
          Application Tracking & Status
        </h2>
        <p className="text-sm text-slate-600">
          Check live verification, official approvals, and Direct Benefit Transfer (DBT) progress.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative flex items-center max-w-xl">
          <input
            type="text"
            placeholder="Enter Ref Number (e.g. GS-2026-MH-84920)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-28 rounded-xl border border-slate-300 bg-white text-xs md:text-sm font-medium focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 h-8 px-4 rounded-lg bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Track'}
          </button>
        </div>
        {searchError && (
          <p className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {searchError}
          </p>
        )}
      </form>

      {/* Main Grid: Applications List on Left, Selected App Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Registered Records ({applications.length})
          </h3>

          {applications.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No applications submitted yet.</p>
            </div>
          ) : (
            applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#003366] bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#003366]">
                      {app.applicationNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-50 text-[#008744] border border-emerald-200">
                      {app.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 mb-1">
                    {app.schemeTitle}
                  </h4>
                  <span className="text-xs text-slate-500 block">
                    Applicant: <strong className="text-slate-800">{app.applicantName}</strong>
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Status Card */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#003366] border border-blue-200">
                      {selectedApp.applicationNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      Submitted on {new Date(selectedApp.submittedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                    {selectedApp.schemeTitle}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>

              {/* Status Timeline */}
              <div className="mb-8">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#008744]" />
                  Live Processing Timeline
                </h4>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedApp.timeline.map((item, idx) => {
                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-0 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white text-[10px] font-bold ${
                            item.completed
                              ? 'bg-[#008744] text-white'
                              : 'bg-slate-300 text-white'
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        <div
                          className={`p-3.5 rounded-xl border ${
                            item.current
                              ? 'bg-blue-50/50 border-blue-300'
                              : item.completed
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.stage}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{item.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Beneficiary & Disbursement Details */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2.5">
                <h5 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Beneficiary & DBT Disbursement Summary
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Applicant Name</span>
                    <span className="font-semibold text-slate-900">{selectedApp.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Aadhaar (Last 4)</span>
                    <span className="font-semibold text-slate-900">XXXX {selectedApp.aadhaarLast4}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">DBT Account</span>
                    <span className="font-semibold text-slate-900">A/C •••• {selectedApp.bankAccountLast4}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Direct Benefit</span>
                    <span className="font-bold text-[#008744] text-sm">{selectedApp.benefitAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mobile</span>
                    <span className="font-semibold text-slate-900">+91 {selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Disbursement</span>
                    <span className="font-semibold text-slate-900">{selectedApp.estimatedDisbursement}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <h4 className="text-base font-semibold text-slate-900 mb-1">
                Select an Application to Track
              </h4>
              <p className="text-xs max-w-sm mx-auto">
                Click on any of your registered applications on the left or search with your Reference Number.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
