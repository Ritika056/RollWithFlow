from app.core.database import SessionLocal, init_db
from app.services.auth_service import create_admin_from_settings


def create_admin() -> None:
    init_db()
    db = SessionLocal()
    try:
        user = create_admin_from_settings(db)
        if user:
            print(f"Admin ready: {user.email}")
        else:
            print("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before creating an admin.")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
