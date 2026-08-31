(() => {
  const articles = Array.from(document.querySelectorAll('article'));
  return articles.slice(0, 25).map(a => {
    const getText = sel => {
      const el = a.querySelector(sel);
      return el ? el.innerText.trim().replace(/\s+/g, ' ') : '';
    };
    const authorEl = a.querySelector('[data-testid="User-Name"]');
    const author = authorEl ? (authorEl.querySelector('a span')?.innerText || '') : '';
    const handle = authorEl ? (authorEl.querySelectorAll('a')[1]?.innerText || '') : '';
    const timeEl = a.querySelector('time');
    const date = timeEl ? timeEl.getAttribute('datetime') : '';
    const text = getText('[data-testid="tweetText"]');
    const url = timeEl ? (timeEl.parentElement?.getAttribute('href') || '') : '';
    const stats = {};
    a.querySelectorAll('[data-testid*="reply"], [data-testid*="retweet"], [data-testid*="like"], [data-testid*="bookmark"]').forEach(b => {
      const label = b.getAttribute('aria-label') || '';
      const num = (label.match(/([\d,.]+)([KMB]?)/) || [])[0] || '';
      if (label.includes('Repl')) stats.replies = num;
      else if (label.includes('repost') || label.includes('Repost')) stats.reposts = num;
      else if (label.includes('Like')) stats.likes = num;
      else if (label.includes('Bookmark')) stats.bookmarks = num;
    });
    return { author, handle, date, text, stats, url };
  });
})()
