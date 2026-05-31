import json, time, re, os, sys

new_tab("https://x.com/search?q=neurology+OR+%23neurotwitter+OR+%23NeuroX\u0026src=typed_query\u0026f=top")
wait_for_load()

def extract():
    js_res = js(r"""
    (() => {
      let articles = document.querySelectorAll('article[data-testid="tweet"]');
      if (articles.length === 0) articles = document.querySelectorAll('article');
      let out = [];
      for (let a of articles) {
        let nameEl = a.querySelector('div[data-testid="User-Names"]');
        let author = ''; let handle = '';
        if (nameEl) {
           let spans = nameEl.querySelectorAll('span');
           let allText = Array.from(spans).map(s => s.textContent).join(' ');
           author = allText;
           let hMatch = allText.match(/@([A-Za-z0-9_]+)/);
           if (hMatch) handle = hMatch[1];
           let cleanName = allText.replace(/@[A-Za-z0-9_]+/g, '').replace(/·/,'').replace(/\s+/g, ' ').trim();
           if (cleanName) author = cleanName;
        }
        if (!handle) { let linkEl = a.querySelector('a[href^="/"]'); if (linkEl) { let hr = linkEl.getAttribute('href'); let m = hr.match(/^\/([A-Za-z0-9_]+)(?:\b|$)/); if (m) handle = m[1]; }}
        let textEl = a.querySelector('div[data-testid="tweetText"]');
        let text = textEl ? textEl.innerText : '';
        let likes  = a.querySelector('button[data-testid="like"]')?.textContent || '';
        let rt     = a.querySelector('button[data-testid="retweet"]')?.textContent || '';
        let reply  = a.querySelector('button[data-testid="reply"]')?.textContent || '';
        let link   = a.querySelector('a[href*="/status/"]');
        let url    = link ? ('https://x.com' + link.getAttribute('href')) : '';
        out.push({author, handle, text, likes, retweets: rt, replies: reply, url});
      }
      return JSON.stringify(out);
    })();
    """)
    return json.loads(js_res)

all_tweets = {}
current_batch = extract()
for t in current_batch:
    if t.get('url'):
        all_tweets[t['url']] = t

for i in range(4):
    js("""window.scrollTo(0, document.body.scrollHeight);""")
    time.sleep(2)
    batch = extract()
    for t in batch:
        if t.get('url') and t['url'] not in all_tweets:
            all_tweets[t['url']] = t
    print(f"Batch {i+1} added, total unique now: {len(all_tweets)}")

def likes_to_int(val):
    if not val:
        return 0
    try:
        v = val.replace(',','')
        if v.endswith('K'):
           return int(float(v[:-1])*1000)
        if v.endswith('M'):
           return int(float(v[:-1])*1000000)
        return int(v)
    except:
        return 0

for key in list(all_tweets.keys()):
    t = all_tweets[key]
    t['likes_int'] = likes_to_int(t['likes'])

sorted_tweets = sorted(all_tweets.values(), key=lambda x: x['likes_int'], reverse=True)
print(f"Final unique tweets: {len(sorted_tweets)}")
for i,t in enumerate(sorted_tweets[:20],1):
    print(f"{i}. @{t.get('handle','')} L:{t['likes']} R:{t['retweets']} rep:{t['replies']} — {t['text'][:100].replace(chr(10),' ')}")

out_path = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/scratch/x_neurology_raw_2026-05-30.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(sorted_tweets, f, indent=2, ensure_ascii=False)
print("Saved JSON to", out_path)
