// X Post Extractor Script
const posts = [];

// Scroll to load more posts
async function scrollToLoad() {
  const scrollToBottom = () => {
    window.scrollTo(0, document.body.scrollHeight);
  };
  
  for (let i = 0; i < 3; i++) {
    scrollToBottom();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Scroll back to top
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 1000));
}

// Extract posts from the page
function extractPosts() {
  const articles = document.querySelectorAll('article');
  
  articles.forEach(article => {
    const post = {};
    
    // Author name
    const nameEl = article.querySelector('[data-testid="User-Name"]');
    if (nameEl) {
      const nameSpan = nameEl.querySelector('span');
      post.author = nameSpan ? nameSpan.textContent.trim() : '';
      
      // Handle
      const handleLink = nameEl.querySelector('a[href^="/"]');
      if (handleLink) {
        post.handle = handleLink.href.split('/').pop();
      }
    }
    
    // Tweet text
    const tweetText = article.querySelector('[data-testid="tweetText"]');
    if (tweetText) {
      post.text = tweetText.textContent.trim();
    }
    
    // Date/time
    const timeEl = article.querySelector('time');
    if (timeEl) {
      post.datetime = timeEl.getAttribute('datetime');
      post.dateText = timeEl.textContent.trim();
    }
    
    // Post URL
    const statusLink = article.querySelector('a[href*="/status/"]');
    if (statusLink) {
      post.url = 'https://x.com' + statusLink.getAttribute('href');
      post.id = statusLink.getAttribute('href').split('/').pop();
    }
    
    // Engagement metrics
    const replyBtn = article.querySelector('[data-testid="reply"]');
    const repostBtn = article.querySelector('[data-testid="retweet"]');
    const likeBtn = article.querySelector('[data-testid="like"]');
    
    if (replyBtn) {
      const ariaLabel = replyBtn.getAttribute('aria-label') || '';
      const match = ariaLabel.match(/(\d+)/);
      post.replies = match ? parseInt(match[1]) : 0;
    }
    
    if (repostBtn) {
      const ariaLabel = repostBtn.getAttribute('aria-label') || '';
      const match = ariaLabel.match(/(\d+)/);
      post.reposts = match ? parseInt(match[1]) : 0;
    }
    
    if (likeBtn) {
      const ariaLabel = likeBtn.getAttribute('aria-label') || '';
      const match = ariaLabel.match(/(\d+)/);
      post.likes = match ? parseInt(match[1]) : 0;
    }
    
    // Views
    const viewsEl = article.querySelector('[data-testid="views"]');
    if (viewsEl) {
      const viewText = viewsEl.textContent.trim();
      post.views = viewText;
    }
    
    if (post.text && post.author) {
      posts.push(post);
    }
  });
  
  return posts;
}

// Main execution
await scrollToLoad();
const posts = extractPosts();
return JSON.stringify(posts, null, 2);