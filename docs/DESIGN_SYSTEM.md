# Design system and interaction contract

The existing neutral/indigo identity and light/dark themes remain the application foundation. `styles.css` defines surface, ink, muted, border, accent, status and shadow tokens. `workspace.css` supplies domain layouts; `studio.css` adds responsive foundations and document previews. Product branding and customer document branding are separate concerns.

- Reading content uses bounded widths; analytical/studio layouts may expand to 1900 px on large screens. Grid tracks use `minmax(0, ...)` and shrinking children use `min-width: 0`.
- The sidebar is independently scrollable at `100dvh`, its children cannot shrink out of reach, and its attribution remains keyboard-accessible. Low-height desktop layouts reduce secondary chrome. Mobile replaces the sidebar with an isolated, focus-contained drawer and a backdrop.
- Existing heading/body hierarchy, spacing, radii and shared `button`, `field`, `panel`, `paper`, `badge`, `notice`, modal and empty-state components are reused. Status color never replaces the text label.
- Primary actions remain visible or reachable by local scrolling. Mobile buttons/icons are at least 44 px high; text inputs use 16 px to avoid iOS focus zoom. Small native color swatches exceed the WCAG 2.2 24 px target minimum. Safe-area insets and dynamic viewport heights protect bottom actions.
- Document previews scale as a whole within their own width. Scope comparisons retain readable rows; stories, relationships and coverage are stacked records on narrow screens. Large text is wrapped rather than clipped out of the document.
- Focus rings, keyboard skip link, labelled controls, Radix dialogs, Escape and restored focus are part of the interaction contract. Theme changes switch foreground/background together. Reduced-motion preferences suppress nonessential animation.
- Avoid invented scores, decorative project charts, false certainty and marketing badges. Chart previews with sample values are explicitly labelled illustrative. Export charts use selected project calculations.

Responsive/browser receipts and screenshot dimensions are described in [Testing](TESTING.md). Automated axe results are bounded evidence, not a WCAG certification or a substitute for assistive-technology review.
