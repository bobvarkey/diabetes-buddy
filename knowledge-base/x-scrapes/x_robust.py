import json, time, re, datetime
from playwright.sync_api import sync_playwright

Q = "https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=live&since:today"

def click_text(page, text):
    return page.evaluate("""(t) => {
      const spans = [...document.querySelectorAll('span')].filter(e => e.innerText.trim() === t);
      for (const s of spans) { let el=s; for(let i=0;i<6;i++){ el=el.parentElement; if(!el)break; if(el.getAttribute&&(el.getAttribute('role')==='button'||el.tagName==='BUTTON')){el.click();return true;} } }
      return false;
    }""", text)

def extract(page):
    return page.evaluate("""() => {
      const out = [];
      const arts = document.querySelectorAll('article[data-testid="tweet"]');
      arts.forEach(a => {
        const link = a.querySelector('a[href*="/status/"]');
        const url = link ? 'https://x.com' + link.getAttribute('href') : '';
        const nameEl = a.querySelector('[data-testid="User-Name"]');
        const name = nameEl ? nameEl.innerText.replace(/\\n/g,' ') : '';
        const textEl = a.querySelector('[data-testid="tweetText"]');
        const text = textEl ? textEl.innerText.replace(/\\n/g,' ') : '';
        const timeEl = a.querySelector('time');
        const time = timeEl ? timeEl.getAttribute('datetime') : '';
        const stats = {replies:'',reposts:'',likes:'',views:''};
        a.querySelectorAll('[aria-label]').forEach(s => {
          const al = s.getAttribute('aria-label') || '';
          const m = al.match(/(\\d[\\d,.]*[KMB]?)\\s*(replies|reposts|likes|views)/i);
          if (m) stats[m[2].toLowerCase()] = m[1];
        });
        out.push({name, text, url, time, stats});
      });
      return out;
    }""")

def parse_num(s):
    if not s: return 0
    s = s.strip().upper()
    mult = 1
    if s.endswith('K'): mult=1000; s=s[:-1]
    elif s.endswith('M'): mult=1000000; s=s[:-1]
    try: return int(float(s.replace(',',''))*mult)
    except: return 0

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp("http://127.0.0.1:18800")
    ctx = browser.contexts[0]
    page = ctx.pages[0]
    page.bring_to_front()
    all_posts = {}
    for attempt in range(6):
        try:
            page.goto(Q, wait_until="domcontentloaded")
            time.sleep(10)
            click_text(page, "See new posts")
            time.sleep(2)
            click_text(page, "Retry")
            time.sleep(6)
            for _ in range(15):
                page.mouse.wheel(0, 3000)
                time.sleep(1.0)
            data = extract(page)
            for d in data:
                if d['url'] and d['url'] not in all_posts:
                    all_posts[d['url']] = d
            print(f"attempt {attempt}: got {len(data)}, total unique {len(all_posts)}")
            if len(all_posts) >= 10:
                break
        except Exception as e:
            print(f"attempt {attempt} err: {str(e)[:80]}")
        time.sleep(2)
    posts = list(all_posts.values())[:10]
    print("FINAL COUNT:", len(posts))
    print(json.dumps(posts, ensure_ascii=False, indent=2))
    today = datetime.date.today().strftime("%Y-%m-%d")
    path = f"/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-{today}.md"
    lines = [f"# X Neurology Scrape — {today}", "", "Query: `neurology OR #neurotwitter OR #NeuroX` (Latest, since today)", f"Scraped: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "", "---", ""]
    for i, d in enumerate(posts, 1):
        likes = parse_num(d['stats'].get('likes'))
        flag = " ⚡BREAKING" if re.search(r'breaking|just in|urgent|alert', d['text'], re.I) else ""
        hot = " 🔥HOT" if likes > 100 else ""
        lines.append(f"## {i}. {d['name']}{flag}{hot}")
        lines.append(f"- **Text:** {d['text']}")
        lines.append(f"- **URL:** {d['url']}")
        lines.append(f"- **Time:** {d['time']}")
        lines.append(f"- **Engagement:** replies={d['stats'].get('replies','-')} reposts={d['stats'].get('reposts','-')} likes={d['stats'].get('likes','-')} views={d['stats'].get('views','-')}")
        lines.append("")
    with open(path, 'w') as f:
        f.write("\n".join(lines))
    print("SAVED:", path)
    browser.close()
