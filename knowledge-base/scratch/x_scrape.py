import json, base64, os
os.makedirs("/Users/bobvarkey/.openclaw/workspace/knowledge-base/scratch", exist_ok=True)

res = cdp("Page.captureScreenshot")
img_data = base64.b64decode(res["data"])
with open("/Users/bobvarkey/.openclaw/workspace/knowledge-base/scratch/x_neurology_top.png", "wb") as f:
    f.write(img_data)
print("Saved screenshot, size:", len(img_data))

js_res = js(r"""
(() => {
  let articles = document.querySelectorAll('article[data-testid="tweet"]');
  if (articles.length === 0) articles = document.querySelectorAll('article');
  let out = [];
  for (let a of articles) {
    let author = a.querySelector('div[data-testid="User-Names"]')?.textContent || '';
    let text   = a.querySelector('div[data-testid="tweetText"]')?.textContent || '';
    let likes  = a.querySelector('button[data-testid="like"]')?.textContent || '';
    let rt     = a.querySelector('button[data-testid="retweet"]')?.textContent || '';
    let reply  = a.querySelector('button[data-testid="reply"]')?.textContent || '';
    let link   = a.querySelector('a[href*="/status/"]');
    let url    = link ? ('https://x.com' + link.getAttribute('href')) : '';
    out.push({author, text, likes, retweets: rt, replies: reply, url});
  }
  return JSON.stringify(out.slice(0, 12));
})();
""")
print("TWEETS_JSON:", js_res)
