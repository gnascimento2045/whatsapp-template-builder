import { validateTemplate } from '../src/engine/validator.js';
import { runAllStructuralChecks, checkTemplateName } from '../src/engine/rules.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  OK ' + name);
  } catch (err) {
    failed++;
    console.log('  FAIL ' + name + ': ' + err.message);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

console.log('\nTestes do Validador\n');

test('Lenient: feedback conversacional generico = UTILITY_FRACO', () => {
  const r = validateTemplate('Ola Gabriel, tudo bem? Gostaria de saber como tem sido sua experiencia ate o momento. Como tem sido sua experiencia?');
  assert(r.category === 'UTILITY_FRACO', 'Esperava UTILITY_FRACO, recebeu ' + r.category);
  assert(r.details.hasFeedbackGeneric === true, 'Deveria detectar feedback generico');
});

test('Lenient: feedback survey COM pedido = UTILITY', () => {
  const r = validateTemplate('Entregamos seu pedido {{1}}. Se houver algum problema, entre em contato conosco.');
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
});

test('Lenient: template promocional = MARKETING', () => {
  const r = validateTemplate('Oferta exclusiva! Desconto de 50% no plano premium!');
  assert(r.category === 'MARKETING', 'Esperava MARKETING, recebeu ' + r.category);
});

test('Lenient: utility puro = UTILITY', () => {
  const r = validateTemplate('Ola, {{1}}. Seu acesso ao sistema esta ativo e funcionando normalmente. Acesse sua conta para visualizar seus registros.');
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
  assert(r.score >= 60, 'Score deveria ser >= 60, recebeu ' + r.score);
});

test('Lenient: opt-in = UTILITY', () => {
  const r = validateTemplate('Agradecemos por confirmar seu consentimento. Agora voce recebera notificacoes via WhatsApp.');
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
});

test('Lenient: cross-channel = UTILITY', () => {
  const r = validateTemplate('Ola! Voce solicitou suporte pelo nosso chat online. Como posso ajudar?');
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
});

test('Lenient: cross-channel nao marca como feedback generico', () => {
  const r = validateTemplate('Ola! Voce solicitou suporte pelo nosso chat online. Como posso ajudar?');
  assert(r.details.hasFeedbackGeneric === false, 'Nao deveria marcar como feedback generico');
});

test('Strict: feedback generico = MARKETING', () => {
  const r = validateTemplate('Ola Gabriel, tudo bem? Gostaria de saber como tem sido sua experiencia.', { strict: true });
  assert(r.category === 'MARKETING', 'Esperava MARKETING, recebeu ' + r.category);
});

test('Strict: feedback survey COM pedido = UTILITY', () => {
  const r = validateTemplate('Entregamos seu pedido {{1}}. Se houver algum problema, entre em contato conosco.', { strict: true });
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
});

test('Strict: utility puro = UTILITY', () => {
  const r = validateTemplate('Ola, {{1}}. Seu acesso ao sistema esta ativo e funcionando normalmente. Acesse sua conta para visualizar seus registros.', { strict: true });
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
  assert(r.score >= 60, 'Score deveria ser >= 60, recebeu ' + r.score);
});

test('Strict: opt-in = UTILITY', () => {
  const r = validateTemplate('Agradecemos por confirmar seu consentimento. Agora voce recebera notificacoes via WhatsApp.', { strict: true });
  assert(r.category === 'UTILITY', 'Esperava UTILITY, recebeu ' + r.category);
});

test('Detecta variavel comecando o corpo', () => {
  const issues = runAllStructuralChecks('{{1}}, sua conta esta ativa.', {});
  assert(issues.some(i => i.includes('não pode começar')), 'Deveria detectar variavel no inicio');
});

test('Detecta nome de template invalido', () => {
  const issues = checkTemplateName('Nome Com Espacos');
  assert(issues.length > 0, 'Deveria rejeitar nome com espacos e maiusculas');
});

test('Nome de template valido passa', () => {
  const issues = checkTemplateName('status_check_1');
  assert(issues.length === 0, 'Nao deveria ter issues, recebeu: ' + issues.join(', '));
});

console.log('\n' + passed + ' passaram, ' + failed + ' falharam\n');
process.exit(failed > 0 ? 1 : 0);
