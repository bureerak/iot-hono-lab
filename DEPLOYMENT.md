# DigitalOcean App Platform

This project is configured to run as a Node.js web service on DigitalOcean App Platform.

## App settings

- Resource type: Web Service
- Region: Singapore
- Build command: `npm run build`
- Run command: `npm start`
- Health check path: `/health`
- Source directory: `/`

App Platform supplies `PORT` automatically. Do not configure a fixed production port.

## Runtime environment variables

Configure these values in App Platform and mark both as encrypted secrets:

- `DATABASE_URL`: the Neon PostgreSQL connection string
- `SECRET_PASSWORD`: a long random bearer token

`NODE_ENV=production` can be configured as a regular runtime variable.

Do not upload `.env` to the repository or copy it into the App Platform build settings.

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

## Smoke test

```sh
curl https://YOUR-APP.ondigitalocean.app/health
curl -H "Authorization: Bearer YOUR_TOKEN" https://YOUR-APP.ondigitalocean.app/api/student/1
```
