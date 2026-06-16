# WATemplate Builder

WhatsApp template validator and generator with memory and AI-powered suggestions.

## Features

- **Dual-mode validation**: Lenient (Meta initial approval) and Strict (quality re-evaluation)
- **Context generation**: opt-in, cross-channel, status check, onboarding, alert, confirmation
- **Approval memory**: save templates as UTILITY or MARKETING, export/import JSON
- **AI suggestions**: compatible with any OpenAI-like API (configurable URL, model, key)
- **Live preview**: WhatsApp mockup with highlighted variables and sample values
- **Similarity detection**: compares new templates against saved approvals
- **Reference library**: 15 templates (Meta official + practical examples)
- **Responsive UI**: Tailwind CSS, WhatsApp Web light theme
- **Zero dependencies**: runs entirely in the browser, no build step

## Quick start

```bash
git clone https://github.com/seuusuario/watemplate-builder.git
cd watemplate-builder
npm start
# or: python3 -m http.server 3000
```

Open http://localhost:3000 in your browser.

## How it works

1. Paste your template in the Validate tab
2. Fill sample values for variables {{1}}, {{2}}
3. See score, category, and indicators in real time
4. If approved, click "APROVADO COMO UTILITY" or "APROVADO COMO MARKETING"
5. Saved templates appear in the Memory tab
6. On next validation, the system compares against saved ones and shows suggestions

## AI setup

1. Go to the Config tab
2. Enter API URL (e.g. https://api.openai.com/v1)
3. Enter model name (e.g. gpt-4o-mini)
4. Enter API key
5. Everything stays in your browser

## Tests

```bash
npm test
```

14 validation tests, all passing.

## License

MIT
