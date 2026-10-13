#!/usr/bin/env python
"""
Automated Database Backup Utility for Bright Mindz Academy.
Supports PostgreSQL (pg_dump) and Django JSON dumpdata format.
"""

import os
import sys
import datetime
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKUP_DIR = BASE_DIR / 'backups'
BACKUP_DIR.mkdir(exist_ok=True)

# Add backend to sys.path
sys.path.insert(0, str(BASE_DIR / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def run_backup():
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    db_engine = os.getenv('DB_ENGINE', 'sqlite').lower()

    if db_engine == 'postgres':
        # PostgreSQL native backup
        db_name = os.getenv('DB_NAME', 'brightmindz_db')
        db_user = os.getenv('DB_USER', 'brightmindz_user')
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        backup_file = BACKUP_DIR / f"pg_backup_{db_name}_{timestamp}.sql"

        cmd = [
            'pg_dump',
            '-h', db_host,
            '-p', db_port,
            '-U', db_user,
            '-F', 'c',
            '-b',
            '-v',
            '-f', str(backup_file),
            db_name
        ]
        print(f"Executing pg_dump to {backup_file}...")
        try:
            subprocess.run(cmd, check=True)
            print(f"Successfully created PostgreSQL backup: {backup_file}")
            return
        except Exception as e:
            print(f"pg_dump not available or failed: {e}. Falling back to Django dumpdata...")

    # Django dumpdata backup (format agnostic)
    import django
    django.setup()
    from django.core.management import call_command

    backup_file = BACKUP_DIR / f"django_dumpdata_{timestamp}.json"
    print(f"Generating Django dumpdata backup to {backup_file}...")
    with open(backup_file, 'w', encoding='utf-8') as f:
        call_command(
            'dumpdata',
            '--natural-foreign',
            '--natural-primary',
            '--exclude=contenttypes',
            '--exclude=auth.Permission',
            '--indent=2',
            stdout=f
        )
    print(f"Successfully generated database snapshot: {backup_file} ({backup_file.stat().st_size} bytes)")

if __name__ == '__main__':
    run_backup()
