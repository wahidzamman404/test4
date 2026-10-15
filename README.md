# Shahbaz Furniture — پاکستانی ہنر

A mobile-first Urdu and English furniture showroom for Pakistani customers.

**Live site:** https://wahidzamman404.github.io/test4/

## Features

- Urdu by default, with a complete English switch and correct RTL/LTR layouts.
- Eight Pakistani furniture concepts: Chinioti bed, dining set, baithak seating, charpai, wardrobe, carved door, study desk and jali console.
- Search, category filters, sorting, detailed design dialogs and a saved shortlist.
- A design brief with wood, finish, furniture type and width selections.
- A six-scene gallery with buttons, keyboard navigation, dots and touch swipes.
- Staff role inquiries, a sample review carousel, a session-only review form and FAQs.
- WhatsApp contact **+92 313 4683786**, supplied by the owner, with localized inquiry previews and copy support. The site never sends a message automatically.
- Mobile bottom navigation, accessible native dialogs, reduced-motion support, local fonts and a WZDEV credit linking to https://wzdev.pk.

## Run locally

No build, API key or application dependency is needed. From this directory:

```sh
python -m http.server 8014 --bind 0.0.0.0
```

Open `http://localhost:8014`. Keep server output redirected to a log when running it as a background process in a cloud environment.

## Edit the site

- `site.config.js`: public brand and WhatsApp details and image mappings. Never put secrets here.
- `index.html`: bilingual page copy, forms and sections. Translation attributes are `data-en` and `data-ur`.
- `app.js`: bilingual catalogue, gallery, design studio, shortlist and inquiry logic.
- `feedback.js`: sample team roles and browser-session reviews.
- `styles.css`: responsive layouts and Urdu typography.
- `assets/credits.json`: image provenance and font licence information.

Furniture images are original AI-generated Pakistani design concepts, rather than completed customer projects. Staff portraits are fictional, and the initial reviews are labelled samples. Review submissions are held in memory for the current page session; they are not published or saved to a server. Replacing these with verified business material is recommended before using the site as an official catalogue. No showroom address, delivery promise, fixed price or warranty is invented.

The browser stores only the selected language and saved design IDs. Inquiry form details stay in the page until the visitor chooses to open WhatsApp or copy the message.

## Verify

The browser checks use Python Playwright and a local Chromium installation; site visitors do not need either.

```sh
python tests/smoke.py --url http://127.0.0.1:8014
python tests/reviews.py --url http://127.0.0.1:8014
```

Checks exercise both languages, small-phone layouts, design selection, saved favourites, galleries, localized validation, inquiry construction and review safety. They do not send WhatsApp messages.

## Publish

GitHub Pages serves the root of the `gh-pages` branch. Source is on `main`; publish the same tested commit to both branches. All site paths are relative, so the `/test4/` project URL works without a build step. The other Shahbaz Furniture repositories are independent and are not changed by this site.
