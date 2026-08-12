import os
import sys
import sqlite3
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, generate_token

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

import uuid

def create_test_user(email: str = None):
    if not email:
        email = f"act_user_{uuid.uuid4().hex[:8]}@example.com"
    else:
        email = f"{uuid.uuid4().hex[:4]}_{email}"

    conn = sqlite3.connect("database.db", timeout=20.0)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO users (email, password_hash, is_admin)
        VALUES (?, 'hashed_pass_test', 0)
    """, (email,))
    conn.commit()

    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user_id = cursor.fetchone()[0]
    conn.close()

    token = generate_token(user_id=user_id, email=email)
    return user_id, {"Authorization": f"Bearer {token}"}


def test_create_and_get_activities_location_masking(client):
    host_id, host_headers = create_test_user("scuba_host@example.com")
    user_b_id, b_headers = create_test_user("traveler_b@example.com")

    # 1. Host creates activity invite
    res = client.post('/api/activities', json={
        "city": "Goa",
        "title": "Grand Island Scuba Trip",
        "activity_type": "adventure",
        "scheduled_date": "2026-12-01",
        "scheduled_time": "08:00 AM",
        "location_name": "Grand Island Jetty, Candolim Beach",
        "description": "Looking for 3 buddies to share boat charter costs.",
        "max_participants": 4
    }, headers=host_headers)

    assert res.status_code == 201
    activity_id = res.get_json()['activity']['id']

    # 2. User B (unaccepted) views open activities in Goa
    get_res = client.get('/api/activities?city=Goa', headers=b_headers)
    assert get_res.status_code == 200
    activities = get_res.get_json()['activities']
    target_act = next(a for a in activities if a['id'] == activity_id)

    # LOCATION PRIVACY TEST: location_name must be masked for non-accepted users!
    assert target_act['location_name'] == "🔒 Visible to accepted participants only"
    assert target_act['host_email'] == f"Traveler #{host_id}"

    # Host viewing own activity gets exact location
    host_get_res = client.get('/api/activities?city=Goa', headers=host_headers)
    host_target = next(a for a in host_get_res.get_json()['activities'] if a['id'] == activity_id)
    assert host_target['location_name'] == "Grand Island Jetty, Candolim Beach"


def test_host_approval_enforcement_and_location_unmasking(client):
    host_id, host_headers = create_test_user("trek_host@example.com")
    applicant_id, applicant_headers = create_test_user("applicant_user@example.com")

    # Create activity
    res = client.post('/api/activities', json={
        "city": "Manali",
        "title": "Solang Sunrise Glacier Hike",
        "activity_type": "adventure",
        "scheduled_date": "2026-11-20",
        "location_name": "Solang Ropeway Base Station Gate 2"
    }, headers=host_headers)
    activity_id = res.get_json()['activity']['id']

    # Applicant requests to join
    join_res = client.post(f'/api/activities/{activity_id}/join', headers=applicant_headers)
    assert join_res.status_code == 201
    assert join_res.get_json()['status'] == 'requested'

    # Verify applicant STILL sees masked location while request is pending ('requested')
    get_res1 = client.get('/api/activities?city=Manali', headers=applicant_headers)
    act1 = next(a for a in get_res1.get_json()['activities'] if a['id'] == activity_id)
    assert act1['location_name'] == "🔒 Visible to accepted participants only"

    # Host accepts join request
    resp_res = client.post(
        f'/api/activities/{activity_id}/participants/{applicant_id}/respond',
        json={"action": "accept"},
        headers=host_headers
    )
    assert resp_res.status_code == 200
    assert resp_res.get_json()['participant_status'] == 'accepted'

    # Applicant NOW sees exact unmasked location name!
    get_res2 = client.get('/api/activities?city=Manali', headers=applicant_headers)
    act2 = next(a for a in get_res2.get_json()['activities'] if a['id'] == activity_id)
    assert act2['location_name'] == "Solang Ropeway Base Station Gate 2"


def test_user_blocking_and_query_filtering(client):
    blocker_id, blocker_headers = create_test_user("blocker_user@example.com")
    blocked_id, blocked_headers = create_test_user("blocked_user@example.com")

    # Blocked user creates an activity in Jaipur
    res = client.post('/api/activities', json={
        "city": "Jaipur",
        "title": "Amber Fort Evening Illumination Walk",
        "activity_type": "sightseeing",
        "scheduled_date": "2026-11-25"
    }, headers=blocked_headers)
    act_id = res.get_json()['activity']['id']

    # Blocker blocks the blocked user
    block_res = client.post('/api/blocks', json={"blocked_user_id": blocked_id}, headers=blocker_headers)
    assert block_res.status_code == 200

    # Blocker queries activities in Jaipur -> Blocked user's invite is FILTERED OUT!
    get_res = client.get('/api/activities?city=Jaipur', headers=blocker_headers)
    activities = get_res.get_json()['activities']
    assert not any(a['id'] == act_id for a in activities)

    # Blocked user tries to join Blocker's activity -> 403 Forbidden
    blocker_act_res = client.post('/api/activities', json={
        "city": "Jaipur",
        "title": "Chokhi Dhani Dinner",
        "activity_type": "food",
        "scheduled_date": "2026-11-26"
    }, headers=blocker_headers)
    blocker_act_id = blocker_act_res.get_json()['activity']['id']

    join_attempt = client.post(f'/api/activities/{blocker_act_id}/join', headers=blocked_headers)
    assert join_attempt.status_code == 403
    assert join_attempt.get_json()['success'] is False
    assert "user block settings" in join_attempt.get_json()['error']


def test_safety_reporting(client):
    reporter_id, reporter_headers = create_test_user("reporter@example.com")
    reported_id, _ = create_test_user("scammer@example.com")

    res = client.post('/api/reports', json={
        "reported_user_id": reported_id,
        "reason": "scam_or_commercial",
        "description": "User asked for advance bank transfer payment outside app."
    }, headers=reporter_headers)

    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert 'report_id' in data
