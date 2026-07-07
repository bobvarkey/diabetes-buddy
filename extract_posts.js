function extractPosts() {
  const posts = [];
  const articles = document.querySelectorAll('article');
  
  for (let i = 0; i < Math.min(10, articles.length); i++) {
    const article = articles[i];
    try {
      const authorLink = article.querySelector('a[href^="/"]');
      const authorName = authorLink?.querySelector('span')?.textContent || '';
      const handle = authorLink?.href?.split('/').pop() || '';
      const text = article.querySelector('[data-testid="tweet"]')?.textContent || '';
      const likes = article.querySelector('[data-testid="like"]')?.getAttribute('aria-label') || '0';
      const replies = article.querySelector('[data-testid="reply"]')?.getAttribute('aria-label') || '0';
      const reposts = article.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label') || '0';
      const timeElement = article.querySelector('time');
      const postUrl = timeElement?.closest('a')?.href || '';
      
      posts.push({
        author: authorName,
        handle: handle,
        text: text.substring(0, 500),
        likes: likes,
        replies: replies,
        reposts: reposts,
        url: postUrl
      });
    } catch (e) {}
  }
  return posts;
}
return extractPosts();