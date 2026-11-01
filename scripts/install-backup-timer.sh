#!/bin/bash
# Active la sauvegarde de nuit de Fund Road (03:15), sur le modèle de surface-crm-backup
set -euo pipefail
SCRIPT=$(cd "$(dirname "$0")" && pwd)/backup-prod.sh
UNITS=$HOME/.config/systemd/user
mkdir -p "$UNITS"
cat > "$UNITS/fundroad-backup.service" <<EOF
[Unit]
Description=Sauvegarde quotidienne de Fund Road (base et documents)
[Service]
Type=oneshot
ExecStart=$SCRIPT
EOF
cat > "$UNITS/fundroad-backup.timer" <<'EOF'
[Unit]
Description=Declenche la sauvegarde de Fund Road chaque nuit
[Timer]
OnCalendar=*-*-* 03:15:00
Persistent=true
[Install]
WantedBy=timers.target
EOF
systemctl --user daemon-reload
systemctl --user enable --now fundroad-backup.timer
systemctl --user list-timers fundroad-backup.timer --no-pager
