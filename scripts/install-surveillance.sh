#!/bin/bash
# Active la surveillance de Fund Road toutes les 5 minutes (minuteur systemd utilisateur)
set -euo pipefail
SCRIPT=$(cd "$(dirname "$0")" && pwd)/surveiller.sh
UNITS=$HOME/.config/systemd/user
mkdir -p "$UNITS"
cat > "$UNITS/fundroad-surveillance.service" <<EOT
[Unit]
Description=Surveillance de Fund Road (site, API, worker, sauvegarde)
[Service]
Type=oneshot
ExecStart=$SCRIPT
EOT
cat > "$UNITS/fundroad-surveillance.timer" <<'EOT'
[Unit]
Description=Declenche la surveillance de Fund Road toutes les 5 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
EOT
systemctl --user daemon-reload
systemctl --user enable --now fundroad-surveillance.timer
systemctl --user list-timers fundroad-surveillance.timer --no-pager
