import {
  detectMarketingIndicators,
  detectUtilityIndicators,
  hasForbiddenInUtility,
  checkOpenQuestions,
  hasConcreteData
} from './patterns.js';

function hasFeedbackWithoutOrder(text, marketing, utility) {
  const hasGenericFeedback = marketing.some(m => m.category === 'generic_feedback');
  if (!hasGenericFeedback) return false;
  const hasOrderRef = utility.some(u => u.category === 'order_reference' || u.category === 'feedback_with_order' || u.category === 'transaction_ref');
  const hasConcrete = hasConcreteData(text);
  return !hasOrderRef && !hasConcrete;
}

export function calculateUtilityScore(text, strict = false) {
  const marketing = detectMarketingIndicators(text);
  const utility = detectUtilityIndicators(text);
  const forbidden = hasForbiddenInUtility(text);
  const openQuestions = checkOpenQuestions(text);
  const concreteData = hasConcreteData(text);
  const feedbackGeneric = hasFeedbackWithoutOrder(text, marketing, utility);

  let utilityPoints = 0;
  let marketingPoints = 0;
  let deductions = 0;

  for (const u of utility) {
    utilityPoints += u.weight * Math.min(u.count, 3);
  }

  if (concreteData) {
    utilityPoints += 15;
  }

  const hasPromo = marketing.some(m =>
    m.category === 'promotional' || m.category === 'upsell' || m.category === 'urgency'
  );
  const hasReengagement = marketing.some(m => m.category === 'reengagement');

  let rawScore;
  let category;
  let confidence;

  if (strict) {
    for (const m of marketing) {
      marketingPoints += m.weight * Math.min(m.count, 3);
    }
    if (forbidden.length > 0) deductions += 40;
    if (openQuestions.length > 0) deductions += 20;
    if (feedbackGeneric) deductions += 30;

    rawScore = Math.max(0, Math.min(100, utilityPoints - marketingPoints - deductions));

    if (rawScore >= 60) {
      category = 'UTILITY';
      confidence = rawScore >= 80 ? 'alta' : 'media';
    } else if (rawScore >= 30) {
      if (forbidden.length > 0 || marketingPoints > utilityPoints || feedbackGeneric) {
        category = 'MARKETING';
        confidence = 'media';
      } else {
        category = 'UTILITY_FRACO';
        confidence = 'baixa';
      }
    } else {
      category = 'MARKETING';
      confidence = 'alta';
    }
  } else {
    // Lenient mode: simula aprovacao inicial da Meta
    // So reprova se for promocional puro, upsell, urgencia ou reengajamento
    if (hasPromo || hasReengagement) {
      category = 'MARKETING';
      confidence = 'alta';
      rawScore = Math.max(0, Math.min(30, utilityPoints));
    } else if (feedbackGeneric && utilityPoints < 20) {
      // Generic feedback sem dados concretos nem referencia a pedido
      // Meta docs: "A general/generic survey will not be approved as utility"
      // Mas lenient simula aprovacao inicial inconsistente → UTILITY_FRACO
      category = 'UTILITY_FRACO';
      confidence = 'baixa';
      rawScore = Math.max(20, Math.min(45, utilityPoints + 25));
    } else {
      // Feedback, status check, onboarding, etc → Utility
      category = 'UTILITY';
      confidence = utility.length > 0 || concreteData ? 'alta' :
                   openQuestions.length ? 'media' : 'media';
      rawScore = Math.max(35, Math.min(100, utilityPoints + 40));
    }
  }

  return {
    score: rawScore,
    category,
    confidence,
    mode: strict ? 'strict' : 'lenient',
    details: {
      utilityPoints,
      marketingPoints,
      deductions,
      utilityIndicators: utility,
      marketingIndicators: marketing,
      forbiddenMatches: forbidden,
      openQuestions,
      hasConcreteData: concreteData,
      hasFeedbackGeneric: feedbackGeneric
    }
  };
}

export function getCategoryLabel(category) {
  const labels = {
    'UTILITY': 'Utilidade',
    'UTILITY_FRACO': 'Utilidade — Risco de reclassificação',
    'MARKETING': 'Marketing'
  };
  return labels[category] || category;
}

export function getScoreBar(score) {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}
