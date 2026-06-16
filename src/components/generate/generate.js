function generateTemplates(context){
  var map = {
    opt_in: {
      label:"Gestao de aceitacao (opt-in)",
      templates:[
        { name:'gen_opt_in_1', body:'Ola, {{1}}.\nAgradecemos por confirmar seu consentimento.\nAgora, voce recebera notificacoes via WhatsApp.', reason:'Confirmacao de opt-in. Exemplo oficial Meta.' },
        { name:'gen_opt_out_1', body:'Ola, {{1}}.\nAgradecemos por confirmar sua preferencia de cancelamento.\nVoce nao recebera mais mensagens nossas no WhatsApp.', reason:'Confirmacao de opt-out. Exemplo oficial Meta.' }
      ]
    },
    cross_channel: {
      label:"Continuacao cross-channel",
      templates:[
        { name:'gen_cross_channel_1', body:'Ola, {{1}}.\nVejo que voce solicitou suporte por meio do nosso chat online.\nSou o assistente virtual do WhatsApp. Como posso ajudar?', reason:'Continuacao de conversa de outro canal. Exemplo oficial Meta.' },
        { name:'gen_cross_ticket_1', body:'Ola, {{1}}.\nEstamos dando continuidade ao seu contato sobre {{2}}.\nEncaminhamos seu caso para a proxima etapa.', reason:'Continuidade de ticket do usuario.' }
      ]
    },
    status_check: {
      label:"Verificacao de status",
      templates:[
        { name:'gen_status_check_1', body:'Ola, {{1}}.\nRealizamos uma verificacao no seu acesso a EMPRESA X.\nSua conta esta ativa e sem restricoes no momento.', reason:'Status de sistema: verificacao + resultado' },
        { name:'gen_access_status_1', body:'Ola, {{1}}.\nSeu acesso a EMPRESA X esta ativo e funcionando normalmente.\nAcesse sua conta para mais detalhes.', reason:'Status + acao clara. Zero conversa.' },
        { name:'gen_system_check_1', body:'Ola, {{1}}.\nRealizamos uma verificacao de rotina no seu acesso a EMPRESA X.\nNao identificamos nenhuma restricao ou problema.', reason:'Verificacao tecnica. Resultado objetivo.' }
      ]
    },
    onboarding: {
      label:"Onboarding",
      templates:[
        { name:'gen_onboarding_1', body:'Ola, {{1}}.\nSua conta na EMPRESA X esta ativa e pronta para uso.\nPara comecar, registre sua primeira conta no sistema.', reason:'Conta ativa + acao concreta (registrar).' },
        { name:'gen_getting_started_1', body:'Ola, {{1}}.\nSeu cadastro na EMPRESA X foi confirmado.\nAcesse o sistema para registrar suas primeiras informacoes.', reason:'Confirmacao de cadastro + proximo passo.' }
      ]
    },
    alert: {
      label:"Alerta / Notificacao",
      templates:[
        { name:'gen_alert_1', body:'Ola, {{1}}.\nSua conta na EMPRESA X esta sem movimentacao ha {{2}} dias.\nAcesse o sistema para manter seus registros atualizados.', reason:'Dado objetivo (dias sem movimento) + acao.' },
        { name:'gen_pending_action_1', body:'Ola, {{1}}.\nVoce possui {{2}} registro(s) pendente(s) na EMPRESA X.\nAcesse sua conta para revisar.', reason:'Dado concreto (pendencias) + acao.' }
      ]
    },
    confirmation: {
      label:"Confirmacao",
      templates:[
        { name:'gen_action_confirmed_1', body:'Ola, {{1}}.\nSua solicitacao na EMPRESA X foi processada com sucesso.\nAcesse sua conta para visualizar os detalhes.', reason:'Confirmacao de acao do usuario. Sem pergunta.' }
      ]
    }
  };
  return map[context] || null;
}

function generate(){
  var ctx = document.getElementById('gen-context').value;
  var area = document.getElementById('gen-result');
  var data = generateTemplates(ctx);
  if (!data) { area.innerHTML = '<div class="empty-state"><h3>Contexto invalido</h3></div>'; return; }

  var html = '<div class="bg-white rounded-xl shadow-sm border border-[#e9edef] p-4"><div class="text-xs font-semibold text-[#667781] uppercase tracking-wider mb-3">'+data.label+' - '+data.templates.length+' templates</div><div class="grid gap-3">';
  data.templates.forEach(function(t){
    html += '<div class="gen-card" onclick="previewGenerated(\''+t.body.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n')+'\')">';
    html += '<div class="template-name">'+t.name+'</div>';
    html += '<div class="template-output text-xs">'+t.body+'</div>';
    html += '<div class="text-xs text-[#8696a0]">'+t.reason+'</div>';
    html += '</div>';
  });
  html += '</div></div>';
  area.innerHTML = html;
}

function previewGenerated(body){
  inputBody.value = body;
  document.getElementById('input-header').value = '';
  document.getElementById('input-footer').value = '';
  window.buttons = [];
  renderButtonsConfig();
  document.querySelector('[data-tab="validate"]').click();
  refreshVariableSamples();
  updatePreview();
  validate();
}
