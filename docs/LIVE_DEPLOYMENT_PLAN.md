# Live Deployment Plan

## Frontend

- Deploy the Next.js app to Vercel.
- Set `NEXT_PUBLIC_API_BASE_URL` to the public backend URL.
- Deploy only after the private `/login` flow has been tested.

## Backend

- Deploy FastAPI to Render or Railway.
- Set `APP_ENV=production`, `DATABASE_URL`, `CORS_ORIGINS`, a strong `SECRET_KEY`, and the invited admin variables.
- Include the Vercel URL in `CORS_ORIGINS`.

## Data And Access

- SQLite is for local development. Use PostgreSQL before private production use.
- Require login before exposing the private DJ workspace publicly.
- Add managed storage before supporting uploaded audio or mix files.

## Rollout Order

1. Deploy frontend and backend with the health endpoint.
2. Provision PostgreSQL and set `DATABASE_URL=postgresql+psycopg://...`.
3. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME`, and a strong `SECRET_KEY`.
4. Add the Vercel URL to `CORS_ORIGINS`, then verify login and the dashboard.
5. Add object storage before mix/audio uploads.
