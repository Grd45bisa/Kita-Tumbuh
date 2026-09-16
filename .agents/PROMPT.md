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
- Warm Off-White / Tulang (Dominant canvas: 60–75%)
- Green / Hijau (Primary brand / action: 20–30%)
- Brown / Coklat (Secondary material / earth: 5–10%)
```

### Approved Hex Values

#### Tulang / Warm Off-White
```text
cream-50   #FDFCF8 (Main page canvas)
cream-100  #F8F5EC (Section background)
cream-200  #EFEADF (Soft surface / divider)
cream-300  #E2DACB (Border / muted surface)
cream-400  #D2C7B5 (Strong divider)
```

#### Green / Hijau
```text
green-900  #173B2A (Deep brand text / dark surface)
green-800  #214C37 (Primary brand)
green-700  #2F6247 (Primary CTA)
green-600  #477A5B (Links / active emphasis)
green-500  #62916D (Secondary accents)
green-400  #7FA688
green-300  #A8BDAA
green-200  #CDDDCF
green-100  #E5EEE6 (Soft environmental surface)
```

#### Brown / Coklat
```text
brown-900  #3E2A21
brown-800  #52372A
brown-700  #684636
brown-600  #815843 (Secondary brand CTA / earth accent)
brown-500  #9A6A50
brown-400  #B08369
brown-300  #C8A591
brown-200  #DFCCBD
brown-100  #F0E4DA (Soft warning / earth surface)
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

1. Do NOT introduce default framework colors (e.g. default Tailwind/shadcn blue/purple focus rings or tags). Replace them with approved green/brown semantic tokens.
2. A restrained earthy tone is allowed strictly for semantic error/destructive states—never as decoration or branding.
3. Data charts must use green, brown, and cream tones only. No rainbow charts.
4. No neon glows or heavy glassmorphism.

---

## 4. Phase Continuity

- **Phase 0** establishes the design tokens and foundation.
- **Phase 1** homepage visibly uses the approved tokens.
- **All later phases** inherit the exact same system across public, member, and admin surfaces.
