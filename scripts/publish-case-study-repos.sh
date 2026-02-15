#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPOS_DIR="${ROOT_DIR}/case-study-repos"
GITHUB_OWNER="JefferyAddaeSecB"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install from https://cli.github.com/."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated. Run: gh auth login"
  exit 1
fi

if [ ! -d "${REPOS_DIR}" ]; then
  echo "No case-study repos found at ${REPOS_DIR}"
  exit 1
fi

for repo_path in "${REPOS_DIR}"/*; do
  [ -d "${repo_path}" ] || continue
  repo_name="$(basename "${repo_path}")"

  echo "Publishing ${repo_name}..."

  pushd "${repo_path}" >/dev/null

  if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial workflow and docs"
  fi

  if gh repo view "${GITHUB_OWNER}/${repo_name}" >/dev/null 2>&1; then
    echo "Repo ${GITHUB_OWNER}/${repo_name} already exists. Skipping create."
  else
    gh repo create "${GITHUB_OWNER}/${repo_name}" --public --source=. --remote=origin --push
  fi

  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/${GITHUB_OWNER}/${repo_name}.git"
  fi

  git branch -M main
  git push -u origin main

  popd >/dev/null
done

echo "Done. All case-study repos are published."
