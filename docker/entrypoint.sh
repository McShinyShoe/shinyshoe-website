#!/bin/sh
set -e

export LEPTOS_SITE_ADDR="0.0.0.0:${PORT:-3000}"
export RUST_LOG="${LOG_LEVEL:-info}"

exec "$@"