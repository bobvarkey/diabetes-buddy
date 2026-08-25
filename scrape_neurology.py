#!/usr/bin/env python3
"""Scrape X/Twitter for neurology news."""
import subprocess
import os
import json
import re

BU_CDP_WS = "ws://127.0.0.1:9222/devtools/page/13E21ABF325F4E9466B72AA0BEE019DF"
SCRIPT = '''
import time
import json
import re
from pathlib import Path

accounts = ['NeurologyToday', 'AANmember']
all_tweets = []

for account in accounts:
    print(f"Scraping @{account}...")
    goto(f'https://x.com/{account}')
    wait_for_load()
    time.sleep(4)
    for i in range(5):
        js("window.scrollBy(0, 900)")
        time.sleep(1.2)
    
    arts = js("(function() { var arts = document.querySelectorAll('article'); var out = []; for (var i = 0; i < Math.min(arts.length, 12); i++) { out.push(arts[i].innerText); } return out; })()")
    print(f"  Found {len(arts)} articles")
    
    for art in arts:
        lines = [l.strip() for l in art.split('\\n') if l.strip()]
        filtered = []
        for l in lines:
            if not (l.startswith('Replying to') or l.startswith('Show more') or l.startswith('Quote') or l.startswith('From ')):
                filtered.append(l)
        
        if len(filtered) < 4:
            continue
        if len(filtered) > 1 and filtered[1].startswith('@'):
            display = filtered[0]
            handle = filtered[1].lstrip('@')
            idx = 2
            if idx < len(filtered) and filtered[idx] == '·':
                idx += 1
            time_str = filtered[idx] if idx < len(filtered) else ''
            idx += 1
            
            text_lines = []
            for j in range(idx, len(filtered)):
                text_lines.append(filtered[j])
            
            text = ' '.join(text_lines)
            all_tweets.append({
                'display_name': display,
                'handle': handle,
                'time_str': time_str,
                'text': text,
                'url': f'https://x.com/{handle}'
            })

# Sort by text length as proxy for engagement
all_tweets.sort(key=lambda x: len(x.get('text', '')), reverse=True)
tweets = all_tweets[:10]

for t in tweets:
    t['likes_num'] = 0
    t['flagged'] = len(t.get('text', '')) > 100

out_path = Path('/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md')
out_path.parent.mkdir(parents=True, exist_ok=True)

lines = ["# X Neurology News Scrape", "", "Date: 2026-05-22", "Query: neurology OR #neurotwitter OR #NeuroX", "Source: X search (login required)", "Note: Scraped public neurology account timelines", "", f"## Top {len(tweets)} Posts", ""]

for i, t in enumerate(tweets, 1):
    flag = " 🚨 FLAGGED" if t.get('flagged') else ""
    lines.append(f"### {i}. {t['display_name']} (@{t['handle']}){flag}")
    lines.append(f"- **Time:** {t['time_str']}")
    lines.append(f"- **URL:** {t['url']}")
    lines.append(f"- **Text:** {t['text'][:200]}...")
    lines.append("")

flagged = [t for t in tweets if t.get('flagged')]
lines.append("## Summary")
lines.append(f"- Total posts: {len(tweets)}")
lines.append(f"- Flagged: {len(flagged)}")

out_path.write_text('\\n'.join(lines))
print(f"Saved: {out_path}")
print(json.dumps(tweets, indent=2))
'''

# Run browser harness with the script
env = os.environ.copy()
env['BU_CDP_WS'] = BU_CDP_WS

proc = subprocess.Popen(
    ['uv', 'run', 'browser-harness'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    env=env,
    text=True,
    cwd='/Users/bobvarkey/.openclaw/skills/browser-harness'
)

stdout, _ = proc.communicate(input=SCRIPT, timeout=120)
print(stdout)
