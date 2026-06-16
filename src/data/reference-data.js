window.REFERENCE = [
  { name:"payment_due_reminder", body:"Ola, {{texto}}, sua conta {{texto}} de {{valor}} vence em {{data}}. Pague agora. Ignore se ja pagou.", tag:"UTILITY", reason:"Valor + data + acao + opt-out. Template oficial Meta." },
  { name:"appointment_confirmation_1", body:"Ola, {{texto}}. Sua consulta para {{texto}} em {{data}} as {{texto}} esta confirmada.", tag:"UTILITY", reason:"Confirmacao com data/hora. Template oficial Meta." },
  { name:"account_balance_update", body:"Atualizacao diaria para conta final {{four_digit_number}}: saldo disponivel e {{amount}}.", tag:"UTILITY", reason:"Alerta de conta com saldo. Exemplo oficial Meta." },
  { name:"order_confirmed", body:"Agradecemos! O pedido {{order_number}} foi confirmado. Avisaremos quando seu pacote estiver a caminho.", tag:"UTILITY", reason:"Confirmacao de pedido. Exemplo oficial Meta." },
  { name:"order_tracking", body:"Seu pedido {{order_number}} esta a caminho. Codigo de rastreio: {{tracking_ID}}. Previsao: {{date}}.", tag:"UTILITY", reason:"Tracking + data. Exemplo oficial Meta." },
  { name:"feedback_with_order", body:"Entregamos seu pedido {{order_number}}. Se houver algum problema, entre em contato conosco.", tag:"UTILITY", reason:"Feedback survey com pedido especifico. Exemplo oficial Meta." },
  { name:"feedback_store_visit", body:"Avalie sua recente visita a nossa loja {{store}}. Seu feedback nos ajuda a melhorar.", tag:"UTILITY", reason:"Feedback com referencia a visita. Exemplo oficial Meta." },
  { name:"opt_in_confirmation", body:"Agradecemos por confirmar seu consentimento. Agora voce recebera notificacoes via WhatsApp.", tag:"UTILITY", reason:"Gestao de aceitacao opt-in. Exemplo oficial Meta." },
  { name:"opt_out_confirmation", body:"Agradecemos por confirmar sua preferencia de cancelamento. Voce nao recebera mais mensagens no WhatsApp.", tag:"UTILITY", reason:"Confirmacao de opt-out. Exemplo oficial Meta." },
  { name:"cross_channel_chat", body:"Ola! Voce solicitou suporte pelo nosso chat online. Sou o assistente virtual do WhatsApp. Como posso ajudar?", tag:"UTILITY", reason:"Continuacao cross-channel. Exemplo oficial Meta." },
  { name:"low_balance_warning_3", body:"Ola, {{texto}}, seu saldo e de {{valor}}. Recarregue para evitar interrupcoes.", tag:"UTILITY", reason:"Dado concreto + acao direta. Template oficial Meta." },
  { name:"account_status_summary", body:"Ola {{1}}, resumo financeiro. Periodo: {{2}} Receber: {{3}} Pagar: {{4}} Acesse o sistema.", tag:"UTILITY", reason:"Dados financeiros concretos + acao clara." },
  { name:"account_status_check", body:"Ola, {{1}}. Verificacao no seu acesso ao sistema. Sua conta esta ativa e sem restricoes.", tag:"UTILITY", reason:"Status de sistema: verificacao + resultado." },
  { name:"feedback_generico_1", body:"Ola {{1}}, tudo bem? Como tem sido sua experiencia?", tag:"MARKETING", reason:"Feedback generico sem pedido. Meta nao aprova como utility." },
  { name:"retorno_preco_2", body:"Lembrei de voce! Plano vai de R$27 pra R$49. Seguro os R$27 pra voce ate hoje.", tag:"MARKETING", reason:"Reengajamento + oferta = Marketing puro." }
];
