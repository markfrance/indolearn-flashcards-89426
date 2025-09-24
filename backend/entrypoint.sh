#!/bin/sh
# Robust entrypoint for backend service. Never fail due to missing *.env files and start the server reliably.
set -e

# Some orchestrations or compose files may attempt to 'cat *.env' to print env vars.
# If no files match, BusyBox/ash will error and, with set -e, would terminate the script.
# We proactively run it and suppress errors to ensure this never stops container startup.
cat *.env 2>/dev/null || true

# Do NOT attempt to export variables by parsing .env here (values may contain spaces/quotes).
# Node will load .env via dotenv inside the app for correctness and consistency.

# Defensive guard: if node is unexpectedly missing, keep container alive for diagnostics instead of crash-looping.
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: 'node' runtime not found in container PATH. Ensure the image includes Node.js." >&2
  tail -f /dev/null
fi

# Start the server (dotenv will load .env; missing Supabase vars are logged by the app but do not prevent startup)
exec node src/server.js
