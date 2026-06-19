# Private Beta Deployment Checklist

## Backend: Render Or Railway

1. Create a Python web service from the repository and set the backend working directory to `backend`.
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Provision PostgreSQL and set:
   `DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/rollwithflow`
5. Set backend environment variables:
   - `APP_ENV=production`
   - `DATABASE_URL=postgresql+psycopg://...`
   - `SECRET_KEY=` a new random value with at least 32 characters
   - `ADMIN_EMAIL=` private owner email
   - `ADMIN_PASSWORD=` strong private password
   - `ADMIN_DISPLAY_NAME=` preferred display name
   - `CORS_ORIGINS=` temporary local URLs, then add the Vercel URL after it is known
6. After deployment, run the admin command in the backend service shell if startup did not create it:
   `python -m app.seed.create_admin`

## Frontend: Vercel

1. Import the repository and set the frontend root directory to `frontend`.
2. Set `NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND.example.com`.
3. Deploy, then copy the Vercel production URL.
4. Update backend `CORS_ORIGINS` to include the exact Vercel URL, redeploy the backend, and test login.

## Smoke Tests

1. `GET https://YOUR-BACKEND/api/health` returns `status: ok`.
2. `GET https://YOUR-BACKEND/api/songs` returns `401` without a token.
3. Sign in at `https://YOUR-FRONTEND/login` with the manually created admin.
4. Confirm dashboard/library load after login and logout returns to `/login`.
5. Confirm browser network requests use the deployed backend URL and have no CORS errors.

## Security Check

- Never commit `.env` files or real passwords.
- Use PostgreSQL for production; SQLite remains local-only.
- Keep the app private until additional account-management and token-revocation controls are added.
