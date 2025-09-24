#!/bin/sh
# Robust entrypoint for backend service. Never fail due to missing *.env files and start the server reliably.
set -e

# Some orchestrations or compose files may attempt to 'cat *.env' to print env vars.
# If no files match, BusyBox/ash will error and, with set -e, would terminate the script.
# We proactively run it and suppress errors to ensure this never stops container startup.
cat *.env 2>/dev/null || true

# Optional: if a .env file exists in the container, export it. If it doesn't, continue gracefully.
if [ -f ".env" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs) || true
fi

# Warn if critical env vars are missing (info only; server will still start and show warnings)
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "WARNING: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set. API endpoints depending on Supabase will not function." >&2
fi

# Defensive guard: if node is unexpectedly missing, keep container alive for diagnostics instead of crash-looping.
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: 'node' runtime not found in container PATH. Ensure the image includes Node.js." >&2
  tail -f /dev/null
fi

# Start the server
exec node src/server.js
