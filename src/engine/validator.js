import { calculateUtilityScore, getCategoryLabel, getScoreBar } from './scorer.js';
import { detectMarketingIndicators, detectUtilityIndicators } from './patterns.js';
import { runAllStructuralChecks } from './rules.js';

function generateSuggestions(text) {
  const s = [];
  const norm = text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if (/como vai/.test(norm)||/tudo bem/.test(norm)||/tudo certo/.test(norm))
    s.push('Substitua "Como vai?" / "Tudo bem?" por uma declaracao objetiva de status.');
  if (/\?/.test(text))
    s.push('Remova perguntas abertas. Utility informa, nao pergunta.');
  if (!/r\$|valor|data|vencimento|status|ativo|acesso/.test(norm))
    s.push('Adicione um dado concreto: status da conta, data, valor ou acao especifica.');
  if (!/acesse|registre|consultar|para/.test(norm))
    s.push('Inclua uma acao clara: "Acesse sua conta", "Registre sua primeira conta".');
  if (!s.length) s.push('Template parece adequado. Verifique se referencia uma acao/transacao do usuario.');
  return s;
}

export function validateTemplate(text, options = {}) {
  const scoring = calculateUtilityScore(text, options.strict);
  const marketingIndicators = detectMarketingIndicators(text);
  const utilityIndicators = detectUtilityIndicators(text);
  const structuralIssues = runAllStructuralChecks(text, options);
  const suggestions = generateSuggestions(text);

  return {
    text,
    score: scoring.score,
    category: scoring.category,
    categoryLabel: getCategoryLabel(scoring.category),
    confidence: scoring.confidence,
    scoreBar: getScoreBar(scoring.score),
    details: scoring.details,
    structuralIssues,
    suggestions,
    timestamp: new Date().toISOString()
  };
}

export function formatValidationReport(result) {
  const lines = [];
  lines.push('═══════════════════════════════════════════');
  lines.push('  VALIDAÇÃO DE TEMPLATE WHATSAPP');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push(`  Categoria:        ${result.categoryLabel}`);
  lines.push(`  Confiança:        ${result.confidence}`);
  lines.push(`  Score Utility:    ${result.score}/100 ${result.scoreBar}`);
  lines.push('');

  if (result.details.marketingIndicators.length > 0) {
    lines.push('  ⚠️  Indicadores de Marketing:');
    for (const m of result.details.marketingIndicators) {
      lines.push(`     • ${m.label} (${m.matches.join(', ')})`);
    }
    lines.push('');
  }

  if (result.details.utilityIndicators.length > 0) {
    lines.push('  ✅ Indicadores de Utility:');
    for (const u of result.details.utilityIndicators) {
      lines.push(`     • ${u.label} (${u.matches.join(', ')})`);
    }
    lines.push('');
  }

  if (result.details.openQuestions.length > 0) {
    lines.push('  ❌ Perguntas abertas detectadas:');
    for (const q of result.details.openQuestions) {
      lines.push(`     • " ${q}"`);
    }
    lines.push('');
  }

  if (result.details.hasFeedbackGeneric) {
    lines.push('  ⚠️  Feedback generico sem referencia a pedido/transacao —');
    lines.push('     Meta: "A generic survey will not be approved as utility."');
    lines.push('     Adicione uma referencia ao pedido: "sobre o pedido {{numero}}"');
    lines.push('');
  }

  if (result.details.forbiddenMatches.length > 0) {
    lines.push('  🚫 Palavras proibidas em Utility:');
    for (const f of result.details.forbiddenMatches) {
      lines.push(`     • "${f}"`);
    }
    lines.push('');
  }

  if (result.structuralIssues.length > 0) {
    lines.push('  🔧 Problemas estruturais:');
    for (const s of result.structuralIssues) {
      lines.push(`     • ${s}`);
    }
    lines.push('');
  }

  if (!result.details.hasConcreteData) {
    lines.push('  ⚡ Sem dado concreto (valor, data, status) — essencial para Utility');
    lines.push('');
  }

  if (result.suggestions.length > 0) {
    lines.push('  💡 Sugestões de melhoria:');
    for (const s of result.suggestions) {
      lines.push(`     ${s}`);
    }
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════');
  return lines.join('\n');
}
