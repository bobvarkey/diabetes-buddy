## Goal

Restyle `src/pages/LandingPage.tsx` to mirror the uploaded reference (Lipid Risk Predictor landing). Same content/routes — new look.

## Visual direction (locked from reference)

- **Theme**: light. Off-white background `hsl(0 0% 99%)`, slate body text, near-black headlines.
- **Accent**: rose/pink (`#E11D48` / rose-600). Used for badge, italic word, primary CTA, icon chips.
- **Typography**: bold sans headline with one italic accent word (e.g. *Predictor*). Body in muted slate. Wider max-width (`max-w-3xl`) and larger type than current mobile-only layout.
- **Hero composition**:
  - Centered pill badge with heart icon: "❤ CARDIOVASCULAR · METABOLIC CARE"
  - H1: "Diabetes Risk *Predictor*" — bold + italic rose accent
  - Subhead paragraph, centered, slate-500
  - Two pill buttons side-by-side: solid rose "Get Started →" + outline "Clinic Tool"
  - Rounded hero image (doctor/clinical) with a floating white overlay card pinned bottom-left containing a rose circle icon + "10-Year ASCVD Risk / PREVENT 2024 Equations"
- **"Diagnostic Arsenal"**: section heading + subhead, then 2×2 (md) / 1-col (sm) card grid. Each card: white, soft border, small label, title, one-line desc, arrow → on the right.
- **Data-Driven panel**: light card with checklist, "98.4% Guideline Accuracy" stat, "HIPAA Compliant" chip, Start Assessment CTA.
- **Footer**: small muted disclaimer line — guidelines + educational use.

## Implementation

Single-file rewrite of `src/pages/LandingPage.tsx`:

1. Swap dark wrapper for `bg-background text-foreground` light shell.
2. Build hero per composition above. Replace emoji placeholder with a generated clinical hero image (1024×640, doctor at monitors, pink/magenta lighting) imported from `src/assets/landing-hero.jpg`.
3. Recreate Diagnostic Arsenal as 2-col grid keeping existing 6 routes (Insulin Titration, HbA1c, GLP-1, Med Optimizer, CKD, Clinical Guides).
4. Add overlay card on hero image (absolute, bottom-left, white, shadow).
5. Keep Comprehensive Prescription Generator card but restyle as light featured card above the arsenal.
6. Replace Data-Driven section with reference styling (4 checkmark items, stat, chip, CTA).

## Tokens (no hardcoded colors)

Use semantic Tailwind: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`. Map rose accent through existing `--primary` if it's already rose-aligned; otherwise add a `--accent-rose` token in `index.css` and a `rose` color in `tailwind.config.ts`, both as HSL. Reuse for badge / CTA / icon chips.

## Out of scope

- No routing changes, no new pages, no business logic.
- Other build errors in the project (PatientInput, ModeSelector, med-logic, etc.) are unrelated and not touched here.
