#!/usr/bin/env python3
import os, re, json, sqlite3, subprocess, sys, time, datetime

NVM_DIR = os.path.expanduser("$HOME/.nvm")
TOKEN = "9d070e5cfb935bf8614f92573eaf0e484d39fcdd3fd76163"
NODE_VER = "24"

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"
JS_PATH = "/Users/bobvarkey/extract_x_posts_cli.js"

QUERIES = [
    ("neuro1", "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"),
    ("neuro2", "cerebral AVM OR intracranial aneurysm OR endovascular"),
]

SEARCH_URLS = [
    "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today",
    "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today",
]


def build_env():
    env = os.environ.copy()
    env["OPENCLAW_GATEWAY_TOKEN"] = TOKEN
    env["NVM_DIR"] = NVM_DIR
    # Add nvm node bin to PATH if available
    nvm_node_bin = os.path.expanduser(f"~/.nvm/versions/node/v{NODE_VER}.19.0/bin")
    if os.path.isdir(nvm_node_bin):
        env["PATH"] = nvm_node_bin + os.pathsep + env.get("PATH", "")
    return env


def run_cmd(argv, env=None, timeout=120):
    if env is None:
        env = build_env()
    # Run via bash -lc to source nvm and select node version
    shell_cmd = (
        f"export NVM_DIR='{NVM_DIR}' && [ -s '$NVM_DIR/nvm.sh' ] && . '$NVM_DIR/nvm.sh' && nvm use {NODE_VER} && "
        + " ".join(json.dumps(str(a)) for a in argv)
    )
    res = subprocess.run(
        ["bash", "-lc", shell_cmd],
        capture_output=True,
        text=True,
        env=env,
        timeout=timeout,
    )
    return res


def extract_json_array(text):
    # The CLI prints config warnings before the JSON array; find the outermost array.
    start = text.find("[")
    if start == -1:
        return None
    # Use a simple bracket counter to locate the matching end of the first array.
    depth = 0
    in_string = False
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
            continue
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except Exception:
                    return None
    return None


def get_js():
    with open(JS_PATH, "r", encoding="utf-8") as f:
        return f.read()


def focus_tab(label):
    r = run_cmd(["openclaw", "browser", "--browser-profile", "openclaw", "focus", label])
    return r.returncode == 0


def extract_posts():
    js = get_js()
    r = run_cmd(["openclaw", "browser", "--browser-profile", "openclaw", "evaluate", "--fn", js])
    if r.returncode != 0:
        print("evaluate failed", r.stderr[-500:], file=sys.stderr)
        return []
    data = extract_json_array(r.stdout)
    if data is None:
        print("could not parse JSON from:", r.stdout[-500:], file=sys.stderr)
        return []
    return data


def scroll_page():
    js = "() => { window.scrollBy(0, 1200); return document.querySelectorAll('article[data-testid=tweet]').length; }"
    r = run_cmd(["openclaw", "browser", "--browser-profile", "openclaw", "evaluate", "--fn", js])
    if r.returncode == 0:
        arr = extract_json_array(r.stdout)
        if isinstance(arr, int):
            return arr
    return 0


def scrape_query(label, url):
    print(f"Scraping {label}: {url}")
    # Close any existing tab with the same label to avoid conflicts.
    run_cmd(["openclaw", "browser", "--browser-profile", "openclaw", "close", label])
    # openclaw browser open requires the URL as the first positional argument.
    r = run_cmd(["openclaw", "browser", "--browser-profile", "openclaw", "open", url, "--label", label])
    print("open", r.returncode, r.stdout[-200:], r.stderr[-300:])
    if r.returncode != 0:
        print("open failed", r.stderr[-500:], file=sys.stderr)
        return []
    # Give the initial page a moment to render.
    time.sleep(3)
    focus_tab(label)
    posts = []
    seen_urls = set()
    rounds = 0
    max_rounds = 4
    while rounds < max_rounds:
        batch = extract_posts()
        new = 0
        for p in batch:
            url = p.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                p["query_label"] = label
                posts.append(p)
                new += 1
        print(f"  round {rounds + 1}: found {len(batch)} visible posts, {new} new, total {len(posts)}")
        if new == 0:
            break
        scroll_page()
        time.sleep(2.5)
        rounds += 1
    return posts


def parse_metric(raw):
    if not raw:
        return ""
    # Extract leading number, possibly with K/M suffix from aria-label or text.
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)([KkMmBb]?)\s*(?:Reply|repost|Like|View|reply|repost|like|view)?", raw, re.IGNORECASE)
    if m:
        num = float(m.group(1))
        suffix = m.group(2).upper()
        if suffix == "K":
            num *= 1000
        elif suffix == "M":
            num *= 1_000_000
        elif suffix == "B":
            num *= 1_000_000_000
        return str(int(num))
    return raw


def ensure_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies TEXT,
            retweets TEXT,
            likes TEXT,
            views TEXT,
            query_label TEXT,
            scraped_at TEXT
        )
    """)
    conn.commit()
    conn.close()


def save_to_db(posts):
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_count = 0
    for p in posts:
        try:
            conn.execute(
                """
                INSERT OR IGNORE INTO posts (url, author, handle, date, text, replies, retweets, likes, views, query_label, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    p.get("url", ""),
                    p.get("author", ""),
                    p.get("handle", ""),
                    p.get("date", ""),
                    p.get("text", ""),
                    parse_metric(p.get("replies", "")),
                    parse_metric(p.get("retweets", "")),
                    parse_metric(p.get("likes", "")),
                    parse_metric(p.get("views", "")),
                    p.get("query_label", ""),
                    now,
                ),
            )
            if conn.total_changes > 0:
                new_count += 1
        except Exception as e:
            print("DB insert error", e, file=sys.stderr)
    conn.commit()
    conn.close()
    return new_count


def append_report(posts, new_total_db):
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    now_local = datetime.datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z")
    lines = []
    lines.append(f"\n## X / Twitter neurointervention scrape — {now_local}\n")
    lines.append(f"Total posts collected this run: {len(posts)} | New posts inserted: {new_total_db}\n")
    for label, _ in QUERIES:
        qposts = [p for p in posts if p.get("query_label") == label]
        lines.append(f"### Query: {label} ({len(qposts)} posts)\n")
        for p in qposts:
            likes = parse_metric(p.get("likes", ""))
            lines.append(f"- **{p.get('author', '')}** ({p.get('handle', '')}) — {p.get('date', '')}\n")
            lines.append(f"  - {p.get('text', '').replace(chr(10), ' ')}\n")
            lines.append(f"  - Replies: {parse_metric(p.get('replies',''))} | Reposts: {parse_metric(p.get('retweets',''))} | Likes: {likes} | Views: {parse_metric(p.get('views',''))}\n")
            lines.append(f"  - [Post URL]({p.get('url', '')})\n")
    high = [p for p in posts if int(parse_metric(p.get("likes", "0") or "0") or 0) > 50]
    lines.append(f"\n### High-engagement posts (>50 likes): {len(high)}\n")
    for p in high:
        lines.append(f"- {p.get('author', '')} ({p.get('handle', '')}) — Likes: {parse_metric(p.get('likes',''))} — {p.get('url','')}\n")
    with open(REPORT_PATH, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    all_posts = []
    for (label, _), url in zip(QUERIES, SEARCH_URLS):
        posts = scrape_query(label, url)
        all_posts.extend(posts)
    new_db = save_to_db(all_posts)
    append_report(all_posts, new_db)
    high = [p for p in all_posts if int(parse_metric(p.get("likes", "0") or "0") or 0) > 50]
    print(f"SUMMARY: collected {len(all_posts)} posts, {new_db} new in DB, {len(high)} high-engagement (>50 likes)")
    for p in high:
        print(f"  HIGH: {p.get('author')} {p.get('handle')} likes={parse_metric(p.get('likes'))} {p.get('url')}")


if __name__ == "__main__":
    main()
