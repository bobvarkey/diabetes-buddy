const articles = Array.from(document.querySelectorAll("article"));
const posts = [];
articles.forEach(article => {
  try {
    const time = article.querySelector('time');
    const tweetLink = article.querySelector('a[href*="/status/"]');
    const url = tweetLink ? 'https://x.com' + tweetLink.getAttribute('href') : '';
    const handleEl = article.querySelector('a[href^="/"] span');
    const handle = handleEl ? handleEl.textContent : '';
    const authorEl = article.querySelector('a[href^="/"]');
    const author = authorEl ? authorEl.querySelector('span')?.textContent : '';
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent : '';
    
    const metrics = article.querySelectorAll('button');
    let replies = '0', reposts = '0', likes = '0', views = '0';
    metrics.forEach(btn => {
      const ariaLabel = btn.getAttribute('aria-label') || '';
      if (ariaLabel.includes('Repl')) replies = ariaLabel.match(/\d+/)?.[0] || '0';
      if (ariaLabel.includes('repost')) reposts = ariaLabel.match(/\d+/)?.[0] || '0';
      if (ariaLabel.includes('Like')) likes = ariaLabel.match(/\d+/)?.[0] || '0';
    });
    const viewEl = article.querySelector('[data-testid="viewCount"]');
    if (viewEl) views = viewEl.textContent;
    
    if (text) {
      posts.push({author, handle, text, replies, reposts, likes, views, date: time?.textContent || '', url});
    }
  } catch(e) {}
});
JSON.stringify(posts, null, 2);