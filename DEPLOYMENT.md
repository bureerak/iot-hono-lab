# Vercel

Vercel detects the default Hono export in `src/index.ts` and deploys it as a Vercel Function. No custom server, port, build command, output directory, or `vercel.json` is required.

## Project settings

- Framework preset: Hono (normally detected automatically)
- Root directory: `.`
- Node.js version: 22.x (also pinned in `package.json`)
- Build command: no override
- Output directory: no override
- Install command: no override

## Environment variables

Configure these variables for Production and any Preview environments that should access the API:

- `DATABASE_URL`: the Neon PostgreSQL connection string
- `SECRET_PASSWORD`: a long random bearer token

Do not add `NODE_ENV=production` manually. Vercel sets the runtime environment, while setting this variable during dependency installation can cause npm to omit build-time development dependencies.

After changing an environment variable, redeploy the project so the new value is used.

## Database migrations

Generate migrations locally whenever the Drizzle schema changes:

```sh
npm run db:generate
```

Commit the generated `drizzle/` directory. Apply pending migrations once against the target database:

```sh
npm run db:migrate
```

Do not run the initial migration against a database where the `students` table was created previously without first reconciling the existing schema.

## Local validation

Run the Vercel development server with the Vercel CLI:

```sh
npx vercel dev
```

Check TypeScript without creating build output:

```sh
npm run typecheck
```

## Smoke test

```sh
curl https://YOUR-PROJECT.vercel.app/health
curl -H "Authorization: Bearer YOUR_TOKEN" https://YOUR-PROJECT.vercel.app/api/student/1
```
