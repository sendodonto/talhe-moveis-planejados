---
name: Talhe
description: Warm showroom for custom joinery. Sand, taupe and wood tones, wide photography, high-contrast Didone set in spaced capitals.
colors:
  papel: "#efe8df"
  papel-2: "#e6dcd0"
  papel-3: "#d9cbb9"
  tinta: "#2b221c"
  tinta-2: "#5e5047"
  linha: "#d6c9b8"
  linha-forte: "#9a8a78"
  madeira: "#6f5237"
  madeira-2: "#a07c58"
  grafite: "#231c17"
  grafite-2: "#30271f"
  sobre-grafite: "#f1e9de"
  sobre-grafite-2: "#c9b9a6"
  led: "#e2bf94"
  creme: "#f5ede2"
  erro: "#9a2c1c"
typography:
  wordmark-hero:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(4.2rem, 1rem + 17vw, 15rem)"
    fontWeight: 520
    lineHeight: 0.9
    letterSpacing: "0.04em"
    fontVariation: "'opsz' 36"
  display:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(2rem, 1.2rem + 3.6vw, 4rem)"
    fontWeight: 460
    lineHeight: 1.08
    letterSpacing: "0.02em"
    fontVariation: "'opsz' 20"
  headline:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(1.55rem, 1.15rem + 1.7vw, 2.5rem)"
    fontWeight: 460
    lineHeight: 1.15
    letterSpacing: "0.035em"
    fontVariation: "'opsz' 20"
  title:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(1.3rem, 1.15rem + 0.6vw, 1.6rem)"
    fontWeight: 460
    lineHeight: 1.2
    fontVariation: "'opsz' 20"
  card-name:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(0.92rem, 0.85rem + 0.3vw, 1.05rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.08em"
    fontVariation: "'opsz' 12"
  lead:
    fontFamily: "'Albert Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.1rem, 1.04rem + 0.3vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'Albert Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  note:
    fontFamily: "'Albert Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Albert Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  field: "14px"
  raio: "20px"
  raio-g: "28px"
  pill: "999px"
spacing:
  moldura: "clamp(8px, 1.2vw, 16px)"
  margem: "clamp(16px, 4.6vw, 56px)"
  secao: "clamp(64px, 8vw, 128px)"
  gap-sm: "12px"
  gap-md: "20px"
  largura: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.creme}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.madeira}"
    textColor: "{colors.creme}"
  button-cream:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  card-ambiente-photo:
    backgroundColor: "{colors.papel-2}"
    rounded: "{rounded.raio}"
  card-servico:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.tinta-2}"
    rounded: "{rounded.raio}"
    padding: "32px 30px"
  banner-3d:
    backgroundColor: "{colors.papel-3}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.raio-g}"
  field:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "52px"
  chip:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  chip-selected:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
  footer:
    backgroundColor: "{colors.grafite}"
    textColor: "{colors.sobre-grafite}"
---

# Design System: Talhe

## Overview

**Creative North Star: "The Warm Showroom"**

The site behaves like a joinery showroom, not a technical drawing board. Wide, bright, wood-toned photography carries each room, and a rounded frame holds the opening photograph like a display window. A high-contrast Didone, set in spaced capitals, works as the showroom's signage. A humanist sans handles everything that has to be read. The palette is sand, linen and taupe, with a dark ink brown for text and a darker graphite band reserved for the footer.

Density is low and generous. The home page has few sections, and each one is made of one large idea: the frame with the name, a row of room cards, a 3D banner, and an alternating photo and card grid for the process. Surfaces are tonal (paper, deeper paper, cream cards) with only a faint ambient lift on cards. Motion is slow and settles with a long ease-out. The name resolves out of a blur on arrival, and photographs zoom a little on hover.

**Key Characteristics:**
- A rounded photographic frame (28px) inset from the viewport edge by a fluid margin.
- Didone uppercase with generous tracking for every heading; sans for body, labels and controls.
- One emphasised phrase per heading, set in wood brown (upright, not italic).
- Pill buttons: ink on light grounds, cream over photographs.
- Photo-led cards at 20px radius whose image scales on hover.
- A mobile-first bottom action bar sits within thumb reach. On desktop the header becomes sticky.

## Colors

A warm, low-chroma earth palette. Almost everything is paper and ink, and wood brown is the only accent.

### Primary
- **Walnut Ink Accent** (madeira): the one accent. It sets the emphasised phrase inside headings, the primary button hover, active menu items, card-name hover, icons in service cards and guarantee badges, focus outlines, text selection and the caret. It is dark enough to carry text on paper.
- **Light Oak** (madeira-2): the light wood tone. It is only for surfaces and icons, never for text.

### Secondary
- **LED Glow** (led): the accent on dark grounds. It covers link hover in the footer, focus outlines on photographs and dark bands, and emphasised phrases on dark themes.

### Neutral
- **Linen Paper** (papel): the page ground, the theme-color and the OG image background.
- **Sand Surface** (papel-2): recessed surfaces such as image placeholders, the closing call-to-action band and the guarantee icon discs.
- **Taupe Surface** (papel-3): the deepest light surface. It starts the 3D banner gradient.
- **Cream** (creme): raised surfaces (service cards, form fields, chips), text on photographs, and the fill of the cream button.
- **Espresso Ink** (tinta): primary text and the primary button fill.
- **Muted Umber** (tinta-2): secondary text (lead, body paragraphs, notes, captions, card blurbs).
- **Hairline** (linha): dividers, the header rule once scrolled, and menu list rules.
- **Strong Hairline** (linha-forte): outline-button and field borders, the vertical rule beside intro copy, and the scrollbar thumb.
- **Graphite** (grafite) / **Graphite Raised** (grafite-2): the footer band. Graphite also supplies the tint for photo veils and dialog backdrops.
- **On-Graphite** (sobre-grafite) / **On-Graphite Muted** (sobre-grafite-2): primary and secondary text on graphite.
- **Kiln Red** (erro): field error borders, error text and the error summary.

### Studio (3D viewer only)
- **Studio Backdrop** (#d0c2ad) → **Studio Mid** (#c9b79d) → **Studio Floor** (#c0a98b): the gradient behind the 3D stage and the full-screen viewer background. These match the rendered studio (`COR_ESTUDIO` / `COR_CHAO` in `src/scripts/visualizador/cena.ts`, after tone mapping), so the poster, the live canvas and the empty stage read as one surface. They are not used outside the viewer.

### Named Rules
**The One Wood Rule.** Wood brown is the only chromatic accent on light grounds. On dark grounds and photographs it gives way to LED Glow. No other hue enters the interface, apart from the WhatsApp button's green (#1d5c3f), which stays reserved for that one channel.

**The Dark Wood For Words Rule.** Only the dark wood (madeira) may colour text. The light oak (madeira-2) is for surfaces and icons.

## Typography

**Display Font:** Bodoni Moda Variable (with Didot, Bodoni 72, Georgia)
**Body Font:** Albert Sans Variable (with system-ui, -apple-system, Segoe UI)
**Label/Mono Font:** none. The `--f-mono` variable is an alias for the sans.

**Character:** A showroom plaque over a friendly workshop voice. The Didone is high contrast. Its optical-size axis is pinned low ('opsz' 20, or 36 on the hero wordmark) so hairlines stay visible at large sizes. Albert Sans stays plain and warm.

### Hierarchy
- **Wordmark Hero** (520, clamp to 15rem, 0.9): the brand name in the hero frame, uppercase and centred. On phones under 600px it is sized `calc(1rem + 21vw)` at 0.02em tracking so it fills the width.
- **Display** (460, clamp 2–4rem, 1.08, 0.02em, uppercase): page h1s and the 3D banner heading, which uses a smaller local clamp of 1.9–3.4rem.
- **Headline** (460, clamp 1.55–2.5rem, 1.15, 0.035em, uppercase): section h2s.
- **Title** (460, clamp 1.3–1.6rem, 1.2, sentence case): card headings such as the service steps.
- **Card Name** (500, ~1rem, 0.08em, uppercase): room card names, with a trailing arrow.
- **Lead** (400, clamp 1.1–1.25rem, 1.55): the intro paragraph under a heading, in muted umber.
- **Body** (400, 1.0625rem, 1.6): running text, capped at 65ch in `.t-texto`.
- **Note** (400, 0.9rem, 1.5): captions, credits and small print.
- **Label** (600, 0.8rem, 0.12em, uppercase, sans): small headings in sidebars and step numbers.

The mobile menu sets its links in the Didone (1.35rem, 0.04em, uppercase). The header wordmark is the Didone at 1.3rem with 0.24em tracking.

### Named Rules
**The Plaque Rule.** Headings at display and headline size are set in Didone uppercase with positive tracking and `text-wrap: balance`. Sentence-case Didone is only for the title role.

**The Upright Emphasis Rule.** Emphasis inside a heading (`em`) keeps an upright style (`font-style: normal`) and changes colour to wood brown, or to LED Glow on dark grounds. Use one emphasised phrase per heading.

## Layout

The layout is mobile first. Base styles target the phone, and `min-width` queries widen it at 480, 600, 640, 900, 1024 and 1280px. Content sits in a centred strip with a 1440px maximum width, padded by a fluid side margin. Sections breathe with a fluid vertical padding (the secao token).

The hero frame is inset from the viewport by the moldura token. It is at least `min(88svh, 900px)` tall on phones, and on desktop it fills the viewport minus the inset, up to 980px. Room cards run in 2 columns on phones, 3 from 900px and 6 from 1280px. The service grid is a single column on phones and becomes 3 columns from 900px, alternating photo and card. Intro blocks split 1fr/1fr from 900px, with a vertical strong hairline before the copy.

On phones the fixed bottom bar (64px, `--barra`) holds Menu and the primary call to action. It hides while the user scrolls down and returns on scroll-up, near the page end, or never while a field has focus. The body reserves padding for it. From 1024px the bar disappears and a sticky 76px header (`--topo`) takes over. On photo-led pages that header is transparent over the frame and turns solid paper once the hero is scrolled past.

## Elevation & Depth

Depth comes mainly from tonal layering: paper, then sand, then taupe, with cream cards raised above the paper. Shadows are rare and soft.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 1px 2px rgb(43 34 28 / 0.06), 0 12px 32px -18px rgb(43 34 28 / 0.25)`): cream service and process cards only.
- **Header rule** (`box-shadow: 0 1px 0 var(--linha)`): the desktop header after the page scrolls.
- **Bottom bar** (`box-shadow: 0 -1px 0 var(--linha), 0 -8px 24px rgb(43 34 28 / 0.06)`): the mobile action bar.
- **Photo text shadow** (`0 2px 30px rgb(35 28 23 / 0.35)`): text set over photographs, together with a graphite gradient veil.

Header and bottom bar use frosted glass: paper at 92–94% over `backdrop-filter: blur(12px)`.

### Named Rules
**The Tonal First Rule.** Separate surfaces by stepping the paper tone. Reserve the card lift for cream cards that sit on paper, and never stack shadows on photographs.

## Shapes

The shapes are soft and generous. The large frame and banners use 28px corners. Cards, service photos and the 3D viewer use 20px. Form fields use 14px. Buttons, chips, image tags and the skip link are full pills. Icon badges and 3D hotspots are circles. The mobile menu is a bottom sheet with 28px top corners. Photographs are always clipped by their container radius. Borders are 1px hairlines. Icons are 24px-grid line drawings with a 1.6 stroke and round caps.

## Components

### Buttons
Buttons are tactile pills.
- **Shape:** full pill (rounded.pill), 52px tall with a 12px gap between label and icon. The header version is 44px tall, and the bottom-bar version is 48px.
- **Primary:** espresso ink fill with cream text, 600 weight, 1rem.
- **Hover / Focus:** the fill shifts to wood brown over 0.25s, a trailing arrow nudges 3px right, and the button scales to 0.98 on press. Focus shows a 2px wood outline at 3px offset.
- **Cream:** a cream fill with ink text, used over photographs. Its hover lightens to #fff8ee.
- **Outline:** transparent with a strong-hairline border and ink text. On hover the border darkens to ink.
- **WhatsApp:** a green fill with white text, only on the quote page and in the menu.
- **Arrow link:** 600 weight, a 1px currentColor underline drawn as a bottom border, and a trailing arrow. It turns wood brown on hover.

### Chips
- **Style:** cream pill, 48px tall, strong-hairline border.
- **State:** a selected chip fills with ink, takes paper-coloured text and shows a drawn checkmark. Focus uses a 3px wood outline.

### Cards / Containers
- **Room card:** a 3:4 photo at 20px radius on a sand placeholder, then a Didone uppercase name with an arrow and a muted umber blurb. No border and no shadow. On hover the photo scales 1.05 and saturates 1.08 over 1.1s, and the name turns wood brown as the arrow nudges 4px.
- **Service card:** cream, 20px radius, card lift. Padding is 24px 22px 26px on phones and 32px 30px on desktop, with a 30px wood line icon, a Title-role heading and muted body text.
- **3D banner:** the whole banner is a link. It sits at 28px radius on a taupe gradient (#d9cbb9 to #cdbba5), with text at 5fr and image at 7fr on desktop. On hover the render scales 1.03 and rotates -0.4deg.

### Inputs / Fields
- **Style:** cream fill, 1px strong-hairline border, 14px radius, 52px minimum height and a 1.0625rem font so iOS does not zoom.
- **Focus:** the border darkens to ink and a 3px warm glow ring appears.
- **Error:** kiln-red border and a 600-weight kiln-red message below the field.

### Navigation
- **Desktop:** the Didone wordmark sits left. On the right are three sans links (500, 0.95rem) whose underline grows from the left on hover or on the current page, plus a compact primary pill. Over photographs the text is cream and the pill is cream.
- **Mobile:** a bottom bar with a hairline-outlined Menu pill and the primary call-to-action pill. Menu opens a paper bottom sheet (`<dialog>`) that slides up 32px. It holds Didone uppercase links separated by hairlines, with the current page in wood brown.

### Hero Frame (signature)
A full-bleed photograph fills a 28px-radius frame, inset by moldura, under a graphite gradient veil. The giant Didone wordmark is centred. On arrival its tracking collapses from 0.22em while a 10px blur clears (1.8s). A short tagline in spaced sans capitals (0.26em) and a cream pill fade up after it. A small image credit sits in the bottom-right corner.

## Do's and Don'ts

### Do:
- **Do** set every display and headline heading in Bodoni Moda uppercase with positive tracking, and emphasise one phrase in wood brown.
- **Do** frame photographs with 20px (cards) or 28px (frames, banners) corners and let the photograph carry the section.
- **Do** use the pill button: ink on light grounds, cream over photographs.
- **Do** step surfaces tonally (papel, papel-2, papel-3, creme) before reaching for a shadow.
- **Do** ease every transition with `cubic-bezier(0.16, 1, 0.3, 1)`, and keep reveal motion once-only behind `prefers-reduced-motion: no-preference`.
- **Do** keep touch targets at least 44px, and 48–52px for primary controls.

### Don't:
- **Don't** introduce a second chromatic accent. Wood brown and, on dark grounds, LED Glow are the only accents.
- **Don't** set text in the light oak tone (madeira-2).
- **Don't** italicise heading emphasis. It stays upright and changes colour.
- **Don't** use square corners on surfaces that hold photographs or cards.
- **Don't** add a monospace face. Captions and measurements use the sans.
