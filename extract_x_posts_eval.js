() => {
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  const posts = [];
  articles.forEach(article => {
    try {
      const authorEl = article.querySelector('[data-testid="User-Name"]');
      let author = '', handle = '', date = '', url = '';
      if (authorEl) {
        const links = authorEl.querySelectorAll('a');
        links.forEach(a => {
          const href = a.getAttribute('href') || '';
          const spans = a.querySelectorAll('span');
          spans.forEach(s => {
            const t = s.textContent.trim();
            if (t.startsWith('@')) handle = t;
            else if (t && !author && !['·'].includes(t)) author = t;
          });
          if (href.includes('/status/')) {
            url = 'https://x.com' + href.split('?')[0];
            const time = a.querySelector('time');
            if (time) date = time.getAttribute('datetime') || time.textContent.trim();
          }
        });
      }
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.innerText.trim() : '';
      const metrics = { replies: 0, reposts: 0, likes: 0, bookmarks: 0, views: 0 };
      article.querySelectorAll('button[role="button"]').forEach(btn => {
        const label = btn.getAttribute('aria-label') || '';
        const numMatch = label.match(/(\d[\d,KMGT]*)/);
        let val = 0;
        if (numMatch) {
          const raw = numMatch[1].replace(/,/g, '');
          if (/K/i.test(raw)) val = Math.round(parseFloat(raw) * 1000);
          else if (/M/i.test(raw)) val = Math.round(parseFloat(raw) * 1000000);
          else val = parseInt(raw, 10) || 0;
        }
        if (/reply|repl/i.test(label)) metrics.replies = val || metrics.replies;
        else if (/repost|retweet/i.test(label)) metrics.reposts = val || metrics.reposts;
        else if (/like/i.test(label)) metrics.likes = val || metrics.likes;
        else if (/bookmark/i.test(label)) metrics.bookmarks = val || metrics.bookmarks;
        else if (/view|analytics/i.test(label)) metrics.views = val || metrics.views;
      });
      posts.push({ author, handle, date, text, url, ...metrics });
    } catch (e) {}
  });
  return { count: posts.length, posts };
}
