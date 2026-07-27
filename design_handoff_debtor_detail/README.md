# Handoff: Debtor Detail page redesign (option "1b — Money first")

## Overview
Redesign of the debtor detail page in Tuabi (dark-theme debt-tracking app). The current page shows the signup photo as a large thumbnail at the top of an info card, which wastes vertical space and buries the thing that actually matters — the outstanding balance. This redesign demotes the photo to a small avatar in the title row (with a full copy in a side rail), promotes the balance to a stat row, and replaces the empty transactions table with a timeline.

**Implement option `1b` only.** The bundled HTML file also contains an alternative direction (`1a — Identity rail`) for reference; ignore it unless asked.

## About the design files
`Debtor Detail.dc.html` is a **design reference created in HTML** — a prototype of the intended look, not production code to copy. Recreate it in the app's existing environment (React/Tailwind/shadcn or whatever the codebase uses) with the codebase's own components, tokens and utilities. The file opens directly in a browser. It renders two options side by side; the one to build is the block with `id="1b"`.

## Fidelity
**High-fidelity.** Colors, type, spacing and radii below are final values — match them, but express them through the codebase's existing token system where equivalents exist (the values were derived from the current app's dark theme).

## Screen: Debtor detail (`/debtors/:id`)
Purpose: the shop owner checks how much one customer owes, confirms who they are, and records a payment or a reminder.

Page shell is unchanged (existing sidebar + top bar). Everything below describes the main content column, padding `32px 36px 36px`, background `#0b0e14`.

### 1. Header row
`display:flex; align-items:center; justify-content:space-between; gap:20px`

Left cluster (`flex; align-items:center; gap:16px`):
- **Back button** — 36×36, `border-radius:10px`, `1px solid #232b3a`, arrow glyph `#8b94a6`. Navigates to Debtors list.
- **Avatar** — 56×56 circle.
  - *With photo:* `object-fit:cover`, `2px solid #232b3a` border, plus an 18px `#34d399` presence dot at bottom-right with a `3px solid #0b0e14` ring. Clicking opens the full photo in a lightbox.
  - *Without photo (photo is optional):* same 56px circle, `background:#6366f11f`, `1px solid #6366f13d`, initials from the name in `800 19px Manrope`, color `#a5abff`.
- **Name + meta** (`flex column; gap:5px`):
  - Name — `800 26px/1 Manrope`, `#f2f4f8`, `letter-spacing:-0.02em`. Render as stored (lowercase input stays lowercase).
  - Meta line — `500 13px Manrope`, `#6b7488`: `"024 529 8765 · customer since 7/26/2026 · "` followed by a link in `#8b93ff` reading **View ID photo** when a photo exists, **Add a photo** when it doesn't.

Right cluster (`flex; gap:10px`):
- **Edit** — `padding:11px 18px`, `border-radius:10px`, `1px solid #232b3a`, text `600 14px`, `#c3c9d6`.
- **Record payment** — `padding:11px 18px`, `border-radius:10px`, `background:#6366f1`, text `700 14px #fff`, `box-shadow:0 6px 20px -6px #6366f1aa`. Label `+ Record payment`.

### 2. Stat row
`display:grid; grid-template-columns:1.35fr 1fr 1fr; gap:14px`. All cards `border-radius:16px`, `padding:24px 26px`, `flex column; gap:12px`.

Every card has: a mono eyebrow (`600 11px JetBrains Mono`, `letter-spacing:.14em`), a value, and a caption (`500 13px Manrope`, `#6b7488`).

| Card | Eyebrow | Value | Caption |
|---|---|---|---|
| Balance owed (accent) | `BALANCE OWED` in `#a1707a` | `GH₵ 862.00` — `800 46px Manrope`, `#f87171`, `letter-spacing:-0.03em`, decimals at `24px` / `#f8717199`, `white-space:nowrap` | `Unchanged for 0 days` in `#8b94a6` |
| Total paid | `TOTAL PAID` in `#616a7d` | `GH₵ 0` — `800 34px`, `#e6e9ef` | `across 0 payments` |
| Last activity | `LAST ACTIVITY` in `#616a7d` | `Today` — `800 34px`, `#e6e9ef` | `debt created` |

Balance card background `linear-gradient(140deg,#1a1319 0%,#10131b 70%)`, border `1px solid #f8717129`. Other two: background `#0f131b`, border `1px solid #1c2330`.

### 3. Body: `display:grid; grid-template-columns:1fr 320px; gap:22px; align-items:start`

**Left — tabs + timeline**
- Tab bar: `flex; gap:26px; border-bottom:1px solid #1c2330`. Tabs `padding-bottom:12px`. Active = `700 15px`, `#f2f4f8`, underline `inset 0 -2px 0 #6366f1`; inactive = `600 15px`, `#6b7488`. Tabs: **Transaction history**, **Reminders**.
- Timeline replaces the old empty-state table. Each entry is `flex; gap:16px`:
  - Marker column: an 11px dot; completed events `#6366f1` filled, the pending event `1px solid #3a4356` on `#161c27`. A `2px` `#1c2330` vertical rule fills the space between dots.
  - Entry 1 (creation, always present): title `700 15px #e6e9ef` — `Debt created — GH₵ 862`; subtitle `500 13px #6b7488` — `7/26/2026 · "Bought poi" · recorded by Demo Store Owner`. `padding-bottom:26px`.
  - Entry 2 (pending, only while no payments exist): `600 15px #6b7488` — `Awaiting first payment`, plus a ghost button `Record payment`: `padding:10px 18px`, `border-radius:9px`, `background:#6366f11f`, `1px solid #6366f14d`, text `700 13px #a5abff`.
  - Once payments exist, each payment becomes a completed entry (amount, date, running balance) and the pending row drops off.

**Right rail** (`flex column; gap:14px`)
- **Photo card** *(only when a photo exists)*: `border-radius:16px`, `overflow:hidden`, `1px solid #1c2330`, `background:#0f131b`. Image `width:100%; height:190px; object-fit:cover`. Footer `padding:14px 16px`, top border `#1c2330`: `Captured at signup` (`700 13px #c3c9d6`) and `7/26/2026 · 14:02 · Demo Store` (`500 12px JetBrains Mono`, `#616a7d`). Click opens the lightbox.
- **No-photo card** *(when no photo)*: replaces the above, dashed `1px dashed #232b3a`, `padding:18px 20px`, `flex; align-items:center; gap:14px` — a 44px `border-radius:12px` initials tile (`#6366f11a` bg, `#6366f133` border, `700 15px #a5abff`) plus `No photo on file` (`700 13px #c3c9d6`) and an `Add one` link (`600 12px #8b93ff`) that opens the camera/upload flow.
- **Description card**: `1px solid #1c2330`, `border-radius:16px`, `padding:18px 20px`, `background:#0f131b`. Eyebrow `DESCRIPTION` (mono 11px `#616a7d`), body `600 15px/1.5 #e6e9ef`. Hide the card if the description is empty.
- **Call / Remind buttons**: `flex; gap:10px`, each `flex:1`, `padding:12px 0`, `border-radius:10px`, `1px solid #232b3a`, `600 13px #c3c9d6`, centred. Call → `tel:` link; Remind → reminder composer.

## Optional-photo rule
The photo is optional at debtor creation. When absent:
1. Avatar → initials circle (first letter of first + last name, uppercase, `#a5abff` on `#6366f11f`).
2. Title meta link → `Add a photo`.
3. Right-rail photo card → the compact dashed "No photo on file" card.
No layout shift beyond the rail card getting shorter; never render an empty frame or a broken image.

## Interactions & behavior
- Avatar / photo card click → lightbox with the full-resolution capture; Esc or backdrop click closes.
- `+ Record payment` → payment modal; on success, prepend a completed timeline entry, decrement Balance owed, increment Total paid, set Last activity to `Today`.
- Hover: bordered buttons lighten border to `#313a4b`; primary button brightens to `#7275f5`. Transition `background/border-color 150ms ease`.
- Fully-paid state: balance card switches accent from red to `#34d399`, eyebrow to `SETTLED`, and the status wording follows.
- Responsive: under ~1024px the body grid collapses to one column with the rail below the timeline; the stat row becomes a single column at ~640px.

## State
`debtor { id, name, phone, amountOwed, amountPaid, description, photoUrl | null, createdAt }`, `transactions[]`, `activeTab: 'transactions' | 'reminders'`, `lightboxOpen: boolean`, `paymentModalOpen: boolean`. Derived: `balance = amountOwed - amountPaid`, `progress = amountPaid / amountOwed`, `lastActivityAt`.

## Design tokens
Colors — page `#0b0e14`; card `#0f131b`; raised `#11161f`; border `#1c2330`; border-strong `#232b3a`; text `#f2f4f8`; body `#e6e9ef`; secondary `#c3c9d6`; muted `#8b94a6`; faint `#6b7488`; eyebrow `#616a7d`; primary `#6366f1` (tint `#6366f11f`, border `#6366f14d`, light text `#a5abff`, link `#8b93ff`); danger `#f87171` (tint border `#f8717129`); success `#34d399`.

Radii — 9/10 (buttons), 12/14, 16 (cards), 999 (pills).
Spacing — 4 · 5 · 7 · 10 · 14 · 16 · 20 · 22 · 26 · 32 · 36.
Type — **Manrope** 400–800 for UI; **JetBrains Mono** 400–500 for eyebrows and timestamps. Scale: 11 mono eyebrow / 12–13 caption / 14–15 body / 26 page title / 34 secondary stat / 46 balance.
Shadow — primary button `0 6px 20px -6px #6366f1aa`.

## Assets
- `debtor-photo.png` — a crop from the user's screenshot, used only as sample data. Real photos come from the existing signup capture.
- Icons in the current app (phone, calendar, bell, etc.) are unchanged — reuse the existing icon set; the redesign doesn't require new ones.

## Files
- `Debtor Detail.dc.html` — the prototype. Build the `id="1b"` block; `id="1a"` is an unused alternative.
- `debtor-photo.png` — sample image referenced by the prototype.
