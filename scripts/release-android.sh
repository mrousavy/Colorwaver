#!/bin/bash

cd "$(dirname "$0")"
cd ..

# Check if we're on main
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "main" ]]; then
  echo 'Not on main branch! Switch to main and try again.';
  exit 1;
fi

if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
else
  # Uncommitted changes
  echo 'Working directory not clean! Commit/Revert changes and try again.';
  exit 1;
fi


cd android

# Increment version
bundle exec fastlane bump
git add app/build.gradle

set -e
if bundle exec fastlane release then
  git commit -m "Bump version for Android Release"
  git push
else
  # Update failed, revert version bump
  git checkout -- app/build.gradle
fi
