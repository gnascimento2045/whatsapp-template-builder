# Regras para Classificacao de Templates WhatsApp

## Categoria UTILITY

Regra fundamental: o template deve informar o usuario sobre uma acao ou transacao que ele realizou, ou um status do servico contratado. Nao deve vender, engajar ou entreter.

### Padroes que caracterizam UTILITY

- Status do sistema ("conta ativa", "sem restricoes", "funcionando normalmente")
- Referencia a pedido/transacao ("pedido {{numero}}", "sua compra", "seu pagamento")
- Dado financeiro concreto (valor, data, saldo, periodo)
- Acao clara para o usuario ("acesse sua conta", "pague agora", "registre")
- Instrucao de opt-out ("ignore se ja pagou", "desconsidere")
- Gestao de aceitacao ("confirmou seu consentimento", "confirmou sua preferencia")
- Continuacao cross-channel ("solicitou suporte pelo chat", "continuacao do seu contato")
- Feedback vinculado a pedido especifico ("sobre o pedido {{numero}}", "apos sua recente compra")

### Exemplos aprovados como UTILITY (Meta oficial)

```
Ola, {{texto}}, sua conta {{texto}} de {{valor}} vence em {{data}}. Pague agora. Ignore se ja pagou.
```

```
Atualizacao diaria para conta final {{1234}}: saldo disponivel e {{valor}}.
```

```
Entregamos seu pedido {{order_number}}. Se houver algum problema, entre em contato conosco.
```

```
Agradecemos por confirmar seu consentimento. Agora voce recebera notificacoes via WhatsApp.
```

```
Ola! Voce solicitou suporte pelo nosso chat online. Sou o assistente virtual do WhatsApp. Como posso ajudar?
```

### Exemplos aprovados como UTILITY (usuario real)

```
Ola, {{1}}. O recurso solicitado por voce na {{2}} ja esta disponivel. Ainda teria interesse?
```

```
Ola {{1}}, como vai? Esta tudo certo com a {{2}}? Gostariamos de ouvir seu feedback sobre a plataforma.
```

Observacao: ambos tem perguntas abertas ("como vai?", "ainda teria interesse?") mas foram aprovados como UTILITY pela Meta porque o contexto e de acao do usuario (ele solicitou o recurso, ele usa a plataforma).

## Categoria MARKETING

Regra fundamental: o template promove, engaja, reativa ou vende algo. O usuario nao iniciou a acao.

### Padroes que caracterizam MARKETING

- Pergunta aberta/conversacional ("como vai?", "tudo bem?", "o que achou?")
- Reengajamento ("lembrei de voce", "sinto sua falta", "quanto tempo")
- Linguagem promocional ("oferta", "desconto", "cupom", "oportunidade unica", "imperdivel")
- Upsell/cross-sell ("subir de plano", "plano premium", "upgrade")
- Gatilho de urgencia ("ultima chance", "termina hoje", "vagas limitadas")
- Curiosidade ("voce sabia?", "que tal?")
- PS/addendum ("p.s.", "by the way", "alias")
- Feedback generico sem pedido ("como tem sido sua experiencia?", sem mencionar pedido/visita)

### Exemplos rejeitados (classificados como MARKETING)

```
Ola {{1}}, tudo bem? Como tem sido sua experiencia?
```
Motivo: feedback generico sem referencia a pedido. Meta diz: "A generic survey will not be approved as utility."

```
Lembrei de voce! Plano vai de R$27 pra R$49. Seguro os R$27 pra voce ate hoje.
```
Motivo: reengajamento + oferta = Marketing puro.

```
Oferta exclusiva! Desconto de 50% no plano premium!
```
Motivo: linguagem promocional.

## Regras de ouro para sugerir variacoes

1. Se o template menciona algo que o usuario fez -> UTILITY
2. Se menciona algo que a empresa quer que o usuario faca -> MARKETING
3. Perguntas abertas ("como vai?", "tudo bem?") so sao aceitas em UTILITY se o contexto for de acao do usuario
4. Feedback generico SEMPRE precisa de referencia a pedido para ser UTILITY
5. Dados concretos (valor, data, status) fortalecem UTILITY
6. Acoes claras ("acesse", "pague", "registre") fortalecem UTILITY
7. Nunca usar: oferta, desconto, cupom, promocao, oportunidade, imperdivel em UTILITY
8. Opt-out ("ignore se ja") e sempre bem-vindo em UTILITY
9. Templates de confirmacao de opt-in/opt-out sao sempre UTILITY
10. Templates de continuacao de conversa (cross-channel) sao sempre UTILITY

## Estrutura de variaveis

- Usar {{1}}, {{2}} para variaveis numericas
- Evitar {{texto}}, {{valor}}, {{data}} - podem causar rejeicao
- O template nao deve comecar ou terminar com variavel
- Maximo de 3 botoes (QUICK_REPLY, URL, PHONE_NUMBER, COPY_CODE)
- Corpo: maximo 1024 caracteres
- Header: maximo 60 caracteres (texto)
- Footer: maximo 60 caracteres
