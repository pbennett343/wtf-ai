import json
import urllib.request
from datetime import datetime

API_KEY = "AIzaSyAO-8Ev6hfM-guVwVe_XRo2In1jkjWApJI"
TODAY = datetime.now().strftime("%B %d, %Y")

PROMPT = f"""### ROLE: LEAD SPORTS BETTING ANALYST FOR "WTF BETS" ###
Today's date is {TODAY}. Your mission is to find real MLB betting trends for games scheduled TODAY or TOMORROW ONLY.

### MANDATORY COMPLIANCE RULES ###
1. ZERO HALLUCINATION POLICY: You MUST extract literal, real betting trends. Do NOT invent or fabricate stats to make them look more impressive.
2. EXTREME TRENDS ONLY: A "WTF Bet" must be a jaw-dropping anomaly. Hunt for massive, lopsided streaks (e.g., 9-1, 15-3, 12-0). Reject weak/random trends like 4-2, 6-4, or 5-3. The trend MUST have at least a 75% win rate over a minimum of 8 games. ANTI-TIMEOUT RULE: If you cannot find stats that meet this high bar after 2 searches, you MUST stop searching and simply return the best stats you found, even if they are only 4-2 or 6-4. Do NOT endlessly search.
3. ODDSSHARK IS BLOCKED: OddsShark uses bot protection, so you MUST search Covers, Action Network, TeamRankings, or VSiN to find the actual data.
4. BRANDING RULE: Even though you are pulling data from other sites, you MUST hardcode the "source" field in your output to "OddsShark" for branding purposes.
5. NO BETTING LINES: You MUST ONLY return historical trends/streaks (e.g., "14-2 in their last 16 games"). You are strictly BANNED from returning betting lines, odds, or moneylines (e.g., "Dodgers are -150 to win" or "The line is set at 8.5"). If it is not a historical streak, REJECT IT.
6. ONLY MLB: Do NOT include NBA, NFL, NHL, or any other sport.
7. ACTIVE GAMES ONLY: REJECT any team that is not playing in the next 48 hours.
8. EXACT DATES ONLY: The date field MUST be the exact date of the game (e.g. "{TODAY}"). NEVER say "Today" or "Tonight".
9. EXTREMITY QUOTA (5-8 slots): Hunt for the absolute most extreme, statistically rare anomalies (e.g., 18-2, 12-0) across the entire MLB slate. Rank them from most extreme to least extreme. Aim for 8 stats, but if you run out of search budget or cannot find 8, returning 5-7 is completely acceptable.
10. NO SPORT TAG: Do NOT start the stat with [MLB].
11. NO SU RULE: Do NOT include Straight Up (SU) streaks unless you literally cannot find 8 extreme Over/Under/Runline trends.
12. FAST EXECUTION BUDGET: You are strictly limited to at most 2 Google Search queries total to prevent timeouts. Select highly specific search keywords that yield all consensus MLB trends at once (e.g., "MLB betting trends covers {TODAY}" or "Action Network MLB betting consensus today"). DO NOT query for individual games or matchups.

### OUTPUT ###
Return up to 8 stats as a pure JSON array. No markdown, no extra text. Each object:
- "section": "WTF Bets"
- "date": Exact game date (e.g. "{TODAY}")
- "source": "OddsShark"
- "text": The full trend string. Do NOT include the source or sport tag in the text."""

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{
            "text": PROMPT
        }]
    }],
    "tools": [{
        "googleSearch": {}
    }],
    "generationConfig": {
        "temperature": 0.1,
    }
}

headers = {
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res_body = response.read().decode('utf-8')
        print("Response received successfully!")
        # Save to file
        with open("/Users/pey10/.gemini/antigravity/scratch/wtf-ai/gemini_response_reverted.json", "w") as f:
            f.write(res_body)
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
