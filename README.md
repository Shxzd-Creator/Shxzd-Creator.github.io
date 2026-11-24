# Shehzad Hussain — Personal Portfolio Website

Responsive, zero-dependency static personal portfolio built for **Shehzad Hussain** (BS Artificial Intelligence student at FUUAST, Islamabad & McKinsey.org Forward participant).

## Files

- `index.html` — Semantic HTML5 portfolio sections (Hero & Dossier, About, Experience, Filterable Projects, 39 Skills & 6 Verified Certifications, Education, Contact & Inquiry Composer)
- `styles.css` — Dark/Light theme tokens, responsive grid layout, and `@media print` CV stylesheet
- `script.js` — Theme switcher, mobile navigation drawer, project category filtering, click-to-copy contact utilities, `mailto:` inquiry composer, scroll-spy, and subtle neural node canvas
- `favicon.svg` — Custom `SH` monogram icon
- `server.ps1` & `start.bat` — Optional local PowerShell HTTP preview server on `http://localhost:8090/`

## Preview Locally

1. **Direct file open**: Double-click `index.html` to open it in any browser.
2. **Local server preview**: Run `start.bat` (or `powershell -ExecutionPolicy Bypass -File server.ps1 -Port 8090`) and visit `http://localhost:8090/`.

## Deployment

Since this site uses pure static assets (`index.html`, `styles.css`, `script.js`, `favicon.svg`), you can deploy the folder directly to **GitHub Pages**, **Netlify**, **Vercel**, or **Cloudflare Pages** with zero build step.
