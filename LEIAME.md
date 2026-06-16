# WATemplate Builder

Validador e gerador de templates WhatsApp com memoria e sugestoes por IA.

## Use Online

Acesse o [live demo](https://gnascimento2045.github.io/whatsapp-template-builder/) e comece a criar templates agora.

## Funcionalidades

- **Validacao dual-mode**: Leniente (aprovacao inicial Meta) e Rigoroso (reavaliacao de qualidade)
- **Geracao por contexto**: opt-in, cross-channel, status check, onboarding, alerta, confirmacao
- **Memoria de aprovados**: salve templates como UTILITY ou MARKETING, exporte/importe JSON
- **Sugestao com IA**: compativel com qualquer API OpenAI (URL, modelo e chave configuraveis)
- **Preview ao vivo**: mockup WhatsApp com variaveis destacadas e valores de exemplo
- **Similaridade**: ao validar, compara com templates salvos e sugere melhorias
- **Biblioteca**: 15 templates (oficiais Meta + exemplos praticos)
- **Interface responsiva**: Tailwind CSS, tema claro do WhatsApp Web
- **Zero dependencias**: roda no browser, sem build

## Como usar

```bash
git clone https://github.com/seuusuario/watemplate-builder.git
cd watemplate-builder
npm start
# ou: python3 -m http.server 3000
```

Abra http://localhost:3000 no navegador.

## Como funciona

1. Cole o template na aba Validar
2. Preencha valores de exemplo para variaveis {{1}}, {{2}}
3. Veja score, categoria e indicadores em tempo real
4. Se aprovado, clique em "APROVADO COMO UTILITY" ou "APROVADO COMO MARKETING"
5. Os aprovados ficam na aba Memoria
6. Na proxima validacao, o sistema compara com os salvos

## Configurar IA

1. Aba Config
2. Informe URL da API (ex: https://api.openai.com/v1)
3. Informe o modelo (ex: gpt-4o-mini)
4. Informe a chave da API
5. Tudo fica salvo no navegador

## Testes

```bash
npm test
```

14 testes, todos passando.

## Licenca

MIT
