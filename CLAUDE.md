# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 application for sharing recipes, bootstrapped with `create-next-app`. It uses:
- **Framework**: Next.js 15 with App Router (app directory)
- **Language**: TypeScript with strict mode
- **Styling**: TailwindCSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build tool**: Turbopack (Next.js's new bundler)

## Environment Variables
This application requires environment variables for local development:

- **DATABASE_URL**: PostgreSQL connection string for the database
- **OPENAI_API_KEY**: OpenAI API key for AI-powered recipe formatting features

### Local Development Setup
1. Create a `.env.local` file (not committed to git)
2. Set up local PostgreSQL using Docker - see [DOCKER_SETUP.md](DOCKER_SETUP.md) for complete instructions
3. Add required environment variables:

```env
# Local Docker PostgreSQL (after following DOCKER_SETUP.md)
DATABASE_URL="postgresql://postgres:password@localhost:5432/paste_recipe_dev"

# OpenAI API Key for AI features
OPENAI_API_KEY="your_openai_api_key_here"
```

### Production Deployment (Vercel)
- Set environment variables in Vercel dashboard (Settings → Environment Variables)
- Never commit production credentials to git
- No `.env` file is needed - Vercel handles environment variables via dashboard

## Development Commands
```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run Biome linter and formatter check
npm run lint

# Auto-fix Biome issues
npm run lint:fix

# Format code with Biome
npm run format
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
  - `biome.json` - Biome configuration for linting and formatting
  - `postcss.config.mjs` - PostCSS configuration for TailwindCSS

## Key Details
- Uses Turbopack for both development and production builds (faster than Webpack)
- **Biome** is used for linting and formatting (replaces ESLint + Prettier)
  - Fast, Rust-based linter and formatter
  - Configured with accessibility rules (button types, SVG labels, etc.)
  - Uses tabs for indentation and double quotes for strings
- Path alias `@/*` is configured to reference the root directory
- No test framework is currently configured
- Dark mode styling is already present in the default components using TailwindCSS classes

## Architecture Notes
- Standard Next.js App Router structure with server components by default
- Uses the new font optimization system with next/font/google
- Responsive design implemented with TailwindCSS responsive prefixes (sm:, md:, etc.)
- Image optimization handled by Next.js Image component