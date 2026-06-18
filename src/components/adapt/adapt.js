var SYSTEM_PROMPT = 'Objetivo: adaptar a mensagem abaixo para TEMPLATE DE UTILIDADE do WhatsApp (Meta), removendo qualquer traco promocional e mantendo apenas comunicacao transacional (confirmar, atualizar, suspender ou alterar uma acao previamente iniciada pelo usuario).\n\n'
+ 'Mensagem original:\n\n'
+ 'Regras obrigatorias (siga a risca):\n'
+ '1) Categoria: Utility. Proibido vender, ofertar, sugerir upgrade, cupom, desconto, novidade, "saiba mais", prova social.\n'
+ '2) Contexto explicito de transacao: deixe claro qual acao do usuario esta sendo confirmada/atualizada (pedido, consulta, assinatura, pagamento, politica, acesso, ticket).\n'
+ '3) Tom: informativo, objetivo, sem emojis, sem caixa alta exagerada, sem linguagem promocional. Portugues do Brasil.\n'
+ '4) Estrutura do template: Header (opcional), Body (obrigatorio), Footer (opcional) e Botoes.\n'
+ '5) Limites recomendados: Cabecalho <= 60 caracteres, Rodape <= 60 caracteres, Corpo ate 4 linhas curtas. Texto claro e direto.\n'
+ '6) Variaveis: use {{1}}, {{2}}, {{3}}... onde houver dados dinâmicos (ex.: numero do pedido, data, horario, valor, link). Nada de placeholders fantasiosos.\n'
+ '7) Botoes: traga exatamente 3 rotulos objetivos alinhados ao fluxo transacional (ex.: Confirmar, Reagendar, Ver detalhes). Sem rotulos comerciais.\n'
+ '8) Nao inclua explicacoes, comentarios ou exemplos preenchidos. Entregue somente o conteudo final nas 5 variacoes.\n\n'
+ 'Saida obrigatoria: gere 5 variacoes independentes, exatamente neste formato e ordem (sem linhas extras):\n\n'
+ 'Variacao 1\n'
+ 'Cabecalho: texto ou deixe em branco\n'
+ 'Corpo: texto\n'
+ 'Rodape: texto ou deixe em branco\n'
+ 'Botoes: Botao 1 / Botao 2 / Botao 3\n\n'
+ 'Variacao 2\n'
+ 'Cabecalho: texto ou deixe em branco\n'
+ 'Corpo: texto\n'
+ 'Rodape: texto ou deixe em branco\n'
+ 'Botoes: Botao 1 / Botao 2 / Botao 3\n\n'
+ 'Variacao 3\n'
+ 'Cabecalho: texto ou deixe em branco\n'
+ 'Corpo: texto\n'
+ 'Rodape: texto ou deixe em branco\n'
+ 'Botoes: Botao 1 / Botao 2 / Botao 3\n\n'
+ 'Variacao 4\n'
+ 'Cabecalho: texto ou deixe em branco\n'
+ 'Corpo: texto\n'
+ 'Rodape: texto ou deixe em branco\n'
+ 'Botoes: Botao 1 / Botao 2 / Botao 3\n\n'
+ 'Variacao 5\n'
+ 'Cabecalho: texto ou deixe em branco\n'
+ 'Corpo: texto\n'
+ 'Rodape: texto ou deixe em branco\n'
+ 'Botoes: Botao 1 / Botao 2 / Botao 3';

function generateVariations() {
  var text = document.getElementById('adapt-input').value.trim();
  if (!text) {
    showToast('Digite a mensagem original primeiro');
    return;
  }

  var url = localStorage.getItem('mt_api_url');
  var model = localStorage.getItem('mt_api_model');
  var key = localStorage.getItem('mt_api_key');

  if (!url || !model || !key) {
    showToast('Configure URL, modelo e chave na aba Config');
    document.querySelector('[data-tab="config"]').click();
    return;
  }

  var container = document.getElementById('adapt-result');
  container.innerHTML = '<div class="adapt-empty"><svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><h3>Gerando variacoes...</h3><p class="mt-1">Aguardando resposta da IA</p></div>';
  container.style.display = 'block';

  fetch(url.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  })
  .then(function(resp) {
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();
  })
  .then(function(data) {
    var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) throw new Error('Resposta vazia da API');
    var variations = parseVariations(content);
    if (!variations || variations.length === 0) throw new Error('Nao foi possivel extrair as variacoes da resposta');
    renderVariations(variations);
  })
  .catch(function(err) {
    container.innerHTML = '<div class="adapt-empty"><h3>Erro ao gerar variacoes</h3><p class="mt-1" style="color:#ef5350;">' + err.message + '</p></div>';
    showToast('Erro ao consultar IA');
  });
}

function parseVariations(text) {
  var lines = text.split('\n');
  var variations = [];
  var current = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var varMatch = line.match(/^Variacao\s*(\d+)/i);
    if (varMatch) {
      if (current) variations.push(current);
      current = { index: parseInt(varMatch[1], 10), header: '', body: '', footer: '', buttons: [] };
      continue;
    }

    if (!current) continue;

    var hMatch = line.match(/^Cabecalho:\s*(.*)/i);
    if (hMatch) {
      current.header = hMatch[1].trim() === 'deixe em branco' ? '' : hMatch[1].trim();
      continue;
    }

    var bMatch = line.match(/^Corpo:\s*(.*)/i);
    if (bMatch) {
      current.body = bMatch[1].trim();
      continue;
    }

    var fMatch = line.match(/^Rodape:\s*(.*)/i);
    if (fMatch) {
      current.footer = fMatch[1].trim() === 'deixe em branco' ? '' : fMatch[1].trim();
      continue;
    }

    var btnMatch = line.match(/^Botoes:\s*(.*)/i);
    if (btnMatch) {
      var btns = btnMatch[1].split('/').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0 && s !== 'deixe em branco'; });
      current.buttons = btns;
      continue;
    }
  }

  if (current) variations.push(current);
  return variations;
}

function renderVariations(variations) {
  var container = document.getElementById('adapt-result');
  var html = '<div class="text-xs font-semibold text-[#667781] uppercase tracking-wider mb-3">' + variations.length + ' variacoes geradas</div>';
  html += '<div class="grid gap-3">';

  variations.forEach(function(v, i) {
    html += '<div class="adapt-card">';
    html += '<div class="flex items-center justify-between mb-2">';
    html += '<span class="text-xs font-bold text-[#00a884]">Variacao ' + (i + 1) + '</span>';
    html += '</div>';

    if (v.header) {
      html += '<div class="adapt-field"><span class="adapt-field-label">Cabecalho</span><span class="adapt-field-value">' + escapeHtml(v.header) + '</span></div>';
    }

    html += '<div class="adapt-field"><span class="adapt-field-label">Corpo</span><span class="adapt-field-value">' + escapeHtml(v.body) + '</span></div>';

    if (v.footer) {
      html += '<div class="adapt-field"><span class="adapt-field-label">Rodape</span><span class="adapt-field-value">' + escapeHtml(v.footer) + '</span></div>';
    }

    if (v.buttons && v.buttons.length) {
      html += '<div class="adapt-field"><span class="adapt-field-label">Botoes</span><div class="adapt-buttons-row">';
      v.buttons.forEach(function(btn) {
        html += '<span class="adapt-btn-pill">' + escapeHtml(btn) + '</span>';
      });
      html += '</div></div>';
    }

    var bodyAttr = escapeHtml(v.body);
    var headerAttr = escapeHtml(v.header || '');
    var footerAttr = escapeHtml(v.footer || '');
    var buttonsAttr = escapeHtml(JSON.stringify(v.buttons));
    html += '<button class="adapt-load-btn" onclick="loadVariation(\'' + bodyAttr + '\',\'' + headerAttr + '\',\'' + footerAttr + '\',\'' + buttonsAttr + '\')">Carregar na validacao</button>';
    html += '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

function loadVariation(body, header, footer, buttonsJson) {
  body = unescapeHtml(body);
  header = unescapeHtml(header);
  footer = unescapeHtml(footer);
  var buttons = [];
  try { buttons = JSON.parse(unescapeHtml(buttonsJson)); } catch(e) {}

  document.getElementById('input-body').value = body;
  document.getElementById('input-header').value = header;
  document.getElementById('input-footer').value = footer;

  window.buttons = [];
  buttons.forEach(function(btnText) {
    window.buttons.push({ type: 'QUICK_REPLY', text: btnText, value: '' });
  });
  renderButtonsConfig();

  document.querySelector('[data-tab="validate"]').click();
  refreshVariableSamples();
  updatePreview();
  validate();
  showToast('Variacao carregada na validacao');
}
