# tonekith brand design

Canonical palette, logos, and usage for **tonekith**.

**Source board (authoritative):**  
[/cursor/stores/bc-54157b86-3494-488b-8adc-0708be56bff5/media/tonekith-brand-identity.png](/cursor/stores/bc-54157b86-3494-488b-8adc-0708be56bff5/media/tonekith-brand-identity.png)

Repo copy: `public/brand/tonekith-brand-board.png`

---

## Name

- Always **tonekith** — all lowercase in product UI, package name, and public copy.
- No title case, camelCase, or alternate spellings.

---

## Color palette

| Token | Hex | CSS variable | Use |
| --- | --- | --- | --- |
| Background | `#0B0B0C` | `--brand-black` / `--background` (dark) | Main dark surfaces |
| Surface | `#161618` | `--brand-grey-dark` / `--card` | Cards, panels, elevated UI |
| Muted | `#232327` | `--brand-grey-mid` / `--muted` | Borders, dividers, disabled |
| Primary | `#FF7A00` | `--brand-orange` / `--primary` | Accents, CTAs, knob pointer |
| Text primary | `#F5F5F4` | `--brand-offwhite` / `--foreground` | High-contrast body / headings |
| Text secondary | `#A1A1A6` | `--brand-text-secondary` / `--muted-foreground` | Icons, metadata, secondary copy |
| Accent hover | `#FF5A00` | `--brand-orange-hover` | Hover / active orange |
| Accent dark | `#CC5200` | `--brand-orange-dark` | Pressed states, depth |

Default theme: **studio dark**. Orange is an accent only — never large purple/glow SaaS gradients or warm brown washes.

Light theme may invert surfaces to off-white (`#F5F5F4`) with black text; keep primary orange unchanged.

---

## Typography

- Primary typeface: **Sora** (geometric sans).
- Load via `next/font/google` and apply on `html`/`body`.
- Do not use Inter, Roboto, Arial, or system UI as the brand face.

---

## Logos & marks

### Wordmark
- Lowercase **tonekith** in Sora (or geometric sans matching board).
- The **o** is an amp-knob: ring + orange pointer (~2 o’clock) + three short radial ticks.
- Optional tagline under wordmark (wide tracking, all caps): **FIND YOUR TONE. MAKE IT YOURS.**

### Variants (from board)
| Asset | Use |
| --- | --- |
| Wordmark on dark | Primary marketing / hero |
| Wordmark on light | Light surfaces / print |
| Dark app icon | PWA / favicon default |
| Light app icon | Light OS / notifications |
| Accent (orange) icon | Solid brand tile |
| Minimal / knob-only | Favicon small sizes, compact chrome |

### Repo assets (`public/brand/`)
- `tonekith-brand-board.png` — full board
- `wordmark.svg` / `wordmark.png` — SVG + raster wordmark
- `mark.svg` / `mark.png` — t+knob / knob mark
- `knob.svg` — knob glyph
- `app-icon-dark.svg|.png`, `app-icon-light.svg|.png`, `app-icon-accent.png`
- Cropped board exports as available (`wordmark-dark.png`, etc.)

In-app components: `src/components/brand/wordmark.tsx` (`TonekithWordmark`, `TonekithMark`).

---

## Taglines

Prefer in this order:

1. **Find your tone. Make it yours.** (hero sentence case)
2. Board lockup form: **FIND YOUR TONE. MAKE IT YOURS.** (all caps, tracked)
3. Every tone has a recipe.
4. Hear it. Find it. Build it.

---

## UI direction

- Neutral studio blacks/greys — not brown.
- Subtle borders (`#232327` / low-alpha off-white), restrained radius.
- Orange only on CTAs, active states, knob accents.
- Signal-chain UI may nod to gear without heavy skeuomorphism.

---

## Implementation checklist

- [x] Board saved to store `media/` and `public/brand/`
- [x] Palette tokens in `src/app/globals.css`
- [x] Sora via `next/font`
- [x] Wordmark + mark in header / hero
- [x] Favicon / app icons from brand mark
