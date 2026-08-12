import sqlite3
from datetime import datetime, timezone

def calculate_user_trust_signal(user_id: int, db_path: str = "database.db") -> dict:
    """
    Calculates a lightweight trust signal for a user based on clean safety record,
    trip history (activities hosted/joined), and account tenure.

    Note: This is strictly an operational activity/tenure indicator labeled
    'Active Member' or 'Established Traveler', NOT an identity verification guarantee.
    """
    if not user_id:
        return {
            "badge_label": "New Member",
            "is_active_member": False,
            "activities_count": 0,
            "clean_record": True,
            "tenure_days": 0
        }

    try:
        conn = sqlite3.connect(db_path, timeout=20.0)
        cursor = conn.cursor()

        # 1. Clean safety record check (no open or actioned reports against this user)
        cursor.execute("""
            SELECT COUNT(*) FROM reports
            WHERE reported_user_id = ? AND status IN ('open', 'actioned')
        """, (user_id,))
        open_reports = cursor.fetchone()[0]
        clean_record = (open_reports == 0)

        # 2. Activity experience check (activities hosted or accepted as participant)
        cursor.execute("""
            SELECT COUNT(*) FROM activity_invites
            WHERE host_user_id = ? AND status != 'cancelled'
        """, (user_id,))
        hosted_count = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM activity_participants
            WHERE user_id = ? AND status = 'accepted'
        """, (user_id,))
        joined_count = cursor.fetchone()[0]

        activities_count = hosted_count + joined_count

        # 3. Account tenure check
        cursor.execute("SELECT created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()

        tenure_days = 0
        if row and row[0]:
            try:
                # Handle standard SQLite DATETIME strings
                created_str = str(row[0]).split('.')[0]
                created_dt = datetime.strptime(created_str, "%Y-%m-%d %H:%M:%S")
                tenure_days = (datetime.now() - created_dt).days
            except Exception:
                tenure_days = 1

        conn.close()

        # Determine badge label
        if not clean_record:
            badge_label = "Under Review"
            is_active = False
        elif activities_count >= 3 or tenure_days >= 30:
            badge_label = "Established Traveler"
            is_active = True
        elif activities_count >= 1 or tenure_days >= 7:
            badge_label = "Active Member"
            is_active = True
        else:
            badge_label = "New Member"
            is_active = False

        return {
            "badge_label": badge_label,
            "is_active_member": is_active,
            "activities_count": activities_count,
            "clean_record": clean_record,
            "tenure_days": tenure_days
        }
    except Exception as e:
        return {
            "badge_label": "Active Member",
            "is_active_member": True,
            "activities_count": 0,
            "clean_record": True,
            "tenure_days": 0
        }
