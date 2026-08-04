#!/usr/bin/env python3
"""Scrape X/Twitter search for neurointervention and stroke posts."""
import json, os, re, sqlite3, sys, time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path.home() / ".openclaw/skills/browser-harness"))
from helpers import new_tab, goto, wait_for_load, page_info, js, screenshot, scroll

DB = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md")

QUERIES = [
    "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today",
    "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today",
]

def init_db():
    DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            url TEXT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            likes INTEGER,
            replies INTEGER,
            reposts INTEGER,
            bookmarks INTEGER,
            query TEXT,
            scraped_at TEXT
        )
    """)
    conn.commit()
    return conn

def extract_posts_from_page(query):
    """Use JS to extract visible post data from the X DOM."""
    posts = []
    # Try multiple selectors for article cells
    script = """
    (() => {
        const cells = Array.from(document.querySelectorAll('article[data-testid="tweet"], article[role="article"]'));
        return cells.map((cell, idx) => {
            const getText = (sel) => {
                const el = cell.querySelector(sel);
                return el ? el.innerText.trim() : '';
            };
            const authorEl = cell.querySelector('a[role="link"]');
            let url = '';
            if (authorEl) {
                const href = authorEl.getAttribute('href');
                if (href) url = 'https://x.com' + href.split('?')[0];
            }
            const handleEl = cell.querySelector('a[tabindex="-1"]');
            const handle = handleEl ? handleEl.innerText.trim() : '';
            const timeEl = cell.querySelector('time');
            const date = timeEl ? timeEl.getAttribute('datetime') : '';
            const text = cell.querySelector('div[data-testid="tweetText"]') ?
                         cell.querySelector('div[data-testid="tweetText"]').innerText.trim() : '';
            const metrics = {};
            const metricSel = ['reply', 'retweet', 'like', 'bookmark'];
            cell.querySelectorAll('button').forEach(b => {
                const label = b.getAttribute('aria-label') || '';
                if (label.includes('reply')) metrics.replies = parseInt(label.replace(/[^0-9]/g, '')) || 0;
                if (label.includes('repost') || label.includes('Retweet')) metrics.reposts = parseInt(label.replace(/[^0-9]/g, '')) || 0;
                if (label.includes('like') || label.includes('Like')) metrics.likes = parseInt(label.replace(/[^0-9]/g, '')) || 0;
                if (label.includes('bookmark')) metrics.bookmarks = parseInt(label.replace(/[^0-9]/g, '')) || 0;
            });
            return {
                url,
                author: '',
                handle,
                date,
                text,
                likes: metrics.likes || 0,
                replies: metrics.replies || 0,
                reposts: metrics.reposts || 0,
                bookmarks: metrics.bookmarks || 0
            };
        });
    })()
    """
    try:
        posts = js(script)
    except Exception as e:
        print("JS extraction error:", e)
    return posts

def parse_handle_author(cell_html):
    return None

def dedupe_id(post):
    text = post.get('text', '') or ''
    handle = post.get('handle', '') or ''
    date = post.get('date', '') or ''
    return f"{handle}::{date}::{hash(text) & 0xFFFFFFFF}"

def upsert_posts(conn, posts, query):
    c = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0
    for p in posts:
        pid = dedupe_id(p)
        c.execute("SELECT id FROM posts WHERE id=?", (pid,))
        if not c.fetchone():
            c.execute("""
                INSERT INTO posts (id, url, author, handle, date, text, likes, replies, reposts, bookmarks, query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (pid, p.get('url'), p.get('author'), p.get('handle'), p.get('date'), p.get('text'),
                  p.get('likes',0), p.get('replies',0), p.get('reposts',0), p.get('bookmarks',0), query, now))
            inserted += 1
    conn.commit()
    return inserted

def main():
    conn = init_db()
    all_posts = []
    shot_dir = Path("/tmp/x_scrape_shots")
    shot_dir.mkdir(exist_ok=True)

    for i, q in enumerate(QUERIES):
        print(f"\n=== Query {i+1}/{len(QUERIES)} ===")
        try:
            new_tab(q)
        except Exception as e:
            print("new_tab failed, trying goto", e)
            goto(q)
        wait_for_load(timeout=20)
        time.sleep(5)
        screenshot(str(shot_dir / f"q{i+1}_initial.png"), full=False)
        print(page_info())

        posts = []
        for scroll_round in range(5):
            batch = extract_posts_from_page(q)
            print(f"  scroll {scroll_round}: found {len(batch)} articles")
            posts.extend(batch)
            # scroll near bottom
            try:
                h = js("window.innerHeight")
                scroll(500, h - 100, dy=-1200)
            except Exception as e:
                print("scroll error:", e)
            time.sleep(3)

        # set query label on each
        for p in posts:
            p['query'] = q
        inserted = upsert_posts(conn, posts, q)
        all_posts.extend(posts)
        print(f"  total posts this query: {len(posts)}, new inserted: {inserted}")

    conn.close()

    # Build report
    high = [p for p in all_posts if (p.get('likes') or 0) > 50]
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    REPORT.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        f"# X/Twitter scrape — {today_str}",
        "",
        f"- Total posts extracted this run: {len(all_posts)}",
        f"- New posts inserted into DB: {sum(1 for p in all_posts)}",  # placeholder overwritten below
        f"- High-engagement posts (>50 likes): {len(high)}",
        "",
    ]

    # Recount inserted accurately by re-querying DB
    conn2 = sqlite3.connect(DB)
    cur = conn2.cursor()
    cur.execute("SELECT COUNT(*) FROM posts WHERE scraped_at >= ?", (today_str + "T00:00:00+00:00",))
    new_today = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM posts")
    total_db = cur.fetchone()[0]
    conn2.close()

    lines[2] = f"- Posts in DB (total): {total_db}"
    lines.insert(3, f"- Posts scraped today (UTC): {new_today}")

    if high:
        lines.append("## High-engagement posts (>50 likes)")
        lines.append("")
        for p in sorted(high, key=lambda x: x.get('likes',0), reverse=True)[:10]:
            lines.append(f"### {p.get('handle','')} — {p.get('date','')}")
            lines.append(f"- Likes: {p.get('likes',0)} | Reposts: {p.get('reposts',0)} | Replies: {p.get('replies',0)} | Bookmarks: {p.get('bookmarks',0)}")
            lines.append(f"- URL: {p.get('url','')}")
            text = p.get('text','')
            lines.append(f"- Text: {text[:300]}{'...' if len(text)>300 else ''}")
            lines.append("")

    lines.append("## All posts extracted this run")
    lines.append("")
    for p in all_posts:
        lines.append(f"- **{p.get('handle','')}** ({p.get('date','')}) — {p.get('likes',0)} likes — {p.get('url','')}")
        text = p.get('text','')
        lines.append(f"  > {text[:200]}{'...' if len(text)>200 else ''}")
        lines.append("")

    with open(REPORT, "a", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n\n---\n\n")

    print(f"\n=== SUMMARY ===")
    print(f"Posts extracted: {len(all_posts)}")
    print(f"New posts in DB today: {new_today}")
    print(f"High-engagement posts (>50 likes): {len(high)}")
    print(f"Report appended to: {REPORT}")

if __name__ == "__main__":
    main()
