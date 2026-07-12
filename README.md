# Aureo (golden hour)

Aureo is a photography booking web app — _Photography, beautifully booked._ This repository (`aureo`) contains the Angular frontend.

## Tech stack

- **Angular 22** — standalone components, signals, and the application builder
- **Tailwind CSS 4** — custom design tokens and dark mode
- **Iconify** — Lucide icons via `@iconify/tailwind4`
- **Vitest** — unit tests via `@angular/build:unit-test`
- **TypeScript 6** with path aliases (`@/*`, `@layout/*`, `@features/*`, `@shared/*`)

## Project structure

```
src/app/
├── features/          # Route-level pages (services, not-found, …)
├── layout/            # Shell components (header, footer, main-layout)
│   ├── header/
│   └── footer/
├── app.routes.ts      # Application routing
└── app.ts             # Root component
public/                # Static assets (logos, favicon)
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

Global styles and design tokens live in `src/styles.css`. The theme uses CSS custom properties for colors, typography (Outfit & DM Sans), and spacing. Dark mode is available via the `.dark` class.

## Additional resources

- [Angular documentation](https://angular.dev)
- [Angular CLI reference](https://angular.dev/tools/cli)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
