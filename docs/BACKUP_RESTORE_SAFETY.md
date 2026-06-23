# Backup Restore Safety

Full backups contain metadata only, never audio files. Use Validate Backup to check the expected JSON structure. Use Dry Run Restore to see per-section counts that would be created, updated, or skipped.

Dry runs do not write records, delete records, change the current database, or move audio files. A destructive restore is intentionally not enabled yet.
