# VINblick frontend

Next.js 16 App Router, TypeScript, Tailwind CSS 4, and TanStack Query 5. Rebuilt from the VINblick Framer project with its German copy, original logo and vehicle image, and desktop/mobile layouts.

## Run locally

```sh
npm install
npm run dev
```

Open the URL shown by Next.js. Use `npm run dev -- --port 3001` if another app uses port 3000.

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
```

## Feature-sliced structure

```text
src/
  app/        Next.js routes, layouts, global styles, query provider
  views/      Page compositions (the FSD pages layer)
  widgets/    Header, footer, hero, pricing, reusable report sections
  features/   VIN checks, package selection, checkout, contact, auth, profile
  entities/   Vehicle validation, report content, packages, account models
  shared/     UI primitives, API client, navigation configuration
```

The FSD pages layer is named `views` because Next.js reserves `src/pages` for its Pages Router. Each slice exposes its public API through `index.ts`. Imports flow downward; ESLint enforces layer direction and prohibits sibling-slice dependencies. Static marketing sections remain Server Components; interactive forms and navigation are Client Components. TanStack Query owns server state, mutations, caching, cancellation, and account refresh. Local UI state stays in React.

## Implemented routes

- `/`, `/leistungen`, `/servicehistorie`, `/preise`, `/faq`, `/beispielreport`, `/kontakt`
- `/impressum`, `/datenschutz`, `/agb`
- `/konto`, `/konto/registrieren`, `/konto/passwort-vergessen`
- `/konto/dashboard`, `/konto/reports`, `/konto/profil`, `/konto/bestellungen`
- `/konto/reports/[id]`, `/konto/bestellungen/[id]`, `/konto/rechnungen`, `/konto/passwort-festlegen`
- `/bestellen?paket=<PACKAGE_CODE>&vin=…&check=…`
- `/orders/[id]`, `/orders/[id]/report`, `/r/[token]`, `/check`, `/check/[code]`

## Backend integration (vin-check-api)

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL` – API origin **including** `/v1`, e.g. `https://api.vinblick.de/v1`
- `NEXT_PUBLIC_SITE_URL` – public site URL (robots.txt, sitemap.xml)
- `NEXT_PUBLIC_PAYMENT_METHODS` – payment badges to show (only what is enabled in Stripe)

Auth: the API returns a short-lived access token (kept in memory only) and sets an httpOnly
refresh cookie. `shared/api/client.ts` sends `Authorization: Bearer …`, refreshes once on 401 and
restores the session on page load. The refresh cookie is `SameSite=Strict`, so the web app and the
API must be on the same site (e.g. `vinblick.de` + `api.vinblick.de`). In production set
`CORS_ORIGINS` on the API to the web origin.

Guest checkout: `POST /orders` returns an order access token; it is stored on the device
(localStorage) and links in emails carry a signed `?access=` token, so buyers can open
`/orders/:id` and `/orders/:id/report` without an account.

| Flow                         | API                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Free pre-check               | `POST /checks`                                                                                                          |
| Packages / promo             | `GET /packages`, `POST /promo-codes/validate`                                                                           |
| Checkout                     | `POST /orders` → hosted checkout → `/orders/:id?access=…&payment=success` → `POST /orders/:id/reconcile`                |
| Order status / report / PDFs | `GET /orders/:id`, `/orders/:id/report`, `/orders/:id/report/pdf`, `/orders/:id/invoices/:invoiceId/pdf`                |
| Auth                         | `/auth/sign-in`, `/sign-up`, `/refresh-token`, `/logout`, `/forgot-password`, `/set-password`                           |
| Account                      | `GET/PUT /user/current`, `GET /orders`, `/me/reports`, `/me/reports/:id(/pdf)`, `/me/invoices`, `/me/reports/:id/renew` |
| Sharing                      | `GET/POST /me/reports/:id/share-links`, `DELETE /me/share-links/:id`, `/me/share-links/:id/qr.png`                      |
| Public report                | `/r/:token` → `GET /public/r/:token`; `/check/:code` → `GET /public/code/:code`                                         |
| Contact                      | `POST /contact`                                                                                                         |

Routes used in API emails: `/orders/[id]`, `/orders/[id]/report`, `/account/set-password` (→ `/konto/passwort-festlegen`),
`/account/invoices` (→ `/konto/rechnungen`), `/r/[token]`, `/check/[code]`.

Without `NEXT_PUBLIC_API_BASE_URL` the UI renders, but every data screen shows a "not connected"
message — no example data is shown.

## Source content still needing completion

The Framer project contains placeholder company/contact details, draft legal text, and a privacy statement naming Framer hosting. These are retained in the content layer and need updating for the actual operator, hosting, and providers before publication. Editorial notes embedded in the Framer legal pages were omitted from customer-facing copy. The Framer account password component had a syntax error; the replacement provides a working password visibility control.

The local tests cover VIN normalization/invalid input, missing-backend behavior, credentialed JSON requests, empty responses, and authentication errors. Desktop/mobile interactions are also checked in the browser.

## Dependency audit

The installation audit reports five findings in the development-only ESLint dependency chain, originating from `braces@3.0.3`. The registry did not provide a patched release at implementation time. Runtime dependencies were not implicated. Avoid the suggested automatic downgrade of Next.js ESLint to version 14; update the affected development dependencies when a compatible patch becomes available.

## Design audit and page discovery

The [UI audit](docs/UI-AUDIT.md) maps all 17 Framer pages, records corrected UI/UX issues, and lists the remaining integration gaps. With no API configured, open `/seitenuebersicht` or follow the footer's **Seitenübersicht** link to inspect every screen.

Registration and profile forms now send `firstName`, `lastName`, and the combined `name`. VINs are preserved in checkout URLs and when changing packages. The homepage uses lightweight CSS/IntersectionObserver motion with reduced-motion support.
