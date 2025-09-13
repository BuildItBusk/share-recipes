# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 application for sharing recipes, bootstrapped with `create-next-app`. It uses:
- **Framework**: Next.js 15 with App Router (app directory)
- **Language**: TypeScript with strict mode
- **Styling**: TailwindCSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build tool**: Turbopack (Next.js's new bundler)

## Development Commands
```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Project Structure
- `app/` - Next.js App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with Geist fonts and global styles
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind CSS styles
- `public/` - Static assets (Next.js SVG logos, icons)
- Configuration files:
  - `next.config.ts` - Next.js configuration (currently minimal)
  - `tsconfig.json` - TypeScript config with path aliases (`@/*` maps to `./`)
  - `eslint.config.mjs` - ESLint with Next.js and TypeScript rules
  - `postcss.config.mjs` - PostCSS configuration for TailwindCSS

## Key Details
- Uses Turbopack for both development and production builds (faster than Webpack)
- ESLint extends "next/core-web-vitals" and "next/typescript" configurations
- Path alias `@/*` is configured to reference the root directory
- No test framework is currently configured
- Dark mode styling is already present in the default components using TailwindCSS classes

## Architecture Notes
- Standard Next.js App Router structure with server components by default
- Uses the new font optimization system with next/font/google
- Responsive design implemented with TailwindCSS responsive prefixes (sm:, md:, etc.)
- Image optimization handled by Next.js Image component