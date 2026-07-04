// Simple extraction of visible posts
const posts = [];
const seen = new Set();

document.querySelectorAll('article').forEach(article => {
  try {
    // Get tweet link
    const tweetLink = article.querySelector('a[href*="/status/"]');
    if (!tweetLink) return;
    
    const url = tweetLink.href;
    if (seen.has(url)) return;
    seen.add(url);
    
    // Get author info
    const authorEl = article.querySelector('[data-testid="User-Name"]');
    const authorName = authorEl?.querySelector('span')?.textContent || '';
    
    // Get handle
    const handleMatch = article.textContent.match(/@(\w+)/);
    const handle = handleMatch ? `@${handleMatch[1]}` : '';
    
    // Get timestamp
    const timeEl = article.querySelector('time');
    const datetime = timeEl?.getAttribute('datetime') || '';
    
    // Get text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl?.textContent || '';
    
    // Get engagement metrics
    const metrics = {};
    article.querySelectorAll('[role="group"] button').forEach(btn => {
      const label = btn.getAttribute('aria-label') || '';
      if (label.includes('repl')) {
        const match = label.match(/(\d+)/);
        metrics.replies = match ? parseInt(match[1]) : 0;
      } else if (label.includes('repost')) {
        const match = label.match(/(\d+)/);
        metrics.reposts = match ? parseInt(match[1]) : 0;
      } else if (label.includes('Like')) {
        const match = label.match(/(\d+)/);
        metrics.likes = match ? parseInt(match[1]) : 0;
      } else if (label.includes('view')) {
        const match = label.match(/(\d+)/);
        metrics.views = match ? parseInt(match[1]) : 0;
      }
    });
    
    posts.push({
      author: authorName,
      handle: handle,
      date: datetime,
      text: text.substring(0, 280),
      url: url,
      ...metrics
    });
  } catch (e) {
    // Skip errors
  }
});

posts;