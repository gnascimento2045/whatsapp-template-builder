export function checkCharacterLimits(body, header, footer) {
  const issues = [];
  if (body && body.length > 1024) {
    issues.push(`Corpo excede 1024 caracteres (tem ${body.length})`);
  }
  if (header && header.length > 60) {
    issues.push(`Cabeçalho excede 60 caracteres (tem ${header.length})`);
  }
  if (footer && footer.length > 60) {
    issues.push(`Rodapé excede 60 caracteres (tem ${footer.length})`);
  }
  return issues;
}

export function checkVariableSyntax(text) {
  const issues = [];
  const varRegex = /\{\{(\d+|[a-z_]+)\}\}/g;
  const matches = [...text.matchAll(varRegex)];

  if (matches.length === 0) return issues;

  const names = matches.map(m => m[1]);

  const numericVars = names.filter(n => /^\d+$/.test(n)).map(Number);
  if (numericVars.length > 0) {
    const sorted = [...new Set(numericVars)].sort((a, b) => a - b);
    if (sorted.length > 0 && sorted[0] !== 1) {
      issues.push(`Variáveis numéricas devem começar em {{1}}, não {{${sorted[0]}}}`);
    }
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] !== sorted[i] + 1) {
        issues.push(`Sequência de variáveis quebrada: {{${sorted[i]}}} → {{${sorted[i+1]}}}`);
      }
    }
  }

  if (/\/\{\{/.test(text)) {
    issues.push('Variáveis adjacentes ou com espaçamento incorreto');
  }

  const startsWithVar = /^\{\{/.test(text.trim());
  const endsWithVar = /\}\}\s*$/.test(text.trim());
  if (startsWithVar) {
    issues.push('Corpo não pode começar com variável');
  }
  if (endsWithVar) {
    issues.push('Corpo não pode terminar com variável');
  }

  return issues;
}

export function checkButtonLimit(buttons, maxButtons = 3, maxChar = 25) {
  const issues = [];
  if (buttons && buttons.length > maxButtons) {
    issues.push(`Máximo de ${maxButtons} botões permitidos (tem ${buttons.length})`);
  }
  if (buttons) {
    for (const b of buttons) {
      if (b.text && b.text.length > maxChar) {
        issues.push(`Texto do botão "${b.text}" excede ${maxChar} caracteres`);
      }
    }
  }
  return issues;
}

export function checkTemplateName(name) {
  const issues = [];
  if (!name) return ['Nome do template é obrigatório'];
  if (name.length > 512) issues.push(`Nome excede 512 caracteres (tem ${name.length})`);
  if (!/^[a-z0-9_]+$/.test(name)) {
    issues.push('Nome deve conter apenas letras minúsculas, números e underlines');
  }
  return issues;
}

export function runAllStructuralChecks(body, options = {}) {
  const issues = [
    ...checkCharacterLimits(body, options.header, options.footer),
    ...checkVariableSyntax(body),
    ...checkButtonLimit(options.buttons || []),
    ...(options.name ? checkTemplateName(options.name) : [])
  ];
  return issues;
}
