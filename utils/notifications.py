import os
import requests

def send_booking_confirmation_email(booking_data):
    """
    Sends a booking confirmation email using SendGrid API (or fallback sandbox mode).
    booking_data contains: reference_id, guest_name, email, destination, hotel_name, room_type, check_in, check_out, total_cost, flight_info.
    Non-blocking: Never raises an exception.
    """
    try:
        email = booking_data.get("email")
        if not email:
            print("[Notification Warning] No email provided in booking data.")
            return False

        ref_id = booking_data.get("reference_id", "AERO-UNKNOWN")
        guest_name = booking_data.get("guest_name", "Valued Guest")
        destination = booking_data.get("destination", "India")
        hotel_name = booking_data.get("hotel_name", "Selected Hotel")
        room_type = booking_data.get("room_type", "Standard Room")
        check_in = booking_data.get("check_in", "N/A")
        check_out = booking_data.get("check_out", "N/A")
        total_cost = booking_data.get("total_cost", 0)
        flight_info = booking_data.get("flight_info") or "No Flight Booked"
        
        # QR Code Verification & Digital Boarding Pass Link
        verify_url = f"http://127.0.0.1:5000/api/bookings/{ref_id}"
        qr_image_url = f"https://api.qrserver.com/v1/create-qr-code/?size=160x160&data={ref_id}"

        formatted_cost = f"₹{int(total_cost):,}" if isinstance(total_cost, (int, float)) else f"₹{total_cost}"

        subject = f"✈️ Booking Confirmed: {ref_id} - {destination} Trip"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }}
            .header {{ text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }}
            .logo {{ font-size: 24px; font-weight: 800; color: #38bdf8; letter-spacing: 1px; }}
            .ref-badge {{ background: #0284c7; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block; margin-top: 10px; }}
            .details-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            .details-table td {{ padding: 10px; border-bottom: 1px solid #334155; font-size: 14px; }}
            .label {{ color: #94a3b8; font-weight: 600; }}
            .val {{ color: #f8fafc; font-weight: 700; text-align: right; }}
            .qr-section {{ text-align: center; background: #0f172a; padding: 20px; border-radius: 12px; margin-top: 24px; border: 1px solid #334155; }}
            .qr-img {{ width: 140px; height: 140px; border-radius: 8px; border: 4px solid #ffffff; }}
            .footer {{ text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; }}
            .btn {{ display: inline-block; background: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-top: 12px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AEROTRAVEL ✈️</div>
              <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Digital Boarding Pass & Booking Invoice</div>
              <div class="ref-badge">{ref_id}</div>
            </div>

            <p style="font-size: 15px; line-height: 1.6;">Dear <strong>{guest_name}</strong>,</p>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              Your travel reservation for <strong>{destination}</strong> is officially confirmed! Below are your digital itinerary and stay details.
            </p>

            <table class="details-table">
              <tr>
                <td class="label">Destination</td>
                <td class="val">{destination}</td>
              </tr>
              <tr>
                <td class="label">Hotel Stay</td>
                <td class="val">{hotel_name} ({room_type})</td>
              </tr>
              <tr>
                <td class="label">Check-in / Check-out</td>
                <td class="val">{check_in} → {check_out}</td>
              </tr>
              <tr>
                <td class="label">Flight Route</td>
                <td class="val">{flight_info}</td>
              </tr>
              <tr>
                <td class="label" style="font-size: 16px; color: #38bdf8;">Grand Total Paid</td>
                <td class="val" style="font-size: 18px; color: #34d399;">{formatted_cost}</td>
              </tr>
            </table>

            <div class="qr-section">
              <div style="font-size: 12px; font-weight: bold; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px;">Check-in Verification QR</div>
              <img src="{qr_image_url}" alt="Verification QR Code" class="qr-img" />
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Scan at airport / hotel desk for priority access</div>
              <br/>
              <a href="{verify_url}" class="btn" target="_blank">View Digital Invoice Online</a>
            </div>

            <div class="footer">
              <p>Thank you for choosing AeroTravel for your journey.</p>
              <p>© 2026 AeroTravel Inc. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        """

        sendgrid_key = os.getenv("SENDGRID_API_KEY")
        from_email = os.getenv("SENDGRID_FROM_EMAIL", "confirmations@aerotravel.com")

        if sendgrid_key and not sendgrid_key.startswith("demo_"):
            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {sendgrid_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "personalizations": [
                    {
                        "to": [{"email": email, "name": guest_name}],
                        "subject": subject
                    }
                ],
                "from": {"email": from_email, "name": "AeroTravel Confirmations"},
                "content": [
                    {
                        "type": "text/html",
                        "value": html_content
                    }
                ]
            }
            resp = requests.post(url, json=payload, headers=headers, timeout=5)
            if resp.status_code in [200, 202]:
                print(f"[Email Notification] Successfully sent booking confirmation email to {email} via SendGrid.")
                return True
            else:
                print(f"[Email Notification Error] SendGrid HTTP {resp.status_code}: {resp.text}")
                return False
        else:
            print(f"[Email Notification Sandbox] Simulated booking confirmation email to '{email}' for Ref: {ref_id}.")
            return True

    except Exception as e:
        print(f"[Notification Non-Blocking Exception] Failed to send email: {e}")
        return False


def send_booking_confirmation_sms(phone_number, booking_data):
    """
    Sends a secondary SMS booking confirmation using Twilio REST API.
    Non-blocking: Never raises an exception.
    """
    try:
        if not phone_number:
            return False

        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_phone = os.getenv("TWILIO_PHONE_NUMBER")

        if not account_sid or not auth_token or not from_phone:
            print(f"[SMS Notification Sandbox] Simulated SMS confirmation to {phone_number} for Ref: {booking_data.get('reference_id')}")
            return True

        ref_id = booking_data.get("reference_id", "AERO-UNKNOWN")
        destination = booking_data.get("destination", "India")
        cost = booking_data.get("total_cost", 0)

        sms_body = f"AeroTravel: Booking Confirmed! Ref: {ref_id}. Destination: {destination}. Total: ₹{int(cost):,}. Digital Pass: http://127.0.0.1:5000/api/bookings/{ref_id}"

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        auth = (account_sid, auth_token)
        data = {
            "From": from_phone,
            "To": phone_number,
            "Body": sms_body
        }

        resp = requests.post(url, auth=auth, data=data, timeout=5)
        if resp.status_code in [200, 201]:
            print(f"[SMS Notification] Successfully sent SMS to {phone_number} via Twilio.")
            return True
        else:
            print(f"[SMS Notification Error] Twilio HTTP {resp.status_code}: {resp.text}")
            return False

    except Exception as e:
        print(f"[Notification Non-Blocking Exception] Failed to send SMS: {e}")
        return False
