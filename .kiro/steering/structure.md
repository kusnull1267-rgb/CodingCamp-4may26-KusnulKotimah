# Project Structure

## File Layout

```
/
├── index.html          # Single HTML entry point — all panels defined here
├── css/
│   └── style.css       # All styles — layout, typography, panel theming
├── js/
│   └── app.js          # All JavaScript — logic, DOM manipulation, localStorage
└── README.md
```

## Rules

- **Exactly one file per type**: one `.html`, one `.css`, one `.js`. Do not create additional files or split into modules.
- `index.html` links to `css/style.css` and `js/app.js` — no inline `<style>` or `<script>` blocks.
- All JavaScript lives in `js/app.js`. No ES modules (`import`/`export`) — use a single script with a clear internal section structure.

## JavaScript Internal Organisation (js/app.js)

Group code into clearly commented sections in this order:

1. **Constants & Config** — timer duration, localStorage keys, etc.
2. **State** — in-memory representations of tasks and quick links
3. **localStorage helpers** — load/save functions for tasks and quick links
4. **Greeting Panel** — clock/date rendering and `setInterval` setup
5. **Focus Timer** — countdown logic, start/stop/reset handlers
6. **Task Manager** — add, edit, complete, delete, render functions
7. **Quick Links Panel** — add, delete, render functions
8. **Init** — bootstrap function called on `DOMContentLoaded`

## CSS Internal Organisation (css/style.css)

Group styles in this order:

1. **Reset / base** — box-sizing, margin/padding resets
2. **Typography** — font family, sizes, line-height
3. **Layout** — dashboard grid/flex container
4. **Greeting Panel**
5. **Focus Timer**
6. **Task Manager**
7. **Quick Links Panel**
8. **Utilities / states** — completed task strikethrough, button hover, etc.

## Naming Conventions

- HTML `id` and `class` attributes: `kebab-case` (e.g., `focus-timer`, `task-list`)
- JavaScript variables and functions: `camelCase` (e.g., `taskList`, `renderTasks`)
- localStorage keys: `SCREAMING_SNAKE_CASE` strings (e.g., `"TASKS"`, `"QUICK_LINKS"`)
- CSS custom properties (if used): `--kebab-case` (e.g., `--color-bg`)
