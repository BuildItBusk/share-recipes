This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

This application requires environment variables for local development:

1. **Database**: Set up a local PostgreSQL database using Docker (see [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed instructions)
2. **API Keys**: You'll need an OpenAI API key for AI features

Create a `.env.local` file in the root directory:
```env
# Local Docker PostgreSQL (after running DOCKER_SETUP.md)
DATABASE_URL="postgresql://postgres:password@localhost:5432/share_recipes_dev"

# OpenAI API Key for AI features
OPENAI_API_KEY="your_openai_api_key_here"
```

**For production deployment on Vercel:**
- Set `DATABASE_URL` and `OPENAI_API_KEY` in your Vercel project's environment variables dashboard
- Do not commit production credentials to git

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
