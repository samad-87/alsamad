# UI Architecture

## Boundaries

- `src/app/[locale]`: locale-first route composition and route metadata boundary.
- `src/components/shell.tsx`: global application shell, locale-aware navigation, footer, and skip link.
- `src/components/ui.tsx`: server-first presentational primitives.
- `src/components/client-controls.tsx`: the only interaction boundary for theme, mobile navigation, adhkar mock progress, and local tasbeeh.
- `src/lib/i18n.ts`: typed Arabic and English UI copy.
- `src/lib/fixtures.ts`: centralized, clearly non-production fixture data.

Routes are Server Components by default. Client Components are limited to stateful behavior. Locale direction is set on the document boundary and links retain the active locale. CSS logical properties support both directions.

No backend concern is represented as a fake frontend service. Future content, prayer, search, identity, and preferences modules should replace fixture adapters through explicit typed boundaries.
