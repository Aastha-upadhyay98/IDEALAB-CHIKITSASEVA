# ChikitsaSeva

**Healthcare, Welfare & Community Support.**

ChikitsaSeva is a citizen-facing portal that connects people with medical camps, healthcare providers, NGOs, government welfare schemes, volunteering and community support. Organizations and administrators manage camps, requests, referrals and verification from their own workspaces.

> **Prototype.** All camps, organizations, people and requests are fictional sample data. Government scheme summaries are unverified and must be checked against official sources. ChikitsaSeva is presented as an independent public-service initiative and is not an official government website.

## Run it

No server or install is needed. Open `index.html` in a browser.

To publish with GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**. The site will be served from `index.html`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Citizen | `demo@example.com` | `demo1234` |
| Organization (NGO) | `ngo@example.com` | `ngo12345` |
| Administrator | `admin@example.com` | `admin1234` |

The account verification code for new citizen accounts is `123456`. Data lives in memory and resets when the page reloads.

## Features

**Public portal:** service discovery search, medical camps, healthcare provider directory, NGO directory with verification labels, government schemes with a preliminary eligibility checker, community programmes, donation campaigns (external verified links only, no payments), volunteer opportunities, blood donation drives, medical equipment donation, health resources, emergency numbers, announcements.

**Citizen portal:** personalised dashboard with explainable recommendations, assistance requests (four-step form with consent-based sharing and status tracking), camp registrations, appointment and callback requests, saved services, notifications, family and household members with consent, volunteering, resource support, feedback and grievances, privacy and consent controls.

**Organization workspace:** assistance request review (accept, decline, request information, progress, resolve), referrals with limited, consented sharing, programmes, volunteers and participation hours, camps and blood donation drives, equipment offers, donation campaigns, reports, team permissions.

**Admin workspace:** request routing, organization verification, camps, registrations and attendance, schemes, grievances, announcements, citizens, reports, audit log.

**Languages and accessibility:** the citizen portal and public pages are fully available in English, Hindi and Marathi. Text size, light/dark theme, keyboard navigation and screen-reader announcements are supported. Organization and admin workspaces are in English.

## Project structure

```
index.html            Built single-file app (generated – do not edit by hand)
build.py              Builds index.html from src/
src/
  template.html       Page shell
  style.css           Design system (tokens, layout, components)
  i18n/*.tsv          Translations: English <TAB> Hindi <TAB> Marathi
  js/01_core.js       Helpers, icons, domain rules, matching engine, app shells
  js/02_data.js       Fictional seed data
  js/03_public.js     Public portal pages
  js/04_citizen.js    Citizen portal pages
  js/05_workspaces.js Organization and admin workspaces
  js/06_router.js     Routing, actions, forms, event wiring
  js/07_resources_feedback.js  Equipment donation, blood donation, feedback, grievances, announcements
tests/smoke.test.js   Visits every page and runs the main flows in all three languages
```

## Develop

```bash
python3 build.py      # rebuild index.html after editing src/
npm install           # once, for the test runner
npm test              # build + smoke test (exits non-zero on any error)
```

To add or change a translation, edit the TSV files in `src/i18n/`. Each line is `English text<TAB>Hindi<TAB>Marathi`, and placeholders such as `{name}` must appear in all three columns. The build stops with an error if a line is malformed.

## Before going live

This prototype simulates the server in the browser. A production version needs real server-side authentication and authorization, a database, verified organization and scheme data, real notification delivery (SMS/email), a legal review of the privacy, terms and data-protection drafts, and authorization before any official department identity is shown.
