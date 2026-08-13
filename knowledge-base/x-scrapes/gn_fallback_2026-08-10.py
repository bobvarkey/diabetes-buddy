#!/usr/bin/env python3
"""Google News RSS fallback for X/Twitter neurology scrape (2026-08-10)."""
import urllib.request, urllib.parse, re, html, datetime as dt, json, os

OUT_DIR = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
OUT_FILE = os.path.join(OUT_DIR, "x-neurology-2026-08-10.md")

def fetch_rss(query, num=25):
    url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(query) + "&hl=en-US&gl=US&ceid=US:en"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")

def parse_items(xml):
    items = re.findall(r"<item>(.*?)</item>", xml, re.S)
    out = []
    for it in items:
        t = re.search(r"<title>(.*?)</title>", it, re.S)
        l = re.search(r"<link>(.*?)</link>", it, re.S)
        p = re.search(r"<pubDate>(.*?)</pubDate>", it, re.S)
        s = re.search(r"<source[^>]*>(.*?)</source>", it, re.S)
        title = html.unescape(t.group(1)) if t else ""
        link = html.unescape(l.group(1)) if l else ""
        pub = p.group(1) if p else ""
        src = html.unescape(s.group(1)) if s else ""
        out.append({"title": title, "link": link, "pub": pub, "source": src})
    return out

def parse_date(pub):
    try:
        return dt.datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S GMT")
    except Exception:
        return None

def main():
    queries = [
        "neurology OR #neurotwitter OR #NeuroX",
        "site:x.com neurology",
        "site:x.com stroke OR neurointervention OR #NeuroX",
    ]
    seen = {}
    for q in queries:
        try:
            xml = fetch_rss(q)
            for it in parse_items(xml):
                d = parse_date(it["pub"])
                if d is None:
                    continue
                # window: last 2 days
                if (dt.datetime.utcnow() - d).days > 2:
                    continue
                key = it["title"].lower()
                if key not in seen:
                    seen[key] = {**it, "dt": d}
        except Exception as e:
            print(f"query failed {q}: {e}")

    posts = sorted(seen.values(), key=lambda x: x["dt"], reverse=True)[:10]

    # Filter out sports noise (football/golf "stroke of half-time" false positives)
    noise_kw = ["half-time", "half time", "golf", "pga", "tournament", "football", "soccer",
                "goal", "scored", "walked off the course", "locker room", "sponsored by"]
    posts = [p for p in posts if not any(k in p["title"].lower() for k in noise_kw)][:10]

    # Flag breaking / high clinical value
    flag_kw = ["fda", "clear", "approv", "breakthrough", "trial", "stroke", "als",
               "parkinson", "alzheimer", "seizure", "epilepsy", "ms ", "multiple sclerosis",
               "aneurysm", "thrombectomy", "avm", "migraine", "gene therapy", "cell therapy"]
    flagged = []
    for p in posts:
        tl = p["title"].lower()
        reasons = [k for k in flag_kw if k in tl]
        if reasons:
            p["flag"] = "; ".join(reasons)
            flagged.append(p)

    lines = [
        "# X / Neurology Scrape — 2026-08-10",
        "",
        "**Source:** Google News RSS fallback (X OAuth2 not configured; X.com login-walled)",
        "**Query:** `neurology OR #neurotwitter OR #NeuroX`",
        "**Window:** last 2 days (2026-08-08 → 2026-08-10)",
        "**Note:** Engagement metrics (likes/reposts) are NOT available via the unauthenticated fallback. Items flagged below are flagged on **breaking-news / clinical significance**, not on like counts.",
        "",
        "---",
        "",
    ]
    if flagged:
        lines += ["## 🚩 FLAGGED (breaking / high clinical value)", ""]
        for i, p in enumerate(flagged, 1):
            lines += [
                f"### {i}. {p['title']}",
                f"- **Source:** {p['source']} | **Date:** {p['pub']}",
                f"- **Why flagged:** {p['flag']}",
                f"- **URL:** {p['link']}",
                "",
            ]
        lines += ["---", ""]
    lines += ["## 📋 Top Posts (recent, last 2 days)", ""]
    for i, p in enumerate(posts, 1):
        lines += [
            f"### {i}. {p['title']}",
            f"- **Source:** {p['source']} | **Date:** {p['pub']}",
            f"- **URL:** {p['link']}",
            "",
        ]
    lines += [
        "---",
        "",
        "## ⚠️ Methodology / Limitations",
        "- **X.com direct scrape blocked** — login wall on remote browser; guest API returns 401/403; no OAuth2 token in xurl.",
        "- **Fallback used:** Google News RSS (broad + `site:x.com` queries), merged + deduped + date-filtered to last 2 days.",
        "- **No engagement metrics** (likes/reposts) available via this route — flags are content-based (breaking news / clinical significance), not like-count-based.",
        "- X post URLs are Google News RSS wrapper links, not direct x.com permalinks.",
    ]
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Saved {len(posts)} posts to {OUT_FILE}")
    print(json.dumps([{k: p[k] for k in ('title','source','pub','link')} for p in posts], indent=2))

if __name__ == "__main__":
    main()
