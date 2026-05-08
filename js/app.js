// ── 1. Constants & Config ────────────────────────────────────────────────────

const TIMER_DURATION_SECS = 25 * 60; // 1500 seconds

const LS_KEYS = {
  TASKS:       'TASKS',
  QUICK_LINKS: 'QUICK_LINKS'
};

// ── 2. State ─────────────────────────────────────────────────────────────────

let tasks      = [];   // Task[]
let quickLinks = [];   // QuickLink[]

let timerState = {
  remaining:  TIMER_DURATION_SECS, // seconds left; starts at 1500
  intervalId: null,                // setInterval handle, or null when stopped
  running:    false                // true while countdown is active
};

// ── 3. localStorage helpers ──────────────────────────────────────────────────

/**
 * Read the task list from localStorage.
 * Returns [] if the key is absent or the stored value cannot be parsed.
 * @returns {Array}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_KEYS.TASKS);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/**
 * Serialise the current in-memory task list and write it to localStorage.
 * Any setItem errors (e.g. quota exceeded) are silently swallowed so the UI
 * remains consistent with the in-memory state.
 */
function saveTasks() {
  try {
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(tasks));
  } catch (_) {
    // silently swallow storage errors
  }
}

/**
 * Read the quick links list from localStorage.
 * Returns [] if the key is absent or the stored value cannot be parsed.
 * @returns {Array}
 */
function loadLinks() {
  try {
    const raw = localStorage.getItem(LS_KEYS.QUICK_LINKS);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/**
 * Serialise the current in-memory quick links list and write it to localStorage.
 * Any setItem errors are silently swallowed.
 */
function saveLinks() {
  try {
    localStorage.setItem(LS_KEYS.QUICK_LINKS, JSON.stringify(quickLinks));
  } catch (_) {
    // silently swallow storage errors
  }
}

// ── 4. Greeting Panel ────────────────────────────────────────────────────────

/**
 * Map an hour (0–23) to a time-of-day greeting string.
 * @param {number} hour - integer in [0, 23]
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5  && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  if (hour >= 18 && hour <= 20) return 'Good evening';
  return 'Good night'; // covers 21–23 and 0–4
}

/**
 * Format a Date as a zero-padded HH:MM string.
 * @param {Date} date
 * @returns {string}  e.g. "09:05"
 */
function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Format a Date as a human-readable date string.
 * @param {Date} date
 * @returns {string}  e.g. "Monday, 14 July 2025"
 */
function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric'
  });
}

/**
 * Read the current time and update the greeting, clock, and date DOM elements.
 * Called once on load and then every 60 seconds via setInterval (wired in bootstrap).
 */
function updateClock() {
  const now = new Date();

  const greetingEl = document.getElementById('greeting-text');
  const clockEl    = document.getElementById('clock-display');
  const dateEl     = document.getElementById('date-display');

  if (greetingEl) greetingEl.textContent = getGreeting(now.getHours());
  if (clockEl)    clockEl.textContent    = formatTime(now);
  if (dateEl)     dateEl.textContent     = formatDate(now);
}

// bootstrap() will call updateClock() once on load and then set a 60-second
// setInterval — see the Init section below.

// ── 5. Focus Timer ───────────────────────────────────────────────────────────

/**
 * Format a number of seconds as a zero-padded MM:SS string.
 * @param {number} secs - integer in [0, 1500]
 * @returns {string}  e.g. "25:00", "01:01", "00:00"
 */
function formatTimer(secs) {
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Write the current timerState.remaining value to #timer-display.
 */
function renderTimer() {
  const el = document.getElementById('timer-display');
  if (el) el.textContent = formatTimer(timerState.remaining);
}

/**
 * Decrement timerState.remaining by 1 and refresh the display.
 * When remaining reaches 0, clears the interval and marks the timer as stopped;
 * does not decrement further below 0.
 */
function tickTimer() {
  if (timerState.remaining <= 0) {
    // Safety guard — should not normally be reached, but prevents going negative
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    timerState.running    = false;
    return;
  }

  timerState.remaining -= 1;
  renderTimer();

  if (timerState.remaining === 0) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    timerState.running    = false;
  }
}

/**
 * Start the countdown.
 * No-op if the timer is already running (guards against double-start).
 */
function startTimer() {
  if (timerState.running) return; // already running — do nothing

  timerState.intervalId = setInterval(tickTimer, 1000);
  timerState.running    = true;
}

/**
 * Pause the countdown, retaining the current remaining time.
 */
function stopTimer() {
  clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  timerState.running    = false;
}

/**
 * Stop any active countdown and restore the timer to its initial 25:00 state.
 */
function resetTimer() {
  stopTimer();
  timerState.remaining = TIMER_DURATION_SECS;
  renderTimer();
}

// ── 6. Task Manager ──────────────────────────────────────────────────────────

/**
 * Create a new Task object with a unique id, trimmed description, and
 * completed set to false.
 * @param {string} description - already-trimmed task text
 * @returns {{ id: string, description: string, completed: boolean }}
 */
function createTask(description) {
  return {
    id:          generateId(),
    description: description.trim(),
    completed:   false
  };
}

/**
 * Add a new task to the list.
 * Trims the input; returns early without mutation if the result is empty.
 * Otherwise appends a new Task, persists, re-renders, and clears the input.
 * @param {string} description
 */
function addTask(description) {
  const trimmed = description.trim();
  if (trimmed === '') return;

  tasks.push(createTask(trimmed));
  saveTasks();
  renderTasks();

  const input = document.getElementById('task-input');
  if (input) input.value = '';
}

/**
 * Update the description of an existing task.
 * Trims the new value; returns early (retaining the original) if empty.
 * @param {string} id
 * @param {string} newDescription
 */
function editTask(id, newDescription) {
  const trimmed = newDescription.trim();
  if (trimmed === '') return;

  const task = tasks.find(t => t.id === id);
  if (task) {
    task.description = trimmed;
    saveTasks();
    renderTasks();
  }
}

/**
 * Flip the completed state of a task, then persist and re-render.
 * @param {string} id
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

/**
 * Remove a task from the list, then persist and re-render.
 * @param {string} id
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/**
 * Rebuild the #task-list element from the current tasks array.
 * Each item renders a toggle button, description span, edit button, and
 * delete button. The 'completed' class is applied when task.completed is true.
 */
function renderTasks() {
  const list = document.getElementById('task-list');
  if (!list) return;

  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const toggleBtn = document.createElement('button');
    toggleBtn.className  = 'task-toggle';
    toggleBtn.type       = 'button';
    toggleBtn.setAttribute('aria-label', 'Toggle complete');
    toggleBtn.textContent = '✓';

    const textSpan = document.createElement('span');
    textSpan.className   = 'task-text';
    textSpan.textContent = task.description;

    const editBtn = document.createElement('button');
    editBtn.className  = 'task-edit-btn';
    editBtn.type       = 'button';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.textContent = '✎';

    const deleteBtn = document.createElement('button');
    deleteBtn.className  = 'task-delete-btn';
    deleteBtn.type       = 'button';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.textContent = '✕';

    li.appendChild(toggleBtn);
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

/**
 * Delegated click handler for the #task-list element.
 * Handles toggle, edit, edit-confirm, edit-cancel, and delete actions.
 * Wired in bootstrap() via: taskListEl.addEventListener('click', handleTaskListClick).
 * @param {MouseEvent} e
 */
function handleTaskListClick(e) {
  const target = e.target;

  // Resolve the task id from the closest [data-id] ancestor
  const item = target.closest('[data-id]');
  if (!item) return;
  const id = item.dataset.id;

  // ── Toggle complete ──────────────────────────────────────────────────────
  if (target.classList.contains('task-toggle')) {
    toggleTask(id);
    return;
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  if (target.classList.contains('task-delete-btn')) {
    deleteTask(id);
    return;
  }

  // ── Enter edit mode ──────────────────────────────────────────────────────
  if (target.classList.contains('task-edit-btn')) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Replace item contents with an inline edit form
    item.innerHTML = '';

    const editInput = document.createElement('input');
    editInput.className = 'task-edit-input';
    editInput.type      = 'text';
    editInput.value     = task.description;

    const confirmBtn = document.createElement('button');
    confirmBtn.className   = 'task-edit-confirm';
    confirmBtn.type        = 'button';
    confirmBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.className   = 'task-edit-cancel';
    cancelBtn.type        = 'button';
    cancelBtn.textContent = 'Cancel';

    item.appendChild(editInput);
    item.appendChild(confirmBtn);
    item.appendChild(cancelBtn);

    editInput.focus();
    return;
  }

  // ── Confirm edit ─────────────────────────────────────────────────────────
  if (target.classList.contains('task-edit-confirm')) {
    const editInput = item.querySelector('.task-edit-input');
    if (editInput) {
      editTask(id, editInput.value);
    }
    return;
  }

  // ── Cancel edit ──────────────────────────────────────────────────────────
  if (target.classList.contains('task-edit-cancel')) {
    renderTasks();
    return;
  }
}

// ── 7. Quick Links Panel ─────────────────────────────────────────────────────

/**
 * Create a new QuickLink object with a unique id, trimmed label, and trimmed url.
 * @param {string} label - already-trimmed link label text
 * @param {string} url   - already-trimmed link URL
 * @returns {{ id: string, label: string, url: string }}
 */
function createLink(label, url) {
  return {
    id:    generateId(),
    label: label.trim(),
    url:   url.trim()
  };
}

/**
 * Add a new quick link to the list.
 * Trims both inputs; returns early without mutation if either result is empty.
 * Otherwise appends a new QuickLink, persists, re-renders, and clears both inputs.
 * @param {string} label
 * @param {string} url
 */
function addLink(label, url) {
  const trimmedLabel = label.trim();
  const trimmedUrl   = url.trim();
  if (trimmedLabel === '' || trimmedUrl === '') return;

  quickLinks.push(createLink(trimmedLabel, trimmedUrl));
  saveLinks();
  renderLinks();

  const labelInput = document.getElementById('link-label-input');
  const urlInput   = document.getElementById('link-url-input');
  if (labelInput) labelInput.value = '';
  if (urlInput)   urlInput.value   = '';
}

/**
 * Remove a quick link from the list, then persist and re-render.
 * @param {string} id
 */
function deleteLink(id) {
  quickLinks = quickLinks.filter(link => link.id !== id);
  saveLinks();
  renderLinks();
}

/**
 * Rebuild the #quick-links-list element from the current quickLinks array.
 * Each item is a div containing an anchor button and a delete button.
 * Uses createElement (not innerHTML) to avoid XSS.
 */
function renderLinks() {
  const list = document.getElementById('quick-links-list');
  if (!list) return;

  list.innerHTML = '';

  quickLinks.forEach(link => {
    const item = document.createElement('div');
    item.className  = 'quick-link-item';
    item.dataset.id = link.id;

    const anchor = document.createElement('a');
    anchor.className   = 'quick-link-btn';
    anchor.href        = link.url;
    anchor.target      = '_blank';
    anchor.rel         = 'noopener noreferrer';
    anchor.textContent = link.label;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'quick-link-delete';
    deleteBtn.type      = 'button';
    deleteBtn.setAttribute('aria-label', 'Delete link');
    deleteBtn.textContent = '✕';

    item.appendChild(anchor);
    item.appendChild(deleteBtn);

    list.appendChild(item);
  });
}

/**
 * Delegated click handler for the #quick-links-list element.
 * Handles delete actions via event delegation.
 * Wired in bootstrap() via: document.getElementById('quick-links-list').addEventListener('click', handleLinksListClick).
 * @param {MouseEvent} e
 */
function handleLinksListClick(e) {
  const target = e.target;

  // Resolve the link id from the closest [data-id] ancestor
  const item = target.closest('[data-id]');
  if (!item) return;
  const id = item.dataset.id;

  // ── Delete ───────────────────────────────────────────────────────────────
  if (target.classList.contains('quick-link-delete')) {
    deleteLink(id);
  }
}

// ── 8. Init ──────────────────────────────────────────────────────────────────

/**
 * Generate a unique ID.
 * Uses crypto.randomUUID() when available; falls back to a Date.now + Math.random
 * combination for environments that do not support the Web Crypto API.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

/**
 * Bootstrap the application.
 * Loads persisted state, renders all panels, starts the clock interval,
 * and wires all event listeners.
 */
function bootstrap() {
  // ── Load persisted state ─────────────────────────────────────────────────
  tasks      = loadTasks();
  quickLinks = loadLinks();

  // ── Initial renders ──────────────────────────────────────────────────────
  renderTasks();
  renderLinks();
  renderTimer();

  // ── Greeting Panel — clock ───────────────────────────────────────────────
  updateClock();
  setInterval(updateClock, 60 * 1000);

  // ── DOM element references ───────────────────────────────────────────────
  const taskInput  = document.getElementById('task-input');
  const labelInput = document.getElementById('link-label-input');
  const urlInput   = document.getElementById('link-url-input');
  const taskList   = document.getElementById('task-list');
  const linksList  = document.getElementById('quick-links-list');

  // ── Task Manager — direct bindings ───────────────────────────────────────
  document.getElementById('task-add-btn').addEventListener('click', function () {
    addTask(taskInput.value);
  });

  taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask(taskInput.value);
  });

  // ── Focus Timer — direct bindings ────────────────────────────────────────
  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);

  // ── Quick Links — direct binding ─────────────────────────────────────────
  document.getElementById('link-add-btn').addEventListener('click', function () {
    addLink(labelInput.value, urlInput.value);
  });

  // ── Delegated listeners ──────────────────────────────────────────────────
  taskList.addEventListener('click', handleTaskListClick);
  linksList.addEventListener('click', handleLinksListClick);
}

document.addEventListener('DOMContentLoaded', bootstrap);
