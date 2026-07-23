import pytest
from utils.notifications import send_booking_confirmation_email, send_booking_confirmation_sms

SAMPLE_BOOKING = {
    "reference_id": "AERO-999888",
    "guest_name": "Test Traveler",
    "email": "traveler@example.com",
    "phone": "+919876543210",
    "destination": "Jaipur",
    "hotel_name": "Rambagh Palace",
    "room_type": "Royal Suite",
    "check_in": "2026-08-01",
    "check_out": "2026-08-07",
    "total_cost": 42000,
    "flight_info": "IndiGo 6E-204 (DEL → JAI)"
}

def test_send_booking_confirmation_email_sandbox():
    """
    Tests sending a booking confirmation email in sandbox/test mode.
    """
    res = send_booking_confirmation_email(SAMPLE_BOOKING)
    assert res is True


def test_send_booking_confirmation_sms_sandbox():
    """
    Tests sending a secondary SMS notification in sandbox/test mode.
    """
    res = send_booking_confirmation_sms("+919876543210", SAMPLE_BOOKING)
    assert res is True


def test_notifications_non_blocking_on_missing_email():
    """
    Verifies that missing email payload returns False without raising exceptions.
    """
    bad_payload = {"reference_id": "AERO-000000"}
    res = send_booking_confirmation_email(bad_payload)
    assert res is False
