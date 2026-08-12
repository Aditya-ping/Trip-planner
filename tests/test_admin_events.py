import os
import sys
import sqlite3
import uuid
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, generate_token

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def create_user_and_get_headers(email: str = None, is_admin: bool = False):
    if not email:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    else:
        email = f"{uuid.uuid4().hex[:4]}_{email}"

    conn = sqlite3.connect("database.db", timeout=20.0)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (email, password_hash, is_admin)
        VALUES (?, 'hashed_pass_test', ?)
    """, (email, 1 if is_admin else 0))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    token = generate_token(user_id=user_id, email=email)
    return user_id, {"Authorization": f"Bearer {token}"}


def test_post_event_rate_limit(client):
    user_id, headers = create_user_and_get_headers("rate_limit_user@example.com")

    # Submit 5 events
    for i in range(1, 6):
        res = client.post('/api/events', json={
            "city": "Mumbai",
            "title": f"Community Art Workshop #{i} - {uuid.uuid4().hex[:4]}",
            "category": "fair",
            "start_date": "2026-10-01",
            "end_date": "2026-10-05"
        }, headers=headers)
        assert res.status_code == 201
        assert res.get_json()['event']['status'] == 'pending'

    # Attempt 6th submission -> should be rate limited (429)
    res_6th = client.post('/api/events', json={
        "city": "Mumbai",
        "title": "Community Art Workshop #6",
        "category": "fair",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05"
    }, headers=headers)
    assert res_6th.status_code == 429
    data = res_6th.get_json()
    assert data['success'] is False
    assert "Maximum pending event submissions reached" in data['error']


def test_spam_keyword_filter(client):
    user_id, headers = create_user_and_get_headers("spam_test_user@example.com")

    # Submit event with suspicious keywords
    res = client.post('/api/events', json={
        "city": "Goa",
        "title": f"Crypto & Bitcoin Casino Night {uuid.uuid4().hex[:4]}",
        "description": "Click here to claim reward and join our whatsapp group.",
        "category": "concert",
        "start_date": "2026-11-01",
        "end_date": "2026-11-03",
        "location_name": "Beach Casino"
    }, headers=headers)

    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['event']['status'] == 'pending'
    assert data['event']['is_flagged'] is True
    assert "Suspicious keyword" in data['event']['flag_reason']


def test_admin_get_events_access_control(client):
    _, regular_headers = create_user_and_get_headers("regular_user@example.com", is_admin=False)
    _, admin_headers = create_user_and_get_headers("mod_admin@example.com", is_admin=True)

    # Regular user -> 403 Forbidden
    res_regular = client.get('/api/admin/events', headers=regular_headers)
    assert res_regular.status_code == 403
    assert res_regular.get_json()['success'] is False

    # Admin user -> 200 OK
    res_admin = client.get('/api/admin/events', headers=admin_headers)
    assert res_admin.status_code == 200
    assert res_admin.get_json()['success'] is True
    assert isinstance(res_admin.get_json()['events'], list)


def test_admin_approve_and_reject_flow(client):
    user_id, user_headers = create_user_and_get_headers("submission_user@example.com")
    _, admin_headers = create_user_and_get_headers("mod_admin_flow@example.com", is_admin=True)

    unique_title = f"Amritsar Organic Harvest Fair {uuid.uuid4().hex[:4]}"

    # 1. Submit event
    res_sub = client.post('/api/events', json={
        "city": "Amritsar",
        "title": unique_title,
        "description": "Local farmers showcase fresh organic wheat, mustard oil, and pickles.",
        "category": "fair",
        "start_date": "2026-11-10",
        "end_date": "2026-11-12",
        "location_name": "Town Hall Square"
    }, headers=user_headers)
    assert res_sub.status_code == 201
    event_id = res_sub.get_json()['event']['id']

    # Verify NOT in public events list yet
    public_res1 = client.get('/api/events?city=Amritsar')
    titles1 = [e['title'] for e in public_res1.get_json()['events']]
    assert unique_title not in titles1

    # 2. Admin approves event
    res_app = client.post(f'/api/admin/events/{event_id}/approve', headers=admin_headers)
    assert res_app.status_code == 200
    assert res_app.get_json()['success'] is True

    # Verify NOW appears in public events list!
    public_res2 = client.get('/api/events?city=Amritsar')
    titles2 = [e['title'] for e in public_res2.get_json()['events']]
    assert unique_title in titles2

    # 3. Submit another event & admin rejects it
    unique_rej_title = f"Spam Scam Event {uuid.uuid4().hex[:4]}"
    res_sub2 = client.post('/api/events', json={
        "city": "Amritsar",
        "title": unique_rej_title,
        "category": "other",
        "start_date": "2026-11-15",
        "end_date": "2026-11-16"
    }, headers=user_headers)
    event_id2 = res_sub2.get_json()['event']['id']

    res_rej = client.post(f'/api/admin/events/{event_id2}/reject', headers=admin_headers)
    assert res_rej.status_code == 200

    # Verify rejected event NEVER appears in public events list
    public_res3 = client.get('/api/events?city=Amritsar')
    titles3 = [e['title'] for e in public_res3.get_json()['events']]
    assert unique_rej_title not in titles3
