const posts = [];
const articles = document.querySelectorAll('article');

articles.forEach((article, index) => {
  try {
    // Get author name
    const authorEl = article.querySelector('a[href^="/"][href*="/status"] span') || 
                      article.querySelector('a[href^="/"] span span');
    const authorName = authorEl ? authorEl.textContent : "Unknown";
    
    // Get handle
    const handleEl = article.querySelector('a[href^="/"][href*="/status"]');
    const handleMatch = handleEl ? handleEl.href.match(/x\.com\/([^\/]+)/) : null;
    const handle = handleMatch ? "@" + handleMatch[1] : "@unknown";
    
    // Get tweet text
    const textEl = article.querySelector('[data-testid="tweetText"]') || 
                    article.querySelector('[lang]') ||
                    article.querySelector('div[lang]');
    const text = textEl ? textEl.textContent : "";
    
    // Get time
    const timeEl = article.querySelector('time');
    const time = timeEl ? timeEl.getAttribute('datetime') || timeEl.textContent : "";
    const timeDisplay = timeEl ? timeEl.textContent : "";
    
    // Get URL
    const linkEl = timeEl?.closest('a');
    const url = linkEl ? "https://x.com" + linkEl.getAttribute('href') : "";
    
    // Get engagement - look for aria-labels on buttons
    const buttons = article.querySelectorAll('button[aria-label]');
    let replies = "0", reposts = "0", likes = "0", views = "0", bookmarks = "0";
    
    buttons.forEach(btn => {
      const label = btn.getAttribute('aria-label') || "";
      
      if (label.includes('repl') && label.includes('Repl')) {
        const match = label.match(/(\d+[\d,K\.]*)/);
        if (match) replies = match[1];
      }
      if (label.includes('repost') || label.includes('Repost')) {
        const match = label.match(/(\d+[\d,K\.]*)/);
        if (match) reposts = match[1];
      }
      if (label.toLowerCase().includes('like')) {
        const match = label.match(/(\d+[\d,K\.]*)/);
        if (match) likes = match[1];
      }
      if (label.includes('view') || label.includes('View')) {
        const match = label.match(/(\d+[\d,K\.]*)/);
        if (match) views = match[1];
      }
      if (label.includes('bookmark') || label.includes('Bookmark')) {
        const match = label.match(/(\d+[\d,K\.]*)/);
        if (match) bookmarks = match[1];
      }
    });
    
    // Parse numeric values for flagging
    const parseCount = (val) => {
      if (!val || val === "0") return 0;
      if (val.includes('K')) return parseFloat(val) * 1000;
      if (val.includes('M')) return parseFloat(val) * 1000000;
      return parseInt(val.replace(/,/g, ''));
    };
    
    const likesNum = parseCount(likes);
    
    posts.push({
      author: authorName.trim(),
      handle: handle,
      text: text.trim().substring(0, 500),
      time: timeDisplay,
      timestamp: time,
      engagement: { replies, reposts, likes, views, bookmarks },
      likesNum: likesNum,
      url
    });
  } catch (e) {
    console.error('Error parsing article:', e);
  }
});

return posts.length > 0 ? JSON.stringify(posts.slice(0, 10), null, 2) : "No posts found";