# Idea Board

A minimal Next.js and TypeScript application, being configured in verified steps for Supabase PostgreSQL and Vercel Hobby.

## Local development

Use Node.js 22 or newer. From this directory:

```sh
npm ci
npm run dev
```

Open the address printed by Next.js in your local terminal. To check a production build:

```sh
npm run build
npm run start
```

`npm run typecheck` checks TypeScript.

## Current step

The responsive application shell is implemented. Submission is deliberately disabled until server-side database access is configured. There are no mock votes or submitted ideas.

Database access, the reproducible SQL schema, environment variable setup, and Vercel deployment instructions will be added in the next verified steps. Never commit `.env` files or put secret credentials in `NEXT_PUBLIC_` variables.
