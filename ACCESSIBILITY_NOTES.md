# Accessibility Notes

Target: WCAG 2.2 AA.

- A skip link, semantic header/nav/main/footer landmarks, ordered headings, and labeled controls are present.
- Keyboard focus is high contrast and never conveyed by color alone.
- Touch controls target at least 44×44 CSS pixels where practical.
- `lang` and `dir` are set at the document boundary for Arabic RTL and English LTR.
- Reading order is DOM-logical; CSS uses inline/block logical properties.
- Arabic text uses generous line height and survives 200% zoom without fixed-height clipping.
- Reduced-motion preferences disable nonessential transitions and scrolling.
- Static prayer values do not use noisy countdown announcements.

Still required before public release: manual NVDA, VoiceOver, TalkBack, 200% zoom, reflow, high contrast mode, and representative Arabic glyph/diacritic testing.
