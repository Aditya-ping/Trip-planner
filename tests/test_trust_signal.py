import os
import sys
import sqlite3
import uuid
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.trust_signal import calculate_user_trust_signal

def create_user(email: str):
    conn = sqlite3.connect("database.db", timeout=20.0)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (email, password_hash) VALUES (?, 'hash')", (email,))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return user_id


def test_new_user_trust_signal():
    email = f"new_user_{uuid.uuid4().hex[:6]}@example.com"
    user_id = create_user(email)

    signal = calculate_user_trust_signal(user_id)
    assert signal['badge_label'] == "New Member"
    assert signal['is_active_member'] is False
    assert signal['clean_record'] is True


def test_active_member_trust_signal():
    email = f"active_user_{uuid.uuid4().hex[:6]}@example.com"
    user_id = create_user(email)

    # Add 1 hosted activity
    conn = sqlite3.connect("database.db", timeout=20.0)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO activity_invites (host_user_id, title, activity_type, city, scheduled_date, status)
        VALUES (?, 'Test Scuba', 'adventure', 'Goa', '2026-12-10', 'open')
    """, (user_id,))
    conn.commit()
    conn.close()

    signal = calculate_user_trust_signal(user_id)
    assert signal['badge_label'] == "Active Member"
    assert signal['is_active_member'] is True
    assert signal['activities_count'] == 1
    assert signal['clean_record'] is True


def test_reported_user_trust_signal():
    reporter_email = f"reporter_{uuid.uuid4().hex[:6]}@example.com"
    reported_email = f"reported_{uuid.uuid4().hex[:6]}@example.com"
    reporter_id = create_user(reporter_email)
    reported_id = create_user(reported_email)

    # Add open report against reported_id
    conn = sqlite3.connect("database.db", timeout=20.0)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reports (reporter_user_id, reported_user_id, reason, status)
        VALUES (?, ?, 'suspicious_behavior', 'open')
    """, (reporter_id, reported_id))
    conn.commit()
    conn.close()

    signal = calculate_user_trust_signal(reported_id)
    assert signal['badge_label'] == "Under Review"
    assert signal['is_active_member'] is False
    assert signal['clean_record'] is False
