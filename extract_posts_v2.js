const posts = [];
const articles = document.querySelectorAll('article');

articles.forEach(article => {
  try {
    const authorEl = article.querySelector('[data-testid="User-Name"] span');
    const author = authorEl ? authorEl.textContent : '';
    
    const links = article.querySelectorAll('a[href^="/"]');
    let handle = '';
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      if (href.match(/^\/[a-zA-Z0-9_]+$/)) {
        handle = href.substring(1);
        break;
      }
    }
    
    const timeEl = article.querySelector('time');
    const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
    
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent : '';
    
    const statusLink = article.querySelector('a[href*="/status/"]');
    const url = statusLink ? statusLink.href : '';
    
    const metrics = { replies: 0, reposts: 0, likes: 0, views: 0 };
    
    const replyBtn = article.querySelector('[data-testid="reply"]');
    if (replyBtn) {
      const aria = replyBtn.getAttribute('aria-label') || '';
      const m = aria.match(/(\d+)/);
      if (m) metrics.replies = parseInt(m[1]);
    }
    
    const repostBtn = article.querySelector('[data-testid="retweet"], [data-testid="unretweet"]');
    if (repostBtn) {
      const aria = repostBtn.getAttribute('aria-label') || '';
      const m = aria.match(/(\d+)/);
      if (m) metrics.reposts = parseInt(m[1]);
    }
    
    const likeBtn = article.querySelector('[data-testid="like"], [data-testid="unlike"]');
    if (likeBtn) {
      const aria = likeBtn.getAttribute('aria-label') || '';
      const m = aria.match(/(\d+)/);
      if (m) metrics.likes = parseInt(m[1]);
    }
    
    const viewsSpan = article.querySelector('[data-testid="views"] span');
    if (viewsSpan) {
      const t = viewsSpan.textContent || '';
      const n = parseFloat(t.replace(/[^0-9.K]/g, ''));
      if (t.includes('K')) metrics.views = Math.round(n * 1000);
      else if (!isNaN(n)) metrics.views = Math.round(n);
    }
    
    if (author && text && url) {
      posts.push({ author, handle, datetime, text, url, metrics });
    }
  } catch (e) {}
});

posts.length + ' posts found: ' + posts.map(p => p.author).join(', ');