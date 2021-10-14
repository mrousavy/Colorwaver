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
  echo 'Clean working directory';
else
  # Uncommitted changes
  echo 'Working directory not clean! Commit/Revert changes and try again.';
  exit 1;
fi


cd ios

# Credentials
bundle exec fastlane match adhoc --readonly

# Increment version
bundle exec fastlane bump
git add ios/Colorwaver/Info.plist

set -e
if bundle exec fastlane release then
  git commit -m "Bump version for iOS Release"
  git push
else
  # Update failed, revert version bump
  git checkout -- ios/Colorwaver/Info.plist
fi
