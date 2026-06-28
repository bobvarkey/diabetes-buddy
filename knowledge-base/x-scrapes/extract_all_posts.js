() => {
  const articles = Array.from(document.querySelectorAll('article'));
  const posts = [];
  const seen = new Set();
  
  articles.forEach((article) => {
    try {
      const post = {};
      
      // Extract author
      const authorNameEl = article.querySelector('a[href^="/"] span');
      if (authorNameEl) {
        post.author = authorNameEl.textContent.trim();
      }
      
      // Extract handle and URL
      const timeLink = article.querySelector('a[href*="/status/"]');
      if (timeLink) {
        const href = timeLink.getAttribute('href') || timeLink.href;
        if (!href.startsWith('http')) {
          post.url = 'https://x.com' + href;
        } else {
          post.url = href;
        }
        // Extract handle from URL
        const match = post.url.match(/x\.com\/([^\/]+)\/status/);
        if (match) {
          post.handle = match[1];
        }
      }
      
      if (!post.url || seen.has(post.url)) return;
      seen.add(post.url);
      
      // Extract text
      const textSelectors = [
        '[data-testid="tweetText"]',
        'article [lang]',
      ];
      
      for (const selector of textSelectors) {
        const textEl = article.querySelector(selector);
        if (textEl && textEl.textContent.trim()) {
          post.text = textEl.textContent.trim();
          break;
        }
      }
      
      if (!post.text) {
        const allText = article.textContent;
        post.text = allText.substring(0, 300);
      }
      
      // Extract engagement
      const buttons = article.querySelectorAll('[role="button"]');
      const engagement = { replies: 0, reposts: 0, likes: 0, views: 0 };
      
      buttons.forEach(btn => {
        const label = btn.getAttribute('aria-label') || '';
        const countEl = btn.querySelector('span');
        const countText = countEl ? countEl.textContent.trim() : '0';
        
        const parseCount = (text) => {
          if (text.includes('K')) {
            return parseFloat(text) * 1000;
          } else if (text.includes('M')) {
            return parseFloat(text) * 1000000;
          }
          return parseInt(text) || 0;
        };
        
        if (label.toLowerCase().includes('repl')) {
          engagement.replies = parseCount(countText);
        } else if (label.toLowerCase().includes('repost')) {
          engagement.reposts = parseCount(countText);
        } else if (label.toLowerCase().includes('like')) {
          engagement.likes = parseCount(countText);
        }
      });
      
      // Get views
      const analyticsLink = article.querySelector('a[href*="/analytics"]');
      if (analyticsLink) {
        const viewsSpan = analyticsLink.querySelector('span');
        if (viewsSpan) {
          const viewsText = viewsSpan.textContent.trim();
          if (viewsText.includes('K')) {
            engagement.views = parseFloat(viewsText) * 1000;
          } else if (viewsText.includes('M')) {
            engagement.views = parseFloat(viewsText) * 1000000;
          } else {
            engagement.views = parseInt(viewsText) || 0;
          }
        }
      }
      
      post.engagement = engagement;
      post.flagged = engagement.likes > 100;
      
      // Extract timestamp
      const timeEl = article.querySelector('time');
      if (timeEl) {
        post.timestamp = timeEl.textContent.trim();
      }
      
      if (post.author && post.url) {
        posts.push(post);
      }
    } catch (e) {
      // Skip malformed posts
    }
  });
  
  return posts;
}