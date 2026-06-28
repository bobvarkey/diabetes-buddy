() => {
  const articles = document.querySelectorAll('article');
  const posts = [];
  
  articles.forEach((article, index) => {
    if (index >= 10) return;
    
    try {
      const post = {};
      
      // Extract author
      const authorNameEl = article.querySelector('a[href^="/"] span');
      if (authorNameEl) {
        post.author = authorNameEl.textContent.trim();
      }
      
      // Extract handle
      const handleEl = article.querySelector('a[href^="/"][role="link"]');
      if (handleEl) {
        const href = handleEl.getAttribute('href') || handleEl.href;
        post.handle = href.split('/').pop();
        post.url = 'https://x.com' + href;
      }
      
      // Extract timestamp URL
      const timeLink = article.querySelector('a[href*="/status/"]');
      if (timeLink) {
        const href = timeLink.getAttribute('href') || timeLink.href;
        if (!href.startsWith('http')) {
          post.url = 'https://x.com' + href;
        } else {
          post.url = href;
        }
      }
      
      // Extract text - try multiple selectors
      const textSelectors = [
        '[data-testid="tweetText"]',
        'article [lang]',
        'article div[css-901oao]'
      ];
      
      for (const selector of textSelectors) {
        const textEl = article.querySelector(selector);
        if (textEl && textEl.textContent.trim()) {
          post.text = textEl.textContent.trim();
          break;
        }
      }
      
      if (!post.text) {
        // Fallback: get all text and clean it
        const allText = article.textContent;
        post.text = allText.split('\n').filter(l => l.length > 20)[0] || allText.substring(0, 200);
      }
      
      // Extract engagement
      const buttons = article.querySelectorAll('[role="button"]');
      const engagement = { replies: 0, reposts: 0, likes: 0, views: 0 };
      
      buttons.forEach(btn => {
        const label = btn.getAttribute('aria-label') || '';
        const countEl = btn.querySelector('span');
        const count = countEl ? countEl.textContent.trim() : '0';
        
        if (label.toLowerCase().includes('repl')) {
          engagement.replies = parseInt(count) || 0;
        } else if (label.toLowerCase().includes('repost')) {
          engagement.reposts = parseInt(count) || 0;
        } else if (label.toLowerCase().includes('like')) {
          engagement.likes = parseInt(count) || 0;
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
          } else {
            engagement.views = parseInt(viewsText) || 0;
          }
        }
      }
      
      post.engagement = engagement;
      post.flagged = engagement.likes > 100;
      
      if (post.author && post.url) {
        posts.push(post);
      }
    } catch (e) {
      // Skip malformed posts
    }
  });
  
  return posts;
}