# RollWithFlow Backend

FastAPI backend for the Phase 1 RollWithFlow foundation.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Seed

```bash
python -m app.seed.seed_data
```

## Health

```text
GET http://127.0.0.1:8000/api/health
```
