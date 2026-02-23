#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"

files=$(git diff --name-only "$BASE_REF"...HEAD -- 'assets/js/**/*.js' 'assets/js/*.js' | tr '\n' ' ')

if [[ -z "${files// }" ]]; then
  echo "No changed JS files to lint."
  exit 0
fi

echo "Linting changed files against $BASE_REF"
./node_modules/.bin/eslint $files
