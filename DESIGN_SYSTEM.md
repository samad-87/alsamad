# Sakīnah Design System

Sakīnah expresses calm, reverence, clarity, and trust through typography, proportion, whitespace, and explicit provenance—not ornamental excess.

## Tokens

- Canvas: `#F8FBF9` light / `#07130F` dark.
- Surface: `#FFFFFF` light / `#0D1D17` dark.
- Primary emerald: `#0F5B43` light / `#68BC98` dark.
- Gold: `#9B742B` light / `#D3AE62` dark; reserved for trust and ceremonial emphasis.
- Borders precede shadows. Shadows are soft and rare.
- Radius: 12px controls, 20px cards, 32px feature surfaces.
- Spacing follows a 4px base scale; common steps are 8, 12, 16, 24, 32, 48, 64.
- UI feedback is 120–220ms and removed under `prefers-reduced-motion`.

## Typography

Arabic UI uses a project-safe Noto Sans Arabic/Tahoma fallback stack. Arabic religious reading uses a separate Noto Naskh Arabic/Amiri/serif role with generous leading. English uses Inter/system UI. The final Quran font remains blocked on edition, glyph, waqf-mark, and licensing approval. Decorative calligraphy is never body copy; joined Arabic receives no letter spacing.

## Surfaces and focus

Semantic tokens live in `src/app/globals.css`. Every interactive control has a visible gold focus ring with 3px offset. Minimum primary touch target is approximately 46px. Dark mode changes surface hierarchy and borders rather than adding glow.
