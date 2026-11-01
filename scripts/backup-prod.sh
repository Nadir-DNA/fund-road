#!/bin/bash
# Sauvegarde de la production sur la box : base + documents/logos, 14 jours conservés
set -euo pipefail
DOCKER=${DOCKER:-/home/dna/.local/docker/docker}
DEST=${DEST:-$HOME/backups/fundroad}
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p "$DEST" && chmod 700 "$DEST"
"$DOCKER" exec fundroad-prod-db-1 pg_dump -U fundroad -Fc fundroad > "$DEST/db-$STAMP.dump"
"$DOCKER" run --rm -v fundroad-prod_fundroad_data:/data:ro alpine tar -C /data -czf - . > "$DEST/data-$STAMP.tgz"
# une sauvegarde vide signale un échec silencieux
test -s "$DEST/db-$STAMP.dump" && test -s "$DEST/data-$STAMP.tgz"
ls -1t "$DEST"/db-*.dump | tail -n +15 | xargs -r rm -f
ls -1t "$DEST"/data-*.tgz | tail -n +15 | xargs -r rm -f
