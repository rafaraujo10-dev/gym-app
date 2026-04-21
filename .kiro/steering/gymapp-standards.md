# GymApp — Engineering Standards

## Design Philosophy
This is a **premium, serious fitness app**. Every decision must reflect that.
- Zero emojis anywhere in the UI. Use SVG icons or Unicode symbols sparingly and only when they add clarity.
- No animated GIFs, no cartoon figures, no stick figures.
- Clean, minimal, dark UI. Think Apple Fitness+ meets a premium SaaS tool.
- Typography-first design. Weight, spacing, and hierarchy carry the visual language.
- Every interaction must feel intentional and polished.

## Code Standards
- All code lives in `public/index.html` — single file, no build step.
- Deploy: `git push` from `gym-app/` → Cloudflare Pages auto-deploys to `https://gym-app-8ea.pages.dev/`
- Always use `cwd: gym-app` for git commands.
- Use semicolons as command separators in PowerShell (not `&&`).

## UX Rules (non-negotiable)
1. **Weights are always editable** — everywhere a weight is shown, it must be tappable to edit.
2. **Language change must never lose form data** — save all OB fields before re-rendering.
3. **No emoji in UI** — use clean text labels and SVG icons only.
4. **BLE scan only triggers if a device was previously paired** — never auto-scan on first use.
5. **Finish Anyway must work** — saves all completed sets, marks skipped as N/A, excludes N/A from weight progression logic.
6. **Navigation in workout** — always show prev/next exercise names, plus "Select exercise" and "End workout" as 4 bottom actions.
7. **Units** — weight input in onboarding must respect lb/kg selection. Height in cm only (no ft/in needed for now).
8. **Premium tone** — no playful copy, no exclamation marks in UI labels, no emoji substitutes for real design.

## i18n
- All 3 languages (pt/en/es) must be complete and correct.
- The onboarding step 1 title/subtitle must be translated per language.
- Language switch in onboarding must preserve all entered data.

## localStorage keys
- `ga_settings` → `{autoWeights, autoBle, numSets, bleArm, bleLeg, lastAutoWeights, disclaimerSeen}`
- All weights stored internally in **lb**.
