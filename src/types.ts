export type Gender = 'male' | 'female' | 'other';
export type AreaType = 'rural' | 'urban';
export type SocialCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
export type EmploymentType =
  | 'farmer'
  | 'student'
  | 'self_employed'
  | 'unemployed'
  | 'salaried'
  | 'daily_wage'
  | 'senior_citizen'
  | 'artisan_craftsperson'
  | 'street_vendor'
  | 'women_entrepreneur'
  | 'other';

export type SectorInterest =
  | 'agriculture'
  | 'education'
  | 'healthcare'
  | 'housing'
  | 'business_loans'
  | 'women_child'
  | 'social_welfare'
  | 'skills_employment';

export interface UserProfile {
  // Step 1: Basic Info
  age: number | '';
  gender: Gender | '';
  state: string;
  district: string;
  area: AreaType;

  // Step 2: Socio-Economic Profile
  employment: EmploymentType | '';
  annualIncome: number | '';
  category: SocialCategory | '';
  hasDisability: boolean;
  disabilityPercentage?: number;
  isMinority: boolean;
  maritalStatus: 'unmarried' | 'married' | 'widowed' | 'divorced' | '';

  // Step 3: Specific Needs & Assets
  isBplOrRationCard: boolean;
  hasAgriculturalLand: boolean;
  landHoldingAcres: number | '';
  isStudent: boolean;
  educationLevel?: string;
  selectedSectors: SectorInterest[];

  // Step 4: Priorities
  matchPriority: 'all' | 'financial_grant' | 'healthcare' | 'loans_subsidies' | 'education' | 'pension';
}

export interface Scheme {
  id: string;
  title: string;
  shortTitle?: string;
  ministry: string;
  level: 'Central' | 'State' | 'Centrally Sponsored';
  stateSpecific?: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  benefitAmount: string;
  benefitType:
    | 'Direct Benefit Transfer'
    | 'Financial Subsidy'
    | 'Loan at Low Interest'
    | 'Health Insurance'
    | 'Scholarship'
    | 'Free Training & Tools'
    | 'Social Security / Pension'
    | 'Housing Grant';
  tags: string[];
  eligibilitySummary: string[];
  eligibilityCriteria: {
    minAge?: number;
    maxAge?: number;
    genderAllowed?: Gender[];
    allowedStates?: string[];
    allowedEmployments?: EmploymentType[];
    maxAnnualIncome?: number;
    categoriesAllowed?: SocialCategory[];
    requiresBpl?: boolean;
    requiresAgriculturalLand?: boolean;
    disabilityOnly?: boolean;
    minorityOnly?: boolean;
    studentOnly?: boolean;
    ruralOnly?: boolean;
    womenOnly?: boolean;
    seniorOnly?: boolean;
  };
  documentsRequired: string[];
  applicationProcessSteps: string[];
  officialPortalUrl: string;
  helplineNumber: string;
  isPopular?: boolean;
  
  // Computed on match
  matchScore?: number;
  isEligible?: boolean;
  matchReasons?: string[];
  unmetReasons?: string[];
}

export interface ApplicationTimelineItem {
  stage: string;
  date: string;
  note: string;
  completed: boolean;
  current?: boolean;
}

export interface ApplicationRecord {
  id: string;
  applicationNumber: string; // e.g. GS-2026-MH-84920
  schemeId: string;
  schemeTitle: string;
  schemeMinistry: string;
  applicantName: string;
  applicantFatherOrSpouseName: string;
  aadhaarLast4: string;
  phone: string;
  email: string;
  state: string;
  district: string;
  pinCode: string;
  bankAccountLast4: string;
  ifscCode: string;
  benefitAmount: string;
  status:
    | 'Submitted'
    | 'Document Verification'
    | 'Field Verification'
    | 'Sanctioned & Approved'
    | 'Benefit Disbursed'
    | 'Under Review';
  submittedAt: string;
  estimatedDisbursement: string;
  uploadedDocuments: {
    name: string;
    type: string;
    fileSize: string;
    verified: boolean;
  }[];
  timeline: ApplicationTimelineItem[];
}

export interface DistrictMap {
  [stateName: string]: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedSchemes?: Scheme[];
  quickReplies?: string[];
}
