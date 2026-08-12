import re

SPAM_KEYWORDS = [
    # Crypto & Financial Scams
    "crypto", "bitcoin", "ethereum", "usdt", "free money", "earn money", "passive income",
    "lottery", "cashback guarantee", "claim reward", "free prize", "pyramid scheme",
    
    # Phishing & External Group Links
    "whatsapp group", "telegram channel", "telegram group", "click link", "click here",
    "bit.ly", "tinyurl", "buy followers", "cheap deals", "discount code",
    
    # Gambling & Adult Content
    "casino", "online poker", "slot machine", "betting app", "gambling",
    "viagra", "cialis", "adult service", "escort", "nude", "sex"
]

def check_spam_keywords(title: str = "", description: str = "", location_name: str = "") -> tuple[bool, str | None]:
    """
    Scans event submission content for suspicious keywords or profanity.
    Returns (is_flagged, flag_reason).
    Flagged events remain 'pending' but are prioritized for admin review.
    """
    combined_text = f"{title} {description} {location_name}".lower()

    for keyword in SPAM_KEYWORDS:
        # Match whole word or exact pattern where appropriate
        pattern = r"\b" + re.escape(keyword) + r"\b"
        if re.search(pattern, combined_text):
            return True, f"Suspicious keyword detected: '{keyword}'"

    # Check for excessive URLs
    url_count = len(re.findall(r"https?://|www\.", combined_text))
    if url_count >= 2:
        return True, "Multiple external URLs detected in submission"

    return False, None
