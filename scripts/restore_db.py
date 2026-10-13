#!/usr/bin/env python
"""
Database Restoration Utility for Bright Mindz Academy.
Restores a selected snapshot into the database.
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKUP_DIR = BASE_DIR / 'backups'

sys.path.insert(0, str(BASE_DIR / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def restore_backup(backup_filepath):
    path = Path(backup_filepath)
    if not path.is_file():
        print(f"Error: Backup file {path} not found.")
        sys.exit(1)

    print(f"Restoring database from: {path}...")

    if path.suffix == '.json':
        import django
        django.setup()
        from django.core.management import call_command
        call_command('loaddata', str(path))
        print("Successfully restored database via Django loaddata.")
    elif path.suffix in ('.sql', '.dump'):
        db_name = os.getenv('DB_NAME', 'brightmindz_db')
        db_user = os.getenv('DB_USER', 'brightmindz_user')
        db_host = os.getenv('DB_HOST', 'localhost')
        import subprocess
        cmd = ['pg_restore', '-h', db_host, '-U', db_user, '-d', db_name, '--clean', str(path)]
        subprocess.run(cmd, check=True)
        print("Successfully restored PostgreSQL database.")
    else:
        print("Unsupported file format. Please provide a .json or .sql backup.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python restore_db.py <path_to_backup_file>")
        sys.exit(1)
    restore_backup(sys.argv[1])
