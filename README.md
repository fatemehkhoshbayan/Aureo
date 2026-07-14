# Aureo (golden hour)

Aureo is a photography booking web app — _Photography, beautifully booked._ This repository (`aureo`) contains the Angular frontend.

## Tech stack

- **Angular 22** — standalone components, signals, and the application builder
- **Tailwind CSS 4** — custom design tokens and dark mode
- **Angular CDK** — accessible listbox for sort controls
- **Iconify** — Lucide icons via `@iconify/tailwind4`
- **Vitest** — unit tests via `@angular/build:unit-test`
- **TypeScript 6** with path aliases (`@/*`, `@layout/*`, `@features/*`, `@shared/*`)

## Project structure

```
src/app/
├── features/
│   ├── services/              # Home page — browse & search photographers
│   │   ├── components/
│   │   │   ├── hero-section/      # Carousel hero with search
│   │   │   ├── services-list/     # Grid, filters, sorting, toolbar
│   │   │   ├── photographer-card/ # Individual photographer card
│   │   │   ├── category-filter/   # Category pill scroller
│   │   │   ├── sidebar/         # Filter sidebar (photographer, price)
│   │   │   ├── toolbar/         # Result count, sort, filter toggle
│   │   │   ├── constants.ts     # Mock data (photographers, categories, …)
│   │   │   └── interfaces.ts    # Photographer, Category, CarouselSlide types
│   │   ├── utils.ts           # formatPrice, formatDate helpers
│   │   └── services.ts        # Page component — search + filtered list
│   └── not-found/             # 404 page
├── layout/
│   ├── header/                # Nav, mobile menu, dark mode toggle
│   ├── footer/                # Site footer
│   └── main-layout/           # Shell wrapping header + router-outlet + footer
├── shared/
│   ├── pill/                  # Reusable pill / tag component
│   ├── skeleton-card/         # Loading placeholder for cards
│   └── star-rating/           # Star rating display
├── app.routes.ts
└── app.ts
public/                        # Static assets (logos, favicon)
```

## Routes

| Path           | Component | Status      |
| -------------- | --------- | ----------- |
| `/`            | Services  | Implemented |
| `/my-bookings` | —         | Planned     |
| `/my-profile`  | —         | Planned     |
| `/privacy`     | —         | Planned     |
| `/terms`       | —         | Planned     |
| `/contact`     | —         | Planned     |
| `/**`          | Not Found | Implemented |

## Features

### Services page (`/`)

- **Hero section** — auto-rotating image carousel with search input
- **Search** — filter photographers by name or specialty (wired from hero to list)
- **Category filter** — horizontal scrollable category pills
- **Sidebar filters** — filter by photographer name and price range
- **Sorting** — by rating, price (low → high), or price (high → low)
- **Photographer cards** — avatar, cover, specialties, rating, starting price, like toggle
- **Loading state** — skeleton cards while data loads
- **Responsive layout** — collapsible filter sidebar on mobile

### Layout

- **Header** — sticky nav with active route highlighting, mobile menu, dark mode toggle
- **Footer** — site links and branding

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm 11+

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The app reloads automatically when source files change.

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

Global styles and design tokens live in `src/styles.css`. The theme uses CSS custom properties for colors, typography (Outfit & DM Sans), and spacing. Dark mode is toggled via the header and applied with the `.dark` class on `<html>`.

## Additional resources

- [Angular documentation](https://angular.dev)
- [Angular CLI reference](https://angular.dev/tools/cli)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
