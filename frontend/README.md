# Aureo (golden hour)

Aureo is a photography booking web app — _Photography, beautifully booked._ This repository (`aureo`) contains the Angular frontend.

## Tech stack

- **Angular 22** — standalone components, signals, and the application builder
- **Tailwind CSS 4** — custom design tokens and dark mode
- **Angular CDK** — accessible listbox for sort controls
- **Iconify** — Lucide icons via `@iconify/tailwind4`
- **Vitest** — unit tests via `@angular/build:unit-test`
- **TypeScript 6** with path aliases (`@/*`, `@layout/*`, `@features/*`, `@shared/*`, `@services/*`, `@utils/*`)

## Project structure

```
src/app/
├── features/
│   ├── service-list/              # Home page — browse & search photographers
│   │   ├── components/
│   │   │   ├── hero-section/          # Carousel hero with search
│   │   │   ├── photographers-list/    # Grid, filters, sorting, toolbar
│   │   │   ├── photographer-card/     # Individual photographer card
│   │   │   ├── category-filter/       # Category pill scroller
│   │   │   ├── sidebar/               # Filter sidebar (photographer, price)
│   │   │   ├── toolbar/               # Result count, sort, filter toggle
│   │   │   └── constants.ts           # Carousel / UI constants
│   │   └── services-list.ts           # Page component — search + filtered list
│   ├── photographer-info/         # Photographer profile page
│   │   ├── components/
│   │   │   ├── about-photographer/    # Bio, specialties, portfolio, reviews
│   │   │   ├── portfolio-gallery/     # Portfolio image grid
│   │   │   ├── reviews/               # Client reviews list
│   │   │   └── cta-packages/          # Pricing packages & booking CTA
│   │   └── photographer-info.ts       # Page component — load by route id
│   ├── booking-form/              # 3-step booking flow (package → details → confirmed)
│   ├── my-bookings/               # User bookings & favorites
│   │   ├── components/
│   │   │   ├── bookings-list/         # Upcoming / past booking cards
│   │   │   ├── cancel-dialog/         # Confirm booking cancellation
│   │   │   ├── favorites-list/        # Liked photographers
│   │   │   └── not-logged-in/         # Prompt when unauthenticated
│   │   └── my-bookings.ts             # Stats, tabs, cancel flow
│   ├── my-profile/                # Account, preferences, quick links
│   │   ├── components/
│   │   │   ├── log-in-form/           # Email / password login
│   │   │   ├── user-info/             # Profile view + avatar
│   │   │   ├── edit-form/             # Edit name, email, phone, location
│   │   │   ├── preferences/           # Theme & email notifications
│   │   │   └── quick-links/           # Shortcuts to bookings
│   │   ├── interfaces.ts              # Profile draft / save payload types
│   │   └── my-profile.ts
│   ├── interfaces.ts              # Shared feature types (Category, Statistics, …)
│   └── not-found/                 # 404 page
├── services/
│   ├── photographers/             # PhotographersService + Photographer types
│   ├── categories/                # CategoriesService
│   ├── auth/                      # AuthService, interceptor, user types
│   ├── bookings/                  # BookingsService + Booking types (load / create / cancel)
│   ├── favorites/                 # Favorites (liked photographers), synced per-user via the backend API
│   ├── theme/                     # Dark / light theme persistence
│   └── toast/                     # ToastService (success / error notifications)
├── layout/
│   ├── header/                    # Nav, mobile menu, dark mode toggle
│   ├── footer/                    # Site footer
│   └── main-layout/               # Shell wrapping header + router-outlet + footer + toast host
├── shared/
│   ├── pill/                      # Reusable pill / tag component
│   ├── skeleton-card/             # Loading placeholder for cards
│   ├── star-rating/               # Star rating display
│   ├── tabs/                      # Tab switcher
│   ├── confirm-modal/             # Reusable confirmation dialog
│   └── toast/                     # Global toast host (reads ToastService)
├── utils.ts                       # formatPrice, formatDate helpers
├── app.routes.ts
└── app.ts
public/                            # Static assets (logos, favicon)
```

## Routes

| Path                      | Component             | Status      |
| ------------------------- | --------------------- | ----------- |
| `/`                       | ServicesList          | Implemented |
| `/photographer/dashboard` | PhotographerDashboard | Implemented |
| `/photographer/:id`       | PhotographerInfo      | Implemented |
| `/book/:id`               | BookingForm           | Implemented |
| `/my-bookings`            | MyBookings            | Implemented |
| `/my-profile`             | MyProfile             | Implemented |
| `/become-a-photographer`  | BecomePhotographer    | Implemented |
| `/privacy`                | —                     | Planned     |
| `/terms`                  | —                     | Planned     |
| `/contact`                | —                     | Planned     |
| `/**`                     | Not Found             | Implemented |

## Features

### Services page (`/`)

- **Hero section** — auto-rotating image carousel with search input
- **Search** — filter photographers by name or specialty (wired from hero to list)
- **Category filter** — horizontal scrollable category pills
- **Sidebar filters** — filter by photographer name and price range
- **Sorting** — by rating, price (low → high), or price (high → low)
- **Photographer cards** — avatar, cover, specialties, rating, starting price, like toggle; navigate to profile
- **Favorites** — like/unlike photographers (stored via FavoritesService)
- **Loading state** — skeleton cards while data loads
- **Responsive layout** — collapsible filter sidebar on mobile

### Photographer info (`/photographer/:id`)

- **Cover & identity** — cover image, avatar, name, location, and experience
- **About** — bio and specialty tags
- **Portfolio gallery** — sample work grid
- **Reviews** — client ratings and comments
- **Packages CTA** — pricing packages; navigates to `/book/:id` (optional `?package=`)
- **Back navigation** — return to the photographers list
- **Not found state** — shown when the photographer id is invalid

### Booking form (`/book/:id`)

- **Auth gate** — prompts login with `returnUrl` when unauthenticated
- **Step 1** — choose package (from photographer API data), date, and time slot
- **Step 2** — contact details (prefilled from AuthService) + booking summary
- **Step 3** — confirmation with reference and **Total** (no payment collected)
- **API** — creates an upcoming booking via `BookingsService.create` → `POST /bookings`
- **Toasts** — success / error feedback via shared `Toast` + `ToastService`

### My bookings (`/my-bookings`)

- **Auth gate** — prompts login when the user is not authenticated
- **Statistics** — total bookings, upcoming count, and total spent
- **Tabs** — upcoming, past (completed / cancelled), and favorites
- **Cancel booking** — confirm dialog; cancels upcoming bookings via the API
- **Favorites tab** — photographers the user has liked from the services list

### My profile (`/my-profile`)

- **Login / sign up** — email / password login, or switch to a sign-up form to create a new account, against the auth API
- **User info** — name, email, phone, location, and avatar
- **Edit profile** — update details and upload avatar
- **Preferences** — dark / light theme and email notification toggle
- **Quick links** — shortcuts to My Bookings
- **Logout** — clear session and return to the login form

### Layout

- **Header** — sticky nav with active route highlighting, mobile menu, dark mode toggle
- **Footer** — site links and branding

### Auth & API

- **AuthService** — login, register, logout, `loadMe`, token persistence
- **authInterceptor** — attaches `Authorization: Bearer` to API requests; on `401` logs out and redirects to `/my-profile` with a `returnUrl`
- **BookingsService** — load, create, and cancel user bookings
- **FavoritesService** — load, toggle, and check liked photographers, synced per-user via the backend API
- **ToastService** — global success / error notifications (host mounted in MainLayout)
- API base URL is set in [`src/environment.ts`](src/environment.ts)

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm 11+
- Backend API running (see root [README](../README.md))

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The app reloads automatically when source files change.

For local API development, set `apiBase` in `src/environment.ts` to `http://localhost:8000` (or use Docker Compose with `apiBase: '/api'`).

Demo customer: `customer@example.com` / `customer123`

### Build

```bash
npm run build
```

Production output is written to `dist/`.

### Unit tests

```bash
npm test
```

### Code scaffolding

Generate new components, directives, pipes, and more with the Angular CLI:

```bash
ng generate component component-name
ng generate --help
```

## Styling

Global styles and design tokens live in `src/styles.css`. The theme uses CSS custom properties for colors, typography (Outfit & DM Sans), and spacing. Dark mode is toggled via the header (and profile preferences) and applied with the `.dark` class on `<html>`.

## Additional resources

- [Angular documentation](https://angular.dev)
- [Angular CLI reference](https://angular.dev/tools/cli)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
