import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sqlite3
import os
import re
import json
import time
from datetime import datetime

DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
REPORT_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
SCREENSHOT_DIR = '/Users/bobvarkey/.openclaw/workspace/x-screenshots'
PROFILE_DIR = '/Users/bobvarkey/Library/Application Support/Google/Chrome/openclaw'

QUERIES = [
    ('query1', 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today'),
    ('query2', 'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today'),
]

def ensure_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT UNIQUE,
            author_name TEXT,
            handle TEXT,
            post_date TEXT,
            text TEXT,
            likes INTEGER,
            replies INTEGER,
            reposts INTEGER,
            bookmarks INTEGER,
            views INTEGER,
            url TEXT,
            query_group TEXT,
            scraped_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

def parse_metric(text):
    if not text:
        return 0
    text = text.strip().replace(',', '')
    m = re.search(r'([0-9.]+)([KMB]?)', text, re.IGNORECASE)
    if not m:
        return 0
    num = float(m.group(1))
    mult = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(m.group(2).upper(), 1)
    return int(num * mult)

def scrape_page(driver, group, url):
    driver.get(url)
    # Wait for tweets
    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'article[data-testid="tweet"]'))
        )
    except Exception:
        pass
    time.sleep(4)
    # Scroll to load more
    for _ in range(3):
        driver.execute_script("window.scrollBy(0, 900);")
        time.sleep(2)
    time.sleep(3)

    screenshot_path = os.path.join(SCREENSHOT_DIR, f'x-{group}-{int(time.time())}.png')
    driver.save_screenshot(screenshot_path)

    articles = driver.find_elements(By.CSS_SELECTOR, 'article[data-testid="tweet"]')
    posts = []
    for article in articles:
        try:
            status_link = ''
            post_id = ''
            for a in article.find_elements(By.CSS_SELECTOR, 'a[href*="/status/"]'):
                href = a.get_attribute('href')
                m = re.search(r'/status/(\d+)', href)
                if m:
                    post_id = m.group(1)
                    status_link = 'https://x.com' + a.get_attribute('href').split('?')[0]
                    break
            if not post_id:
                continue

            user_link = article.find_element(By.CSS_SELECTOR, 'a[href^="/"]')
            handle = user_link.get_attribute('href').split('/')[-1] if user_link else ''

            try:
                name_el = article.find_element(By.CSS_SELECTOR, '[data-testid="User-Name"]')
                author = name_el.text.split('\n')[0].strip()
            except Exception:
                author = ''

            try:
                time_el = article.find_element(By.CSS_SELECTOR, 'time')
                post_date = time_el.get_attribute('datetime')
            except Exception:
                post_date = ''

            try:
                text_el = article.find_element(By.CSS_SELECTOR, '[data-testid="tweetText"]')
                text = text_el.text
            except Exception:
                text = ''

            likes = parse_metric(article.get_attribute('innerText'))
            replies = 0
            reposts = 0
            try:
                for btn in article.find_elements(By.CSS_SELECTOR, '[role="button"]'):
                    label = btn.get_attribute('aria-label') or ''
                    if 'reply' in label.lower():
                        replies = parse_metric(label)
                    elif 'repost' in label.lower() or 'retweet' in label.lower():
                        reposts = parse_metric(label)
                    elif 'like' in label.lower():
                        likes = parse_metric(label)
            except Exception:
                pass

            posts.append({
                'post_id': post_id,
                'author_name': author,
                'handle': handle,
                'post_date': post_date,
                'text': text,
                'likes': likes,
                'replies': replies,
                'reposts': reposts,
                'bookmarks': 0,
                'views': 0,
                'url': status_link,
            })
        except Exception as e:
            print('parse error', e)
            continue
    return posts, screenshot_path

def save_to_db(posts, group):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = datetime.utcnow().isoformat() + 'Z'
    added = 0
    for p in posts:
        try:
            c.execute('''
                INSERT OR IGNORE INTO posts
                (post_id, author_name, handle, post_date, text, likes, replies, reposts, bookmarks, views, url, query_group, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (p['post_id'], p['author_name'], p['handle'], p['post_date'], p['text'],
                  p['likes'], p['replies'], p['reposts'], p['bookmarks'], p['views'], p['url'], group, now))
            if c.rowcount > 0:
                added += 1
        except Exception as e:
            print('db insert error', e)
    conn.commit()
    conn.close()
    return added

def append_report(posts, group, added, url):
    lines = [
        f"## X Scrape — {group} — {datetime.utcnow().isoformat()}Z",
        f"Query: {url}",
        f"New posts inserted: {added}",
        f"Total posts collected this run: {len(posts)}",
        '',
        '| Author | Handle | Date | Likes | Reposts | Replies | URL | Text |',
        '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ]
    for p in posts:
        text = (p.get('text') or '').replace('|', '\\|').replace('\n', ' ')[:120]
        lines.append(f"| {p.get('author_name','')} | @{p.get('handle','')} | {p.get('post_date','')} | {p.get('likes',0)} | {p.get('reposts',0)} | {p.get('replies',0)} | {p.get('url','')} | {text} |")
    lines += ['', '---', '']
    with open(REPORT_PATH, 'a', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

def main():
    ensure_db()
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    options = uc.ChromeOptions()
    options.add_argument(f'--user-data-dir={PROFILE_DIR}')
    options.add_argument('--profile-directory=openclaw')
    options.add_argument('--window-size=1280,900')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = uc.Chrome(options=options, version_main=None)
    try:
        total_added = 0
        all_posts = []
        for group, url in QUERIES:
            posts, screenshot = scrape_page(driver, group, url)
            added = save_to_db(posts, group)
            total_added += added
            all_posts.extend(posts)
            append_report(posts, group, added, url)
            print(f'Group {group}: {len(posts)} posts, {added} new, screenshot: {screenshot}')
        high = [p for p in all_posts if p.get('likes', 0) > 50]
        print(f'TOTAL_ADDED={total_added}')
        print(f'TOTAL_POSTS={len(all_posts)}')
        print(f'HIGH_ENGAGEMENT={len(high)}')
        if high:
            print('HIGH_ENGAGEMENT_POSTS=' + json.dumps(high[:10], ensure_ascii=False))
    finally:
        driver.quit()

if __name__ == '__main__':
    main()
