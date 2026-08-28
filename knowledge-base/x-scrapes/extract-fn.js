() => {
  const articles = Array.from(document.querySelectorAll('article'));
  const posts = [];
  for (const article of articles) {
    try {
      const authorEl = article.querySelector('[data-testid="User-Name"]');
      const displayName = authorEl?.querySelector('a span')?.innerText?.trim() || '';
      const handle = authorEl?.querySelector('a[href^="/"]')?.getAttribute('href')?.replace(/^\//, '') || '';
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.innerText.trim() : '';
      const timeEl = article.querySelector('time');
      const time = timeEl ? timeEl.getAttribute('datetime') : '';
      const linkEl = timeEl?.closest('a') || article.querySelector('a[href*="/status/"]');
      const relativeUrl = linkEl ? linkEl.getAttribute('href') : '';
      const url = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : 'https://x.com' + relativeUrl.split('?')[0]) : '';

      const getStat = (testid) => {
        const el = article.querySelector('[data-testid="' + testid + '"]');
        if (!el) return null;
        const txt = el.innerText.trim();
        const m = txt.match(/([\d.,]+)([KMB]?)/i);
        if (!m) return null;
        let n = parseFloat(m[1].replace(/,/g, ''));
        const suf = m[2].toUpperCase();
        if (suf === 'K') n *= 1000;
        if (suf === 'M') n *= 1000000;
        if (suf === 'B') n *= 1000000000;
        return Math.round(n);
      };

      const replies = getStat('reply') ?? 0;
      const reposts = getStat('retweet') ?? 0;
      const likes = getStat('like') ?? 0;
      const bookmarks = getStat('bookmark') ?? 0;
      const views = getStat('analyticsButton') ?? 0;

      if (text && handle) {
        posts.push({ author: displayName, handle, text, time, url, replies, reposts, likes, bookmarks, views });
      }
    } catch (e) {}
  }
  return posts;
}
