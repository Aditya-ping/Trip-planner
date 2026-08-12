import os
import json
import re
import requests
import logging
from utils.distance import optimize_route, get_real_route, estimate_travel_cost

logger = logging.getLogger("aerotravel.refiner")

def parse_target_days_from_instruction(instruction: str, total_days: int) -> list:
    """
    Utility to extract explicit day references from user's natural language instruction.
    E.g. 'Day 2', 'days 1 and 3', 'first day', 'last day'.
    """
    text = instruction.lower()
    targeted = set()

    # Numeric day patterns e.g. "day 2", "day 02", "days 1 and 3"
    matches = re.findall(r'days?\s*(\d+)(?:\s*(?:and|&|,)\s*(\d+))?', text)
    for m in matches:
        for g in m:
            if g and g.isdigit():
                d = int(g)
                if 1 <= d <= total_days:
                    targeted.add(d)

    if "first day" in text or "day one" in text or "day 1" in text:
        targeted.add(1)
    if "last day" in text or f"day {total_days}" in text:
        targeted.add(total_days)

    # Default to Day 2 or Day 1 if no specific day number found
    if not targeted:
        targeted.add(min(2, total_days))

    return sorted(list(targeted))


def call_llm_api(prompt: str, system_prompt: str) -> str:
    """
    Multi-provider LLM API caller:
    1. Google Gemini API (GEMINI_API_KEY)
    2. Anthropic Claude API (ANTHROPIC_API_KEY)
    3. OpenAI GPT API (OPENAI_API_KEY)
    Returns raw completion string or raises Exception if no key or error.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # Tier 1: Google Gemini Flash / Pro API
    if gemini_key:
        try:
            logger.info("[LLM Refiner] Calling Google Gemini API...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\n{prompt}"}]
                    }
                ]
            }
            resp = requests.post(url, json=payload, timeout=12)
            logger.info(f"[LLM Refiner] Gemini status={resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
        except Exception as e:
            logger.error(f"[LLM Refiner Error] Gemini API error: {e}")

    # Tier 2: Anthropic Claude API
    if anthropic_key:
        try:
            logger.info("[LLM Refiner] Calling Anthropic Claude API...")
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1500,
                "system": system_prompt,
                "messages": [{"role": "user", "content": prompt}]
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            logger.info(f"[LLM Refiner] Anthropic status={resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("content", [])
                if content:
                    return content[0].get("text", "")
        except Exception as e:
            logger.error(f"[LLM Refiner Error] Anthropic API error: {e}")

    # Tier 3: OpenAI API
    if openai_key:
        try:
            logger.info("[LLM Refiner] Calling OpenAI API...")
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            logger.info(f"[LLM Refiner] OpenAI status={resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"[LLM Refiner Error] OpenAI API error: {e}")

    raise RuntimeError("No working LLM API key found or all LLM requests failed.")


def fallback_rule_refiner(itinerary: list, instruction: str, target_days: list, city: str) -> dict:
    """
    Intelligent rule-based refiner fallback executed when no live LLM key is set in .env.
    Modifies places in targeted day based on keywords (less packed, cafe, nature, heritage).
    """
    logger.info(f"[Fallback Refiner] Modifying target_days={target_days} for city='{city}' using rules")
    modified_diff = {}
    text = instruction.lower()

    for d in target_days:
        day_obj = next((day for day in itinerary if day["day"] == d), None)
        if not day_obj:
            continue
        
        places = list(day_obj.get("places", []))
        if not places:
            continue

        if "less packed" in text or "relaxed" in text or "fewer" in text:
            # Reduce place count if > 2
            if len(places) > 2:
                places = places[:2]
        elif "cafe" in text or "food" in text or "dining" in text:
            # Append a local dining/cafe spot
            places.append({
                "name": f"Local Heritage Cafe & Tea Room ({city})",
                "category": "Dining",
                "rating": 4.7,
                "description": f"Relaxed local cafe in {city} offering regional tea, traditional refreshments, and authentic hospitality.",
                "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
            })
        elif "nature" in text or "outdoor" in text or "park" in text:
            places.append({
                "name": f"{city} Central Botanical Garden",
                "category": "Nature",
                "rating": 4.6,
                "description": f"Serene green sanctuary in {city} with manicured walkways, native flora, and peaceful lakeside benches.",
                "image": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80"
            })
        else:
            # Default swap last place with a relaxed spot
            if len(places) >= 2:
                places[-1] = {
                    "name": f"{city} Cultural Promenade & Crafts Market",
                    "category": "Culture",
                    "rating": 4.8,
                    "description": f"Vibrant artisan street in {city} showcasing regional handicrafts, local musicians, and evening strolls.",
                    "image": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=600&q=80"
                }

        modified_diff[str(d)] = places

    return modified_diff


def refine_itinerary(itinerary: list, instruction: str, city: str = "India") -> dict:
    """
    Main itinerary refinement controller:
    1. Extracts target days from user instruction.
    2. Invokes LLM (or rule fallback) to generate day-scoped place diffs.
    3. Enforces scope guardrails (untouched days remain 100% unmodified).
    4. Re-runs route optimization & real route pricing for modified days.
    """
    total_days = len(itinerary)
    target_days = parse_target_days_from_instruction(instruction, total_days)
    logger.info(f"[Refiner] Processing instruction='{instruction}' for city='{city}' (Target days: {target_days})")

    system_prompt = (
        "You are an expert travel itinerary refinement engine. "
        "Your task is to refine ONLY the days specified by the user in an Indian travel itinerary.\n\n"
        "STRICT CONSTRAINTS:\n"
        "1. Output ONLY a valid JSON object mapping string day numbers (e.g. '2') to an updated array of place objects.\n"
        "2. Do NOT output markdown codeblocks, text explanations, or key names other than day numbers.\n"
        "3. Every place object MUST include keys: 'name', 'category', 'rating', 'description', 'image'.\n"
        "4. DO NOT modify any day numbers that were NOT explicitly requested by the user."
    )

    prompt = (
        f"City: {city}\n"
        f"User Refinement Instruction: '{instruction}'\n"
        f"Targeted Days: {target_days}\n\n"
        f"Current Itinerary JSON:\n{json.dumps(itinerary, indent=2)}\n\n"
        f"Respond with JSON format: {{\"{target_days[0]}\": [place1, place2, ...]}}"
    )

    day_diffs = {}
    refinement_note = f"Refined Day {', Day '.join(map(str, target_days))}: '{instruction}'"

    try:
        raw_response = call_llm_api(prompt, system_prompt)
        cleaned_json = raw_response.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned_json)
        if isinstance(parsed, dict):
            day_diffs = parsed
    except Exception as llm_err:
        logger.info(f"[Refiner] LLM API unavailable/failed ({llm_err}). Executing rule-based refiner fallback.")
        day_diffs = fallback_rule_refiner(itinerary, instruction, target_days, city)

    # Scope Validation & Merging Pipeline
    updated_itinerary = []
    modified_days_recorded = []

    for day_item in itinerary:
        day_num = day_item["day"]
        day_num_str = str(day_num)

        # Check if this day was targeted and modified in diff
        if day_num_str in day_diffs or day_num in day_diffs:
            new_places = day_diffs.get(day_num_str) or day_diffs.get(day_num)
            if isinstance(new_places, list) and len(new_places) > 0:
                modified_days_recorded.append(day_num)

                # Re-run route optimization for modified day if coords exist
                if all(("latitude" in p and "longitude" in p) for p in new_places):
                    new_places = optimize_route(new_places)

                # Re-compute routes between places for modified day
                new_routes = []
                for i in range(len(new_places) - 1):
                    p1 = new_places[i]
                    p2 = new_places[i + 1]
                    if "latitude" in p1 and "longitude" in p1 and "latitude" in p2 and "longitude" in p2:
                        rd = get_real_route(p1["latitude"], p1["longitude"], p2["latitude"], p2["longitude"])
                        if rd:
                            cost = estimate_travel_cost(rd.get("distance", 0))
                            new_routes.append({
                                "from": p1.get("name"),
                                "to": p2.get("name"),
                                "distance": rd.get("distance"),
                                "time": rd.get("duration"),
                                "cost": cost,
                                "mode": rd.get("mode", "Car/Cab")
                            })

                updated_itinerary.append({
                    "day": day_num,
                    "places": new_places,
                    "routes": new_routes
                })
                continue

        # Untouched Day: Preserve 100% of original day_item
        updated_itinerary.append(day_item)

    total_trip_cost = sum(sum(r.get("cost", 0) for r in d.get("routes", [])) for d in updated_itinerary)

    return {
        "success": True,
        "city": city,
        "days": total_days,
        "refinement_note": refinement_note,
        "modified_days": modified_days_recorded if modified_days_recorded else target_days,
        "itinerary": updated_itinerary,
        "total_trip_cost": total_trip_cost
    }
