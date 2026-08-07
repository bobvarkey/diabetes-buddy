const articles = document.querySelectorAll('article');
const posts = [];
articles.forEach(article => {
  try {
    // Get all links to user profiles
    const allLinks = article.querySelectorAll('a[href^="/"]');
    let handle = '';
    let url = '';
    
    // Find the first link that's a user profile (not hashtag, not status)
    for (const link of allLinks) {
      const href = link.getAttribute('href');
      if (href && !href.includes('/status/') && !href.includes('/hashtag/') && !href.startsWith('/i/')) {
        handle = href.replace('/', '');
        url = 'https://x.com' + href;
        break;
      }
    }
    
    // Get author name
    const authorSpan = article.querySelector('span');
    const author = authorSpan ? authorSpan.textContent.trim() : '';
    
    // Get tweet text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent.trim() : '';
    
    // Get date
    const timeEl = article.querySelector('time');
    const date = timeEl ? timeEl.getAttribute('datetime') : '';
    
    // Get engagement metrics
    const likeBtn = article.querySelector('[data-testid="like"]');
    const likesText = likeBtn ? likeBtn.textContent : '0';
    const likes = parseInt(likesText.replace(/[^0-9]/g, '')) || 0;
    
    const repostBtn = article.querySelector('[data-testid="unretweet"], [data-testid="retweet"]');
    const repostsText = repostBtn ? repostBtn.textContent : '0';
    const reposts = parseInt(repostsText.replace(/[^0-9]/g, '')) || 0;
    
    const replyBtn = article.querySelector('[data-testid="reply"]');
    const repliesText = replyBtn ? replyBtn.textContent : '0';
    const replies = parseInt(repliesText.replace(/[^0-9]/g, '')) || 0;
    
    // Get tweet URL - find link to status
    const statusLink = article.querySelector('a[href*="/status/"]');
    const tweetUrl = statusLink ? 'https://x.com' + statusLink.getAttribute('href').split('?')[0] : '';
    
    if (author && text) {
      posts.push({
        author: author,
        handle: '@' + handle,
        text: text,
        date: date,
        likes: likes,
        reposts: reposts,
        replies: replies,
        url: tweetUrl
      });
    }
  } catch (e) {
    console.error('Error parsing article:', e);
  }
});
return JSON.stringify(posts, null, 2);