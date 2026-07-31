# EstoSpaces Design System

> This file mirrors the approved landing-page direction in
> `.superdesign/design-system.md`. Page-specific files may refine composition,
> but they must not replace the core palette, typography, truthfulness, or
> accessibility rules below.

**Project:** EstoSpaces  
**Direction:** Surveyor's tracing film  
**Status:** Approved landing system, 31 July 2026

## Product character

EstoSpaces is a transparent working instrument for a property journey. It
should feel architectural, measured, calm, and operational—not like a luxury
property catalogue, a generic SaaS template, or a speculative technology demo.

## Tokens

### Color

| Role                   | Value                  | Current CSS convention |
| ---------------------- | ---------------------- | ---------------------- |
| Mineral canvas         | `#11130F`              | `--ink`                |
| Raised mineral surface | Existing landing token | `--ink-raised`         |
| Chalk text             | `#F2F0E8`              | `--paper`              |
| Stone secondary text   | `#A8ADA2`              | `--stone`              |
| Dim stone              | Existing landing token | `--stone-dim`          |
| Tracing rule           | `#3B4038`              | `--rule-strong`        |
| Signal orange          | `#E95A24`              | `--signal`             |

Use the signal orange for the primary action, active status, and measured
accents only. Do not add teal, blue gradients, acid colors, glass surfaces, or
alternating light/dark section themes.

### Typography

- Display and body: `Archivo`, variable sans-serif.
- Field labels, route numbers, status, and compact metadata: `IBM Plex Mono`.
- Headlines are left-aligned, tightly tracked, and balanced.
- Body copy stays calm, direct, and readable at 50–75 characters per line.
- All-caps is reserved for short operational labels.

### Shape and depth

- Panels and controls use precise 0–4px corners.
- Depth comes from photographic planes, translucent tracing layers, clipping,
  and rule weight.
- Shadows are rare.
- No pill-heavy UI, floating glass cards, gradient blobs, or decorative
  rounded containers.

## Approved page composition

### Navigation

- Slim mineral-dark navigation integrated into the page field.
- Keep the current product, journey, audience, trust, account, and blog routes.
- On mobile use a clear menu with focus return, Escape closing, and scroll
  locking.

### Hero

- Split field: left content column, right architectural threshold image.
- Left column order: private-beta status, headline, concise explanation,
  primary and secondary actions, professional-access link.
- Keep the complete desktop composition inside the opening viewport.
- Keep the operational caveat compact and attached to the image field.
- Do not animate the navigation or headline by character.

### Product proof

- Show exactly two genuine, sanitized dashboard captures:
  seeker dashboard and manager dashboard.
- Frames are equal, 1120×609 intrinsic pixels, and compact.
- Desktop: two columns. Mobile: one column.
- Captions must state private-beta scope, capture date, test-data status, and
  cropping.
- Never use generated mockups, obsolete UI, customer personal data, or a poor
  screenshot merely to fill space.

### Narrative sections

- Use route lines, numbered waypoints, relay panels, evidence tables, and
  restrained common regions.
- Seeker and manager perspectives are two sides of one journey.
- Keep qualifications adjacent to the 10-minute target and 24-hour Fast Track
  aim.

## Controls

- Primary action: solid signal-orange rectangle, mineral-dark text, at least
  48px high.
- Secondary action: transparent with a clear light rule.
- Links use an underline or line-draw treatment, not color alone.
- All interactive targets are at least 44×44px on touch.
- Every interactive element has visible hover, focus-visible, active, and
  disabled states where applicable.
- Focus rings are at least 2px and meet 3:1 contrast.

## Motion

- Motion supports the route narrative; it never hides core content.
- Use transform and opacity, normally 160–240ms for interactions.
- Product proof may use a restrained clip/settle reveal.
- Avoid infinite marquees, continuous decorative motion, pinned mobile
  sections, `transition: all`, character animation, or raw scroll-state React
  rerenders.
- Under `prefers-reduced-motion: reduce`, render the complete static
  composition with no parallax, pinning, smoothing, or delayed reveal.

## Responsive and accessibility rules

- Reflow without horizontal page overflow at 320 CSS px.
- Validate 320, 360, 390, 768, 1440, and 1920 widths plus 200% zoom.
- Maintain body contrast of at least 4.5:1 and UI/focus contrast of at least
  3:1.
- Preserve semantic landmarks, one logical H1, a skip link, keyboard access,
  meaningful alt text, practical touch targets, and text-spacing tolerance.
- No content may depend on animation, hover, color alone, or client-side
  hydration.

## Content guardrails

- Private-beta access, inventory, and professional coverage vary.
- Ten minutes is an operating target, not a guarantee.
- Twenty-four hours is an aim to progress toward a viewing or application, not
  transaction completion.
- Public search remains withheld until production release checks pass.
- EstoSpaces is a software platform backed by
  `Estospaces Solutions Private Limited` and
  `Estospaces Solutions Limited`; no estate-agency status is claimed.
- No fake product UI, testimonials, customer or property metrics, unsupported
  features, provider endorsements, pricing, or outcome promises.

## Pre-delivery checklist

- [ ] Uses the approved palette, Archivo, and IBM Plex Mono.
- [ ] Primary action is visually dominant.
- [ ] Product proof uses current sanitized real captures.
- [ ] No horizontal overflow from 320px upward.
- [ ] Focus, keyboard, touch targets, contrast, and reduced motion pass.
- [ ] Motion uses transform/opacity and is nonessential.
- [ ] Public claims remain qualified and traceable to the claims register.
- [ ] Local build, format, lint, typecheck, tests, site audit, and launch
      verifier pass.
