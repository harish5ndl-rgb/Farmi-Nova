<!-- .github/copilot-instructions.md -->
# Royal Harvest — Copilot instructions

Purpose
- Help an AI coding agent be immediately productive on this repository: a small static website (HTML/CSS) for Royal Harvest Global Trade.

Big picture
- This is a static site (no Node/Python build system). Main pages: `index.html`, `products.html`, `about.html`, `become-supplier.html`, `contact.html`.
- Styles live in `css/style.css`. Images are under `images/` (note: some filenames use mixed case — watch case sensitivity when deploying to Linux/CDN).
- Interactivity is implemented with small inline scripts in `index.html` (scroll header, revealOnScroll, simple menu toggle). No SPA frameworks or bundlers.

Key files to inspect
- `index.html` — hero, product carousel, inline supplier form (client-side only).
- `contact.html` — contact cards and Font Awesome CDN link; contains no server form action.
- `css/style.css` — visual tokens, layout classes (e.g., `.container`, `.reveal`, `.main-header`).

Developer workflows (how to run & debug)
- No build step. To preview locally, open `index.html` in a browser or run a static server from the site folder. Example:

```bash
# from the inner project folder (where index.html is)
python -m http.server 8000
# or use VS Code Live Server extension
```

- Debugging: use browser devtools; JS is inline, so edit HTML directly and refresh.

Project-specific conventions
- Pages link with relative paths (e.g., `href="products.html"`) — keep links relative when adding pages.
- Forms are present for UI only (no `action` attribute). If adding a backend, wire `action` + `method` and add server-side validation.
- Image folder name may appear as `images/products` or `images/Products` in HTML — normalize file names when adding assets to avoid deployment issues.

External integrations
- Font Awesome is loaded via CDN in `contact.html` (no package manager). If switching to offline, replace CDN with local assets.

What AI agents should do first
- Update or add small changes to HTML/CSS only; assume no automated tests.
- When adding dynamic behavior, keep it small and inline consistent with existing patterns (no new frameworks).

Merge guidance
- If `.github/copilot-instructions.md` already exists, preserve any custom workflow notes; append or replace only outdated lines about builds or tooling. This repo has no `package.json` or build tools — remove stale build steps.

Examples from this repo
- Inline scripts: see `index.html` for `revealOnScroll()` and header scroll handling — follow that pattern for small UI tweaks.
- Supplier form: present in `index.html` under `.supplier-form` — to make it functional, add a backend endpoint and set `form action="/api/supplier" method="post"`.

Questions for the maintainer
- Would you like forms wired to an email/backend or kept static?
- Should file-name casing be normalized (e.g., `images/Products` → `images/products`) for cross-platform safety?

If unclear, ask for a small example change to implement and I will follow the repository's visible patterns.
