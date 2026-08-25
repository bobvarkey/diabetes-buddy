return Array.from(document.querySelectorAll("article")).slice(0,20).map(a => {
  const getText = (sel) => { const el = a.querySelector(sel); return el ? el.textContent.trim() : ""; };
  const userName = a.querySelector('[data-testid="User-Name"]');
  let author = "", handle = "";
  if (userName) {
    const links = userName.querySelectorAll('a, span');
    author = links[0] ? links[0].textContent.trim() : "";
    handle = Array.from(links).map(l => l.textContent.trim()).find(t => t.startsWith('@')) || "";
  }
  const time = a.querySelector('time');
  const date = time ? time.getAttribute('datetime') || time.textContent.trim() : "";
  const tweetText = a.querySelector('[data-testid="tweetText"]');
  const text = tweetText ? tweetText.innerText : "";
  const getMetric = (testid) => {
    const btn = a.querySelector(`[data-testid="${testid}"]`);
    return btn ? (btn.textContent.trim() || "0") : "0";
  };
  const likes = getMetric('like');
  const replies = getMetric('reply');
  const reposts = getMetric('retweet');
  const viewsBtn = a.querySelector('a[href$="/analytics"]');
  const views = viewsBtn ? viewsBtn.textContent.trim() : "";
  const linkEl = a.querySelector('a[href*="/status/"]');
  const link = linkEl ? "https://x.com" + linkEl.getAttribute("href").split('?')[0] : "";
  return {author, handle, date, text, likes, replies, reposts, views, link};
});
