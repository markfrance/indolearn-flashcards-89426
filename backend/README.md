# IndoLearn Flashcards — Express Backend (Supabase)

This backend no longer uses a local PostgreSQL connection. All data access and authentication are performed via Supabase.

What changed:
- Removed pg pool and all direct SQL usage
- Integrated `@supabase/supabase-js` server client
- Auth endpoints proxy to Supabase Auth (signUp/signIn)
- CRUD for users, categories, flashcards, quizzes, stats now use Supabase tables

Environment variables (set in your runtime, do not commit secrets):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_JWT_SECRET (optional, only if you plan to verify JWTs locally)
- SITE_URL (optional; used as emailRedirectTo for signUp)
- HOST (default 0.0.0.0)
- PORT (default 3001)

A `.env` file is optional. The app uses `dotenv` if present but will also read variables from the runtime environment. See `.env.example` for the required keys.

Quick start (local):
1) Copy `.env.example` to `.env` and fill in values (or set variables via your shell)
2) npm install
3) npm start
4) Open Swagger docs at /docs

Docker:
1) Build the image
   docker build -t indolearn-backend .
2) Run the container with env vars passed from host (no local .env required)
   docker run -p 3001:3001 \
     -e SUPABASE_URL=... \
     -e SUPABASE_SERVICE_ROLE_KEY=... \
     -e SITE_URL=http://localhost:3000 \
     --name indolearn-backend indolearn-backend
3) Open Swagger docs at http://localhost:3001/docs

Security notes:
- Never expose SERVICE_ROLE_KEY to the browser.
- Frontend should use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
- The container will start even if Supabase variables are missing, but endpoints that access Supabase will not function and will warn in logs.
