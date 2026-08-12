import os
import sys
import sqlite3
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, generate_token, verify_token

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_events_all(client):
    res = client.get('/api/events')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert isinstance(data['events'], list)
    assert len(data['events']) > 0
    # Ensure all returned events are approved
    for event in data['events']:
        assert event['status'] == 'approved'

def test_get_events_by_city(client):
    res = client.get('/api/events?city=Mumbai')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['events']) > 0
    for event in data['events']:
        assert event['city'].lower() == 'mumbai'
        assert event['status'] == 'approved'

def test_post_event_unauthorized(client):
    res = client.post('/api/events', json={
        "city": "Mumbai",
        "title": "Test Local Street Fair",
        "category": "fair",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05"
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data['success'] is False

import random

def test_post_event_authorized_pending_status(client):
    test_user_id = random.randint(1000, 999999)
    token = generate_token(user_id=test_user_id, email=f"testuser_{test_user_id}@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "city": "Jaipur",
        "title": "Jaipur Community Pottery Market",
        "description": "Local pottery artisans showcasing handmade kulhads and terracotta crafts.",
        "category": "market",
        "start_date": "2026-11-01",
        "end_date": "2026-11-03",
        "location_name": "MI Road Market Grounds"
    }

    res = client.post('/api/events', json=payload, headers=headers)
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['event']['status'] == 'pending'
    assert data['event']['source'] == 'user_submitted'
    assert data['event']['submitted_by'] == test_user_id

    # Verify that GET /api/events?city=Jaipur does NOT return this pending event
    get_res = client.get('/api/events?city=Jaipur')
    get_data = get_res.get_json()
    titles = [e['title'] for e in get_data['events']]
    assert "Jaipur Community Pottery Market" not in titles
