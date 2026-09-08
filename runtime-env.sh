#!/bin/sh
set -eu

target=/usr/share/nginx/html/runtime-env.js

escape() {
  printf '%s' "${1:-}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

emit() {
  escaped="$(escape "${2:-}")"
  [ -n "$escaped" ] || return 0
  printf '  "%s": "%s",\n' "$1" "$escaped"
}

{
  printf 'window.__RUNTIME_ENV__ = {\n'
  emit VITE_SENTRY_DSN "${VITE_SENTRY_DSN:-}"
  emit VITE_SENTRY_ENVIRONMENT "${VITE_SENTRY_ENVIRONMENT:-}"
  emit VITE_APP_VERSION "${VITE_APP_VERSION:-}"
  printf '};\n'
} > "$target"
