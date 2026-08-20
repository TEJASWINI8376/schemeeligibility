import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  CreditCard,
  User,
  ArrowRight,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { Scheme, UserProfile, ApplicationRecord } from '../types';

interface ApplicationFormModalProps {
  scheme: Scheme | null;
  profile: UserProfile;
  onClose: () => void;
  onApplicationSubmitted: (app: ApplicationRecord) => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  scheme,
  profile,
  onClose,
  onApplicationSubmitted,
}) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    fatherOrSpouseName: '',
    phone: '',
    email: '',
    aadhaarLast4: '',
    bankAccount: '',
    bankIfsc: 'SBIN0001234',
    state: profile.state || 'maharashtra',
    district: profile.district || 'pune',
    pinCode: '411038',
    declarationAccepted: true,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; fileSize: string; verified: boolean }[]>([
    { name: 'Aadhaar_Card_Verified.pdf', type: 'Aadhaar Card', fileSize: '1.4 MB', verified: true },
    { name: 'Bank_Passbook_Front_Page.pdf', type: 'Bank Passbook', fileSize: '980 KB', verified: true },
    { name: 'Self_Declaration_Signed.pdf', type: 'Income & Domicile Declaration', fileSize: '1.1 MB', verified: true },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ApplicationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!scheme) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        type: 'Additional Document',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        verified: true,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.applicantName.trim()) {
      setErrorMsg('Please enter your full name as per Aadhaar.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.aadhaarLast4 || formData.aadhaarLast4.length !== 4) {
      setErrorMsg('Please enter the last 4 digits of your Aadhaar card.');
      return;
    }
    if (!formData.bankAccount || formData.bankAccount.length < 6) {
      setErrorMsg('Please enter your active bank account number for DBT.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: scheme.id,
          applicantName: formData.applicantName,
          applicantFatherOrSpouseName: formData.fatherOrSpouseName,
          aadhaarLast4: formData.aadhaarLast4,
          phone: formData.phone,
          email: formData.email,
          state: formData.state,
          district: formData.district,
          pinCode: formData.pinCode,
          bankAccountLast4: formData.bankAccount.slice(-4),
          ifscCode: formData.bankIfsc,
          documents: uploadedFiles,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit application. Please try again.');
      }

      const application: ApplicationRecord = await res.json();
      setSubmittedResult(application);
      onApplicationSubmitted(application);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8df9a8] font-semibold tracking-wide block">
              Direct Application Portal
            </span>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Apply: {scheme.shortTitle || scheme.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {submittedResult ? (
            /* SUCCESS CONFIRMATION RECEIPT */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-[#008744]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-[#008744] border border-emerald-200 text-xs font-semibold rounded-full mb-2">
                  Application Successfully Registered
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  Acknowledgement Receipt
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Your application has been registered on the centralized welfare repository.
                </p>
              </div>

              {/* Receipt details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-sm space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium text-xs">Reference No.</span>
                  <span className="font-semibold text-[#003366] bg-blue-50 px-2 py-0.5 rounded-md text-xs border border-blue-200">
                    {submittedResult.applicationNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium text-xs">Scheme</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {submittedResult.schemeTitle}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium text-xs">Applicant Name</span>
                  <span className="font-semibold text-slate-900">{submittedResult.applicantName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium text-xs">Benefit Amount</span>
                  <span className="font-bold text-[#008744] text-base">{submittedResult.benefitAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium text-xs">Status</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#008744]" />
                    {submittedResult.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#003366] text-white text-xs font-semibold hover:bg-[#002244] shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* APPLICATION FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Personal details */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#003366]" />
                  1. Applicant Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name (as on Aadhaar) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Eknath Patil"
                      value={formData.applicantName}
                      onChange={(e) => handleInputChange('applicantName', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Father's / Spouse's Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eknath Patil"
                      value={formData.fatherOrSpouseName}
                      onChange={(e) => handleInputChange('fatherOrSpouseName', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="citizen@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Aadhaar Last 4 *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="4829"
                    value={formData.aadhaarLast4}
                    onChange={(e) => handleInputChange('aadhaarLast4', e.target.value.replace(/\D/g, ''))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bank Account Details for DBT */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#008744]" />
                  2. Bank Account Details (For Direct Benefit Transfer)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Bank Savings Account Number *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. 10492837492"
                      value={formData.bankAccount}
                      onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Bank IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={formData.bankIfsc}
                      onChange={(e) => handleInputChange('bankIfsc', e.target.value.toUpperCase())}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#003366] focus:outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload section */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#008744]" />
                  3. Attached Certificates & Documents
                </h4>
                <div className="space-y-2 mb-3">
                  {uploadedFiles.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#008744]" />
                        <span className="font-medium text-slate-800">{doc.name}</span>
                        <span className="text-slate-400 text-[11px]">({doc.fileSize})</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#008744] border border-emerald-200 font-semibold text-[11px] rounded-full">
                        Attached
                      </span>
                    </div>
                  ))}
                </div>

                <label className="flex items-center justify-center p-3 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-xs text-slate-700 font-medium gap-2">
                  <UploadCloud className="w-4 h-4 text-[#003366]" />
                  <span>Attach additional document (PDF/Image up to 5MB)</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
              </div>

              {/* Self Declaration Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.declarationAccepted}
                    onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#003366] focus:ring-[#003366] accent-[#003366]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I solemnly declare that the particulars furnished above are true and correct, and I consent to Aadhaar-based e-KYC and Direct Benefit Transfer (DBT) credit under {scheme.title}.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
