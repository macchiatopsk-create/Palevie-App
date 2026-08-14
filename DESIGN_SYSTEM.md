# PALEVIE — K-Beauty Personal Color App
## Visual handoff spec v1

Reference direction: clean modern Korean beauty brand, warm milk background, editorial serif + restrained rose accent, real product imagery, translucent acrylic/glass materials, lots of whitespace. Avoid generic SaaS cards, Y2K chrome overload, giant gradient CTAs, decorative 3D balls, and text embedded inside image assets.

---

## 0. Global design system

### Artboard / layout
- Primary mobile reference width: **390px**
- Design should scale from **360–430px**
- Page max-width on desktop preview: **430px**
- Safe horizontal padding: **24px**
- Section gap: **32px**
- Small content gap: **12px**
- Default vertical page padding: **16px top / 32px bottom**
- Bottom navigation height: **72px** + safe-area inset

### Color tokens
```css
:root {
  --bg: #FBF7F2;          /* warm milk */
  --surface: #FFFDFC;     /* clean warm white */
  --ink: #1D191C;         /* near-black plum */
  --muted: #857B80;       /* warm gray */
  --line: #EDE5E3;        /* hairline */
  --rose: #EE6F8E;        /* primary Palevie rose */
  --rose-soft: #F8D7DF;
  --rose-pale: #FDF0F2;
  --lavender: #B6A1D6;
  --blue-soft: #A8BDD2;
  --peach: #F2BEA7;
  --gold: #C9A37B;        /* tiny accents only */
}
```

### Typography
Use web fonts, not image text.

```css
--font-display: "Instrument Serif", "Times New Roman", serif;
--font-ui: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

- Brand wordmark: Instrument Serif, **38/40**, weight 400, letter-spacing `-0.02em`
- Hero H1: Instrument Serif, **58/56**, weight 400, letter-spacing `-0.035em`
- Result title: Instrument Serif, **64/60**, weight 400
- Section title: Instrument Serif, **30/32**, weight 400
- UI heading: Inter, **18/24**, weight 600
- Body: Inter, **15/22**, weight 400
- Small label: Inter, **11/16**, weight 600, letter-spacing `0.16em`, uppercase
- Metadata: Inter, **12/18**, weight 500

### Radius
- Primary CTA pill: **999px**
- Product card: **20px**
- Content card: **24px**
- Image tile: **18px**
- Small chips: **999px**

### Shadows
Avoid gray SaaS drop shadows. Use pink-beige ambient shadow.

```css
--shadow-soft: 0 12px 40px rgba(91, 57, 67, 0.08);
--shadow-float: 0 18px 50px rgba(85, 48, 61, 0.12);
--shadow-cta: 0 10px 28px rgba(238, 111, 142, 0.20);
```

### Borders
- Default hairline: `1px solid rgba(58, 40, 46, 0.08)`
- Active/selected: `1.5px solid var(--rose)`

### Motion
- Press: `transform: scale(.985)` for 100ms
- Card enter: opacity 0→1 + translateY(8px→0), 260ms
- Selected quiz answer: scale 1→1.015, 180ms
- Palette swatch hover/tap: translateY(-4px), 180ms
- Never use bouncing or excessive spring motion.

---

# 1. HOME

## Header
Height **56px**.
- Left: optional menu icon, 24px
- Center: `palévie` wordmark, Instrument Serif 38px; subtitle `personal color` 9px Inter under it
- Right: bell/profile icon, 24px
- No boxed header. Background transparent.

## Hero copy
Top margin from header: **48px**.

Small label:
`KOREAN PERSONAL COLOR`
- Inter 11px / 16
- weight 600
- letter spacing .18em
- color `--rose`

Headline:
`your colors,\nmade for you.`
- Instrument Serif 58/56
- `you.` may use `--rose`, but keep same serif style; no giant italic gimmick
- max-width 300px

Body:
`Korean personal color for beauty, fashion & everyday shopping.`
- 15/22
- max-width 220px
- color `--ink`

## Hero visual
Position center-right, approximately **235 × 390px** visual footprint.
Use a transparent PNG of **4 translucent acrylic color panels** in rose / peach / lilac / soft blue.
- No text in asset
- Asset can overflow right edge by 18–24px
- Add very soft CSS radial glow behind it, not a rendered box

## CTA
Width `calc(100% - 48px)`; height **60px**.
- Background `--ink`
- Text `Find my palette  ✦`
- Inter 17px, weight 600
- White text
- margin-top 34px
- shadow `--shadow-cta`

Under CTA, three inline facts centered:
`12 questions` · `No selfie` · `About 90s`
- 12px/18, muted
- each gets a 14px line icon

## “Popular now” section
Margin-top: **40px**.
Container surface can be card-like but nearly flat:
- background `rgba(255,255,255,.68)`
- radius 24px
- padding 16px
- no heavy shadow

Horizontal 4-item strip: each **92px** wide.
- image ratio 4:5
- radius 14px
- label 12px/16
- no popularity percentages unless they come from real measured analytics; use category labels only in demo

---

# 2. QUIZ

## Top bar
- Back button: 42px circular white translucent surface
- Progress: `03 / 12` centered
- thin progress bar 2px using `--rose`

## Question block
Top margin: **42px**.
- Small eyebrow: `WHAT FEELS BETTER?`
- Main question: Instrument Serif **46/48**
- Supporting sentence: Inter 14/21 muted

Example:
`Gold\nor Silver?`

## Answer cards
Two-up layout, gap **12px**, each width ~165px, height **260px**.
- image occupies 210px height
- bottom label 48px
- radius 22px
- active card: 1.5px rose outline + subtle `--shadow-float`
- active badge: 28px rose circle with white check in top-right

Do not auto-advance immediately. After selection show CTA.

## Bottom CTA
Fixed above safe area, 24px left/right.
- black pill, height 56px
- `Next  →`
- disabled state: #E8E1DF background, #AAA1A4 text

---

# 3. RESULT / MY PALETTE

## Background
Use type-specific backdrop; no universal pink result page.
For Soft Summer example:
- base `#FBF7F2`
- subtle transparent silk/floral texture in top-right at 22–30% opacity
- lilac/rose ambient gradient only behind title area

## Top bar
- back: 42px circular translucent white
- share: 42px circular translucent white
- no boxed header

## Result heading
Eyebrow: `YOUR PALETTE` rose, 11px uppercase.
Optional index right: `01/07` 12px.

Title:
`Soft\nSummer`
- Instrument Serif 64/60
- color `--ink`
- no split black/hot-pink title treatment

Descriptor:
`cool · muted · soft`
- Instrument Serif 19/24 or Inter 14/20 semibold
- generous letter spacing

## Swatches
Label: `YOUR COLORS`
Then 7 vertical swatches, horizontal scroll or fit width.
- width 44–48px
- height 128px
- radius 8px top corners / 0 bottom is acceptable, or 10px all around
- gap 6px
- current swatch can display tiny check badge

Soft Summer example palette:
- `#B9677C`
- `#C58A9D`
- `#9C7485`
- `#8D8CA5`
- `#9CB9CC`
- `#92B9C2`
- `#C5BAD1`

## Product section
Title `MADE FOR YOUR PALETTE`
Horizontal product rail, **120px** cards.
Each card:
- warm white surface
- product cutout PNG centered on pale warm background
- category 9px uppercase muted
- shade/product name 13px/17
- heart icon top-right
- no fake brand names if real catalog data is not connected

## Color match banner
Full-width 342 × 118 card.
- pale rose surface
- left: `See how these colors look on you`
- outlined secondary CTA `Try color match`
- right: layered preview circles/avatar placeholder (use only if actual photo functionality exists; otherwise abstract swatches)

---

# 4. ANALYZE / COLOR CHECK

Purpose: user checks a clothing/cosmetic color against their saved palette.

## Header
`Color Check`
- title 32px Instrument Serif
- subtitle `Will this color suit you?`

## Upload zone
Not a generic dashed SaaS uploader.
Use a **large editorial image stage**:
- width 342px
- height 330px
- radius 28px
- pale neutral background
- center translucent glass bubble/acrylic element before upload
- one small camera icon + text `Add a product photo`

After image selected:
- photo fills stage
- extracted dominant color shown as 52px circular chip floating bottom-left
- below: `Is this the color you want to check?`
- controls: `Yes, check it` / `Try another photo`

## Verdict
Use large typographic verdict, not nested cards.
Example:
`GOOD MATCH`
- eyebrow 11px rose
- score only if real engine provides it
- short explanation 15px/22

Then 3–4 recommended palette shades in a horizontal strip labeled:
`Strong shades from your palette`

---

# 5. SHOP / RECOMMENDATIONS

## Header
Title `For you`
Subheading uses current profile:
`Soft Summer ♡`

## Filter chips
Horizontal chips:
`All` `Lip` `Blush` `Eyes` `Clothing`
- active: ink background, white text
- inactive: transparent with line border
- height 36px

## Product grid
2 columns, gap 12px.
Product card width ~165px.
- image area 165 × 190px
- product PNG on warm off-white or type-tinted background
- radius 20px
- text below on page background (do not wrap every product in a heavy white card)
- category 10px uppercase
- product 14px/18
- shade 12px muted
- price 14px semibold
- optional match tag e.g. `Great for your palette` only if algorithm supplies it

## Sponsored / partner products
Must visually disclose paid relationship.
Use tiny label `Sponsored` or `Partner` above product metadata. Do not disguise paid placements as neutral rankings.

---

# Bottom navigation
Use on Home / Result / Analyze / Shop / My Page.
Height 72px.
- white/ivory blurred surface with top hairline
- 5 items: Home / Analyze / My Palette / Shop / My Page
- icon 21px, label 10px
- active rose, inactive warm gray
- no giant floating center button

---

# Asset rules for implementation

All image assets must be supplied as **separate transparent PNGs/WebPs** where possible.

DO:
- transparent background
- realistic studio light
- no logos or brand marks
- no embedded text
- no UI frames
- no colored rectangular card baked into image
- soft natural contact shadow only when intrinsic to object
- leave generous transparent margin around object

DO NOT:
- generate a full app screenshot as an asset
- put labels inside images
- put product on a colored square/card
- combine multiple unrelated assets into one sprite image
- use celebrity or copyrighted campaign photos

Recommended export sizes:
- hero acrylic panes: 1600×1600 PNG
- lip tint: 1200×1200 PNG
- blush compact: 1200×1200 PNG
- glass bubble: 1200×1200 PNG
- silk/fabric overlay: 1600×1600 PNG
- generic eyeshadow/product cutout: 1200×1200 PNG

---

# CSS implementation notes

- Use real HTML text for all copy.
- Use `next/image` for product and decorative assets.
- Decorative transparent PNGs: `pointer-events:none; user-select:none;`
- Use CSS `radial-gradient()` for ambient glows rather than baking backgrounds into images.
- Keep high contrast for body copy; pink is accent, not body text.
- Respect `prefers-reduced-motion`.
- Result theme should derive from the user’s profile; e.g. Soft Summer uses mauve/lilac/soft blue, Warm Spring uses peach/coral/butter, Deep Winter uses berry/ink/icy blue.

---

# Acceptance checklist

1. Home does not look like a questionnaire landing page.
2. No repeated stack of identical rounded white cards.
3. No decorative floating spheres.
4. No giant pink gradient CTA.
5. Result page looks like a collectible personal color book/page worth sharing.
6. Product imagery is actual transparent cutout imagery, not CSS rectangles pretending to be products.
7. Every generated image asset contains **zero text**.
8. Palette/theme visibly changes by personal-color result.
9. Shop and recommendations are visually integrated into the personal-color experience.
10. Mobile at 390px is the primary QA target.
