# DESIGN_SYSTEM.md — KITA TUMBUH

## Identity

**Master Brand:** KITA TUMBUH  
**Platform:** KAMPUNG SMART FARMING  
**Tagline:** Dari Limbah, Tumbuh Manfaat.  
**Core Statement:** SAMPAH KALIAN SANGAT BERARTI BAGI KAMI

This document is the visual source of truth for the product.

---

## 1. Visual Direction

The product must feel:

- natural
- warm
- human
- professional
- calm
- trustworthy
- community-oriented
- modern, but not futuristic

The visual identity should evoke:

```text
paper
soil
leaves
wood
farming
local community
craft
growth
```

Avoid making the product feel like:

```text
fintech
gaming
generic SaaS
neon technology
generic charity template
```

---

# 2. MASTER COLOR PALETTE

The entire product uses a **controlled natural palette**, implemented as CSS
custom properties in `styles/tokens.css` (mirrored in `lib/tokens/index.ts`):

```text
PAPER   (warm off-white / neutral canvas)
INK     (ink/near-black neutral for text and structure)
GREEN   (botanical green — primary brand/action)
EARTH   (warm earth/brown — secondary material accent)
```

> **Note:** an earlier draft of this document used the names
> `cream` / `hijau` / `coklat` with different hex values. The palette below
> reflects the tokens actually implemented and shipped in `styles/tokens.css`
> — this section was updated to match the code (not the other way around),
> since the token set was already in wide production use across
> `components/ui/*`, `components/layout/*`, and the live homepage before this
> document was reconciled. See `.agents/DECISIONS.md` for the decision
> record.

These are the only normal brand color families.

### Hard rule

Do not introduce unrelated colors just to add variety.

Forbidden as brand/decorative colors:

```text
bright red
blue
purple
pink
cyan
magenta
neon
rainbow
```

If a component library introduces default blue, purple, red, or another unrelated color, override it with the approved semantic tokens.

---

# 3. PAPER (WARM OFF-WHITE)

The website should not use harsh pure white as its dominant canvas.

Token: `--color-paper-*` in `styles/tokens.css`.

```text
paper-0      #FFFFFF
paper-50     #FCFCFA
paper-100    #F7F7F3
paper-150    #F1F1EA
```

Primary usage:

```text
paper-50  (--color-bg-canvas)
main page background

paper-0   (--color-bg-surface)
raised surface / cards

paper-100 (--color-bg-subtle)
section background / soft surface

paper-150 (--color-bg-muted)
muted surface / divider
```

The overall interface should feel like warm quality paper.

`paper-0` (`#FFFFFF`) may be used for specific raised surfaces where necessary, but it must not dominate the full page — `paper-50` is the dominant canvas.

---

# 3b. INK (NEUTRAL TEXT & STRUCTURE)

Token: `--color-ink-*` in `styles/tokens.css`. Used for text, borders, and neutral structural elements — the counterpart neutral scale to `paper`.

```text
ink-950   #1C211E   (--color-text-primary)
ink-900   #252A27
ink-800   #343A36
ink-700   #4A514C   (--color-text-secondary)
ink-600   #636B65
ink-500   #7E8780   (--color-text-muted)
ink-400   #A0A8A1   (--color-border-strong)
ink-300   #C6CCC7
ink-200   #DCE1DD   (--color-border-default)
ink-100   #EEF1EE   (--color-border-subtle)
```

Use the darkest ink shades for primary text, mid shades for secondary/muted text, and the lightest shades for borders and dividers — never for large fill surfaces (that is `paper`'s role).

---

# 4. GREEN (BOTANICAL GREEN)

Green is the main brand and action family. Token: `--color-green-*` in `styles/tokens.css`.

```text
green-800    #254A3A
green-700    #32614B   (--color-brand-primary)
green-600    #43775B
green-500    #5C8D70
green-400    #7EA28B
green-300    #A9C0B1
green-200    #D5E2D9
green-100    #EAF2EC
```

Recommended use:

```text
green-800
deep brand text / dark surfaces / hover state (--color-brand-primary-hover)

green-700
primary brand / primary CTA (--color-brand-primary, --color-focus-ring)

green-600
links / active emphasis

green-500
secondary accents

green-300 / 200 / 100
soft environmental and impact surfaces
```

Do not use every green shade simultaneously.

A typical screen should use only a small subset.

---

# 5. EARTH (WARM EARTH / BROWN)

Brown is the secondary earth/material family. Token: `--color-earth-*` in `styles/tokens.css`.

```text
earth-700    #7A4D35
earth-600    #986145   (--color-brand-secondary)
earth-500    #B97855
earth-400    #CD9475
earth-300    #E4B9A0
earth-200    #F0D6C7
earth-100    #F7EAE2
```

Use earth/brown for:

- earth/soil references;
- product/craft stories;
- material transformation;
- supporting accents;
- secondary visual emphasis.

Brown should remain secondary to green.

---

# 6. SEMANTIC COLORS

Semantic states must stay compatible with the natural palette. Implemented as
dedicated `--color-success-*` / `--color-warning-*` / `--color-danger-*` /
`--color-info-*` tokens in `styles/tokens.css` — these are their own small
palette (not raw green/earth values), so they stay legible and stable even
if the brand palette shifts.

### Success

```text
background → --color-success-bg   #EAF4EC
foreground → --color-success-fg   #275D35
border     → --color-success-border  #C2DEC8
```

### Warning

```text
background → --color-warning-bg   #FFF3DC
foreground → --color-warning-fg   #805A14
border     → --color-warning-border  #F3DBA7
```

### Error / Destructive

Do not use bright generic red as a brand color.

Use a restrained earthy-red treatment (`--color-danger-*`), derived in spirit from the earth family but distinct enough to read clearly as an error state — never as decoration or branding.

```text
background → --color-danger-bg   #FCEBEA
foreground → --color-danger-fg   #8B2F2B
border     → --color-danger-border  #F2C2BF
```

### Info

```text
background → --color-info-bg   #EAF1F6
foreground → --color-info-fg   #315A73
border     → --color-info-border  #BCD1E1
```

A muted blue-gray is used here rather than green/earth so informational
messages remain visually distinct from success/brand states — this is the
one deliberate, documented exception to the "no blue" rule, scoped strictly
to the `info` semantic state and never used decoratively.

---

# 7. COLOR RATIO

As a visual guideline:

```text
60–75%  paper (warm off-white)
20–30%  green
5–10%   earth (brown)
```

This is guidance, not a strict mathematical requirement.

Avoid making every section green.

---

# 8. NO COLOR DRIFT

Every normal UI color must come from:

```text
TULANG
HIJAU
COKLAT
```

or an approved semantic derivative.

This includes:

- buttons;
- badges;
- icons;
- charts;
- forms;
- cards;
- navigation;
- status;
- illustrations;
- hover states;
- focus states.

Never accept framework defaults blindly.

---

# 9. GRADIENT POLICY

Default rule:

> **No gradients.**

Prefer:

```text
flat color
+
photography
+
texture
+
typography
+
spacing
```

Do not use gradient-heavy hero sections.

Do not use glow/neon backgrounds.

Any future gradient requires an explicit documented design decision.

---

# 10. TYPOGRAPHY

Use a maximum of two primary font families.

### Display / Editorial

Use a refined serif for:

- hero headlines;
- emotional statements;
- selected campaign/editorial moments.

### Interface / Utility

Use a clean sans-serif for:

- body text;
- navigation;
- buttons;
- forms;
- dashboard;
- metrics;
- tables.

Typography should be warm and contemporary, not overly futuristic.

---

# 11. TYPE SCALE

```text
Display XL   64 / 1.02
Display L    52 / 1.05
H1           44 / 1.08
H2           36 / 1.12
H3           30 / 1.15
H4           24 / 1.20
Title        20 / 1.30
Body L       18 / 1.55
Body         16 / 1.55
Body S       14 / 1.50
Caption      12 / 1.40
```

Responsive layouts should reduce scale rather than create overflow.

---

# 12. SPACING

Use a predictable rhythm:

```text
4
8
12
16
20
24
32
40
48
64
80
96
120
```

Avoid arbitrary spacing without a clear layout reason.

---

# 13. RADIUS

```text
radius-sm   8px
radius-md   12px
radius-lg   16px
radius-xl   24px
```

Do not make every control a pill.

---

# 14. ELEVATION

Prefer:

```text
surface contrast
+
border
+
subtle shadow
```

Avoid:

- heavy shadows;
- neon glow;
- colored shadow effects;
- excessive floating surfaces.

---

# 15. BUTTONS

### Primary

Use green.

Examples:

```text
Donasikan Limbah
Mulai Berkontribusi
Jadwalkan Pickup
Konfirmasi Donasi
```

### Secondary

Use earth (brown) or outlined green.

Examples:

```text
Lihat Dampak
Lihat Program
Pelajari Cara Kerja
```

### Destructive

Use restrained earth semantic styling.

Never use bright red as decoration.

---

# 16. HOMEPAGE HERO

The hero hierarchy should communicate:

```text
KITA TUMBUH
KAMPUNG SMART FARMING
Dari Limbah, Tumbuh Manfaat.
```

Then the emotional statement:

> **SAMPAH KALIAN SANGAT BERARTI BAGI KAMI**

Then a concise explanation of:

```text
waste
→ processing
→ farming/community
→ value
→ social impact
```

Primary CTA:

```text
Donasikan Limbah
```

Secondary CTA:

```text
Lihat Dampak
```

Hero visuals should use authentic or meaningful imagery related to community, farming, materials, or transformation.

---

# 17. SIGNATURE VISUAL LANGUAGE

The product's recurring visual narrative is:

```text
LIMBAH
↓
DIKUMPULKAN
↓
DIOLAH
↓
TUMBUH
↓
BERMANFAAT
```

Use:

- green for growth and impact;
- earth (brown) for material/earth transformation;
- paper (warm off-white) for the main canvas.

This visual grammar should appear across:

- homepage;
- donation tracking;
- impact;
- transparency;
- Kampung Smart Farming sections.

---

# 18. KAMPUNG SMART FARMING

The visual identity should communicate:

```text
community
+
farming
+
smart technology
+
local economy
+
circular resources
```

Smart technology is an enabler.

Do not turn the experience into a futuristic IoT dashboard.

Use natural imagery:

- soil;
- plants;
- crops;
- farming;
- compost;
- recycled materials;
- local production;
- community activity.

---

# 19. CARDS

Use cards only when grouping improves comprehension.

Good candidates:

- programs;
- products;
- collection points;
- donations;
- impact summaries.

Avoid:

```text
card
→ card
→ card
→ card inside card
```

The page should breathe.

---

# 20. DATA VISUALIZATION

Charts should use:

```text
green
earth (brown)
paper (cream/off-white)
muted ink
```

For multiple datasets, first use light/dark variants of the same approved families.

Do not create rainbow charts.

---

# 21. STATUS

Suggested system:

```text
Pending
→ earth/paper

Scheduled
→ earth

Collected
→ soft green

Verified
→ green

Processing
→ deep green

Completed
→ deep green
```

Always use text in addition to color.

---

# 22. IMAGERY

Preferred:

- natural light;
- authentic people;
- real local environments;
- real products;
- real farming;
- real materials.

Avoid:

- generic stock charity imagery;
- exploitative poverty imagery;
- fake beneficiary photography;
- AI-generated people presented as real community members.

---

# 23. MOTION

Motion must be subtle and functional.

Good:

- opacity;
- small slide;
- state transitions;
- gentle reveal.

Avoid:

- floating blobs;
- excessive parallax;
- bouncing CTA;
- continuous decorative animation;
- neon effects.

Respect `prefers-reduced-motion`.

---

# 24. ACCESSIBILITY

The restricted palette must not reduce accessibility.

Required:

- strong contrast;
- visible focus;
- semantic HTML;
- accessible labels;
- keyboard navigation;
- text + icon for status;
- readable forms/errors.

Do not rely on color alone.

---

# 25. RESPONSIVE

Mobile is a first-class design target.

Mobile must preserve:

- warm paper base;
- green primary CTA;
- earth (brown) secondary accents;
- readable typography;
- clear hierarchy;
- no horizontal overflow.

Desktop may use richer editorial compositions and multi-column layouts.

---

# 26. ADMIN UI

Admin may be denser but must retain the same design DNA:

```text
paper background
+
green primary
+
earth (brown) secondary
+
same typography
+
same spacing
+
same status system
```

Do not convert admin into a colorful generic analytics template.

---

# 27. ANTI-SLOP COLOR CHECK

Before approving a screen:

```text
[ ] Warm off-white is the main canvas
[ ] Green is the primary visual family
[ ] Brown is secondary
[ ] No random blue
[ ] No random purple
[ ] No random pink
[ ] No random cyan
[ ] No decorative bright red
[ ] No rainbow chart
[ ] No gradient-heavy background
[ ] No neon/glow
[ ] Palette feels natural
[ ] Palette feels professional
```

---

# 28. Final Brand Expression

The website should feel like:

> **a modern community movement rooted in nature, not a technology company pretending to be green.**

Primary identity:

> **KITA TUMBUH**  
> **KAMPUNG SMART FARMING**  
> **Dari Limbah, Tumbuh Manfaat.**

Core emotional statement:

> **SAMPAH KALIAN SANGAT BERARTI BAGI KAMI**
