import { Scheme, UserProfile } from '../types';

export function evaluateSchemeEligibility(scheme: Scheme, profile: Partial<UserProfile>): {
  isEligible: boolean;
  score: number;
  matchReasons: string[];
  unmetReasons: string[];
} {
  const matchReasons: string[] = [];
  const unmetReasons: string[] = [];
  let score = 50; // base score

  const age = Number(profile.age) || 0;
  const gender = profile.gender;
  const state = profile.state;
  const employment = profile.employment;
  const annualIncome = Number(profile.annualIncome) || 0;
  const category = profile.category;
  const hasDisability = profile.hasDisability;
  const isBpl = profile.isBplOrRationCard;
  const hasLand = profile.hasAgriculturalLand;

  const crit = scheme.eligibilityCriteria;

  // 1. Age check
  if (crit.minAge !== undefined) {
    if (age >= crit.minAge) {
      matchReasons.push(`Age ${age} meets minimum age requirement of ${crit.minAge} years`);
      score += 10;
    } else if (age > 0) {
      unmetReasons.push(`Requires minimum age of ${crit.minAge} (You entered ${age})`);
      score -= 30;
    }
  }

  if (crit.maxAge !== undefined) {
    if (age > 0 && age <= crit.maxAge) {
      matchReasons.push(`Age ${age} is within upper limit of ${crit.maxAge} years`);
      score += 10;
    } else if (age > crit.maxAge) {
      unmetReasons.push(`Exceeds maximum age limit of ${crit.maxAge} years`);
      score -= 30;
    }
  }

  // 2. Gender check
  if (crit.genderAllowed && crit.genderAllowed.length > 0) {
    if (gender && crit.genderAllowed.includes(gender)) {
      matchReasons.push(`Gender requirement matched (${gender.toUpperCase()})`);
      score += 15;
    } else if (gender) {
      unmetReasons.push(`Restricted to ${crit.genderAllowed.join(', ')} applicants`);
      score -= 40;
    }
  }

  // 3. State check
  if (crit.allowedStates && crit.allowedStates.length > 0) {
    if (state && crit.allowedStates.includes(state)) {
      matchReasons.push(`State domicile matched (${state.replace('_', ' ').toUpperCase()})`);
      score += 20;
    } else if (state) {
      unmetReasons.push(`Specific to state of ${crit.allowedStates.join(', ').replace('_', ' ').toUpperCase()}`);
      score -= 50;
    }
  }

  // 4. Employment / Occupation check
  if (crit.allowedEmployments && crit.allowedEmployments.length > 0) {
    if (employment && crit.allowedEmployments.includes(employment)) {
      matchReasons.push(`Occupation matches eligible category (${employment.replace('_', ' ')})`);
      score += 15;
    } else if (employment) {
      unmetReasons.push(`Designed for occupations: ${crit.allowedEmployments.map(e => e.replace('_', ' ')).join(', ')}`);
      score -= 20;
    }
  }

  // 5. Income check
  if (crit.maxAnnualIncome !== undefined) {
    if (annualIncome > 0 && annualIncome <= crit.maxAnnualIncome) {
      matchReasons.push(`Annual income ₹${annualIncome.toLocaleString('en-IN')} is within ceiling of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}`);
      score += 15;
    } else if (annualIncome > crit.maxAnnualIncome) {
      unmetReasons.push(`Annual income ₹${annualIncome.toLocaleString('en-IN')} exceeds limit of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}`);
      score -= 35;
    }
  }

  // 6. Category check
  if (crit.categoriesAllowed && crit.categoriesAllowed.length > 0) {
    if (category && crit.categoriesAllowed.includes(category)) {
      matchReasons.push(`Social category ${category} is eligible`);
      score += 10;
    } else if (category) {
      unmetReasons.push(`Targeted towards: ${crit.categoriesAllowed.join(', ')} categories`);
      score -= 20;
    }
  }

  // 7. BPL check
  if (crit.requiresBpl) {
    if (isBpl) {
      matchReasons.push('BPL / Ration card requirement satisfied');
      score += 20;
    } else {
      unmetReasons.push('Requires BPL / Priority Ration Card status');
      score -= 15;
    }
  }

  // 8. Agricultural land check
  if (crit.requiresAgriculturalLand) {
    if (hasLand) {
      matchReasons.push('Agricultural landholding verified');
      score += 20;
    } else {
      unmetReasons.push('Requires cultivable agricultural landholding');
      score -= 35;
    }
  }

  // 9. Disability check
  if (crit.disabilityOnly) {
    if (hasDisability) {
      matchReasons.push('Differently-abled / PwD criteria verified');
      score += 30;
    } else {
      unmetReasons.push('Applicable specifically to Persons with Disabilities');
      score -= 50;
    }
  }

  // 10. Rural requirement
  if (crit.ruralOnly) {
    if (profile.area === 'rural') {
      matchReasons.push('Rural residency criteria satisfied');
      score += 10;
    } else if (profile.area === 'urban') {
      unmetReasons.push('Program is dedicated to rural areas');
      score -= 20;
    }
  }

  // Normalize score between 0 and 100
  const finalScore = Math.max(10, Math.min(99, score));
  const isEligible = unmetReasons.length === 0;

  return {
    isEligible,
    score: isEligible ? Math.max(75, finalScore) : Math.min(65, finalScore),
    matchReasons: matchReasons.length > 0 ? matchReasons : ['General demographic eligibility satisfied'],
    unmetReasons,
  };
}

export function matchAllSchemes(schemes: Scheme[], profile: Partial<UserProfile>): Scheme[] {
  return schemes.map((s) => {
    const result = evaluateSchemeEligibility(s, profile);
    return {
      ...s,
      isEligible: result.isEligible,
      matchScore: result.score,
      matchReasons: result.matchReasons,
      unmetReasons: result.unmetReasons,
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
