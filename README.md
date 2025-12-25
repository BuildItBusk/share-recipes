# Paste Recipe

AI-powered recipe formatter. Paste messy recipes, get clean structured output.

**Live:** https://www.pasterecipe.com

## The Problem

Recipe sites bury recipes in life stories and ads. Cookbooks format inconsistently. Screenshots lose structure. Manual reformatting is tedious. And don't even get me started on recipes in social media comments.

## Design Philosophy

AI should amplify human created content, not strip attribution and context. This tool:
- Preserves source attribution when URLs are provided
- Formats recipes for readability without claiming ownership
- Stores originals alongside formatted versions for transparency

It's a formatter, not a scraper. Think of it like Markdown rendering for recipes.

## The Approach

Treating recipes as a transformation problem, not a parsing problem:

- Pre-process input (normalize whitespace, strip HTML if pasted from web)
- OpenAI API interprets structure from messy text
- Server Actions write directly to PostgreSQL (no separate API layer)
- Store both raw + formatted versions so users can verify interpretation

## Stack

Next.js 15 · PostgreSQL · Prisma · OpenAI API · Vercel

## License

MIT - feel free to learn from it.
