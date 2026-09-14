#!/usr/bin/env bash
# Installeer de projecthooks (scripts/git-hooks/*) in .git/hooks.
# .git/hooks is niet geversioneerd, dus na een verse clone eenmalig draaien.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$(git -C "$ROOT" rev-parse --git-path hooks)"
mkdir -p "$HOOKS_DIR"
for hook in "$ROOT"/scripts/git-hooks/*; do
  name="$(basename "$hook")"
  cp "$hook" "$HOOKS_DIR/$name"
  chmod +x "$HOOKS_DIR/$name"
  echo "geïnstalleerd: $HOOKS_DIR/$name"
done
