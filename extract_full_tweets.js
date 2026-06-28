// Extract comprehensive tweet data from X/Twitter
const results = [];

// Find all article elements (tweets)
const articles = document.querySelectorAll('article[data-testid="tweet"]');

articles.forEach(article => {
  try {
    const post = {
      author: '',
      handle: '',
      date: '',
      text: '',
      likes: 0,
      reposts: 0,
      replies: 0,
      views: 0,
      bookmarks: 0,
      url: ''
    };
    
    // Get tweet text
    const tweetText = article.querySelector('[data-testid="tweetText"]');
    post.text = tweetText ? tweetText.textContent : '';
    
    // Get author name
    const userName = article.querySelector('[data-testid="User-Name"]');
    if (userName) {
      // Get author name
      const nameSpan = userName.querySelector('span:not([class*="r-"])');
      const allSpans = userName.querySelectorAll('span');
      for (const span of allSpans) {
        const text = span.textContent || '';
        if (text.length > 0 && !text.startsWith('@') && text.length < 100) {
          // Check if this is the display name
          const parent = span.closest('a');
          if (parent && !text.includes('Replying to')) {
            post.author = text;
            break;
          }
        }
      }
      
      // Get handle
      const handleLink = userName.querySelector('a[href^="/@"]');
      if (handleLink) {
        post.handle = handleLink.textContent;
      } else {
        // Alternative: find @ in the spans
        for (const span of allSpans) {
          const text = span.textContent || '';
          if (text.startsWith('@') && text.length < 30) {
            post.handle = text;
            break;
          }
        }
      }
    }
    
    // Get date/time
    const timeEl = article.querySelector('time');
    if (timeEl) {
      post.date = timeEl.getAttribute('datetime') || timeEl.textContent;
    }
    
    // Get engagement metrics from aria-labels
    const replyBtn = article.querySelector('[data-testid="reply"]');
    if (replyBtn) {
      const parent = replyBtn.closest('[role="group"]');
      if (parent) {
        const aria = parent.getAttribute('aria-label') || '';
        const numMatch = aria.match(/(\d+)/);
        post.replies = numMatch ? parseInt(numMatch[1]) : 0;
      }
      // Also try getting from the button text
      const btnText = replyBtn.textContent || '';
      const numMatch = btnText.match(/(\d+)/);
      if (numMatch) post.replies = parseInt(numMatch[1]);
    }
    
    const repostBtn = article.querySelector('[data-testid="repost"]');
    if (repostBtn) {
      const btnText = repostBtn.textContent || '';
      const numMatch = btnText.match(/(\d+)/);
      post.reposts = numMatch ? parseInt(numMatch[1]) : 0;
    }
    
    const likeBtn = article.querySelector('[data-testid="like"]');
    if (likeBtn) {
      const btnText = likeBtn.textContent || '';
      const numMatch = btnText.match(/(\d+)/);
      post.likes = numMatch ? parseInt(numMatch[1]) : 0;
    }
    
    // Views are in a link with "views" in aria-label
    const viewLink = article.querySelector('a[aria-label*="view"]');
    if (viewLink) {
      const aria = viewLink.getAttribute('aria-label') || '';
      const match = aria.match(/(\d+[.,]?\d*[KkMm]?)/);
      if (match) {
        let v = match[1].toLowerCase().replace(',', '');
        if (v.includes('k')) post.views = Math.round(parseFloat(v.replace('k', '')) * 1000);
        else if (v.includes('m')) post.views = Math.round(parseFloat(v.replace('m', '')) * 1000000);
        else post.views = parseInt(v) || 0;
      }
    }
    
    // Alternative: get from group aria-label
    const groups = article.querySelectorAll('[role="group"]');
    for (const group of groups) {
      const aria = group.getAttribute('aria-label') || '';
      if (aria.includes('replies') || aria.includes('likes') || aria.includes('views')) {
        // Parse format like "2 replies, 1 like, 139 views"
        const replyMatch = aria.match(/(\d+)\s*repl/i);
        const likeMatch = aria.match(/(\d+)\s*like/i);
        const repostMatch = aria.match(/(\d+)\s*repost/i);
        const viewMatch = aria.match(/(\d+[.,]?\d*[KkMm]?)\s*views?/i);
        const bookmarkMatch = aria.match(/(\d+)\s*bookmark/i);
        
        if (replyMatch) post.replies = parseInt(replyMatch[1]);
        if (likeMatch) post.likes = parseInt(likeMatch[1]);
        if (repostMatch) post.reposts = parseInt(repostMatch[1]);
        if (bookmarkMatch) post.bookmarks = parseInt(bookmarkMatch[1]);
        if (viewMatch) {
          let v = viewMatch[1].toLowerCase().replace(',', '');
          if (v.includes('k')) post.views = Math.round(parseFloat(v.replace('k', '')) * 1000);
          else if (v.includes('m')) post.views = Math.round(parseFloat(v.replace('m', '')) * 1000000);
          else post.views = parseInt(v) || 0;
        }
        break;
      }
    }
    
    // Get URL
    const link = article.querySelector('a[href*="/status/"]');
    if (link) {
      post.url = link.href;
    } else if (post.handle) {
      post.url = `https://x.com/${post.handle.replace('@', '')}/status/placeholder`;
    }
    
    results.push(post);
  } catch (e) {
    // Skip problematic posts
  }
});

return JSON.stringify(results, null, 2);