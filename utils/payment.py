import os
import time
import hmac
import hashlib
import requests
import logging

logger = logging.getLogger("aerotravel.payment")

def get_razorpay_keys():
    key_id = os.getenv("RAZORPAY_TEST_KEY_ID", "rzp_test_demo_key_id")
    key_secret = os.getenv("RAZORPAY_TEST_KEY_SECRET", "rzp_test_demo_key_secret")
    return key_id, key_secret


def create_razorpay_order(amount_inr, currency="INR"):
    """
    Creates a Razorpay order in Test Mode using Razorpay REST API.
    amount_inr: Total amount in INR rupees.
    Returns dictionary with order details.
    """
    key_id, key_secret = get_razorpay_keys()
    amount_paise = int(round(amount_inr * 100))
    receipt_id = f"rcpt_{int(time.time())}"

    # If test keys are default demo placeholders, return sandbox order payload
    if key_id.startswith("rzp_test_demo"):
        logger.info(f"[Razorpay API] Sandbox mode: Creating demo order for amount=₹{amount_inr}")
        return {
            "success": True,
            "id": f"order_demo_{int(time.time())}",
            "amount": amount_paise,
            "currency": currency,
            "key": key_id,
            "receipt": receipt_id,
            "is_sandbox": True
        }

    try:
        logger.info(f"[Razorpay API] Creating live test order for amount=₹{amount_inr} ({currency})")
        url = "https://api.razorpay.com/v1/orders"
        auth = (key_id, key_secret)
        payload = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": receipt_id,
            "payment_capture": 1
        }
        response = requests.post(url, auth=auth, json=payload, timeout=10)
        logger.info(f"[Razorpay API] Response status={response.status_code}")
        data = response.json()

        if response.status_code == 200 and "id" in data:
            return {
                "success": True,
                "id": data["id"],
                "amount": data["amount"],
                "currency": data["currency"],
                "key": key_id,
                "receipt": receipt_id,
                "is_sandbox": False
            }
        else:
            logger.error(f"[Razorpay API Error] Order creation failed: {data}")
            return {
                "success": False,
                "error": data.get("error", {}).get("description", "Failed to create Razorpay order")
            }
    except Exception as e:
        logger.error(f"[Razorpay API Error] Request exception: {e}")
        return {"success": False, "error": str(e)}


def verify_razorpay_signature(order_id, payment_id, signature):
    """
    Verifies the HMAC-SHA256 signature returned by Razorpay Checkout.js.
    """
    key_id, key_secret = get_razorpay_keys()

    # Sandbox mode bypass for demo keys
    if key_id.startswith("rzp_test_demo") or order_id.startswith("order_demo_"):
        return True

    if not order_id or not payment_id or not signature:
        return False

    message = f"{order_id}|{payment_id}".encode("utf-8")
    secret = key_secret.encode("utf-8")

    generated_signature = hmac.new(secret, message, hashlib.sha256).hexdigest()

    return hmac.compare_digest(generated_signature, signature)
