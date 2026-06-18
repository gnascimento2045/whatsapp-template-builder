var SYSTEM_PROMPT = 'Objetivo: adaptar a mensagem abaixo para TEMPLATE DE UTILIDADE do WhatsApp (Meta), mantendo tom humano, cordial e informativo, sem carater promocional.\n\n'
+ 'Regras obrigatorias (siga a risca):\n'
+ '1) Categoria: Utility. Proibido conteudo promocional, vendas, ofertas, cupons, upsell ou qualquer linguagem comercial.\n'
+ '2) Iniciar sempre com: "Ola {{1}},"\n'
+ '3) Apos a saudacao, variar apenas expressoes simples e naturais como: "Tudo bem?", "Como vai?", "Tudo certo?", "Como voce esta?", sem usar frases como "Espero que esteja bem" ou similares.\n'
+ '4) Manter o sentido original: informar que o recurso solicitado anteriormente foi disponibilizado/providenciado e perguntar se ainda deseja continuar com o atendimento ou solicitacao.\n'
+ '5) Tom: natural, simpatico, direto e profissional. Sem emojis.\n'
+ '6) Estrutura com quebra de linha:\n'
+ '   Linha 1: saudacao (ex.: "Ola {{1}}, tudo bem?" ou "Ola {{1}}," seguido de "Tudo bem?" na mesma linha ou na linha seguinte)\n'
+ '   Linha em branco\n'
+ '   Mensagem principal informando a disponibilizacao do recurso\n'
+ '   Linha em branco\n'
+ '   Pergunta de continuidade\n'
+ '7) Nao adicionar informacoes novas, ofertas ou interpretacoes fora do contexto original.\n'
+ '8) Manter mensagens curtas e claras (estilo WhatsApp).\n'
+ '9) Entregar apenas as variacoes finais, sem explicacoes.\n\n'
+ 'Saida obrigatoria: gere 10 variacoes independentes seguindo exatamente as regras acima, neste formato:\n\n'
+ 'Variacao 1\n'
+ 'Corpo: Ola {{1}},\n'
+ 'Tudo bem?\n\n'
+ 'O recurso solicitado foi disponibilizado.\n\n'
+ 'Ainda deseja continuar com o atendimento?\n\n'
+ 'Variacao 2\n'
+ 'Corpo: ...\n\n'
+ '(e assim por diante ate Variacao 10)';

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
      temperature: 0.8,
      max_tokens: 4000
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
  var blocks = text.split(/\n(?=Variacao\s+\d)/i);
  var variations = [];

  for (var b = 0; b < blocks.length; b++) {
    var block = blocks[b].trim();
    if (!block) continue;

    var bodyMatch = block.match(/^Variacao\s+\d+\s*\nCorpo:\s*([\s\S]*)/i);
    if (bodyMatch) {
      variations.push({ body: bodyMatch[1].trim() });
    }
  }

  return variations;
}

function renderVariations(variations) {
  window._lastVariations = variations;
  var container = document.getElementById('adapt-result');
  var html = '<div class="text-xs font-semibold text-[#667781] uppercase tracking-wider mb-3">' + variations.length + ' variacoes geradas</div>';
  html += '<div class="grid gap-3">';

  variations.forEach(function(v, i) {
    var bodyHtml = v.body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

    html += '<div class="adapt-card">';
    html += '<div class="flex items-center justify-between mb-2">';
    html += '<span class="text-xs font-bold text-[#00a884]">Variacao ' + (i + 1) + '</span>';
    html += '</div>';

    html += '<div class="adapt-field"><span class="adapt-field-label">Mensagem</span><span class="adapt-field-value">' + bodyHtml + '</span></div>';

    html += '<button class="adapt-load-btn" onclick="loadVariationByIndex(' + i + ')">Carregar na validacao</button>';
    html += '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}

function loadVariationByIndex(index) {
  var v = window._lastVariations && window._lastVariations[index];
  if (!v) { showToast('Variacao nao encontrada'); return; }
  loadVariation(v.body);
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

function loadVariation(body) {
  body = unescapeHtml(body);
  document.getElementById('input-body').value = body;
  document.getElementById('input-header').value = '';
  document.getElementById('input-footer').value = '';
  window.buttons = [];
  renderButtonsConfig();

  document.querySelector('[data-tab="validate"]').click();
  refreshVariableSamples();
  updatePreview();
  validate();
  showToast('Variacao carregada na validacao');
}
