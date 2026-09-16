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

The entire product uses a **controlled natural palette**:

```text
TULANG / WARM OFF-WHITE
HIJAU
COKLAT
```

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

# 3. TULANG / WARM OFF-WHITE

The website should not use harsh pure white as its dominant canvas.

Use warm ivory/paper tones:

```text
cream-50     #FDFCF8
cream-100    #F8F5EC
cream-200    #EFEADF
cream-300    #E2DACB
cream-400    #D2C7B5
```

Primary usage:

```text
cream-50
main page background

cream-100
section background

cream-200
soft surface / divider

cream-300
border / muted surface

cream-400
strong muted divider
```

The overall interface should feel like warm quality paper.

`#FFFFFF` may be used sparingly for specific surfaces where necessary, but it must not dominate the full page.

---

# 4. HIJAU

Green is the main brand and action family.

```text
green-900    #173B2A
green-800    #214C37
green-700    #2F6247
green-600    #477A5B
green-500    #62916D
green-400    #7FA688
green-300    #A8BDAA
green-200    #CDDDCF
green-100    #E5EEE6
```

Recommended use:

```text
green-900
deep brand text / dark surfaces

green-800
primary brand

green-700
primary CTA

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

# 5. COKLAT

Brown is the secondary earth/material family.

```text
brown-900    #3E2A21
brown-800    #52372A
brown-700    #684636
brown-600    #815843
brown-500    #9A6A50
brown-400    #B08369
brown-300    #C8A591
brown-200    #DFCCBD
brown-100    #F0E4DA
```

Use brown for:

- earth/soil references;
- product/craft stories;
- material transformation;
- supporting accents;
- secondary visual emphasis.

Brown should remain secondary to green.

---

# 6. SEMANTIC COLORS

Semantic states must stay compatible with the natural palette.

### Success

```text
background → green-100
foreground → green-800
```

### Warning

```text
background → brown-100
foreground → brown-800
```

### Error / Destructive

Do not use bright generic red as a brand color.

Use a restrained earthy treatment derived from the brown/earth family.

A stronger red-like signal is allowed only when conventional accessibility/semantic signaling genuinely requires it, and only for the state—not as decoration or branding.

### Info

Prefer muted green, brown, or neutral tones.

Do not introduce blue just because a UI library normally uses blue for information.

---

# 7. COLOR RATIO

As a visual guideline:

```text
60–75%  warm off-white
20–30%  green
5–10%   brown
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

Use brown or outlined green.

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
- brown for material/earth transformation;
- cream for the main canvas.

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
brown
cream
muted ink
```

For multiple datasets, first use light/dark variants of the same approved families.

Do not create rainbow charts.

---

# 21. STATUS

Suggested system:

```text
Pending
→ brown/cream

Scheduled
→ brown

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

- warm cream base;
- green primary CTA;
- brown secondary accents;
- readable typography;
- clear hierarchy;
- no horizontal overflow.

Desktop may use richer editorial compositions and multi-column layouts.

---

# 26. ADMIN UI

Admin may be denser but must retain the same design DNA:

```text
cream background
+
green primary
+
brown secondary
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
