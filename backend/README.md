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

Quick start:
1) Set env vars
2) npm install
3) npm start
4) Open Swagger docs at /docs

Security notes:
- Never expose SERVICE_ROLE_KEY to the browser.
- Frontend should use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
