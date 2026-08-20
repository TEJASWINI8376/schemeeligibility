import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserProfile, Gender, SocialCategory, EmploymentType, SectorInterest } from '../types';
import { STATES_AND_UTS, DISTRICTS_MAP } from '../data/districts';
import { StepProgress } from './StepProgress';

interface EligibilityWizardProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onComplete: () => void;
}

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({
  profile,
  setProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Populate districts when state changes
  useEffect(() => {
    if (profile.state) {
      const stateKey = profile.state.toLowerCase();
      const list = DISTRICTS_MAP[stateKey] || DISTRICTS_MAP['default'];
      setDistrictsList(list);

      // If existing selected district is not in new list, reset
      if (profile.district && !list.map((d) => d.toLowerCase().replace(/\s+/g, '_')).includes(profile.district)) {
        setProfile((prev) => ({ ...prev, district: '' }));
      }
    } else {
      setDistrictsList([]);
    }
  }, [profile.state, setProfile]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!profile.age || Number(profile.age) < 1 || Number(profile.age) > 120) {
        errors.age = 'Please enter a valid age between 1 and 120.';
      }
      if (!profile.gender) {
        errors.gender = 'Please select your gender.';
      }
      if (!profile.state) {
        errors.state = 'Please select your State or Union Territory.';
      }
    } else if (currentStep === 2) {
      if (!profile.employment) {
        errors.employment = 'Please select your primary occupation / employment status.';
      }
      if (profile.annualIncome === '' || Number(profile.annualIncome) < 0) {
        errors.annualIncome = 'Please select or enter your estimated annual household income.';
      }
      if (!profile.category) {
        errors.category = 'Please select your social category.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onComplete();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSector = (sector: SectorInterest) => {
    setProfile((prev) => {
      const exists = prev.selectedSectors.includes(sector);
      return {
        ...prev,
        selectedSectors: exists
          ? prev.selectedSectors.filter((s) => s !== sector)
          : [...prev.selectedSectors, sector],
      };
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-6 pb-36">
      {/* Step Progress Component */}
      <StepProgress
        currentStep={step}
        totalSteps={4}
        stepTitles={['Basic Info', 'Socio-Economic', 'Needs & Assets', 'Review & Match']}
        onStepClick={(s) => {
          if (s < step) setStep(s);
        }}
      />

      {/* Main Form Container Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all">
        {/* ========================================================================= */}
        {/* STEP 1: BASIC INFO */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#008744] block mb-1">
                Step 1 · Demographics
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#003366] mb-1.5">
                Tell us about yourself
              </h2>
              <p className="text-sm text-slate-600">
                We need some basic details to find schemes you might be eligible for. This information is kept private.
              </p>
            </div>

            <form
              id="eligibilityFormStep1"
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="space-y-5"
            >
              {/* Age Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="age">
                  Age <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 35"
                    value={profile.age}
                    onChange={(e) => handleInputChange('age', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className={`w-full h-11 px-4 rounded-xl border ${
                      formErrors.age ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } bg-white text-slate-900 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none transition-all placeholder-slate-400`}
                    required
                  />
                </div>
                {formErrors.age && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.age}
                  </p>
                )}
              </div>

              {/* Gender Selection */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Gender <span className="text-rose-500">*</span>
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {(['male', 'female', 'other'] as Gender[]).map((genderOption) => {
                    const isChecked = profile.gender === genderOption;
                    return (
                      <label
                        key={genderOption}
                        id={`gender-${genderOption}`}
                        className={`relative flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#003366] bg-blue-50/60 text-[#003366] font-semibold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={genderOption}
                          checked={isChecked}
                          onChange={() => handleInputChange('gender', genderOption)}
                          className="sr-only"
                        />
                        <span className="text-sm capitalize font-medium">
                          {genderOption}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {formErrors.gender && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.gender}
                  </p>
                )}
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="state">
                  State / Union Territory <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="state"
                    name="state"
                    value={profile.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full h-11 px-4 appearance-none rounded-xl border ${
                      formErrors.state ? 'border-rose-400' : 'border-slate-300'
                    } bg-white text-slate-900 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none transition-colors cursor-pointer pr-10`}
                    required
                  >
                    <option value="" disabled>
                      Select your state
                    </option>
                    {STATES_AND_UTS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {formErrors.state && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.state}
                  </p>
                )}
              </div>

              {/* District Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="district">
                  District
                </label>
                <div className="relative">
                  <select
                    id="district"
                    name="district"
                    value={profile.district}
                    disabled={!profile.state || districtsList.length === 0}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className={`w-full h-11 px-4 appearance-none rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none transition-colors cursor-pointer pr-10 ${
                      !profile.state ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
                    }`}
                  >
                    <option value="" disabled={!!profile.state && districtsList.length > 0}>
                      {!profile.state ? 'Select state first' : 'Select your district'}
                    </option>
                    {districtsList.map((district) => {
                      const val = district.toLowerCase().replace(/\s+/g, '_');
                      return (
                        <option key={val} value={val}>
                          {district}
                        </option>
                      );
                    })}
                  </select>
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 ${
                      !profile.state ? 'opacity-50' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Required for localized state welfare initiatives.
                </p>
              </div>

              {/* Area Type (Rural vs Urban) */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Area of Residence
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(['rural', 'urban'] as const).map((areaOption) => {
                    const isChecked = profile.area === areaOption;
                    return (
                      <label
                        key={areaOption}
                        id={`area-${areaOption}`}
                        className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#003366] bg-blue-50/60 text-[#003366] font-semibold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <input
                          type="radio"
                          name="area"
                          value={areaOption}
                          checked={isChecked}
                          onChange={() => handleInputChange('area', areaOption)}
                          className="sr-only"
                        />
                        <span className="text-sm">
                          {areaOption === 'rural' ? '🌾 Rural (Gram Panchayat)' : '🏙️ Urban (City / Town)'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SOCIO-ECONOMIC PROFILE */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#008744] block mb-1">
                Step 2 · Socio-Economic Profile
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#003366] mb-1.5">
                Occupation & Social Details
              </h2>
              <p className="text-sm text-slate-600">
                Government schemes are tailored to specific occupations, income brackets, and categories.
              </p>
            </div>

            <div className="space-y-6">
              {/* Primary Occupation / Employment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2" htmlFor="employment">
                  Primary Occupation / Employment Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { val: 'farmer', label: 'Farmer / Cultivator', icon: '🌾' },
                    { val: 'student', label: 'Student / Scholar', icon: '🎓' },
                    { val: 'self_employed', label: 'Small Business / MSME', icon: '💼' },
                    { val: 'artisan_craftsperson', label: 'Artisan / Craftsperson', icon: '🔨' },
                    { val: 'street_vendor', label: 'Street Vendor / Hawker', icon: '🛒' },
                    { val: 'daily_wage', label: 'Daily Wage / Worker', icon: '🧱' },
                    { val: 'salaried', label: 'Salaried (Private / Govt)', icon: '🏢' },
                    { val: 'senior_citizen', label: 'Senior Citizen / Retired', icon: '👴' },
                    { val: 'unemployed', label: 'Unemployed / Job Seeker', icon: '🔍' },
                  ].map((emp) => {
                    const isSelected = profile.employment === emp.val;
                    return (
                      <button
                        key={emp.val}
                        type="button"
                        id={`emp-${emp.val}`}
                        onClick={() => handleInputChange('employment', emp.val as EmploymentType)}
                        className={`p-3 text-left border rounded-xl transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-[#003366] bg-blue-50/60 text-[#003366] font-semibold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-normal'
                        }`}
                      >
                        <span className="text-lg">{emp.icon}</span>
                        <span className="text-xs">{emp.label}</span>
                      </button>
                    );
                  })}
                </div>
                {formErrors.employment && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.employment}
                  </p>
                )}
              </div>

              {/* Annual Household Income */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="income">
                  Estimated Annual Household Income <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Under ₹1.5 Lakh', value: 120000 },
                    { label: '₹1.5L - ₹3 Lakh', value: 250000 },
                    { label: '₹3L - ₹6 Lakh', value: 450000 },
                    { label: 'Above ₹6 Lakh', value: 800000 },
                  ].map((inc) => (
                    <button
                      key={inc.value}
                      type="button"
                      onClick={() => handleInputChange('annualIncome', inc.value)}
                      className={`p-2.5 text-xs rounded-lg border transition-all text-center ${
                        profile.annualIncome === inc.value
                          ? 'border-[#003366] bg-blue-50 text-[#003366] font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {inc.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                    ₹
                  </span>
                  <input
                    id="income"
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Or enter exact annual income (e.g. 180000)"
                    value={profile.annualIncome}
                    onChange={(e) =>
                      handleInputChange('annualIncome', e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
                  />
                </div>
                {formErrors.annualIncome && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.annualIncome}
                  </p>
                )}
              </div>

              {/* Social Category */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Social Category <span className="text-rose-500">*</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['General', 'OBC', 'SC', 'ST', 'EWS'] as SocialCategory[]).map((cat) => {
                    const isChecked = profile.category === cat;
                    return (
                      <label
                        key={cat}
                        id={`cat-${cat}`}
                        className={`flex items-center justify-center p-2.5 border rounded-xl cursor-pointer transition-all text-center ${
                          isChecked
                            ? 'border-[#003366] bg-blue-50/60 text-[#003366] font-semibold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={isChecked}
                          onChange={() => handleInputChange('category', cat)}
                          className="sr-only"
                        />
                        <span className="text-xs">{cat}</span>
                      </label>
                    );
                  })}
                </div>
                {formErrors.category && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* Additional Inclusivity Filters */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Differently-Abled / Person with Disability (PwD)
                    </span>
                    <span className="text-xs text-slate-500">
                      Qualifies for special assistive grants & concessional benefits.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.hasDisability}
                      onChange={(e) => handleInputChange('hasDisability', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008744]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Minority Community Status
                    </span>
                    <span className="text-xs text-slate-500">
                      Eligible for Ministry of Minority Affairs credit & educational initiatives.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.isMinority}
                      onChange={(e) => handleInputChange('isMinority', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008744]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SPECIFIC NEEDS & ASSETS */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#008744] block mb-1">
                Step 3 · Needs & Assets
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#003366] mb-1.5">
                Needs & Asset Details
              </h2>
              <p className="text-sm text-slate-600">
                Fine-tune matches with your household assets and priority sectors.
              </p>
            </div>

            <div className="space-y-6">
              {/* Ration Card / BPL */}
              <div className="p-4 border rounded-xl border-slate-200 bg-white">
                <div className="flex items-start justify-between">
                  <div className="pr-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      BPL / Ration Card Holder
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Do you hold an Antyodaya Anna Yojana (AAY), Priority Household (PHH), or state ration card?
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleInputChange('isBplOrRationCard', true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        profile.isBplOrRationCard
                          ? 'bg-[#003366] text-white border-[#003366]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('isBplOrRationCard', false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        !profile.isBplOrRationCard
                          ? 'bg-[#003366] text-white border-[#003366]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              {/* Agricultural Land Ownership */}
              <div className="p-4 border rounded-xl border-slate-200 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="pr-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Cultivable Agricultural Landholding
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Required for PM-KISAN, Kisan Credit Card, crop insurance, and irrigation subsidies.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleInputChange('hasAgriculturalLand', true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        profile.hasAgriculturalLand
                          ? 'bg-[#003366] text-white border-[#003366]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('hasAgriculturalLand', false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        !profile.hasAgriculturalLand
                          ? 'bg-[#003366] text-white border-[#003366]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {profile.hasAgriculturalLand && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Approximate Land Size in Acres
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="e.g. 2.5 acres"
                      value={profile.landHoldingAcres}
                      onChange={(e) =>
                        handleInputChange(
                          'landHoldingAcres',
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:border-[#003366] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Sectors of Interest */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Areas of Immediate Benefit Needed (Select all that apply)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'agriculture', label: 'Agriculture & Farming', emoji: '🌱' },
                    { id: 'healthcare', label: 'Health & Medical', emoji: '🏥' },
                    { id: 'business_loans', label: 'Business & Loans', emoji: '💰' },
                    { id: 'housing', label: 'Housing & Shelter', emoji: '🏠' },
                    { id: 'education', label: 'Education & Fees', emoji: '📚' },
                    { id: 'women_child', label: 'Women & Child', emoji: '👩' },
                    { id: 'social_welfare', label: 'Pension & Security', emoji: '🛡️' },
                    { id: 'skills_employment', label: 'Skill Training & Tools', emoji: '⚙️' },
                  ].map((sec) => {
                    const isSelected = profile.selectedSectors.includes(sec.id as SectorInterest);
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => toggleSector(sec.id as SectorInterest)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#003366] bg-blue-50/60 text-[#003366] font-semibold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-normal'
                        }`}
                      >
                        <span className="text-xl mb-1">{sec.emoji}</span>
                        <span className="text-xs">{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & MATCH PREFERENCES */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[#008744] rounded-full text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Profile Complete
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#003366] mb-1.5">
                Review & Discover Schemes
              </h2>
              <p className="text-sm text-slate-600">
                Confirm your demographic inputs before matching with the central and state schemes database.
              </p>
            </div>

            {/* Profile Recap Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Applicant Summary
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#003366] font-semibold underline hover:text-[#0284c7]"
                >
                  Edit Information
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Age & Gender</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {profile.age || '-'} Yrs, {profile.gender || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Location</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {profile.district ? `${profile.district}, ` : ''}
                    {profile.state?.replace('_', ' ') || '-'} ({profile.area})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Occupation</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {profile.employment?.replace('_', ' ') || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Annual Income</span>
                  <span className="font-semibold text-slate-900">
                    {profile.annualIncome ? `₹${Number(profile.annualIncome).toLocaleString('en-IN')}` : 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Category</span>
                  <span className="font-semibold text-slate-900">
                    {profile.category || 'General'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Landholding</span>
                  <span className="font-semibold text-slate-900">
                    {profile.hasAgriculturalLand
                      ? `Yes (${profile.landHoldingAcres || '1+'} Acres)`
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Priority Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                What are you looking for most?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Matching Schemes' },
                  { id: 'financial_grant', label: 'Direct Cash Transfer (DBT)' },
                  { id: 'healthcare', label: 'Free Healthcare / Insurance' },
                  { id: 'loans_subsidies', label: 'Low-Interest MSME Loans' },
                  { id: 'education', label: 'Scholarships & Fee Waiver' },
                  { id: 'pension', label: 'Pension & Old Age Welfare' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleInputChange('matchPriority', p.id)}
                    className={`p-2.5 text-xs rounded-lg border transition-all text-center ${
                      profile.matchPriority === p.id
                        ? 'border-[#003366] bg-blue-50 text-[#003366] font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM FIXED ACTION BAR */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-md z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {step > 1 ? (
            <button
              id="wizardBackBtn"
              type="button"
              onClick={handleBack}
              className="h-11 px-5 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs flex items-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#008744]" />
              <span>100% Encrypted & Citizen Privacy Protected</span>
            </div>
          )}

          <button
            id="wizardContinueBtn"
            type="button"
            onClick={handleNext}
            className="h-11 px-6 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <span>{step === 4 ? 'Discover My Schemes' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
