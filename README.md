This is EducaAI, a Next.js app with an AI Tutor experience for guided student learning.

## Getting Started

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

## AI Tutor Setup

The tutor endpoint is in `app/api/chat/route.ts`.

- Without `OPENAI_API_KEY`, it uses a built-in guided fallback tutor response.
- With `OPENAI_API_KEY`, it calls the OpenAI Chat Completions API.

Create a `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_key_here
```

Restart your dev server after adding environment variables.

## Deploy to the Web (Vercel - easiest)

1. Push this project to GitHub.
2. Go to [Vercel](https://vercel.com/new) and import the GitHub repo.
3. In Vercel project settings, add environment variable:
   - `OPENAI_API_KEY` = your key
4. Click Deploy.
5. After deploy, Vercel gives you a public URL to share.

## Deploy to Any Node Host (Render, Railway, VPS)

This app supports standard Node deployment:

```bash
npm install
npm run build
npm run start
```

Make sure your host has:

- Node.js available
- Port configured (usually via `PORT`)
- `OPENAI_API_KEY` configured in environment variables

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Deploying Guide](https://nextjs.org/docs/app/getting-started/deploying)
