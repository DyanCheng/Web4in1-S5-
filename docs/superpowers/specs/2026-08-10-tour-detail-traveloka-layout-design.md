# Tour Detail Traveloka Layout — Design Spec

**Date:** 2026-08-10  
**Scope:** Frontend tour detail page layout only  
**File:** `frontend/src/app/tour/[id]/page.tsx`  
**Reference:** [Traveloka Disney Adventure cruise product](https://www.traveloka.com/vi-vn/cruise/product/4d3n-singapore-cruise-on-the-disney-adventure-4987978912457)

## Goal

Restructure the tour detail page layout to follow Traveloka’s product page composition (gallery → title below media → itinerary + sticky booking → secondary blocks), without changing fonts or source images.

## Decisions (approved)

| Topic | Choice |
| --- | --- |
| Scope | Full page layout (Traveloka-like), not itinerary-only |
| Approach | Inline layout rewrite in existing `page.tsx` (no new component files) |
| Gallery | Structural gallery frame; reuse the same `tour.image` for main + thumbnails |
| Content blocks | Keep all existing blocks; prioritize itinerary + booking; compact secondary blocks below |
| Itinerary UI | Replace day accordion with always-expanded vertical timeline/route |
| Fonts | Do not change font family / typography classes in use |
| Images | Do not change image URLs or add real multi-image assets |
| API | No schema/API changes |

## Page structure (top → bottom)

1. `Header` (unchanged)
2. **Gallery frame**
   - Desktop: large image (~2/3) + right column of 2–3 thumbnails, all using `tour.image`
   - Mobile: large image; horizontal thumbnail row under it (same image)
   - Thumbnail click: UI highlight only (no real image switch)
   - Save / Share controls on the gallery (reuse existing Heart / Share behavior)
   - Optional “Xem tất cả hình ảnh” text label only — no new lightbox required
3. **Title block under gallery** (no hero text overlay)
   - Location, title, rating, duration
   - Remove overlay badge, gradient-on-hero title treatment from previous layout
4. **Two-column grid (`lg`)**
   - Left (~2/3): itinerary timeline
   - Right (~1/3): sticky booking card (date, adults/children, totals, Payline) — same logic as today
5. **Secondary blocks** (full width under the grid, slightly tighter spacing)
   - Overview → Highlights → Matched locations → Included/Excluded → Reviews
6. `Footer` + existing booking success modal (unchanged behavior)

## Itinerary timeline

Replace `expandedDays` / accordion interaction.

### Route summary header

- Label “Khởi hành từ” + `tour.location`
- Short route line built from existing data:
  - Prefer: `location` → day titles → `location`
  - Fallback if sparse: `location` → “Các ngày trong tour” → `location`

### Detail nodes

For each `tour.itinerary[]` day:

- Vertical timeline node: “Ngày N” + `title`
- Optional chips: `meals`, `accommodation`
- Activities listed inline: `time` + `desc` (always visible, no collapse)

Empty state unchanged when `itinerary.length === 0`.

No new itinerary fields; map only existing `TourItineraryDay` shape.

## Behavior preserved

- `fetchTourById`, favorites, booking → cart, review eligibility/submit, matched locations from Supabase
- Sticky booking totals (`adults`, `children`, `childPrice`, `bookingTotal`)
- Theme / dark mode class patterns already on the page

## Out of scope

- Real multi-image gallery / lightbox
- Mobile sticky bottom CTA bar like Traveloka app
- Font or brand-token changes
- Backend / admin tour form changes
- Extracting new shared components (deferred)

## Success criteria

- First viewport reads as Traveloka-like: media gallery, then title (not overlay hero)
- Itinerary is a continuous timeline, not accordion days
- Booking remains sticky on desktop right column with same booking flow
- Secondary content still available below, denser but complete
- Visual assets still come from the same `tour.image`; typography classes remain the existing ones

## Implementation note

Surgical JSX/layout edits inside `page.tsx` only. Remove accordion state (`expandedDays`, `toggleDay`) once timeline replaces it.
