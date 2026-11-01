#!/bin/bash
# Surveillance de la production (toutes les 5 min) : site public, API locale, sauvegarde de nuit.
# Prévient les administrateurs au changement d'état seulement (panne puis rétablissement).
set -uo pipefail
DOCKER=${DOCKER:-/home/dna/.local/docker/docker}
ETAT=${ETAT:-$HOME/.local/state/fundroad-surveillance}
BACKUPS=${BACKUPS:-$HOME/backups/fundroad}
mkdir -p "$ETAT"
problemes=()
curl -sf --max-time 15 https://fund-road.com/api/health >/dev/null || problemes+=("site public injoignable (https://fund-road.com)")
curl -sf --max-time 10 http://127.0.0.1:3190/api/health >/dev/null || problemes+=("API locale injoignable (127.0.0.1:3190)")
"$DOCKER" ps --format '{{.Names}}' | grep -q '^fundroad-prod-worker-1$' || problemes+=("worker arrêté : analyses et lectures bloquées")
# la sauvegarde de nuit doit dater de moins de 26 h
recente=$(find "$BACKUPS" -maxdepth 1 -name 'db-*.dump' -mmin -1560 -size +1k 2>/dev/null | head -1)
[ -n "$recente" ] || problemes+=("aucune sauvegarde de moins de 26 h dans $BACKUPS")
alerter() {
  for c in fundroad-prod-api-1 fundroad-prod-worker-1; do
    "$DOCKER" exec "$c" npx tsx scripts/alerte.ts "$1" "$2" >/dev/null 2>&1 && return 0
  done
  echo "ALERTE NON ENVOYÉE (email indisponible) : $1 — $2" >&2
  return 1
}
precedent=$(cat "$ETAT/etat" 2>/dev/null || echo ok)
if [ ${#problemes[@]} -gt 0 ]; then
  texte=$(printf -- '- %s\n' "${problemes[@]}")
  echo "$texte"
  if [ "$precedent" != "panne" ]; then
    alerter "Incident en production" "Détecté le $(date '+%d/%m/%Y à %H:%M') :
$texte" && echo panne > "$ETAT/etat"
  fi
  exit 1
fi
if [ "$precedent" = "panne" ]; then
  alerter "Production rétablie" "Tous les contrôles sont de nouveau OK le $(date '+%d/%m/%Y à %H:%M')." && echo ok > "$ETAT/etat"
fi
echo "OK $(date '+%H:%M')"
