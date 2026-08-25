#!/usr/bin/env python3
import json, os, re, sqlite3, sys, time
from datetime import datetime, timezone

from helpers import *

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_DIR = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
REPORT_PATH = os.path.join(REPORT_DIR, "x-scrape-2026-05-22.md")
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

URLS = [
    ("neurointervention_stroke", "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today"),
    ("avm_aneurysm_endovascular", "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today"),
]

def parse_count(text):
    if not text:
        return 0
    text = text.strip().replace(",", "")
    if text.endswith("K"):
        return int(float(text[:-1]) * 1000)
    if text.endswith("M"):
        return int(float(text[:-1]) * 1000000)
    try:
        return int(text)
    except:
        return 0

def extract_tweets():
    js("""
    window.parseCount = function(text) {
        if (!text) return 0;
        text = String(text).trim().replace(/,/g, '');
        if (text.endsWith('K')) return Math.round(parseFloat(text.slice(0,-1)) * 1000);
        if (text.endsWith('M')) return Math.round(parseFloat(text.slice(0,-1)) * 1000000);
        const n = parseInt(text, 10);
        return isNaN(n) ? 0 : n;
    }
    """)
    script = """
    (function() {
        const articles = document.querySelectorAll('article[data-testid="tweet"]');
        const posts = [];
        articles.forEach(article => {
            try {
                const userNameEl = article.querySelector('[data-testid="User-Name"]');
                let author = '', handle = '';
                if (userNameEl) {
                    const spans = userNameEl.querySelectorAll('span');
                    spans.forEach(span => {
                        const txt = span.textContent.trim();
                        if (txt.startsWith('@') && !handle) handle = txt;
                        else if (!author && txt) author = txt;
                    });
                }
                const timeEl = article.querySelector('time');
                const date = timeEl ? timeEl.getAttribute('datetime') : '';
                let url = '';
                if (timeEl) {
                    const a = timeEl.closest('a');
                    if (a && a.getAttribute('href')) {
                        url = 'https://x.com' + a.getAttribute('href').split('?')[0];
                    }
                }
                const textEl = article.querySelector('[data-testid="tweetText"]');
                const text = textEl ? textEl.textContent : '';
                const getMetric = (testid) => {
                    const el = article.querySelector(`[data-testid="${testid}"]`);
                    return el ? el.textContent : '';
                };
                const replies = parseCount(getMetric('reply'));
                const reposts = parseCount(getMetric('retweet'));
                const likes = parseCount(getMetric('like'));
                const views = parseCount(getMetric('app-text-transition-container') || '');
                posts.push({ author, handle, date, text, url, replies, reposts, likes, views });
            } catch(e) {}
        });
        return JSON.stringify(posts);
    })();
    """
    return json.loads(js(script))

def collect_posts(url, label, max_scrolls=8):
    new_tab(url)
    wait_for_load()
    time.sleep(3)
    seen = set()
    posts = []
    for i in range(max_scrolls):
        batch = extract_tweets()
        added = 0
        for p in batch:
            key = (p.get("handle"), p.get("date"), p.get("text", "")[:80])
            if key not in seen and p.get("text"):
                seen.add(key)
                p["search_query"] = label
                p["search_url"] = url
                p["scrape_date"] = datetime.now(timezone.utc).isoformat()
                posts.append(p)
                added += 1
        print(f"  scroll {i+1}: found {len(batch)} articles, {added} new, total {len(posts)}")
        if added == 0:
            break
        js("window.scrollBy(0, 900)")
        time.sleep(2.5)
    return posts

def save_posts(posts):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    new_count = 0
    for p in posts:
        try:
            c.execute("""
                INSERT INTO x_posts (search_query, search_url, author, handle, date, text, url, replies, reposts, likes, views, scrape_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p.get("search_query"), p.get("search_url"), p.get("author"), p.get("handle"),
                p.get("date"), p.get("text"), p.get("url"),
                p.get("replies", 0), p.get("reposts", 0), p.get("likes", 0), p.get("views", 0),
                p.get("scrape_date")
            ))
            new_count += 1
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()
    return new_count

def append_report(posts):
    os.makedirs(REPORT_DIR, exist_ok=True)
    high_engagement = [p for p in posts if p.get("likes", 0) > 50]
    lines = [
        f"\n## Scrape run: {TODAY} UTC\n",
        f"- Total posts collected: {len(posts)}",
        f"- New posts saved to DB: {len(posts)}",
        f"- High-engagement posts (>50 likes): {len(high_engagement)}\n"
    ]
    lines.append("### Search queries\n")
    for label, url in URLS:
        lines.append(f"- **{label}**: {url}\n")
    if posts:
        lines.append("### Posts\n")
        for p in posts:
            lines.append(f"**{p.get('author')} ({p.get('handle')})** — {p.get('date')}")
            lines.append(f"{p.get('text')[:300]}{'...' if len(p.get('text',''))>300 else ''}")
            lines.append(f"🔗 {p.get('url')} | 💬 {p.get('replies',0)} 🔁 {p.get('reposts',0)} ❤️ {p.get('likes',0)} 👁️ {p.get('views',0)}")
            lines.append("")
    if high_engagement:
        lines.append("### High-engagement posts\n")
        for p in high_engagement:
            lines.append(f"- {p.get('author')} ({p.get('handle')}): ❤️ {p.get('likes',0)} — {p.get('text')[:120]}{'...' if len(p.get('text',''))>120 else ''}")
        lines.append("")
    with open(REPORT_PATH, "a", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

def main():
    all_posts = []
    for label, url in URLS:
        print(f"Collecting: {label}")
        posts = collect_posts(url, label)
        all_posts.extend(posts)
    print(f"Total collected: {len(all_posts)}")
    new_count = save_posts(all_posts)
    append_report(all_posts)
    high = [p for p in all_posts if p.get("likes", 0) > 50]
    print(f"Saved {new_count} new posts to {DB_PATH}")
    print(f"Report appended to {REPORT_PATH}")
    print(f"High-engagement posts (>50 likes): {len(high)}")
    if high:
        print("High-engagement:")
        for p in high[:10]:
            print(f"  - {p.get('author')} ({p.get('handle')}): {p.get('likes')} likes — {p.get('text')[:100]}{'...' if len(p.get('text',''))>100 else ''}")

main()
