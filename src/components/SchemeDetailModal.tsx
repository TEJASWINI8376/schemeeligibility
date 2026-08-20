import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  FileText,
  Phone,
  ExternalLink,
  Bot,
  Bookmark,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { Scheme } from '../types';

interface SchemeDetailModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  onApply: (scheme: Scheme) => void;
  onAskAi: (scheme: Scheme) => void;
  isBookmarked: boolean;
  onToggleBookmark: (schemeId: string) => void;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  onClose,
  onApply,
  onAskAi,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'documents' | 'process'>('overview');
  const [checkedDocs, setCheckedDocs] = useState<{ [key: string]: boolean }>({});

  if (!scheme) return null;

  const toggleDocCheck = (doc: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  const handlePrintChecklist = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white p-5 md:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 pr-10">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[#8df9a8] text-xs font-semibold">
              {scheme.level === 'State' ? `State (${scheme.stateSpecific?.toUpperCase()})` : 'Central Scheme'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100 text-xs font-medium">
              {scheme.category}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">
            {scheme.title}
          </h2>
          <p className="text-xs text-blue-200">
            {scheme.ministry}
          </p>

          <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-200 block font-medium">
                Financial Benefit
              </span>
              <span className="text-xl font-bold text-[#8df9a8]">
                {scheme.benefitAmount}
              </span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-white text-[#003366] rounded-lg shadow-2xs">
              {scheme.benefitType}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'eligibility', label: 'Eligibility Criteria' },
            { id: 'documents', label: `Documents (${scheme.documentsRequired.length})` },
            { id: 'process', label: 'How to Apply' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#003366] text-[#003366] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wider">
                  Scheme Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {scheme.fullDescription || scheme.shortDescription}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wider">
                  Key Highlights & Benefits
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-[#008744] shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Benefit:</strong> {scheme.benefitAmount}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-[#008744] shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Disbursement:</strong> Direct Benefit Transfer (DBT) directly into Aadhaar-linked bank account.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-[#008744] shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Coverage:</strong> {scheme.level === 'State' ? `State of ${scheme.stateSpecific?.toUpperCase()}` : 'Pan-India coverage across all States & UTs'}.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Toll-Free Helpline</span>
                  <span className="text-sm font-semibold text-[#003366] flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#008744]" />
                    {scheme.helplineNumber}
                  </span>
                </div>
                {scheme.officialPortalUrl && (
                  <a
                    href={scheme.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] hover:underline"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY */}
          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Mandatory Eligibility Conditions
              </h4>
              <div className="space-y-2.5">
                {scheme.eligibilitySummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#008744] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-800">{item}</span>
                  </div>
                ))}
              </div>

              {scheme.eligibilityCriteria.maxAnnualIncome && (
                <div className="p-3 rounded-xl bg-blue-50/70 text-[#003366] border border-blue-200 text-xs">
                  <strong>INCOME CEILING:</strong> Household annual income must be under ₹{scheme.eligibilityCriteria.maxAnnualIncome.toLocaleString('en-IN')}.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS REQUIRED */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Required Document Checklist
                  </h4>
                  <p className="text-xs text-slate-500">
                    Check off documents you have prepared.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintChecklist}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Checklist</span>
                </button>
              </div>

              <div className="space-y-2">
                {scheme.documentsRequired.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  return (
                    <label
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDocCheck(doc)}
                          className="w-4 h-4 rounded text-[#003366] focus:ring-[#003366] accent-[#003366]"
                        />
                        <span className={`text-sm ${isChecked ? 'line-through text-[#008744] font-medium' : 'text-slate-800'}`}>
                          {doc}
                        </span>
                      </div>
                      <FileText className={`w-4 h-4 ${isChecked ? 'text-[#008744]' : 'text-slate-400'}`} />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATION PROCESS */}
          {activeTab === 'process' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Step-by-Step Application Procedure
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {scheme.applicationProcessSteps.map((stepDesc, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-[#003366] text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                      <span className="text-xs font-semibold text-slate-800 block mb-1">
                        Step {idx + 1}
                      </span>
                      <p className="text-sm text-slate-600">{stepDesc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(scheme.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-blue-50 text-[#003366] border-blue-200'
                  : 'border-slate-200 text-slate-500 hover:bg-white'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={() => onAskAi(scheme)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#003366] hover:bg-slate-50"
            >
              <Bot className="w-4 h-4 text-[#008744]" />
              <span>Ask AI Advisor</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onApply(scheme);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
