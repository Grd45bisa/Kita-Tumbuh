# PROMPT.md — Standard Agent Prompting & Execution Baseline

This document defines the mandatory context, constraints, and checklist that must be included in every prompt or instruction for UI-building and feature phases in this repository.

---

## 1. Brand Hierarchy

Every UI-building phase must explicitly contain:

```text
MASTER BRAND:
KITA TUMBUH

PLATFORM:
KAMPUNG SMART FARMING

TAGLINE:
Dari Limbah, Tumbuh Manfaat.

CORE MESSAGE:
SAMPAH KALIAN SANGAT BERARTI BAGI KAMI
```

Hierarchy:
```text
KITA TUMBUH (Master Brand)
└── KAMPUNG SMART FARMING (Platform / Ekosistem)
    └── Dari Limbah, Tumbuh Manfaat. (Tagline)
```

- **KITA TUMBUH** = Master brand gerakan gotong royong dan kemandirian sirkular.
- **KAMPUNG SMART FARMING** = Platform / ekosistem operasional pengolahan limbah, pertanian pintar komunitas, dan alokasi dampak.
- **Tagline** = *Dari Limbah, Tumbuh Manfaat.*
- **Core Emotional Statement** = *SAMPAH KALIAN SANGAT BERARTI BAGI KAMI*

---

## 2. Approved Color System

Every phase must enforce the strict natural palette:

```text
PRIMARY PALETTE:
- Warm Off-White / Paper (Dominant canvas: 60–75%)
- Green (Primary brand / action: 20–30%)
- Earth / Brown (Secondary material / earth: 5–10%)
```

> These are the tokens actually implemented in `styles/tokens.css` (and
> mirrored in `lib/tokens/index.ts`) — `--color-paper-*`, `--color-ink-*`,
> `--color-green-*`, `--color-earth-*`. An earlier draft of this document
> used `cream-*` / `brown-*` names with different hex values; this section
> was reconciled to match the shipped tokens. See `.agents/DECISIONS.md`.

### Approved Hex Values (from `styles/tokens.css`)

#### Paper / Warm Off-White (`--color-paper-*`)
```text
paper-0    #FFFFFF (Raised surfaces, used sparingly)
paper-50   #FCFCFA (Main page canvas — --color-bg-canvas)
paper-100  #F7F7F3 (Section background — --color-bg-subtle)
paper-150  #F1F1EA (Muted surface / divider — --color-bg-muted)
```

#### Ink (neutral text & structure — `--color-ink-*`)
```text
ink-950  #1C211E (Primary text — --color-text-primary)
ink-700  #4A514C (Secondary text — --color-text-secondary)
ink-500  #7E8780 (Muted text — --color-text-muted)
ink-400  #A0A8A1 (Strong border — --color-border-strong)
ink-200  #DCE1DD (Default border — --color-border-default)
ink-100  #EEF1EE (Subtle border — --color-border-subtle)
```

#### Green (`--color-green-*`)
```text
green-800  #254A3A (Deep brand text / hover — --color-brand-primary-hover)
green-700  #32614B (Primary brand / primary CTA — --color-brand-primary)
green-600  #43775B (Links / active emphasis)
green-500  #5C8D70 (Secondary accents)
green-400  #7EA28B
green-300  #A9C0B1
green-200  #D5E2D9
green-100  #EAF2EC (Soft environmental surface)
```

#### Earth / Brown (`--color-earth-*`)
```text
earth-700  #7A4D35
earth-600  #986145 (Secondary brand CTA / earth accent — --color-brand-secondary)
earth-500  #B97855
earth-400  #CD9475
earth-300  #E4B9A0
earth-200  #F0D6C7
earth-100  #F7EAE2 (Soft warning / earth surface)
```

---

## 3. Strict Negative Rules

```text
NO RANDOM BLUE
NO RANDOM PURPLE
NO RANDOM PINK
NO RANDOM CYAN
NO DECORATIVE BRIGHT RED
NO RAINBOW PALETTE
NO GRADIENT-HEAVY UI
```

1. Do NOT introduce default framework colors (e.g. default Tailwind/shadcn blue/purple focus rings or tags). Replace them with approved green/earth semantic tokens.
2. A restrained earthy tone is allowed strictly for semantic error/destructive states—never as decoration or branding.
3. Data charts must use green, earth (brown), and paper (cream/off-white) tones only. No rainbow charts.
4. No neon glows or heavy glassmorphism.

---

## 4. Phase Continuity

- **Phase 0** establishes the design tokens and foundation.
- **Phase 1** homepage visibly uses the approved tokens.
- **All later phases** inherit the exact same system across public, member, and admin surfaces.
