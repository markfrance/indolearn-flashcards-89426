#!/bin/sh
set -e

# Optional: if a .env file exists in the container, export it. If it doesn't, continue gracefully.
if [ -f ".env" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs) || true
fi

# Warn if critical env vars are missing (info only; server will still start and show warnings)
if [ -z "${SUPABASE_URL}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY}" ]; then
  echo "WARNING: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set. API endpoints depending on Supabase will not function." >&2
fi

# Start the server
exec node src/server.js
