# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement the dashboard as three files: `index.html`, `css/style.css`, and `js/app.js`. Tasks are
ordered so that each step produces immediately runnable code. The HTML scaffold comes first, then
styles, then JavaScript sections in the order defined by the internal organisation spec. Each task
references the specific requirements it satisfies.

---

## Tasks

- [x] 1. Create the HTML scaffold (`index.html`)
  - Create `index.html` with `<!DOCTYPE html>`, `<html lang="en">`, `<head>` (charset, viewport,
    title, link to `css/style.css`), and `<body>` with a `<script src="js/app.js" defer>` tag.
  - Add the `<div id="dashboard">` grid container inside `<body>`.
  - Add `<section id="greeting-panel">` containing `<p id="greeting-text">`, `<p id="clock-display">`,
    and `<p id="date-display">`.
  - Add `<section id="focus-timer">` containing `<p id="timer-display">` and `<div id="timer-controls">`
    with buttons `#timer-start`, `#timer-stop`, and `#timer-reset`.
  - Add `<section id="task-manager">` containing `<div id="task-input-row">` (input `#task-input` +
    button `#task-add-btn`) and `<ul id="task-list">`.
  - Add `<section id="quick-links-panel">` containing `<div id="link-input-row">` (inputs
    `#link-label-input`, `#link-url-input` + button `#link-add-btn`) and `<div id="quick-links-list">`.
  - All four sections must be present in a single page with no navigation required.
  - _Requirements: 1.1, 2.1, 3.1, 7.1, 10.1, 11.1, 11.2, 11.3_

- [x] 2. Write the base CSS (`css/style.css`)
  - [x] 2.1 Add reset/base and typography styles
    - Create `css/style.css`.
    - Add a reset block: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`.
    - Set a readable base font family (system-ui or similar sans-serif stack), base font size, and
      line-height on `body`.
    - Ensure sufficient contrast between text and background colours.
    - _Requirements: 10.3_

  - [x] 2.2 Add dashboard grid layout styles
    - Style `#dashboard` as a CSS Grid container with a two-column layout.
    - Ensure all four panel sections are visually distinct from one another (borders, background
      colours, or spacing).
    - _Requirements: 10.1, 10.2_

  - [x] 2.3 Add Greeting Panel styles
    - Style `#greeting-panel` and its child elements (`#greeting-text`, `#clock-display`,
      `#date-display`) for clear visual hierarchy within the panel.
    - _Requirements: 10.2, 10.3_

  - [x] 2.4 Add Focus Timer styles
    - Style `#focus-timer`, `#timer-display`, and `#timer-controls` buttons.
    - Buttons must have visible hover states.
    - _Requirements: 10.2, 10.5_

  - [x] 2.5 Add Task Manager styles
    - Style `#task-manager`, `#task-input-row`, `#task-list`, and `.task-item` elements.
    - Add `.task-item.completed .task-text { text-decoration: line-through; }` (or equivalent) for
      the visual distinction on completed tasks.
    - Style edit-mode elements (`.task-edit-input`, `.task-edit-confirm`, `.task-edit-cancel`).
    - _Requirements: 5.2, 5.3, 10.2, 10.5_

  - [x] 2.6 Add Quick Links Panel styles
    - Style `#quick-links-panel`, `#link-input-row`, `#quick-links-list`, `.quick-link-item`, and
      `.quick-link-btn`.
    - _Requirements: 10.2, 10.5_

- [x] 3. Create `js/app.js` — Constants, Config, and State
  - Create `js/app.js` with clearly commented sections as per the internal organisation spec.
  - Declare `const TIMER_DURATION_SECS = 25 * 60` and `const LS_KEYS = { TASKS: 'TASKS', QUICK_LINKS: 'QUICK_LINKS' }`.
  - Declare `let tasks = []`, `let quickLinks = []`, and `let timerState` with fields `remaining`,
    `intervalId`, and `running`.
  - _Requirements: 2.1, 11.2_

- [x] 4. Implement localStorage helpers in `js/app.js`
  - Implement `loadTasks()`: reads `LS_KEYS.TASKS` from `localStorage`, parses JSON, returns `[]` on
    missing key or parse error (wrap in `try/catch`).
  - Implement `saveTasks()`: serialises `tasks` to JSON and writes to `LS_KEYS.TASKS`; catch and
    silently swallow any `setItem` errors.
  - Implement `loadLinks()` and `saveLinks()` with the same pattern for `LS_KEYS.QUICK_LINKS`.
  - _Requirements: 6.1, 6.2, 6.3, 8.1, 8.2, 8.3_

- [x] 5. Implement the Greeting Panel in `js/app.js`
  - Implement `getGreeting(hour)`: returns "Good morning" for hours 5–11, "Good afternoon" for
    12–17, "Good evening" for 18–20, and "Good night" for 21–23 and 0–4.
  - Implement `formatTime(date)`: returns the current time as a zero-padded `HH:MM` string.
  - Implement `formatDate(date)`: returns a human-readable date string (e.g., "Monday, 14 July 2025")
    using `toLocaleDateString` or manual construction with `Date` methods.
  - Implement `updateClock()`: reads `new Date()`, writes to `#greeting-text`, `#clock-display`, and
    `#date-display`.
  - `bootstrap()` will call `updateClock()` once on load and then set a 60-second `setInterval`.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 6. Implement the Focus Timer in `js/app.js`
  - Implement `formatTimer(secs)`: returns a zero-padded `MM:SS` string for any value in [0, 1500].
  - Implement `renderTimer()`: writes `formatTimer(timerState.remaining)` to `#timer-display`.
  - Implement `tickTimer()`: decrements `timerState.remaining` by 1 and calls `renderTimer()`; when
    `remaining` reaches 0, clears the interval, sets `timerState.running = false`, and does not
    decrement further.
  - Implement `startTimer()`: guards against double-start (no-op if already running), sets a
    1-second `setInterval` calling `tickTimer()`, stores the handle in `timerState.intervalId`, sets
    `timerState.running = true`.
  - Implement `stopTimer()`: clears `timerState.intervalId`, sets `timerState.running = false`.
  - Implement `resetTimer()`: calls `stopTimer()`, sets `timerState.remaining = TIMER_DURATION_SECS`,
    calls `renderTimer()`.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 7. Checkpoint — open `index.html` in a browser and verify the static shell
  - Confirm all four panels are visible and laid out correctly.
  - Confirm the clock updates every minute and the greeting reflects the current time of day.
  - Confirm the timer displays "25:00" and the start/stop/reset buttons are present.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement the Task Manager in `js/app.js`
  - [x] 8.1 Implement task creation and addition
    - Implement `createTask(description)`: returns a new Task object with a unique `id`
      (`crypto.randomUUID()` with `Date.now().toString() + Math.random()` fallback), trimmed
      `description`, and `completed: false`.
    - Implement `addTask(description)`: trims input; returns early (no mutation) if result is empty;
      otherwise pushes `createTask(trimmed)` onto `tasks`, calls `saveTasks()`, calls `renderTasks()`,
      and clears `#task-input`.
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 8.2 Implement task rendering
    - Implement `renderTasks()`: clears `#task-list` innerHTML, then for each task in `tasks` creates
      a `<li class="task-item" data-id="<id>">` containing a toggle button, a `<span class="task-text">`,
      an edit button, and a delete button. Apply `completed` class to the `<li>` when `task.completed`
      is true.
    - _Requirements: 3.4, 5.2, 5.3_

  - [x] 8.3 Implement task edit mode
    - In the `#task-list` delegated click handler (wired in `bootstrap()`), handle `.task-edit-btn`
      clicks: replace the task item's inner content with a pre-populated `<input class="task-edit-input">`,
      a Save button (`.task-edit-confirm`), and a Cancel button (`.task-edit-cancel`).
    - Implement `editTask(id, newDescription)`: trims value; returns early if empty (retaining
      original description); otherwise finds the task by id, updates its `description`, calls
      `saveTasks()`, calls `renderTasks()`.
    - Handle `.task-edit-confirm` click: calls `editTask(id, inputValue)`.
    - Handle `.task-edit-cancel` click: calls `renderTasks()` to discard changes.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.4 Implement task toggle and delete
    - Implement `toggleTask(id)`: finds task by id, flips `completed`, calls `saveTasks()`, calls
      `renderTasks()`.
    - Implement `deleteTask(id)`: removes the task with the given id from `tasks`, calls `saveTasks()`,
      calls `renderTasks()`.
    - Wire `.task-toggle` and `.task-delete-btn` in the delegated listener on `#task-list`.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Implement the Quick Links Panel in `js/app.js`
  - [x] 9.1 Implement link creation and addition
    - Implement `createLink(label, url)`: returns a new QuickLink object with a unique `id`, trimmed
      `label`, and trimmed `url`.
    - Implement `addLink(label, url)`: trims both inputs; returns early if either is empty; otherwise
      pushes `createLink(trimmed label, trimmed url)` onto `quickLinks`, calls `saveLinks()`, calls
      `renderLinks()`, and clears both input fields.
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 9.2 Implement link rendering and deletion
    - Implement `renderLinks()`: clears `#quick-links-list` innerHTML, then for each link creates a
      `<div class="quick-link-item" data-id="<id>">` containing an `<a class="quick-link-btn"
      href="<url>" target="_blank" rel="noopener noreferrer">` and a delete button
      (`.quick-link-delete`).
    - Implement `deleteLink(id)`: removes the link with the given id from `quickLinks`, calls
      `saveLinks()`, calls `renderLinks()`.
    - Wire `.quick-link-delete` via event delegation on `#quick-links-list`.
    - _Requirements: 7.4, 9.1, 9.2_

- [x] 10. Implement `bootstrap()` and wire all event listeners in `js/app.js`
  - Implement `bootstrap()`:
    - Call `tasks = loadTasks()` and `quickLinks = loadLinks()`.
    - Call `renderTasks()`, `renderLinks()`, and `renderTimer()`.
    - Call `updateClock()` and start the 60-second clock interval.
    - Bind `#task-add-btn` click and `#task-input` Enter keydown to `addTask`.
    - Bind `#timer-start`, `#timer-stop`, `#timer-reset` clicks to `startTimer`, `stopTimer`,
      `resetTimer`.
    - Bind `#link-add-btn` click to `addLink`.
    - Attach the delegated listener on `#task-list` for toggle, edit-btn, edit-confirm, edit-cancel,
      and delete-btn.
    - Attach the delegated listener on `#quick-links-list` for delete.
  - Register `bootstrap` on `DOMContentLoaded`.
  - _Requirements: 1.1, 2.1, 3.1, 6.2, 7.1, 8.2, 10.5, 11.3_

- [x] 11. Final checkpoint — full end-to-end verification
  - Open `index.html` in a browser and confirm:
    - Tasks added persist after page reload.
    - Quick links added persist after page reload and open in a new tab.
    - Timer counts down, stops at 00:00, and resets correctly.
    - Completed tasks show strikethrough; toggling twice restores original appearance.
    - Editing a task with a non-empty value updates it; editing with whitespace retains the original.
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP. No tasks in this plan are
  marked optional because the tech stack rules prohibit automated tests, so there are no test
  sub-tasks to mark as optional.
- Each task references specific requirements for traceability.
- Checkpoints (tasks 7 and 11) ensure incremental validation at natural breaks.
- All three files (`index.html`, `css/style.css`, `js/app.js`) are the only files that should be
  created or modified during implementation.
