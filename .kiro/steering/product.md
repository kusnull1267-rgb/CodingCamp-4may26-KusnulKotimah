# Product Overview

**To-Do Life Dashboard** is a personal productivity hub delivered as a single-page client-side web application. It requires no backend, no build tools, and no external dependencies — everything runs in the browser.

## Core Panels

- **Greeting Panel** — displays the current time (HH:MM, updated every minute), date, and a time-of-day greeting (Good morning / afternoon / evening / night).
- **Focus Timer** — a 25-minute Pomodoro-style countdown with start, stop, and reset controls.
- **Task Manager** — a to-do list supporting add, edit, complete/incomplete toggle, and delete. Tasks persist across sessions.
- **Quick Links Panel** — user-defined shortcut buttons that open URLs in a new tab. Links persist across sessions.

## Persistence

All data (tasks and quick links) is stored in the browser's `localStorage`. No server-side storage exists.

## Target Environments

Modern browsers: Chrome, Firefox, Edge, Safari (current stable releases). May be used as a standalone web page or browser extension.
