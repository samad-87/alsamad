# Alsamad UI Foundation

Recovery reconstruction of the approved **Sakīnah** frontend foundation for [al-samad.com](https://al-samad.com).

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/ar` or `http://localhost:3000/en`.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

All content, prayer times, dates, locations, sources, and religious text areas are explicitly marked static fixtures. This phase includes no database, authentication, external API, geolocation, calculations, AI, production content ingestion, payments, or deployment.

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [UI_ARCHITECTURE.md](./UI_ARCHITECTURE.md), [CONTENT_COMPONENT_RULES.md](./CONTENT_COMPONENT_RULES.md), [ACCESSIBILITY_NOTES.md](./ACCESSIBILITY_NOTES.md), and [UNRESOLVED_DESIGN_DECISIONS.md](./UNRESOLVED_DESIGN_DECISIONS.md).
