from typing import Any

from sqlalchemy.orm import Session

from app.db.models import AuditLog, User


def record_audit(
    db: Session,
    user: User,
    action: str,
    metadata: dict[str, Any] | None = None,
) -> AuditLog:
    audit_log = AuditLog(user_id=user.id, action=action, metadata_=metadata)
    db.add(audit_log)
    return audit_log