# Design Document — To-Do List Life Dashboard

## Overview

The To-Do List Life Dashboard is a single-page, client-side web application delivered as three files:
`index.html`, `css/style.css`, and `js/app.js`. It requires no server, no build step, and no external
dependencies. All logic runs in the browser using Vanilla JavaScript ES6+, with `localStorage` for
persistence, `setInterval`/`clearInterval` for the clock and timer, and the `Date` API for greetings.

The application is composed of four independent UI panels that share a single in-memory state object
and a pair of `localStorage` helpers:

| Panel | Responsibility |
|---|---|
| Greeting Panel | Live clock (HH:MM), date, and time-of-day greeting |
| Focus Timer | 25-minute Pomodoro countdown with start / stop / reset |
| Task Manager | Add, edit, complete/toggle, delete tasks; persisted to `localStorage` |
| Quick Links Panel | Add, delete, open shortcut buttons; persisted to `localStorage` |

### Key Design Decisions

- **No modules** — `js/app.js` is a single script with clearly delimited comment sections. This keeps
  the project zero-dependency and directly openable as a file URL.
- **Render-on-mutation** — every state mutation (add, edit, delete, toggle) is immediately followed by
  a full re-render of the affected panel and a `localStorage` write. This keeps the UI and storage
  always in sync without a reactive framework.
- **Flat state** — tasks and quick links are plain arrays of plain objects stored in two top-level
  state variables. No nested reactivity is needed.
- **CSS Grid for layout, Flexbox for panels** — the dashboard uses a two-column CSS Grid at the page
  level; each panel uses Flexbox internally for its own content flow.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                         │
│  Links css/style.css and js/app.js (no inline blocks)   │
└───────────────────┬─────────────────────────────────────┘
                    │ DOM ready
                    ▼
┌─────────────────────────────────────────────────────────┐
│                       js/app.js                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Constants & │  │    State     │  │  localStorage│  │
│  │   Config     │  │  (tasks[],   │  │   helpers    │  │
│  │  TIMER_SECS  │  │  quickLinks[]│  │  loadTasks() │  │
│  │  LS_KEYS     │  │  timerState) │  │  saveTasks() │  │
│  └──────────────┘  └──────────────┘  │  loadLinks() │  │
│                                      │  saveLinks() │  │
│                                      └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  Greeting    │  │ Focus Timer  │                     │
│  │  Panel       │  │  start/stop/ │                     │
│  │  updateClock │  │  reset       │                     │
│  │  setInterval │  │  setInterval │                     │
│  └──────────────┘  └──────────────┘                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Task Manager │  │ Quick Links  │                     │
│  │  add/edit/   │  │  Panel       │                     │
│  │  toggle/del  │  │  add/del/    │                     │
│  │  renderTasks │  │  renderLinks │                     │
│  └──────────────┘  └──────────────┘                     │
│                                                         │
│  ┌──────────────┐                                       │
│  │     Init     │  DOMContentLoaded → bootstrap()       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    localStorage                         │
│   "TASKS"       → JSON array of Task objects            │
│   "QUICK_LINKS" → JSON array of Quick_Link objects      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. On `DOMContentLoaded`, `bootstrap()` calls `loadTasks()` and `loadLinks()`, populates the in-memory
   state arrays, then calls `renderTasks()` and `renderLinks()`.
2. User interactions fire event handlers attached in `bootstrap()` (or via event delegation on list
   containers).
3. Each handler mutates the relevant state array, calls the matching `save*()` helper, then calls the
   matching `render*()` function.
4. The clock `setInterval` fires every 60 seconds and calls `updateClock()`.
5. The timer `setInterval` fires every 1 second while the timer is running and calls `tickTimer()`.

---

## Components and Interfaces

### HTML Structure

```
<body>
  <div id="dashboard">                        <!-- CSS Grid container -->

    <section id="greeting-panel">
      <p id="greeting-text"></p>              <!-- "Good morning" etc. -->
      <p id="clock-display"></p>              <!-- HH:MM -->
      <p id="date-display"></p>               <!-- "Monday, 14 July 2025" -->
    </section>

    <section id="focus-timer">
      <p id="timer-display"></p>              <!-- MM:SS -->
      <div id="timer-controls">
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
      </div>
    </section>

    <section id="task-manager">
      <div id="task-input-row">
        <input id="task-input" type="text" placeholder="New task…" />
        <button id="task-add-btn">Add</button>
      </div>
      <ul id="task-list"></ul>                <!-- renderTasks() writes here -->
    </section>

    <section id="quick-links-panel">
      <div id="link-input-row">
        <input id="link-label-input" type="text" placeholder="Label" />
        <input id="link-url-input"   type="url"  placeholder="https://…" />
        <button id="link-add-btn">Add</button>
      </div>
      <div id="quick-links-list"></div>       <!-- renderLinks() writes here -->
    </section>

  </div>
</body>
```

Each task list item rendered by `renderTasks()` follows this structure:

```html
<li class="task-item" data-id="<id>">
  <button class="task-toggle" aria-label="Toggle complete"></button>
  <span class="task-text"></span>
  <!-- OR during edit mode: -->
  <input class="task-edit-input" type="text" />
  <button class="task-edit-confirm">Save</button>
  <button class="task-edit-cancel">Cancel</button>
  <!-- end edit mode -->
  <button class="task-edit-btn"   aria-label="Edit task"></button>
  <button class="task-delete-btn" aria-label="Delete task"></button>
</li>
```

Each quick link rendered by `renderLinks()` follows this structure:

```html
<div class="quick-link-item" data-id="<id>">
  <a class="quick-link-btn" href="<url>" target="_blank" rel="noopener noreferrer"><label></a>
  <button class="quick-link-delete" aria-label="Delete link"></button>
</div>
```

### JavaScript Key Function Signatures

```js
// ── Constants & Config ──────────────────────────────────────────────────────
const TIMER_DURATION_SECS = 25 * 60;   // 1500
const LS_KEYS = { TASKS: 'TASKS', QUICK_LINKS: 'QUICK_LINKS' };

// ── State ───────────────────────────────────────────────────────────────────
let tasks      = [];   // Task[]
let quickLinks = [];   // QuickLink[]
let timerState = {
  remaining:   TIMER_DURATION_SECS,  // seconds left
  intervalId:  null,                 // setInterval handle or null
  running:     false
};

// ── localStorage helpers ────────────────────────────────────────────────────
function loadTasks()     // → Task[]        reads LS_KEYS.TASKS, returns [] on miss/error
function saveTasks()     // → void          JSON.stringify(tasks) → LS_KEYS.TASKS
function loadLinks()     // → QuickLink[]   reads LS_KEYS.QUICK_LINKS, returns [] on miss/error
function saveLinks()     // → void          JSON.stringify(quickLinks) → LS_KEYS.QUICK_LINKS

// ── Greeting Panel ──────────────────────────────────────────────────────────
function getGreeting(hour)   // (number) → string   pure; maps hour → greeting string
function formatTime(date)    // (Date)   → string   returns "HH:MM"
function formatDate(date)    // (Date)   → string   returns "Weekday, DD Month YYYY"
function updateClock()       // → void              reads new Date(), updates DOM

// ── Focus Timer ─────────────────────────────────────────────────────────────
function formatTimer(secs)   // (number) → string   returns "MM:SS"
function renderTimer()       // → void              writes timerState.remaining to #timer-display
function startTimer()        // → void              sets interval, sets timerState.running = true
function stopTimer()         // → void              clears interval, sets timerState.running = false
function resetTimer()        // → void              stops, restores timerState.remaining to TIMER_DURATION_SECS
function tickTimer()         // → void              decrements remaining; stops at 0

// ── Task Manager ────────────────────────────────────────────────────────────
function createTask(description)          // (string) → Task
function addTask(description)             // (string) → void   validates, pushes, saves, renders
function editTask(id, newDescription)     // (string, string) → void   validates, mutates, saves, renders
function toggleTask(id)                   // (string) → void   flips completed, saves, renders
function deleteTask(id)                   // (string) → void   splices, saves, renders
function renderTasks()                    // → void            rebuilds #task-list innerHTML

// ── Quick Links Panel ───────────────────────────────────────────────────────
function createLink(label, url)           // (string, string) → QuickLink
function addLink(label, url)              // (string, string) → void   validates, pushes, saves, renders
function deleteLink(id)                   // (string) → void           splices, saves, renders
function renderLinks()                    // → void                    rebuilds #quick-links-list innerHTML

// ── Init ────────────────────────────────────────────────────────────────────
function bootstrap()   // → void   called on DOMContentLoaded; wires all event listeners,
                       //          loads state, renders all panels, starts clock interval
```

### Event Handling Patterns

**Direct binding** (single elements, wired in `bootstrap()`):

| Element | Event | Handler |
|---|---|---|
| `#task-add-btn` | `click` | `addTask(#task-input.value)` |
| `#task-input` | `keydown` (Enter) | `addTask(#task-input.value)` |
| `#timer-start` | `click` | `startTimer()` |
| `#timer-stop` | `click` | `stopTimer()` |
| `#timer-reset` | `click` | `resetTimer()` |
| `#link-add-btn` | `click` | `addLink(label, url)` |

**Event delegation** (dynamic lists, single listener on container):

| Container | Delegated target | Event | Handler |
|---|---|---|---|
| `#task-list` | `.task-toggle` | `click` | `toggleTask(id)` |
| `#task-list` | `.task-edit-btn` | `click` | enter edit mode inline |
| `#task-list` | `.task-edit-confirm` | `click` | `editTask(id, value)` |
| `#task-list` | `.task-edit-cancel` | `click` | `renderTasks()` (discard) |
| `#task-list` | `.task-delete-btn` | `click` | `deleteTask(id)` |
| `#quick-links-list` | `.quick-link-delete` | `click` | `deleteLink(id)` |

IDs are read from the closest `[data-id]` ancestor via `el.closest('[data-id]').dataset.id`.

---

## Data Models

### Task

```js
{
  id:          string,   // crypto.randomUUID() or Date.now().toString() fallback
  description: string,   // non-empty, trimmed
  completed:   boolean   // false on creation
}
```

### QuickLink

```js
{
  id:    string,   // crypto.randomUUID() or Date.now().toString() fallback
  label: string,   // non-empty, trimmed
  url:   string    // non-empty, trimmed; used as href
}
```

### localStorage Schema

| Key | Type | Example value |
|---|---|---|
| `"TASKS"` | JSON string → `Task[]` | `[{"id":"abc","description":"Buy milk","completed":false}]` |
| `"QUICK_LINKS"` | JSON string → `QuickLink[]` | `[{"id":"xyz","label":"GitHub","url":"https://github.com"}]` |

Both keys are absent on first load; the helpers return `[]` in that case. Corrupt/unparseable values
are caught with a `try/catch` and also return `[]`.

### State Object — timerState

```js
{
  remaining:  number,        // seconds remaining; starts at TIMER_DURATION_SECS (1500)
  intervalId: number | null, // handle returned by setInterval, or null when stopped
  running:    boolean        // true while countdown is active
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a
system — essentially, a formal statement about what the system should do. Properties serve as the
bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting function is exhaustive and correct

*For any* integer hour in [0, 23], `getGreeting(hour)` SHALL return exactly one of "Good morning",
"Good afternoon", "Good evening", or "Good night". Specifically: hours 5–11 → "Good morning",
hours 12–17 → "Good afternoon", hours 18–20 → "Good evening", hours 21–23 and 0–4 → "Good night".
No hour shall produce an empty string or an unrecognised value.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 2: formatTimer produces valid MM:SS strings

*For any* non-negative integer seconds in [0, 1500], `formatTimer(secs)` SHALL return a string
matching the pattern `MM:SS` where both components are zero-padded to two digits and the values
correctly represent the minutes and seconds decomposition of the input.

**Validates: Requirements 2.7**

---

### Property 3: Timer tick is monotonically decreasing and bounded below zero

*For any* `timerState.remaining` value in [1, 1500], one call to `tickTimer()` SHALL decrease
`timerState.remaining` by exactly 1. When `timerState.remaining` is 0, `tickTimer()` SHALL NOT
decrement further and SHALL ensure `timerState.running` is false.

**Validates: Requirements 2.2, 2.6**

---

### Property 4: Timer reset is idempotent from any state

*For any* timer state (any `remaining` value in [0, 1500], `running` true or false), calling
`resetTimer()` SHALL set `timerState.remaining` to `TIMER_DURATION_SECS` (1500) and
`timerState.running` to false, regardless of the prior state.

**Validates: Requirements 2.5**

---

### Property 5: Valid task addition appends to the list

*For any* task list of length N and any string whose `.trim()` is non-empty, calling `addTask(description)`
SHALL result in a task list of length N + 1, with the new task appended at index N, `completed` set
to false, and `description` equal to `description.trim()`.

**Validates: Requirements 3.2, 3.4**

---

### Property 6: Whitespace-only task descriptions are rejected

*For any* string whose `.trim()` produces an empty string (empty string, spaces, tabs, newlines, or
any combination), calling `addTask(description)` SHALL leave `tasks.length` and all existing task
objects unchanged.

**Validates: Requirements 3.3**

---

### Property 7: Valid task edit updates only the target task's description

*For any* task list, any task id present in the list, and any string whose `.trim()` is non-empty,
calling `editTask(id, newDescription)` SHALL update only the `description` field of the task with
that id to `newDescription.trim()`, leaving all other tasks and all other fields of the edited task
(including `id` and `completed`) unchanged.

**Validates: Requirements 4.3**

---

### Property 8: Whitespace-only edits are rejected

*For any* task and any string whose `.trim()` produces an empty string, calling
`editTask(id, whitespaceString)` SHALL leave the task's `description` field unchanged.

**Validates: Requirements 4.4**

---

### Property 9: Completion toggle is an involution

*For any* task with any `completed` value, calling `toggleTask(id)` twice in succession SHALL return
the task's `completed` field to its original value (the toggle is its own inverse).

**Validates: Requirements 5.2, 5.3**

---

### Property 10: Delete task removes exactly the target

*For any* task list of length N and any task id present in the list, calling `deleteTask(id)` SHALL
result in a task list of length N − 1 that contains no task with that id, and all other tasks remain
present and unmodified.

**Validates: Requirements 5.5**

---

### Property 11: Task list persistence round-trip

*For any* array of Task objects (including the empty array), calling `saveTasks()` followed by
`loadTasks()` SHALL return an array deeply equal to the original — same length, same order, same
field values on every task.

**Validates: Requirements 6.1, 6.2, 6.3**

---

### Property 12: Valid quick link addition appends to the list

*For any* quick links list of length N, any non-whitespace-only label string, and any non-whitespace-only
URL string, calling `addLink(label, url)` SHALL result in a list of length N + 1, with the new link
appended at index N, `label` equal to `label.trim()`, and `url` equal to `url.trim()`.

**Validates: Requirements 7.2**

---

### Property 13: Quick link with empty label or empty URL is rejected

*For any* (label, url) pair where at least one of `label.trim()` or `url.trim()` is an empty string,
calling `addLink(label, url)` SHALL leave `quickLinks.length` and all existing link objects unchanged.

**Validates: Requirements 7.3**

---

### Property 14: Delete link removes exactly the target

*For any* quick links list of length N and any link id present in the list, calling `deleteLink(id)`
SHALL result in a list of length N − 1 that contains no link with that id, and all other links remain
present and unmodified.

**Validates: Requirements 9.2**

---

### Property 15: Quick links persistence round-trip

*For any* array of QuickLink objects (including the empty array), calling `saveLinks()` followed by
`loadLinks()` SHALL return an array deeply equal to the original — same length, same order, same
field values on every link.

**Validates: Requirements 8.1, 8.2, 8.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` read returns `null` (key absent) | `loadTasks()` / `loadLinks()` return `[]` |
| `localStorage` value is corrupt JSON | `try/catch` in load helpers; return `[]` |
| `localStorage.setItem` throws (quota exceeded) | Caught silently; UI remains consistent with in-memory state |
| `addTask` / `addLink` called with empty/whitespace input | Guard clause returns early; no state mutation |
| `editTask` called with empty/whitespace value | Guard clause returns early; original description retained |
| `crypto.randomUUID` unavailable (very old browser) | Fallback: `Date.now().toString() + Math.random()` |
| Timer reaches 00:00 | `tickTimer()` clears the interval and sets `timerState.running = false` before any further decrement |

---

## Testing Strategy

The tech stack rules specify no automated test framework. All verification is manual browser testing
across Chrome, Firefox, Edge, and Safari.

### Unit-level verification (manual)

Test each function in the browser console or by exercising the UI:

- `getGreeting(hour)` — call with hours 0–23 and verify correct string for each boundary (0, 5, 12, 18, 21).
- `formatTime(date)` — verify zero-padding: hour 9, minute 5 → "09:05".
- `formatDate(date)` — verify weekday name, day, month name, year.
- `formatTimer(secs)` — verify 1500 → "25:00", 61 → "01:01", 0 → "00:00".
- `addTask("")` / `addTask("   ")` — verify task list length unchanged.
- `editTask(id, "")` — verify description unchanged.
- `toggleTask(id)` twice — verify `completed` returns to original value.
- `saveTasks()` then `loadTasks()` — verify round-trip equality.
- `saveLinks()` then `loadLinks()` — verify round-trip equality.

### Integration-level verification (manual, browser)

- Reload page after adding tasks and links — verify they reappear.
- Clear `localStorage` manually (`localStorage.clear()`) and reload — verify empty state renders without errors.
- Start timer, let it run to 00:00 — verify it stops and does not go negative.
- Start timer, stop, reset — verify display returns to 25:00.
- Add a quick link and click it — verify it opens in a new tab.

### Cross-browser verification

Run the full manual checklist in Chrome, Firefox, Edge, and Safari to satisfy Requirement 11.4.

### Performance

- Open DevTools Network tab, reload — verify total load time under 2 seconds (Requirement 10.4).
- Interact with controls — verify DOM updates are visually immediate (Requirement 10.5).
