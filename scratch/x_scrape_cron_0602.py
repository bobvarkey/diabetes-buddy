#!/usr/bin/env python3
"""
X/Twitter scraper for neurointervention/stroke posts.
Saves to SQLite and appends markdown report.
"""

import sqlite3, os, re, json, time, sys
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
MD_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
MD_DIR.mkdir(parents=True, exist_ok=True)

TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")
SCRAPE_TIME = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
SCRAPE_TIME_IST = datetime.now().strftime("%Y-%m-%d %H:%M IST")

SEARCHES = [
    ("neurointervention-thrombectomy-stroke",
     "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top"),
    ("cerebral-AVM-aneurysm-endovascular",
     "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top"),
]

# ── DB ──────────────────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS x_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT UNIQUE,
        author TEXT,
        handle TEXT,
        datetime TEXT,
        text TEXT,
        likes INTEGER DEFAULT 0,
        retweets INTEGER DEFAULT 0,
        replies INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        query TEXT,
        scrape_date TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )""")
    conn.commit()
    conn.close()

def get_existing_urls():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT url FROM x_posts")
    urls = {row[0] for row in c.fetchall()}
    conn.close()
    return urls

def save_to_db(posts, search_name):
    existing = get_existing_urls()
    new_count = 0
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    for p in posts:
        url = p.get("url", "")
        if url in existing:
            continue
        try:
            c.execute("""INSERT INTO x_posts
                (url, author, handle, datetime, text, likes, retweets, replies, views, query, scrape_date)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (url, p.get("author",""), p.get("handle",""), p.get("time",""),
                 p.get("text",""), p.get("likes",0), p.get("retweets",0),
                 p.get("replies",0), p.get("views",0), search_name, SCRAPE_TIME))
            new_count += 1
            existing.add(url)
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()
    return new_count


# ── Extract ─────────────────────────────────────────────────────────────────

def parse_count(text_val):
    if not text_val or not text_val.strip():
        return 0
    text_val = text_val.strip()
    m = re.search(r'([\d,]+(?:\.\d+)?)', text_val)
    if m:
        num_str = m.group(1).replace(",", "")
        try:
            return int(float(num_str))
        except ValueError:
            return 0
    return 0

def extract_posts(page) -> list:
    posts = []
    try:
        articles = page.locator('article[data-testid="tweet"]').all()
    except Exception as e:
        print(f"  Error finding articles: {e}")
        return posts

    print(f"  Found {len(articles)} tweet articles")

    for i, article in enumerate(articles):
        try:
            # --- Author name ---
            author = "Unknown"
            author_links = article.locator('a[role="link"]').all()
            for link in author_links:
                href = link.get_attribute("href") or ""
                if href.startswith("/") and not href.startswith("/search") and not href.startswith("/hashtag") and not href.startswith("/i/"):
                    spans = link.locator('span').all()
                    for span in spans:
                        txt = span.inner_text().strip()
                        if txt and len(txt) > 1:
                            author = txt
                            break
                    if author != "Unknown":
                        break

            # --- Handle ---
            handle = "@unknown"
            for link in author_links:
                href = link.get_attribute("href") or ""
                m = re.search(r'^/(\w+)$', href)
                if m:
                    handle = "@" + m.group(1)
                    break

            # --- Text ---
            text_el = article.locator('[data-testid="tweetText"]').first
            text = text_el.inner_text().strip() if text_el.count() else ""

            # Skip tweets with no substantive text
            if not text or len(text) < 5:
                continue

            # --- Like count ---
            likes = 0
            like_els = article.locator('[data-testid="like"]').all()
            if like_els:
                likes = parse_count(like_els[0].inner_text())

            # --- Retweet count ---
            retweets = 0
            rt_els = article.locator('[data-testid="retweet"]').all()
            if rt_els:
                retweets = parse_count(rt_els[0].inner_text())

            # --- Reply count ---
            replies = 0
            reply_els = article.locator('[data-testid="reply"]').all()
            if reply_els:
                replies = parse_count(reply_els[0].inner_text())

            # --- View count ---
            views = 0
            try:
                stats_spans = article.locator('span:has(> span)').all()
                for span in stats_spans:
                    txt = span.inner_text().strip()
                    m = re.search(r'([\d,]+)\s*(Views|views|View|view)', txt)
                    if m:
                        views = int(m.group(1).replace(",", ""))
                        break
            except:
                pass

            # --- Time ---
            post_time = ""
            time_els = article.locator('time').all()
            if time_els:
                post_time = time_els[0].get_attribute("datetime") or ""

            # --- URL ---
            url = ""
            link_els = article.locator('a[href*="/status/"]').all()
            if link_els:
                href = link_els[0].get_attribute("href") or ""
                if href.startswith("/"):
                    url = "https://x.com" + href
                else:
                    url = href

            posts.append({
                "author": author[:150],
                "handle": handle[:50],
                "text": text[:1000],
                "likes": likes,
                "retweets": retweets,
                "replies": replies,
                "views": views,
                "time": post_time,
                "url": url,
            })

        except Exception as e:
            print(f"  Error extracting post {i}: {e}")
            continue

    return posts


# ── Markdown report ─────────────────────────────────────────────────────────

def append_md_report(query_name, all_posts_total, new_posts, previous_total):
    """Append to the markdown file for today."""
    md_path = MD_DIR / f"x-scrape-{TODAY}.md"

    mode = "a" if md_path.exists() else "w"
    with open(md_path, mode) as f:
        if mode == "w":
            f.write(f"# X Neurointervention Scrape — {TODAY}\n\n")
            f.write(f"**Scrape time:** {SCRAPE_TIME_IST} ({SCRAPE_TIME})\n")

        # Get total posts in DB after this scrape
        total_in_db = get_total_posts()
        f.write(f"**Total new posts saved to DB:** {new_posts}\n")
        f.write(f"**Total posts in DB:** {total_in_db}\n\n")

        if new_posts == 0:
            f.write(f"## {query_name}\n\nNo new posts found.\n\n")
            return

    # For new posts, write details
    if new_posts == 0:
        return

    # Write the detailed section per query
    md_path2 = MD_DIR / f"x-scrape-{TODAY}.md"
    with open(md_path2, "a") as f:
        f.write(f"---\n\n## {query_name}\n\n")

        # Separate high-engagement
        high_eng = [p for p in new_posts if p["likes"] >= 50]

        if high_eng:
            f.write("### High Engagement (≥50 likes)\n\n")
            for p in sorted(high_eng, key=lambda x: -x["likes"]):
                f.write(f"- **{p['author']}** ({p['handle']}) | ❤️ {p['likes']} | 🔄 {p['retweets']} | 💬 {p['replies']}\n")
                f.write(f"  {p['text'][:300]}\n")
                f.write(f"  {p['url']}\n\n")

        f.write("| # | Author | Handle | Date | Topic | Likes | Reposts | Replies |\n")
        f.write("|---|--------|--------|------|-------|-------|---------|---------|\n")

        for i, p in enumerate(new_posts, 1):
            date_str = p["time"][:10] if p["time"] else "Unknown"
            topic = p["text"][:80].replace("\n", " ").replace("|", "/")
            likes_str = f"**{p['likes']}**" if p["likes"] >= 50 else str(p["likes"])
            f.write(f"| {i} | {p['author']} | {p['handle']} | {date_str} | {topic} | {likes_str} | {p['retweets']} | {p['replies']} |\n")

        f.write("\n### Key highlights:\n")
        for p in new_posts:
            if p["likes"] >= 5 or p["retweets"] >= 3 or ("trial" in p["text"].lower()[:200]):
                f.write(f"- **{p['author']}** ({p['handle']}): {p['text'][:200]}\n")

        f.write("\n")


def final_summary(new_posts_all):
    """Append summary section."""
    md_path = MD_DIR / f"x-scrape-{TODAY}.md"
    total_posts_db = get_total_posts()
    all_high = [p for p in new_posts_all if p["likes"] >= 50]

    with open(md_path, "a") as f:
        f.write(f"---\n\n## High-Engagement Posts (>50 likes)\n\n")
        if all_high:
            f.write("| Author | Handle | Likes | Reposts | Replies | Topic |\n")
            f.write("|--------|--------|-------|---------|---------|-------|\n")
            for p in sorted(all_high, key=lambda x: -x["likes"]):
                topic = p["text"][:60].replace("\n", " ").replace("|", "/")
                f.write(f"| {p['author']} | {p['handle']} | **{p['likes']}** | {p['retweets']} | {p['replies']} | {topic} |\n")
        else:
            f.write("None found in this scrape.\n")

        f.write(f"\n---\n\n## Summary\n\n")
        f.write(f"- **{len(new_posts_all)} new unique posts** scraped and saved to SQLite DB\n")
        f.write(f"- **{len(SEARCHES)} queries** across neurointervention keywords\n")
        f.write(f"- **{len(all_high)} high-engagement posts** (>50 likes)\n")
        f.write(f"- **Total posts in DB:** {total_posts_db}\n\n")


def get_total_posts():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM x_posts")
    total = c.fetchone()[0]
    conn.close()
    return total


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    init_db()

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
            },
        )

        page = ctx.new_page()
        page.set_default_timeout(30000)

        all_new_posts = []

        for search_name, url in SEARCHES:
            print(f"\n=== Scraping: {search_name} ===")
            print(f"  URL: {url}")
            try:
                page.goto(url, wait_until="load", timeout=25000)
                page.wait_for_timeout(3000)

                # Scroll a bit to trigger lazy loading
                page.evaluate("window.scrollBy(0, 800)")
                page.wait_for_timeout(2000)

                # Check if we hit login wall
                body_text = page.inner_text("body").lower()
                if "sign in" in body_text[:500] or "log in" in body_text[:500]:
                    print("  ⚠️  Hit login wall — X is requiring authentication")
                    screenshot_path = "/tmp/x-login-wall.png"
                    page.screenshot(path=screenshot_path)
                    print(f"  Screenshot saved to {screenshot_path}")

                    # Try navigating to x.com first to see if we get past
                    page.goto("https://x.com", wait_until="load", timeout=15000)
                    page.wait_for_timeout(2000)
                    page.goto(url, wait_until="load", timeout=25000)
                    page.wait_for_timeout(3000)
                    page.evaluate("window.scrollBy(0, 800)")
                    page.wait_for_timeout(2000)

                posts = extract_posts(page)
                print(f"  Extracted {len(posts)} raw posts")

                # Deduplicate against existing DB
                new_posts_count = save_to_db(posts, search_name)
                print(f"  Saved {new_posts_count} new posts to DB")

                # Build list of actually-new posts for report
                existing = get_existing_urls()
                new_posts = [p for p in posts if p.get("url") in existing][-new_posts_count:] if new_posts_count > 0 else []
                # Actually, get posts by scrape batch
                all_new_posts.extend(posts[:new_posts_count] if new_posts_count < len(posts) else posts)

                # Append to markdown
                append_md_report(search_name, len(posts), posts[:new_posts_count] if new_posts_count < len(posts) else posts, 0)

            except Exception as e:
                print(f"  ERROR: {e}")
                import traceback
                traceback.print_exc()

            time.sleep(1)

        browser.close()

    # Write final summary
    final_summary(all_new_posts)

    print(f"\n=== Done: {datetime.now().isoformat()} ===")
    print(f"Total new posts scraped: {len(all_new_posts)}")


if __name__ == "__main__":
    main()