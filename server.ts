import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ALL_SCHEMES } from './src/data/schemes.js';
import { DISTRICTS_MAP, STATES_AND_UTS } from './src/data/districts.js';
import { evaluateSchemeEligibility, matchAllSchemes } from './src/utils/matcher.js';
import { ApplicationRecord, UserProfile } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for submitted applications
const applicationsDatabase: ApplicationRecord[] = [
  {
    id: 'app_seed_1',
    applicationNumber: 'GS-2026-MH-84920',
    schemeId: 'pm-kisan',
    schemeTitle: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    schemeMinistry: 'Ministry of Agriculture and Farmers Welfare',
    applicantName: 'Ramesh Patil',
    applicantFatherOrSpouseName: 'Eknath Patil',
    aadhaarLast4: '4829',
    phone: '9823011234',
    email: 'ramesh.patil@example.com',
    state: 'maharashtra',
    district: 'pune',
    pinCode: '411038',
    bankAccountLast4: '3941',
    ifscCode: 'SBIN0001234',
    benefitAmount: '₹6,000 / year (Direct Bank Transfer)',
    status: 'Field Verification',
    submittedAt: '2026-08-15T10:30:00.000Z',
    estimatedDisbursement: '2026-08-28',
    uploadedDocuments: [
      { name: 'Aadhaar_Card_Front_Back.pdf', type: 'Aadhaar Card', fileSize: '1.2 MB', verified: true },
      { name: '7_12_Extract_Land_Record.pdf', type: 'Land Ownership Document', fileSize: '2.4 MB', verified: true },
      { name: 'SBI_Passbook_Scan.pdf', type: 'Bank Account Passbook', fileSize: '850 KB', verified: true },
    ],
    timeline: [
      { stage: 'Application Submitted Online', date: '15 Aug 2026, 04:00 PM', note: 'Application acknowledged with Reference ID GS-2026-MH-84920', completed: true },
      { stage: 'Aadhaar e-KYC & Document Verification', date: '16 Aug 2026, 11:15 AM', note: 'Identity and Bank Account IFSC validated with UIDAI & NPCI', completed: true },
      { stage: 'District Agricultural Officer Field Verification', date: '18 Aug 2026, 02:45 PM', note: 'Landholding survey number 42/1 verified under Talati report', completed: true, current: true },
      { stage: 'Sanction & Release Order', date: 'Pending', note: 'Awaiting final approval from State Nodal Officer', completed: false },
      { stage: 'DBT Installment Credit', date: 'Estimated 28 Aug 2026', note: '₹2,000 installment will be credited to A/C ending in 3941', completed: false },
    ],
  },
];

// Lazy initialize Gemini API client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), totalSchemes: ALL_SCHEMES.length });
});

// Get states
app.get('/api/states', (req, res) => {
  res.json(STATES_AND_UTS);
});

// Get districts for state
app.get('/api/districts/:state', (req, res) => {
  const state = req.params.state.toLowerCase();
  const districts = DISTRICTS_MAP[state] || DISTRICTS_MAP['default'];
  res.json({ state, districts });
});

// Get all schemes or search/filter
app.get('/api/schemes', (req, res) => {
  const { category, state, search, level, benefitType } = req.query;
  let filtered = [...ALL_SCHEMES];

  if (category && typeof category === 'string' && category !== 'All') {
    filtered = filtered.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (level && typeof level === 'string' && level !== 'All') {
    filtered = filtered.filter((s) => s.level.toLowerCase() === level.toLowerCase());
  }

  if (benefitType && typeof benefitType === 'string' && benefitType !== 'All') {
    filtered = filtered.filter((s) => s.benefitType.toLowerCase() === benefitType.toLowerCase());
  }

  if (state && typeof state === 'string' && state !== '') {
    filtered = filtered.filter((s) => !s.stateSpecific || s.stateSpecific === state);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json(filtered);
});

// Get scheme by id
app.get('/api/schemes/:id', (req, res) => {
  const scheme = ALL_SCHEMES.find((s) => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme not found' });
  }
  res.json(scheme);
});

// Match schemes against profile
app.post('/api/schemes/match', (req, res) => {
  const profile: Partial<UserProfile> = req.body || {};
  const matched = matchAllSchemes(ALL_SCHEMES, profile);
  
  const eligibleCount = matched.filter((s) => s.isEligible).length;
  const topCategories = Array.from(new Set(matched.slice(0, 5).map((s) => s.category)));

  res.json({
    totalMatched: matched.length,
    eligibleCount,
    topCategories,
    schemes: matched,
  });
});

// Submit Scheme Application
app.post('/api/applications', (req, res) => {
  try {
    const body = req.body;
    if (!body.schemeId || !body.applicantName || !body.phone) {
      return res.status(400).json({ error: 'Missing required applicant details' });
    }

    const scheme = ALL_SCHEMES.find((s) => s.id === body.schemeId);
    if (!scheme) {
      return res.status(404).json({ error: 'Invalid scheme ID' });
    }

    const stateCode = (body.state || 'IN').substring(0, 2).toUpperCase();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const appNumber = `GS-2026-${stateCode}-${randomSuffix}`;

    const newApp: ApplicationRecord = {
      id: `app_${Date.now()}`,
      applicationNumber: appNumber,
      schemeId: scheme.id,
      schemeTitle: scheme.title,
      schemeMinistry: scheme.ministry,
      applicantName: body.applicantName,
      applicantFatherOrSpouseName: body.applicantFatherOrSpouseName || '',
      aadhaarLast4: body.aadhaarLast4 || 'XXXX',
      phone: body.phone,
      email: body.email || '',
      state: body.state || 'maharashtra',
      district: body.district || 'pune',
      pinCode: body.pinCode || '',
      bankAccountLast4: body.bankAccountLast4 || '1234',
      ifscCode: body.ifscCode || 'SBIN0001234',
      benefitAmount: scheme.benefitAmount,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      estimatedDisbursement: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      uploadedDocuments: body.documents || [
        { name: 'Aadhaar_Card_Proof.pdf', type: 'Aadhaar Identity Proof', fileSize: '1.4 MB', verified: true },
        { name: 'Bank_Passbook_Details.pdf', type: 'Bank Passbook / Cancelled Cheque', fileSize: '920 KB', verified: true },
        { name: 'Income_Certificate_2026.pdf', type: 'Income & Domicile Declaration', fileSize: '1.1 MB', verified: true },
      ],
      timeline: [
        {
          stage: 'Application Submitted Online',
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          note: `Application submitted successfully for ${scheme.shortTitle || scheme.title}. Reference ID: ${appNumber}`,
          completed: true,
          current: true,
        },
        {
          stage: 'Aadhaar e-KYC & Document Verification',
          date: 'Scheduled in 2 business days',
          note: 'Verification of identity and Aadhaar-seeded bank account',
          completed: false,
        },
        {
          stage: 'District Officer Inspection & Scrutiny',
          date: 'Scheduled in 5 business days',
          note: 'Scrutiny by District Nodal Officer / Taluk Implementation Committee',
          completed: false,
        },
        {
          stage: 'Sanction & Release Order',
          date: 'Pending',
          note: 'Official sanction order generation and fund allotment',
          completed: false,
        },
        {
          stage: 'Direct Benefit Transfer (DBT)',
          date: `Estimated ${new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          note: `Funds will be directly credited to your Aadhaar-linked bank account`,
          completed: false,
        },
      ],
    };

    applicationsDatabase.unshift(newApp);
    res.status(201).json(newApp);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// Get user applications
app.get('/api/applications', (req, res) => {
  res.json(applicationsDatabase);
});

// Track application by reference number
app.get('/api/applications/:refNumber', (req, res) => {
  const ref = req.params.refNumber.trim().toUpperCase();
  const found = applicationsDatabase.find((a) => a.applicationNumber.toUpperCase() === ref);
  if (!found) {
    return res.status(404).json({ error: `No application found with Reference Number "${ref}"` });
  }
  res.json(found);
});

// AI Scheme Advisor Chat using Gemini
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { message, profile, currentSchemeId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Rule-based high quality fallback when Gemini key is not configured
      const lowMsg = message.toLowerCase();
      let replyText = '';
      let suggested: any[] = [];

      if (lowMsg.includes('farmer') || lowMsg.includes('kisan') || lowMsg.includes('land') || lowMsg.includes('agri')) {
        replyText = 'Based on your interest in agricultural schemes, you can benefit from **PM-KISAN** (₹6,000/year direct cash transfer) and **Kisan Credit Card (KCC)** for low-interest crop loans. Ensure your land records (7/12 or RoR) are updated with your Aadhaar!';
        suggested = ALL_SCHEMES.filter((s) => s.id === 'pm-kisan' || s.id === 'mgnrega');
      } else if (lowMsg.includes('health') || lowMsg.includes('hospital') || lowMsg.includes('ayushman') || lowMsg.includes('medical') || lowMsg.includes('insurance')) {
        replyText = '**Ayushman Bharat PM-JAY** provides up to ₹5,00,000 cashless health insurance cover per family per year for secondary and tertiary hospital treatments. All senior citizens aged 70+ are universally covered regardless of income!';
        suggested = ALL_SCHEMES.filter((s) => s.id === 'pm-jay-ayushman' || s.id === 'pm-suraksha-bima-yojana');
      } else if (lowMsg.includes('women') || lowMsg.includes('girl') || lowMsg.includes('female') || lowMsg.includes('mother') || lowMsg.includes('ladki') || lowMsg.includes('gruha')) {
        replyText = 'For women empowerment and financial aid, top programs include **Mukhyamantri Majhi Ladki Bahin Yojana** (₹1,500/mo in MH), **Gruha Lakshmi** (₹2,000/mo in KA), **Sukanya Samriddhi Yojana** (8.2% tax-free savings for girls), and **PM Matru Vandana Yojana** (₹5,000 maternity aid).';
        suggested = ALL_SCHEMES.filter((s) => s.tags.includes('Women') || s.tags.includes('Girl Child') || s.id.includes('ladki') || s.id.includes('gruha'));
      } else if (lowMsg.includes('loan') || lowMsg.includes('business') || lowMsg.includes('startup') || lowMsg.includes('shop') || lowMsg.includes('mudra') || lowMsg.includes('vendor')) {
        replyText = 'For business growth and collateral-free credit, you can apply for **PM MUDRA Yojana** (loans up to ₹20 Lakh under Shishu, Kishore, and Tarun categories) or **PM SVANidhi** (₹10,000 - ₹50,000 working capital for vendors with 7% interest subsidy).';
        suggested = ALL_SCHEMES.filter((s) => s.id === 'pm-mudra-yojana' || s.id === 'pm-svanidhi' || s.id === 'pm-vishwakarma');
      } else if (lowMsg.includes('student') || lowMsg.includes('scholarship') || lowMsg.includes('college') || lowMsg.includes('education') || lowMsg.includes('school')) {
        replyText = 'Students from SC, ST, OBC, EWS, and minority categories can apply for the **Post-Matric Scholarship Scheme** on the National Scholarship Portal (NSP) for 100% tuition reimbursement and up to ₹13,500 annual maintenance allowance.';
        suggested = ALL_SCHEMES.filter((s) => s.id === 'post-matric-scholarship');
      } else {
        replyText = `Welcome to **GovScheme Assistant**! I can help you discover Central and State government welfare schemes, verify specific eligibility rules (such as income slabs, age limits, and land records), guide you through required documents, and track your submitted applications. Tell me your age, occupation, or state!`;
        suggested = ALL_SCHEMES.slice(0, 3);
      }

      return res.json({
        reply: replyText,
        suggestedSchemes: suggested,
      });
    }

    // Call Gemini with full context
    const profileSummary = profile
      ? `Applicant Profile: Age: ${profile.age || 'Not specified'}, Gender: ${profile.gender || 'Not specified'}, State: ${profile.state || 'Not specified'}, District: ${profile.district || 'Not specified'}, Occupation: ${profile.employment || 'Not specified'}, Income: ₹${profile.annualIncome || 'Not specified'}, Social Category: ${profile.category || 'Not specified'}, Differently-abled: ${profile.hasDisability ? 'Yes' : 'No'}, Has Agricultural Land: ${profile.hasAgriculturalLand ? 'Yes' : 'No'}.`
      : 'Applicant profile has not been completed yet.';

    const systemInstruction = `You are "GovScheme AI Advisor", an official, courteous, and highly knowledgeable Indian Government Schemes and Citizen Welfare consultant.
Your objective is to provide clear, actionable, and accurate advice on Indian Central and State government schemes (such as PM-KISAN, Ayushman Bharat PM-JAY, PMAY, PM Mudra Yojana, PM Vishwakarma, Sukanya Samriddhi, Atal Pension Yojana, Post-Matric Scholarships, State welfare schemes, etc.).

Key instructions:
1. Explain eligibility criteria in simple, jargon-free citizen-friendly terms.
2. Clearly list the mandatory documents required (e.g. Aadhaar Card, Income Certificate, Domicile, Land Records 7/12, Bank Passbook linked with Aadhaar).
3. If the user asks about a specific scheme, explain its key benefits, disbursement amount, and step-by-step application procedure.
4. Keep formatting clean with bold text and bullet points. Avoid unnecessary robotic preambles.
5. Context of user profile: ${profileSummary}`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = geminiResponse.text || 'I am ready to help you with government schemes and application guidance.';

    // Find relevant suggested schemes based on keywords
    const lowerReply = reply.toLowerCase();
    const suggestedSchemes = ALL_SCHEMES.filter(
      (s) => lowerReply.includes(s.shortTitle?.toLowerCase() || '') || lowerReply.includes(s.title.toLowerCase())
    ).slice(0, 3);

    res.json({
      reply,
      suggestedSchemes: suggestedSchemes.length > 0 ? suggestedSchemes : ALL_SCHEMES.slice(0, 2),
    });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
});

// -------------------------------------------------------------
// Vite middleware integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GovScheme server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
