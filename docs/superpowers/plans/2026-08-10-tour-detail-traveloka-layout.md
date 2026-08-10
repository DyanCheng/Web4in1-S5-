# Tour Detail Traveloka Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the tour detail page to a Traveloka-like layout (gallery → title under media → itinerary timeline + sticky booking → compact secondary blocks) without changing fonts or image sources.

**Architecture:** Single-file JSX/layout rewrite inside `frontend/src/app/tour/[id]/page.tsx`. Keep all data fetching, booking, favorites, and review logic. Replace the overlay hero + accordion itinerary with a structural gallery, title block, and always-expanded vertical timeline. Reuse `tour.image` for main + thumbnail slots.

**Tech Stack:** Next.js App Router (`"use client"`), React state/hooks, Tailwind utility classes already on the page, `ImageWithFallback`, existing lucide icons.

## Global Constraints

- Do **not** run any git commands (no add/commit/push/checkout) — user request.
- Do **not** change font family / existing typography class patterns (`font-sans`, `font-black`, `font-bold`, etc.).
- Do **not** change image URLs or add real multi-image assets — only reuse `tour.image`.
- Do **not** change API/schema or admin tour form.
- Do **not** extract new component files — edit `page.tsx` only (approved approach).
- Preserve booking, cart, favorite, review, and matched-locations behavior.
- Spec: `docs/superpowers/specs/2026-08-10-tour-detail-traveloka-layout-design.md`

---

## File map

| File | Responsibility |
| --- | --- |
| Modify: `frontend/src/app/tour/[id]/page.tsx` | Entire layout rewrite for gallery, title, timeline, booking grid, secondary blocks |
| Reference only: `docs/superpowers/specs/2026-08-10-tour-detail-traveloka-layout-design.md` | Approved decisions |

No other files.

---

### Task 1: Remove accordion state and prepare gallery highlight state

**Files:**
- Modify: `frontend/src/app/tour/[id]/page.tsx` (state near `expandedDays` / `toggleDay` / related `useEffect`)

**Interfaces:**
- Consumes: existing `itinerary` from `useMemo` on `tour?.itinerary`
- Produces: `activeThumb: number` state (0-based index) for gallery highlight only

- [ ] **Step 1: Remove accordion state**

Delete:
- `const [expandedDays, setExpandedDays] = useState<number[]>([1]);`
- the `useEffect` that sets `expandedDays` from `itinerary`
- `toggleDay` function

Confirm unused imports later: if `ChevronDown` / `ChevronUp` are only used by accordion, remove them from the lucide import in Task 3.

- [ ] **Step 2: Add gallery thumb highlight state**

Add near other UI state:

```tsx
const [activeThumb, setActiveThumb] = useState(0);
const galleryThumbs = [0, 1, 2]; // three slots, all render tour.image
```

- [ ] **Step 3: Manual verify (no git)**

Run the tour detail page in the browser after later tasks; for this task alone, TypeScript should still compile once JSX still references removed symbols — expect temporary errors until Task 3 replaces accordion JSX. Prefer completing Task 1 + Task 2 + Task 3 in one editing pass if the page must stay runnable.

**Done when:** Accordion state is gone (or scheduled for immediate JSX replacement in the same pass); `activeThumb` exists.

---

### Task 2: Replace hero overlay with Traveloka-style gallery + title block

**Files:**
- Modify: `frontend/src/app/tour/[id]/page.tsx` — replace the block currently starting at the full-bleed hero (`relative h-[52vh]...`) through the end of that hero section, before the `max-w-7xl` content grid

**Interfaces:**
- Consumes: `tour.image`, `tour.title`, `tour.location`, `tour.duration`, `averageRating`, `reviewCount`, `saved`, `handleFavoriteToggle`, `activeThumb`, `setActiveThumb`, `galleryThumbs`
- Produces: DOM structure: gallery → title under gallery (no text overlay on image)

- [ ] **Step 1: Replace hero with gallery frame**

Remove overlay gradient + title-on-image + badge. Insert structure (keep existing typography weight classes; do not introduce new font families):

```tsx
{/* Gallery */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 rounded-2xl overflow-hidden">
    <div className="md:col-span-2 relative aspect-[16/10] md:aspect-auto md:min-h-[360px] bg-slate-200 dark:bg-slate-800">
      <ImageWithFallback
        src={tour.image}
        alt={tour.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4 flex gap-3 z-10">
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className="interactive-press size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <Heart className={`size-5.5 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
        </button>
        <button
          type="button"
          className="interactive-press size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <Share2 className="size-5.5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>
      <button
        type="button"
        className="absolute bottom-4 left-4 z-10 rounded-xl bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow"
      >
        Xem tất cả hình ảnh
      </button>
    </div>

    <div className="hidden md:grid grid-rows-3 gap-2 md:gap-3">
      {galleryThumbs.map((idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => setActiveThumb(idx)}
          className={`relative overflow-hidden rounded-xl border-2 ${
            activeThumb === idx
              ? 'border-blue-600'
              : 'border-transparent'
          }`}
        >
          <ImageWithFallback
            src={tour.image}
            alt={`${tour.title} ${idx + 1}`}
            className="w-full h-full object-cover min-h-[110px]"
          />
        </button>
      ))}
    </div>

    <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
      {galleryThumbs.map((idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => setActiveThumb(idx)}
          className={`relative shrink-0 size-20 overflow-hidden rounded-xl border-2 ${
            activeThumb === idx ? 'border-blue-600' : 'border-transparent'
          }`}
        >
          <ImageWithFallback
            src={tour.image}
            alt={`${tour.title} thumb ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add title block under gallery**

Immediately below gallery:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full text-left">
  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 mb-2 font-bold text-sm">
    <MapPin className="size-4 text-blue-600 dark:text-blue-400" />
    <span>{tour.location}</span>
  </div>
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans leading-tight tracking-wide mb-4">
    {tour.title}
  </h1>
  <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-700 dark:text-slate-200">
    <div className="flex items-center gap-1.5">
      <Star className="size-4.5 fill-amber-400 text-amber-400" />
      <span>
        {averageRating} ({reviewCount.toLocaleString('vi-VN')} đánh giá)
      </span>
    </div>
    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
      <Clock className="size-4.5" />
      <span>{tour.duration}</span>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Visual check**

Open any tour detail URL. Confirm:
1. No title overlay on the image
2. Same `tour.image` in main + thumbs
3. Heart/Share still work
4. Fonts look unchanged vs previous page sections

**Done when:** Gallery + under-image title match the approved structure.

---

### Task 3: Two-column grid — itinerary timeline left, booking sticky right

**Files:**
- Modify: `frontend/src/app/tour/[id]/page.tsx` — the current `grid grid-cols-1 lg:grid-cols-3` section

**Interfaces:**
- Consumes: `itinerary: TourItineraryDay[]`, `tour.location`, booking state/handlers already on the page
- Produces: Route summary + vertical timeline; booking card unchanged in behavior

- [ ] **Step 1: Slim the main content column to itinerary-first**

Inside `lg:col-span-2`, put **only** the itinerary card first (overview / highlights / etc. move to Task 4 under the whole grid).

- [ ] **Step 2: Build route summary from existing itinerary**

Above the timeline list:

```tsx
const routeStops =
  itinerary.length > 0
    ? [tour.location, ...itinerary.map((d) => d.title), tour.location]
    : [tour.location, 'Các ngày trong tour', tour.location];
```

Render:

```tsx
<div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 font-sans leading-tight">
    Lịch trình
  </h2>
  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
    Khởi hành từ
  </p>
  <p className="text-base font-black text-slate-900 dark:text-white mb-4">
    {tour.location}
  </p>
  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-8">
    {routeStops.map((stop, i) => (
      <span key={`${stop}-${i}`} className="inline-flex items-center gap-2">
        {i > 0 && <span className="text-slate-400">→</span>}
        <span>{stop}</span>
      </span>
    ))}
  </div>

  {itinerary.length === 0 ? (
    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
      Chưa có lịch trình chi tiết cho tour này.
    </p>
  ) : (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
      {itinerary.map((dayData) => {
        const activities = dayData.activities ?? [];
        return (
          <div key={dayData.day} className="relative pl-8">
            <span className="absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500" />
            <div className="flex items-center gap-3 mb-3">
              <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-black">
                <span className="text-[10px] uppercase leading-none mb-0.5">Ngày</span>
                <span className="text-lg leading-none">{dayData.day}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{dayData.title}</h3>
            </div>
            {(dayData.meals || dayData.accommodation) && (
              <div className="flex flex-wrap gap-3 text-xs font-bold mb-3">
                {dayData.meals && (
                  <span className="rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1.5">
                    Ăn: {dayData.meals}
                  </span>
                )}
                {dayData.accommodation && (
                  <span className="rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5">
                    Nghỉ: {dayData.accommodation}
                  </span>
                )}
              </div>
            )}
            {activities.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">Chưa có hoạt động cho ngày này.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((act, idx) => (
                  <div key={idx}>
                    {act.time && (
                      <div className="inline-block px-3 py-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs font-black text-blue-700 dark:text-blue-400 mb-2">
                        {act.time}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>
```

- [ ] **Step 3: Keep booking column behavior identical**

Leave the `lg:col-span-1` sticky booking card markup/logic as-is (price, date, adults/children, totals, `PaylineButton`). Only ensure it still sits in the right column of the same grid.

- [ ] **Step 4: Clean imports**

Remove `ChevronDown`, `ChevronUp` from lucide import if unused.

- [ ] **Step 5: Visual / functional check**

1. All itinerary days visible without clicking
2. Route line shows location → day titles → location (or fallback)
3. Booking still adds to cart and opens success modal
4. Empty itinerary still shows empty message

**Done when:** Left = timeline, right = sticky booking; accordion gone.

---

### Task 4: Move secondary blocks under the grid and tighten spacing

**Files:**
- Modify: `frontend/src/app/tour/[id]/page.tsx` — after the itinerary/booking grid closes

**Interfaces:**
- Consumes: `tour.description`, `tour.highlights`, `matchedLocations`, `tour.included`, `tour.excluded`, reviews UI already on page
- Produces: Full-width secondary stack under the 2-column grid

- [ ] **Step 1: Relocate blocks**

Move these out of `lg:col-span-2` to a full-width stack **below** the `lg:grid-cols-3` grid (still inside `max-w-7xl`):

1. Tổng quan (`tour.description`)
2. Highlights
3. Matched locations
4. Included / Excluded
5. Reviews (entire review section including form)

Suggested wrapper:

```tsx
<div className="mt-8 space-y-6">
  {/* overview, highlights, locations, included/excluded, reviews */}
</div>
```

- [ ] **Step 2: Compact spacing only**

Reduce card padding slightly where safe, e.g. `p-8` → `p-6` on secondary cards only. Do **not** change font classes.

- [ ] **Step 3: End-to-end visual checklist**

Against success criteria in the spec:

- [ ] First viewport: gallery + title (not overlay hero)
- [ ] Itinerary is continuous timeline
- [ ] Booking sticky on desktop right
- [ ] Secondary content still present below
- [ ] Same `tour.image`; fonts unchanged
- [ ] Dark mode still readable

- [ ] **Step 4: Skip git**

Do not stage or commit. Leave working tree as-is for the user.

**Done when:** Page matches the approved Traveloka-like layout and all preserved behaviors still work.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
| --- | --- |
| Full page Traveloka layout | Task 2 + 3 + 4 |
| Gallery frame, same image thumbs | Task 2 |
| Title under media, no overlay | Task 2 |
| Timeline replaces accordion | Task 1 + 3 |
| Route summary header | Task 3 |
| Sticky booking unchanged | Task 3 |
| Secondary blocks kept, after, denser | Task 4 |
| No font / image / API / new components | Global Constraints |
| No git | Global Constraints + Task 4 Step 4 |
