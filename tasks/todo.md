# Calendar App — Implementation Tasks

## Setup

- [x] **Create folder structure**
  - Create `calendar/` subfolder in project root
  - Create `calendar/index.html`, `calendar/styles.css`, `calendar/app.js` (empty files)
  - **Acceptance:** All three files exist and open in a browser without errors

---

## index.html

- [x] **Boilerplate and head**
  - DOCTYPE, charset meta, viewport meta, title "Calendar", link to styles.css, script (defer) for app.js
  - **Acceptance:** Page loads with no console errors; viewport meta is present

- [x] **App header markup**
  - `<header>` with prev/next buttons and `<h1 id="month-year-label">`
  - **Acceptance:** Header renders; both buttons are focusable via keyboard Tab

- [x] **Calendar grid container**
  - `<main class="calendar-container">` with `.day-headers` (7 spans) and `<div id="calendar-grid">`
  - **Acceptance:** Day abbreviations (Sun–Sat) are visible in a row above the grid

- [x] **Floating add button**
  - `<button id="btn-add-event" aria-label="Add event">+</button>`
  - **Acceptance:** Button is visible and keyboard-accessible; `aria-label` is present

- [x] **Modal markup**
  - `<dialog id="event-modal">` with form: title, date, time, notes, color, hidden id fields; error container; Delete/Cancel/Save buttons
  - **Acceptance:** `dialog.showModal()` from console opens the modal; Escape closes it

---

## styles.css

- [x] **CSS custom properties and reset**
  - `:root` color variables; `box-sizing: border-box` reset
  - **Acceptance:** All color values referenced via `var(--...)` — no bare hex elsewhere

- [x] **Header layout**
  - `.app-header` as flex row with space-between; styled prev/next arrow buttons
  - **Acceptance:** Month label is centered between two arrow buttons at all widths

- [x] **Calendar grid — desktop**
  - `.day-headers` and `#calendar-grid` as `repeat(7, 1fr)` CSS Grid; `.day-cell` min-height 90px with borders
  - **Acceptance:** 7-column grid with visible cell borders on desktop

- [x] **Day cell states**
  - `.today` (highlighted background), `.other-month` (muted), `.day-number` (positioned top-right)
  - **Acceptance:** Today's cell has a distinct background; other-month cells are visually subdued

- [x] **Event chips**
  - `.event-chip` as small pill buttons with truncated text; `[data-color]` attribute selectors for backgrounds
  - **Acceptance:** Events render as colored pills; long titles truncate with ellipsis

- [x] **Floating action button**
  - `#btn-add-event` as fixed circle (bottom-right), with color, shadow, and visible focus ring
  - **Acceptance:** Button stays fixed on scroll; focus ring is visible

- [x] **Modal and form**
  - `<dialog>`, `::backdrop`, full-width form fields, action button row
  - **Acceptance:** Modal is centered on desktop; fills most viewport width on mobile

- [x] **Responsive breakpoints**
  - `@media (max-width: 767px)`: cell min-height 44px, chips → color dots only
  - `@media (max-width: 479px)`: stack header vertically
  - **Acceptance:** At 375px viewport: grid is still 7 columns; chips show as dots; header does not overflow

---

## app.js — Storage & Data

- [x] **CONSTANTS and STATE**
  - `MONTHS`, `DAYS`, `STORAGE_KEY`, `COLORS`; `state = { currentYear, currentMonth, editingId }`
  - **Acceptance:** `console.log(state)` in DevTools shows all three fields

- [x] **loadEvents / saveEvents**
  - localStorage read/write with JSON parse/stringify and try/catch fallback to `[]`
  - **Acceptance:** `saveEvents([...])` then `loadEvents()` returns same array after page refresh

- [x] **CRUD functions**
  - `generateId`, `getEventsForMonth`, `getEventById`, `createEvent`, `updateEvent`, `deleteEvent`
  - **Acceptance:** Each callable from browser console with correct results on persisted data

---

## app.js — Validation

- [x] **validateForm function**
  - All rules: title required (1–100 chars), date required + valid YYYY-MM-DD, time optional HH:MM, color in allowed list
  - **Acceptance:** `validateForm({title:'',date:'2026-02-30',time:'25:00',color:'blue'})` → `valid: false`, 3 errors

---

## app.js — Render

- [x] **renderCalendar and updateHeaderLabel**
  - Build DOM for current month: calculate first weekday, fill leading other-month days, month days, trailing days to complete last row
  - **Acceptance:** February 2026 shows 28 days; grid starts on correct weekday

- [x] **renderEventsInCell**
  - Append chip buttons with `data-event-id` and `data-color` for each matching event
  - **Acceptance:** Event saved for 2026-03-15 appears as a chip in the March 15 cell

- [x] **Highlight today**
  - Add `.today` class to cell matching today's date
  - **Acceptance:** Today's cell has highlighted style; navigating away and back restores it

---

## app.js — Modal

- [x] **openModalForNew**
  - Clear form, `editingId = null`, hide Delete button, optionally pre-fill date, call `dialog.showModal()`
  - **Acceptance:** Clicking `+` FAB opens empty form with no Delete button visible

- [x] **openModalForEdit**
  - Load event by id, populate all fields, show Delete button, set `editingId`, call `dialog.showModal()`
  - **Acceptance:** Clicking an event chip opens modal with correct pre-filled values

- [x] **closeModal**
  - Clear errors, `editingId = null`, call `dialog.close()`
  - **Acceptance:** Cancel closes modal; form state does not leak into next open

- [x] **showErrors / clearErrors**
  - Render errors as `<li>` items in `.form-errors`; clearErrors empties container
  - **Acceptance:** Invalid submit shows errors; subsequent valid submit clears them

---

## app.js — Handlers & Init

- [x] **Month navigation handlers**
  - Prev/next buttons decrement/increment month with January↔December wrap; re-render
  - **Acceptance:** Clicking prev from January 2026 navigates to December 2025

- [x] **Form submit handler**
  - Prevent default; validate; if invalid showErrors and return; create or update; closeModal; renderCalendar
  - **Acceptance:** Valid new event saves to localStorage and renders chip without page reload

- [x] **Delete handler**
  - `window.confirm` prompt; on confirm: deleteEvent, closeModal, renderCalendar
  - **Acceptance:** Confirming delete removes event from grid and localStorage

- [x] **Grid click delegation**
  - Single listener on `#calendar-grid`; `[data-event-id]` closest → edit; `.day-cell` closest → new pre-filled with date
  - **Acceptance:** Empty cell opens modal pre-filled with that date; chip opens edit modal

- [x] **Backdrop click to close**
  - `dialog` click listener; if `event.target === dialog` → closeModal
  - **Acceptance:** Clicking outside the modal card (on dimmed backdrop) closes it

- [x] **initHandlers and DOMContentLoaded**
  - Wire all handlers; set state from `new Date()`; call renderCalendar
  - **Acceptance:** Refreshing page shows current month with all previously saved events

---

## QA

- [ ] **Cross-browser smoke test**
  - Open in Chrome and Firefox
  - **Acceptance:** No console errors on load; events persist across refresh in both browsers

- [ ] **Mobile layout test**
  - DevTools device emulation at 375px width
  - **Acceptance:** No horizontal overflow; chips show as dots; modal usable without zooming

- [ ] **Keyboard accessibility test**
  - Tab through header buttons, FAB, event chips; open/close modal with keyboard only
  - **Acceptance:** All interactive elements reachable via keyboard; modal traps focus while open

- [ ] **Edge case: empty month**
  - Navigate to a month with no events
  - **Acceptance:** Grid renders correctly with no chips; no JS errors

- [ ] **Edge case: many events on one day**
  - Add 5+ events to one date
  - **Acceptance:** Cell does not break layout; chips overflow gracefully

---

## Review

**What was built:** A fully static Calendar web app (`calendar/index.html`, `styles.css`, `app.js`) requiring no server or build tools. Features month-view grid, add/edit/delete events, localStorage persistence, a native `<dialog>` modal with form validation, and a responsive layout down to 375px.

**Implementation notes:**
- Used native `<dialog>` element — Escape key and focus trapping work without any JS
- Event chip colors driven entirely by `[data-color]` CSS attribute selectors — no JS class toggling
- Date strings stored as `YYYY-MM-DD` to avoid timezone offset bugs
- Grid click uses a single delegated listener on `#calendar-grid` for both cell and chip interactions
- 42-cell fixed grid (6 rows × 7 cols) keeps month layout stable across varying month lengths

**Known limitations:**
- No recurring events support
- No drag-and-drop to move events
- No multi-day/spanning events
- `window.confirm` used for delete confirmation (blocks UI on some browsers)
- QA tasks (cross-browser, mobile, keyboard, edge cases) remain for manual verification
