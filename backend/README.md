# DEPRECATED: Express Backend

This project previously used an Express + PostgreSQL backend. The architecture has been migrated to Supabase as the sole database and auth provider, and the frontend (Next.js) connects directly to Supabase using `@supabase/supabase-js`.

- Do not start or deploy this backend. Any container attempting to start this service without database and JWT env vars will fail by design.
- API calls from the frontend have been replaced with direct Supabase queries and auth.
- Quizzes and stats are currently handled on the client; optional server-side persistence can be added in Supabase.

For current database schema and configuration, see `assets/supabase.md` at the repository root.

You can safely remove this backend folder if not needed by your workflows.
