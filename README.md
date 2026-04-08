# @capgo/capacitor-standard-version
  <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>
<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>

Default config for standard-version for capacitor app

use it at builtin replacement of https://www.npmjs.com/package/standard-version

All config from .versionrc, .versionrc.json or .versionrc.js are supported

## Install

`bun add -D @capgo/capacitor-standard-version`

## Usage

Run `bunx capacitor-standard-version` for update main version or `bunx capacitor-standard-version --prerelease alpha` for alpha release for dev branch.

Example of GitHub Action to do it on every commit in `main` and `development`

```yml
on:
  push:
    branches:
      - main
      - development

jobs:
  bump-version:
    if: "!startsWith(github.event.head_commit.message, 'chore(release):')"
    runs-on: ubuntu-latest
    name: Bump version and create changelog with standard version
    steps:
      - name: Check out
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          token: '${{ secrets.PERSONAL_ACCESS_TOKEN }}'
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun install --frozen-lockfile
      - name: Git config
        run: |
          git config --local user.name "github-actions[bot]"
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
      - name: Create bump and changelog
        if: github.ref == 'refs/heads/main'
        run: bunx capacitor-standard-version
      - name: Create bump and changelog
        if: github.ref != 'refs/heads/main'
        run: bunx capacitor-standard-version --prerelease alpha
      - name: Push to origin
        run: |
          CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
          remote_repo="https://${GITHUB_ACTOR}:${{ secrets.PERSONAL_ACCESS_TOKEN }}@github.com/${GITHUB_REPOSITORY}.git"
          git pull $remote_repo $CURRENT_BRANCH
          git push $remote_repo HEAD:$CURRENT_BRANCH --follow-tags --tags
```
For this action to work you have to add as env var `PERSONAL_ACCESS_TOKEN` you can create it by following this doc https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
