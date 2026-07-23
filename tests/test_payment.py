import hmac
import hashlib
import pytest
from utils.payment import create_razorpay_order, verify_razorpay_signature

def test_create_razorpay_order_structure():
    amount_inr = 191646
    res = create_razorpay_order(amount_inr, currency="INR")

    assert res["success"] is True
    assert res["amount"] == 19164600  # Amount in paise (191646 * 100)
    assert res["currency"] == "INR"
    assert "id" in res
    assert "key" in res


def test_verify_razorpay_signature_hmac():
    key_secret = "test_secret_12345"
    order_id = "order_test_9999"
    payment_id = "pay_test_8888"

    # Compute valid HMAC-SHA256 signature
    message = f"{order_id}|{payment_id}".encode("utf-8")
    secret = key_secret.encode("utf-8")
    valid_signature = hmac.new(secret, message, hashlib.sha256).hexdigest()

    # Monkeypatch get_razorpay_keys to return custom secret for test
    import utils.payment
    original_fn = utils.payment.get_razorpay_keys
    utils.payment.get_razorpay_keys = lambda: ("rzp_live_real", key_secret)

    try:
        assert verify_razorpay_signature(order_id, payment_id, valid_signature) is True
        assert verify_razorpay_signature(order_id, payment_id, "invalid_sig_abc") is False
    finally:
        utils.payment.get_razorpay_keys = original_fn
