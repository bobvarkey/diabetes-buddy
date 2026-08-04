#!/usr/bin/env python3
"""Scrape X/Twitter neurology top posts and save markdown."""
import os
import re
import json
import datetime as dt
from urllib.parse import quote
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

OUT_DIR = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
OUT_FILE = os.path.join(OUT_DIR, "x-neurology-2026-05-22.md")
SEARCH_URL = "https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today"

def ensure_dir():
    os.makedirs(OUT_DIR, exist_ok=True)

def parse_posts(page):
    """Extract visible posts from X top search timeline."""
    posts = []
    # Each article with data-testid="tweet" is a post container.
    articles = page.locator('article[data-testid="tweet"]').all()
    for art in articles[:10]:
        try:
            author = ""
            handle = ""
            text = ""
            likes = 0
            replies = 0
            reposts = 0
            url = ""
            # author name
            name_el = art.locator('[data-testid="User-Name"] a').first
            if name_el.count():
                handle = name_el.get_attribute("href") or ""
                author = name_el.inner_text().strip()
            # text
            text_el = art.locator('[data-testid="tweetText"]').first
            if text_el.count():
                text = text_el.inner_text().strip()
            # engagement numbers from aria-labels
            for btn in art.locator('[role="group"] button').all():
                aria = btn.get_attribute("aria-label") or ""
                m = re.search(r'(\d[\d,]*)\s*(like|likes)', aria, re.I)
                if m:
                    likes = int(m.group(1).replace(",", ""))
                m = re.search(r'(\d[\d,]*)\s*(reply|replies)', aria, re.I)
                if m:
                    replies = int(m.group(1).replace(",", ""))
                m = re.search(r'(\d[\d,]*)\s*(repost|reposts)', aria, re.I)
                if m:
                    reposts = int(m.group(1).replace(",", ""))
            # post URL from timestamp link
            time_link = art.locator('time').locator('..').first
            if time_link.count():
                href = time_link.get_attribute("href") or ""
                if href:
                    url = "https://x.com" + href.split('?')[0]
            posts.append({
                "author": author,
                "handle": handle,
                "text": text,
                "likes": likes,
                "replies": replies,
                "reposts": reposts,
                "url": url,
            })
        except Exception as e:
            posts.append({"error": str(e)})
    return posts

def write_markdown(posts, note=""):
    ensure_dir()
    lines = [
        "# X/Twitter Neurology News Scrape",
        "",
        f"**Date:** 2026-05-22 (scraped {dt.datetime.utcnow().isoformat()}Z)",
        f"**Source:** [{SEARCH_URL}]({SEARCH_URL})",
        "",
    ]
    if note:
        lines += [f"> Note: {note}", ""]
    lines += ["## Top Posts", ""]
    for i, p in enumerate(posts, 1):
        lines.append(f"### {i}. {p.get('author') or 'Unknown'} {p.get('handle') or ''}")
        lines.append(f"- **URL:** {p.get('url') or 'N/A'}")
        lines.append(f"- **Likes:** {p.get('likes', 0)} | **Replies:** {p.get('replies', 0)} | **Reposts:** {p.get('reposts', 0)}")
        flagged = []
        if p.get('likes', 0) > 100:
            flagged.append(f"🚩 >100 likes ({p['likes']})")
        if p.get('reposts', 0) > 50:
            flagged.append(f"🚩 high reposts ({p['reposts']})")
        if flagged:
            lines.append(f"- **Flags:** {'; '.join(flagged)}")
        lines.append(f"- **Text:** {p.get('text') or '(no text)'}")
        lines.append("")
    lines.append("## Raw JSON")
    lines.append("```json")
    lines.append(json.dumps(posts, ensure_ascii=False, indent=2))
    lines.append("```")
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return OUT_FILE

def main():
    note = ""
    posts = []
    with sync_playwright() as p:
        # Use the existing chromium build (skip download requirement)
        browser_path = os.path.expanduser("~/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")
        browser = p.chromium.launch(headless=True, executable_path=browser_path)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
        )
        page = context.new_page()
        try:
            page.goto(SEARCH_URL, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(8000)  # allow JS timeline to render
            # If login wall appears, detect it.
            login_text = page.locator("text='Log in'").count() + page.locator("text='Sign in'").count()
            if login_text:
                note = "X presented a login/sign-up wall; public search results are limited without authentication."
                # Save screenshot for verification
                page.screenshot(path=os.path.join(OUT_DIR, "x-neurology-login-wall.png"))
            else:
                # Scroll a bit to load more posts
                for _ in range(3):
                    page.mouse.wheel(0, 800)
                    page.wait_for_timeout(2000)
                posts = parse_posts(page)
                if not posts:
                    note = "No tweet articles found on the rendered page. X may require login or rate-limiting may be active."
                    page.screenshot(path=os.path.join(OUT_DIR, "x-neurology-empty.png"))
        except PWTimeout as e:
            note = f"Timeout loading X search: {e}"
        except Exception as e:
            note = f"Error during scrape: {e}"
        finally:
            browser.close()
    path = write_markdown(posts, note)
    print(f"Saved {len(posts)} posts to {path}")
    print(json.dumps({"posts": posts, "note": note}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
