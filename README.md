# Shahbaz Furniture — پاکستانی ہنر

A new cinematic Pakistani furniture showroom, with a dark walnut/brass theme and English and Urdu displayed together.

**Live site:** https://wahidzamman404.github.io/test4/

## Features

- English and Urdu displayed together throughout: headings, catalogue, design details, inquiries, staff roles and review controls. Urdu spans retain their own RTL direction and local Nastaliq typography.
- 34 furniture and woodwork references organised from 40 distinct supplied photos: bedrooms, sofas/chairs, doors, wardrobes, kitchens, media walls and carving details. Two identical files in the 42-file upload are deduplicated.
- Search in English or Urdu, category filters, sorting, a saved shortlist and 12-item pagination. Design dialogs include additional photo thumbnails, keyboard navigation and full-photo links.
- A design brief with wood, finish, furniture type and width selections.
- A six-scene gallery with buttons, keyboard navigation, dots and touch swipes.
- Icon-based design/material/project guidance, a sample review carousel, a session-only review form and FAQs. No invented staff portraits are shown.
- WhatsApp contact **+92 313 4683786**, supplied by the owner, with localized inquiry previews and copy support. The site never sends a message automatically.
- A full-width real-photo hero, room collections, workshop photography, design studio, responsive mobile menu, accessible native dialogs and reduced-motion support.
- Floating WhatsApp on the right and a floating WZDEV creator link on the left, with compact circles on phones.

## Run locally

No build, API key or application dependency is needed. From this directory:

```sh
python -m http.server 8014 --bind 0.0.0.0
```

Open `http://localhost:8014`. Keep server output redirected to a log when running it as a background process in a cloud environment.

## Edit the site

- `site.config.js`: confirmed brand and WhatsApp details and featured gallery IDs. Never put secrets here.
- `catalogue.js`: bilingual descriptions and photo groupings. Captions describe visible details; they do not assert unverified timber species, stock or prices.
- `assets/real/`: 40 full photographs; `assets/real/thumbs/` contains proportional lightweight thumbnails. Original uploads and retouch working files stay outside the public repository.
- `index.html`: bilingual page copy, forms and sections. English and Urdu copy is rendered together using semantic language and direction attributes.
- `app.js`: bilingual catalogue, gallery, design studio, shortlist and inquiry logic.
- `feedback.js`: sample team roles and browser-session reviews.
- `styles.css`: responsive layouts and Urdu typography.
- `assets/credits.json`: image provenance and font licence information.

The user supplied 42 JPEG files and requested professional editing for the website. Forty distinct photographs are used after deduplicating two identical files. Thirty-five photographs use accepted AI-assisted edits. Five originals are retained because enhancement attempts changed fine furniture details. Every photo has an optimized mobile thumbnail; full photographs remain available in the design dialogs. Sources, hashes and editing provenance are recorded in `assets/credits.json`. Some source images contained social watermarks or application UI. Source shop identifiers and manufacturer packaging were not adopted as Shahbaz Furniture business details. The user explicitly reconfirmed the business name and WhatsApp number above.

The catalogue uses these photographs as design references, rather than claiming they prove Shahbaz-made projects, available stock, specific wood species or customer reviews. The exact source caption “SOLENE CANE SOFA” and decorative “Dream Big” wording are reflected where relevant. Installation images remain described as work in progress. Initial reviews remain clearly labelled samples; new reviews stay only in memory until reload and are not publicly published. No backend or database is connected.

The browser stores only saved design IDs. Inquiry form details stay in the page until the visitor chooses to open WhatsApp or copy the message.

## Verify

The browser checks use Python Playwright and a local Chromium installation; site visitors do not need either.

```sh
python tests/smoke.py --url http://127.0.0.1:8014
python tests/reviews.py --url http://127.0.0.1:8014
```

Checks exercise both languages, small-phone layouts, design selection, saved favourites, galleries, localized validation, inquiry construction and review safety. They do not send WhatsApp messages.

## Publish

GitHub Pages serves the root of the `gh-pages` branch. Source is on `main`; publish the same tested commit to both branches. All site paths are relative, so the `/test4/` project URL works without a build step. The other Shahbaz Furniture repositories are independent and are not changed by this site.
