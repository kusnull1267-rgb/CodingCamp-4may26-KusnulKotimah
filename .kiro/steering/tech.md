# Tech Stack

## Languages & Technologies

- **HTML5** — single `index.html` file, semantic markup
- **CSS3** — single stylesheet at `css/style.css`
- **Vanilla JavaScript (ES6+)** — single script at `js/app.js`

## Constraints

- **No frameworks or libraries** — no React, Vue, jQuery, or any third-party dependency
- **No build tools** — no npm, webpack, Vite, Babel, or compilation step
- **No backend** — purely client-side; all logic runs in the browser
- **No CDN imports** — all code must be self-contained in the three project files

## Browser APIs Used

- `localStorage` — persisting tasks and quick links
- `setInterval` / `clearInterval` — driving the clock and focus timer
- `Date` — reading current time and date for the greeting panel

## Running the App

Open `index.html` directly in any modern browser — no server or install step required.

For local development with live-reload, any static file server works:

```bash
# Python (built-in)
python -m http.server 8080

# Node (npx, no install)
npx serve .
```

## Testing

No automated test framework is configured. Manual browser testing is the primary verification method. Test across Chrome, Firefox, Edge, and Safari.
