# Sakīnah Design System

Sakīnah expresses calm, reverence, clarity, and trust through typography, proportion, whitespace, and explicit provenance—not ornamental excess.

## Mobile First, Desktop Excellent

ALSAMAD is a Mobile First product. The phone experience is the reference implementation for every screen and component; desktop expands it with more space, never with more complexity, and never becomes the design reference. Full contract: `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §2.12, §25, §32, §43.

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

Arabic UI uses locally delivered Noto Sans Arabic `NotoSansArabic-v2.013`, limited to weights 400–800 at default width, with `Tahoma, Arial, sans-serif` fallback. General/devotional Arabic reading uses the regular 400 instance of locally delivered Noto Naskh Arabic `NotoNaskhArabic-v2.021`, with `serif` fallback and generous leading. Both are version-pinned SIL OFL 1.1 Phase-1 roles. English remains Inter/system UI and is not decided here. Canonical Quran typography is a separate, intentionally unbound `--font-quran` role; the devotional Noto Naskh selection is not Quran approval. Decorative calligraphy is never body copy; joined Arabic receives no letter spacing.

## Surfaces and focus

Semantic tokens live in `src/app/globals.css`. Every interactive control has a visible gold focus ring with 3px offset. Minimum primary touch target is approximately 46px. Dark mode changes surface hierarchy and borders rather than adding glow.
