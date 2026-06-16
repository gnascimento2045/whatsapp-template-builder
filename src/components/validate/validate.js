var inputBody = document.getElementById('input-body');
window.buttons = [];

document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.quick-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var examples = {
        marketing: 'Ola! Como vai? Tudo certo com a EMPRESA X?',
        utility: 'Ola, {{1}}. Realizamos uma verificacao no seu acesso a EMPRESA X. Sua conta esta ativa e sem restricoes no momento.',
        financeiro: 'Ola {{1}}, segue o resumo financeiro. Periodo: {{2}} Total a Receber: {{3}} Total a Pagar: {{4}} Acesse o sistema.',
        feedback: 'Ola {{1}}, tudo bem? Gostaria de saber como tem sido sua experiencia com a EMPRESA X ate o momento.'
      };
      inputBody.value = examples[btn.dataset.example] || '';
      document.getElementById('input-header').value = '';
      document.getElementById('input-footer').value = '';
      window.buttons = [];
      renderButtonsConfig();
      refreshVariableSamples();
      updatePreview();
      validate();
    });
  });

  inputBody.addEventListener('input', function(){
    refreshVariableSamples();
    updatePreview();
    clearTimeout(window._valTimer);
    window._valTimer = setTimeout(validate, 500);
  });

  inputBody.dispatchEvent(new Event('input'));
});

function addVariable(){
  var ta = inputBody;
  var text = ta.value;
  var maxN = (text.match(/\{\{(\d+)\}\}/g) || [])
    .map(function(m){ return parseInt(m.match(/\d+/)[0], 10); })
    .reduce(function(a,b){ return Math.max(a,b); }, 0);
  var nextVar = '{{' + (maxN + 1) + '}}';
  var start = ta.selectionStart;
  var end = ta.selectionEnd;
  ta.value = text.slice(0, start) + nextVar + text.slice(end);
  ta.selectionStart = ta.selectionEnd = start + nextVar.length;
  ta.focus();
  refreshVariableSamples();
  clearTimeout(window._valTimer);
  window._valTimer = setTimeout(validate, 500);
}

function refreshVariableSamples(){
  var text = inputBody.value;
  var vars = text.match(/\{\{(\d+)\}\}/g);
  var container = document.getElementById('variable-samples');
  if (!vars) { container.style.display = 'none'; return; }

  var nums = [...new Set(vars.map(function(v){ return parseInt(v.match(/\d+/)[0], 10); }))].sort(function(a,b){ return a-b; });
  var existing = {};
  container.querySelectorAll('input').forEach(function(inp){ existing[inp.dataset.var] = inp.value; });

  var html = '<div class="text-xs font-semibold text-[#667781] uppercase tracking-wider mb-2">Valores de exemplo</div>';
  nums.forEach(function(n){
    var key = 'var_'+n;
    var val = existing[key] || '';
    html += '<div class="flex items-center gap-2 mb-1.5">';
    html += '<span class="mono text-xs text-[#00a884] font-semibold min-w-[32px]">{'+'{'+n+'}}</span>';
    html += '<input type="text" id="var-'+n+'" data-var="var_'+n+'" value="'+val.replace(/"/g,'&quot;')+'" placeholder="Ex: nome, data, valor..." class="flex-1 text-xs py-1.5" oninput="updatePreview()">';
    html += '</div>';
  });
  container.innerHTML = html;
  container.style.display = 'block';
}

function getFilledText(){
  var text = inputBody.value;
  var vars = text.match(/\{\{(\d+)\}\}/g);
  if (!vars) return { raw: text, filled: text, hasAllSamples: true };
  var nums = [...new Set(vars.map(function(v){ return parseInt(v.match(/\d+/)[0], 10); }))];
  var hasAllSamples = true;
  nums.forEach(function(n){
    var inp = document.getElementById('var-'+n);
    var val = inp ? inp.value.trim() : '';
    if (!val) hasAllSamples = false;
    else text = text.replace(new RegExp('\\{\\{'+n+'\\}\\}', 'g'), val);
  });
  return { raw: inputBody.value, filled: text, hasAllSamples: hasAllSamples };
}

function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function normalize(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }

function findMatches(text, patterns){
  var norm = normalize(text);
  var results = [];
  for (var p of patterns){
    var cleaned = normalize(p);
    var words = cleaned.split(/\s+/).filter(function(w){ return w.length>0; });
    if (!words.length) continue;
    var escaped = words.map(function(w){ return escapeRegex(w); });
    var regex;
    if (words.length === 1) regex = new RegExp('\\b'+escaped[0]+'\\b','i');
    else {
      var joined = escaped.map(function(w,i){ return i===0 ? '\\b'+w+'\\b' : '(?:\\s+[^\\s]+)*?\\s+\\b'+w+'\\b'; }).join('');
      regex = new RegExp(joined,'i');
    }
    if (regex.test(norm)) results.push(p);
  }
  return results;
}

function detectMarketing(text){
  var found = [];
  for (var key in PATTERNS.marketing){
    var matches = findMatches(text, PATTERNS.marketing[key].patterns);
    if (matches.length) found.push({ category:key, label:PATTERNS.marketing[key].label, weight:PATTERNS.marketing[key].weight, matches:matches });
  }
  return found;
}

function detectUtility(text){
  var found = [];
  for (var key in PATTERNS.utility){
    var matches = findMatches(text, PATTERNS.utility[key].patterns);
    if (matches.length) found.push({ category:key, label:PATTERNS.utility[key].label, weight:PATTERNS.utility[key].weight, matches:matches });
  }
  return found;
}

function hasForbidden(text){ return findMatches(text, PATTERNS.forbidden_in_utility.patterns); }
function hasConcreteData(text){ return [/r?\$[\s\d.,]+/i,/valor/i,/\d{1,2}\/\d{1,4}/,/data/i,/saldo/i,/total/i,/vencimento/i,/validade/i].some(function(r){ return r.test(text); }); }

function hasFeedbackWithoutOrder(text, marketing, utility){
  var hasGeneric = marketing.some(function(m){ return m.category === 'generic_feedback'; });
  if (!hasGeneric) return false;
  var hasOrderRef = utility.some(function(u){ return u.category === 'order_reference' || u.category === 'feedback_with_order' || u.category === 'transaction_ref'; });
  var concrete = hasConcreteData(text);
  return !hasOrderRef && !concrete;
}

function checkOpenQ(text){
  var norm = normalize(text);
  return [/como vai/i,/tudo bem/i,/tudo certo/i,/como tem sido/i,/o que achou/i,/gostaria de saber/i,/me conta/i,/\?+\s*$/m].filter(function(r){ return r.test(text); }).map(function(r){ return r.source; });
}

function calculateScore(text, strict){
  var marketing = detectMarketing(text);
  var utility = detectUtility(text);
  var forbidden = hasForbidden(text);
  var openQ = checkOpenQ(text);
  var concrete = hasConcreteData(text);
  var feedbackGeneric = hasFeedbackWithoutOrder(text, marketing, utility);

  var uPoints = 0, mPoints = 0, deduc = 0;
  utility.forEach(function(u){ uPoints += u.weight * Math.min(u.matches.length, 3); });
  marketing.forEach(function(m){ mPoints += m.weight * Math.min(m.matches.length, 3); });
  if (concrete) uPoints += 15;

  if (strict){
    if (forbidden.length) deduc += 40;
    if (openQ.length) deduc += 20;
    if (feedbackGeneric) deduc += 30;
  }

  var hasPromo = marketing.some(function(m){ return m.category==='promotional'||m.category==='upsell'||m.category==='urgency'; });
  var hasReengagement = marketing.some(function(m){ return m.category==='reengagement'; });

  var score, category, confidence;

  if (strict){
    score = Math.max(0, Math.min(100, uPoints - mPoints - deduc));
    if (score >= 60){ category='UTILITY'; confidence=score>=80?'alta':'media'; }
    else if (score >= 30){
      if (forbidden.length || mPoints > uPoints || feedbackGeneric){ category='MARKETING'; confidence='media'; }
      else { category='UTILITY_FRACO'; confidence='baixa'; }
    } else { category='MARKETING'; confidence='alta'; }
  } else {
    if (hasPromo || hasReengagement){
      category = 'MARKETING'; confidence = 'alta';
      score = Math.max(0, Math.min(30, uPoints));
    } else if (feedbackGeneric && uPoints < 20){
      category = 'UTILITY_FRACO'; confidence = 'baixa';
      score = Math.max(20, Math.min(45, uPoints + 25));
    } else {
      category = 'UTILITY';
      confidence = utility.length>0||concrete ? 'alta' : openQ.length ? 'media' : 'media';
      score = Math.max(35, Math.min(100, uPoints + 40));
    }
  }

  return { score:score, category:category, confidence:confidence, marketing:marketing, utility:utility, forbidden:forbidden, openQ:openQ, concrete:concrete, feedbackGeneric:feedbackGeneric, uPoints:uPoints, mPoints:mPoints, deduction:deduc, mode:strict?'strict':'lenient' };
}

function generateSuggestions(text){
  var s = [];
  var norm = normalize(text);
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

function validateTemplate(text, company, strict){
  var sc = calculateScore(text, strict);
  var suggestions = generateSuggestions(text);
  return Object.assign({}, sc, { text:text, suggestions:suggestions });
}

function jaccardSimilarity(a, b){
  var setA = new Set(a.toLowerCase().split(/\s+/).filter(function(w){ return w.length>0; }));
  var setB = new Set(b.toLowerCase().split(/\s+/).filter(function(w){ return w.length>0; }));
  var intersection = 0, union = 0;
  setA.forEach(function(w){ if(setB.has(w)) intersection++; });
  setA.forEach(function(w){ union++; });
  setB.forEach(function(w){ if(!setA.has(w)) union++; });
  return union === 0 ? 0 : intersection / union;
}

function validate(){
  var raw = inputBody.value.trim();
  var strict = document.getElementById('input-mode').value === 'strict';
  var area = document.getElementById('result-area');

  if (!raw) { area.innerHTML = ''; return; }

  var fi = getFilledText();
  var text = fi.hasAllSamples ? fi.filled : raw;
  var r = validateTemplate(text, 'EMPRESA X', strict);
  var catClass = r.category === 'UTILITY' ? 'utility' : r.category === 'MARKETING' ? 'marketing' : 'weak';
  var catLabel = r.category === 'UTILITY' ? 'Utilidade' : r.category === 'MARKETING' ? 'Marketing' : 'Utilidade - Risco';
  var barClass = r.score >= 60 ? 'green' : r.score >= 30 ? 'amber' : 'red';

  var structIssues = [];
  var varMatch = raw.match(/\{\{(\d+)\}\}/g);
  if (varMatch){
    if (/^\{\{/.test(raw.trim())) structIssues.push('Template comeca com variavel - a Meta pode rejeitar. Adicione texto fixo antes.');
    var lastVar = raw.lastIndexOf('{{');
    var afterLast = raw.slice(lastVar).replace(/\{\{(\d+)\}\}/, '').trim();
    if (!afterLast || /^[.\s]*$/.test(afterLast)) structIssues.push('Template termina com variavel - pode gerar mensagem "incompleta". Adicione texto fixo apos.');
    if (raw.includes('{{texto}}')||raw.includes('{{valor}}')||raw.includes('{{data}}')||raw.includes('{{numero}}'))
      structIssues.push('Use {{1}}, {{2}}... em vez de {{texto}}/{{valor}} - variaveis nomeadas podem causar rejeicao.');
  }

  var modeLabel = r.mode === 'strict' ? 'Rigoroso' : 'Leniente';
  var html = '<div class="result-card">';
  html += '<div class="result-header '+catClass+'">';
  html += '<span class="font-bold text-sm">'+catLabel+'</span>';
  html += '<span class="flex gap-2 items-center"><span class="text-[10px] text-[#8696a0]">'+modeLabel+'</span><span class="result-badge '+catClass+'">'+r.confidence+'</span></span>';
  html += '</div><div class="result-body">';

  if (structIssues.length){
    html += '<div class="section-label">Estrutura das variaveis</div>';
    structIssues.forEach(function(s){
      html += '<div class="suggestion-item"><span class="num" style="background:#fde8e8;color:#ef5350;">!</span><span style="color:#ef5350;font-size:12px;">'+s+'</span></div>';
    });
  }

  if (fi.raw !== fi.filled){
    html += '<div class="section-label" style="margin-top:10px;">Preview com valores</div>';
    html += '<div class="template-output text-xs">'+fi.filled+'</div>';
  }

  html += '<div class="score-bar-wrap">';
  html += '<div class="score-bar-label"><span>Score Utility</span><span class="score-num">'+r.score+'/100</span></div>';
  html += '<div class="score-bar-track"><div class="score-bar-fill '+barClass+'" style="width:'+r.score+'%"></div></div>';
  html += '</div>';

  if (r.marketing.length){
    html += '<div class="section-label">Indicadores de Marketing</div><div class="flex flex-wrap gap-1.5">';
    r.marketing.forEach(function(m){ html += '<span class="pill pill-red">'+m.label+'</span>'; });
    html += '</div>';
  }

  if (r.utility.length){
    html += '<div class="section-label" style="margin-top:10px;">Indicadores de Utility</div><div class="flex flex-wrap gap-1.5">';
    r.utility.forEach(function(u){ html += '<span class="pill pill-green">'+u.label+'</span>'; });
    html += '</div>';
  }

  if (r.forbidden.length){
    html += '<div class="section-label" style="margin-top:10px;">Palavras proibidas em Utility</div><div class="flex flex-wrap gap-1.5">';
    r.forbidden.forEach(function(f){ html += '<span class="pill pill-red">'+f+'</span>'; });
    html += '</div>';
  }

  if (r.openQ.length){
    html += '<div class="section-label" style="margin-top:10px;">Perguntas abertas</div>';
    r.openQ.forEach(function(q){ html += '<div class="text-xs text-[#ef5350] mb-0.5">"'+q+'"</div>'; });
  }

  if (r.feedbackGeneric){
    html += '<div class="section-label" style="margin-top:10px;color:#ffa000;">Feedback generico sem referencia a pedido</div>';
    html += '<div class="text-xs text-[#ffa000] mb-1">Meta: "A generic survey will not be approved as utility."</div>';
    html += '<div class="text-xs text-[#8696a0]">Adicione uma referencia ao pedido: "sobre o pedido {{numero}}"</div>';
  }

  if (!r.concrete){
    html += '<div class="section-label" style="margin-top:10px;color:#ffa000;">Sem dado concreto (valor, data, status) - essencial para Utility</div>';
  }

  if (r.suggestions && r.suggestions.length){
    html += '<div class="section-label" style="margin-top:14px;">Sugestoes de melhoria</div>';
    r.suggestions.forEach(function(s,i){ html += '<div class="suggestion-item"><span class="num">'+(i+1)+'</span><span>'+s+'</span></div>'; });
  }

  html += '<div class="section-label" style="margin-top:14px;">Salvar na memoria</div>';
  html += '<div class="flex gap-2">';
  html += '<button class="approve-btn utility" onclick="addToMemory(\''+raw.replace(/'/g,"\\'")+'\',\'UTILITY\','+r.score+',\''+r.mode+'\')">APROVADO COMO UTILITY</button>';
  html += '<button class="approve-btn marketing" onclick="addToMemory(\''+raw.replace(/'/g,"\\'")+'\',\'MARKETING\','+r.score+',\''+r.mode+'\')">APROVADO COMO MARKETING</button>';
  html += '</div>';
  html += '</div></div>';
  area.innerHTML = html;

  var simTotal = jaccardSimilarity(raw, (window.MEMORY||[]).map(function(e){ return e.body; }).join(' '));
  if (simTotal > 0.2 && window.MEMORY.length > 0){
    var similar = window.MEMORY.filter(function(t){ return jaccardSimilarity(raw, t.body) > 0.3; });
    if (similar.length){
      var body = document.querySelector('.result-body');
      if (body){
        var badges = similar.map(function(e){ return '<span class="pill pill-green" style="margin:2px;">similar a: '+e.category+'</span>'; }).join('');
        body.insertAdjacentHTML('afterbegin', '<div style="margin-bottom:10px;padding:6px 10px;background:#e8f9f2;border:1px solid #b8e6d6;border-radius:6px;font-size:11px;color:#00a884;">'+similar.length+' template(s) similar(es) encontrado(s) na memoria '+badges+'</div>');
      }
    }
  }
}

function addButton(){
  window.buttons.push({ type:'URL', text:'', value:'' });
  renderButtonsConfig();
  updatePreview();
}

function removeButton(index){
  window.buttons.splice(index, 1);
  renderButtonsConfig();
  updatePreview();
}

function renderButtonsConfig(){
  var container = document.getElementById('buttons-config');
  if (!container) return;
  if (!window.buttons.length){ container.innerHTML = ''; return; }
  var html = '';
  window.buttons.forEach(function(btn, i){
    html += '<div class="flex items-center gap-2 p-2 bg-[#f7f8fa] rounded border border-[#e9edef]">';
    html += '<select class="w-auto text-xs py-1 px-1.5" onchange="updateButtonType('+i+',this.value)">';
    html += '<option value="URL"'+(btn.type==='URL'?' selected':'')+'>URL</option>';
    html += '<option value="PHONE_NUMBER"'+(btn.type==='PHONE_NUMBER'?' selected':'')+'>Telefone</option>';
    html += '<option value="QUICK_REPLY"'+(btn.type==='QUICK_REPLY'?' selected':'')+'>Resposta rapida</option>';
    html += '<option value="COPY_CODE"'+(btn.type==='COPY_CODE'?' selected':'')+'>Copiar codigo</option>';
    html += '</select>';
    html += '<input type="text" class="flex-1 text-xs py-1" placeholder="Texto do botao" value="'+btn.text.replace(/"/g,'&quot;')+'" oninput="updateButtonText('+i+',this.value)">';
    if (btn.type !== 'QUICK_REPLY'){
      html += '<input type="text" class="flex-1 text-xs py-1" placeholder="'+(btn.type==='URL'?'https://...':btn.type==='PHONE_NUMBER'?'+55...':'Codigo...')+'" value="'+(btn.value||'').replace(/"/g,'&quot;')+'" oninput="updateButtonValue('+i+',this.value)">';
    }
    html += '<button class="text-xs text-[#ef5350] hover:underline px-1" onclick="removeButton('+i+')">X</button>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function updateButtonType(index, type){
  window.buttons[index].type = type;
  if (type === 'QUICK_REPLY') window.buttons[index].value = '';
  renderButtonsConfig();
  updatePreview();
}

function updateButtonText(index, text){
  window.buttons[index].text = text;
  updatePreview();
}

function updateButtonValue(index, value){
  window.buttons[index].value = value;
  updatePreview();
}
