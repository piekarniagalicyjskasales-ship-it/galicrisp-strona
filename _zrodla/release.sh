#!/usr/bin/env bash
# Builds the production site (clean URLs) into ../dist and zips it.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf ../dist && mkdir -p ../dist
cp -r ../site/assets ../dist/assets
node build.mjs --out=../dist
cp ../site/PLAN-WDROZENIA.md ../dist/
cp -r ../build ../dist/_zrodla-generatora && rm -rf ../dist/_zrodla-generatora/node_modules ../dist/_zrodla-generatora/package-lock.json
cd ../dist && zip -qr ../galicrisp-nowa-strona.zip . && cd .. && ls -la galicrisp-nowa-strona.zip
