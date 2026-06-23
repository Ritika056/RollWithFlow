import json

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.common import BackupValidationReport


router = APIRouter(prefix="/api/import", tags=["import"])
EXPECTED = ["songs", "folders", "playlists", "crates", "mixes", "events", "discovery_items"]


async def _read_backup(file: UploadFile) -> BackupValidationReport:
    if not (file.filename or "").lower().endswith(".json"):
        raise HTTPException(status_code=422, detail="Choose a JSON backup file")
    try:
        data = json.loads(await file.read())
    except (UnicodeDecodeError, json.JSONDecodeError):
        return BackupValidationReport(valid=False, errors=["The file is not valid JSON"])

    if not isinstance(data, dict):
        return BackupValidationReport(valid=False, errors=["Backup root must be an object"])

    errors: list[str] = []
    if data.get("schema_version") != 1:
        errors.append("Unsupported or missing schema_version")
    counts: dict[str, int] = {}
    for key in EXPECTED:
        value = data.get(key, [])
        if not isinstance(value, list):
            errors.append(f"{key} must be a list")
        else:
            counts[key] = len(value)
    return BackupValidationReport(valid=not errors, errors=errors, counts=counts)


@router.post("/validate-backup", response_model=BackupValidationReport)
async def validate_backup(file: UploadFile = File(...)) -> BackupValidationReport:
    return await _read_backup(file)


@router.post("/dry-run-restore", response_model=BackupValidationReport)
async def dry_run_restore(file: UploadFile = File(...)) -> BackupValidationReport:
    report = await _read_backup(file)
    if not report.valid:
        return report

    report.would_create = dict(report.counts)
    report.would_update = {key: 0 for key in report.counts}
    report.would_skip = {key: 0 for key in report.counts}
    report.notes = ["Dry run only: no records, audio files, or current database data were changed."]
    return report
