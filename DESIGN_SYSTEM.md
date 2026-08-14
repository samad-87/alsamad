# Sakīnah Design System

Sakīnah's Phase-1 visual direction is **Quiet Editorial Sanctuary**: calm, contemporary, premium, spiritually respectful, editorial, highly readable, and restrained. Identity comes through typography, proportion, reading dignity, source transparency, restrained geometry, and content hierarchy—not ornamental excess. The system reduces visible containers instead of restyling every object as a card.

## Mobile First, Desktop Excellent

ALSAMAD is a Mobile First product. The phone experience is the reference implementation for every screen and component; desktop expands it with more space, never with more complexity, and never becomes the design reference. Full contract: `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §2.12, §25, §32, §43.

## Tokens

- Canvas: `#F8FBF9` light / `#07130F` dark.
- Surface: `#FFFFFF` light / `#0D1D17` dark.
- Grouped tonal surface: `#EEF5F1` light / `#14271F` dark.
- Text: `#10231B` / `#F3F7F4`; muted `#617168` / `#A2B0A8`.
- Primary emerald: `#0F5B43` light / `#68BC98` dark.
- Strong emerald: `#083D2D` / `#91D3B4`; soft emerald `#DCECE5` / `#173D2E`.
- Gold: `#9B742B` light / `#D3AE62` dark; reserved for trust and ceremonial emphasis.
- Border: `#DBE6E0` / `#263C33`; danger `#B42318` / `#FF8A80`.
- Separation order is tonal surface → border → shadow. Shadows are soft, rare, and purposeful; dark mode does not strengthen them into glow.
- Radius: 12px controls, 20px standard cards/surfaces, 32px feature/modal surfaces only when warranted. Pills are reserved for genuine pill semantics.
- Spacing follows a 4px base scale; common steps are 8, 12, 16, 24, 32, 48, 64.
- UI feedback is 120–220ms and removed under `prefers-reduced-motion`.

Most sections remain unframed. Reading surfaces are flat or minimally outlined; grouped information uses tone first; interactive cards use subtle border/tone states; floating overlays may use controlled elevation. Feature radius does not imply a strong shadow, and bordered cards are not nested by default. Gold is not the generic link color, decorative gradients are exceptional, and status never relies on color alone.

Status, category, badge, filter, navigation state, compact action, and source/trust metadata are distinct roles. Shared geometry must not collapse them into one generic pill language.

## Typography

Arabic UI uses locally delivered Noto Sans Arabic `NotoSansArabic-v2.013`, limited to weights 400–800 at default width, with `Tahoma, Arial, sans-serif` fallback. General/devotional Arabic reading uses the regular 400 instance of locally delivered Noto Naskh Arabic `NotoNaskhArabic-v2.021`, with `serif` fallback and generous leading. Both are version-pinned SIL OFL 1.1 Phase-1 roles. English remains Inter/system UI and is not decided here. Canonical Quran typography is a separate, intentionally unbound `--font-quran` role; the devotional Noto Naskh selection is not Quran approval. Decorative calligraphy is never body copy; joined Arabic receives no letter spacing.

## Surfaces and focus

Semantic tokens live in `src/app/globals.css`. Every interactive control has a visible gold focus ring with 3px offset. Minimum primary touch target is approximately 46px. Dark mode uses the frozen low-glare palette and changes tonal surface hierarchy and borders rather than adding shadow or glow. Final brand identity, logo/symbol, icon library, high-contrast mappings, and exact Quran presentation remain separate decisions.
