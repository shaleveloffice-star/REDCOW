# Black Bear Burger

## Mission
Create implementation-ready, token-driven UI guidance for Black Bear Burger that is optimized for consistency, accessibility, and fast delivery across content site.

## Brand
- Product/brand: Black Bear Burger
- URL: https://www.blackbearburger.com/?utm_source=chatgpt.com
- Audience: readers and knowledge seekers
- Product surface: content site

## Style Foundations
- Visual style: minimal, utility-first, accessibility-prioritized
- Main font style: `font.family.primary=BaseOne Heavy`, `font.family.stack=BaseOne Heavy, BaseOne, sans-serif`, `font.size.base=23.746px`, `font.weight.base=800`, `font.lineHeight.base=32.5795px`
- Typography scale: `font.size.xs=0px`, `font.size.sm=14.45px`, `font.size.md=16px`, `font.size.lg=19.1px`, `font.size.xl=23.75px`, `font.size.2xl=27.62px`, `font.size.3xl=31.49px`, `font.size.4xl=46.98px`
- Color palette: `color.border.default=#ffffff`, `color.surface.base=#000000`
- Spacing scale: `space.1=1.91px`, `space.2=4px`, `space.3=8.67px`, `space.4=20px`, `space.5=23.24px`, `space.6=44.8px`, `space.7=51.64px`, `space.8=85.62px`
- Radius/shadow/motion tokens: `radius.xs=50px` | `shadow.1=rgb(255, 255, 255) 0px 0px 0px 0px inset` | `motion.duration.instant=100ms`, `motion.duration.fast=140ms`, `motion.duration.normal=650ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (61), buttons (28), navigation (4), cards (2), lists (2).

- Extraction diagnostics: Limited color diversity detected; color token inference confidence is low. Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
