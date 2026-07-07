// JavaScript to extract X posts data
function extractXPosts() {
    const posts = [];
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    
    for (let i = 0; i < Math.min(10, articles.length); i++) {
        const article = articles[i];
        try {
            // Get author info
            const authorElement = article.querySelector('[data-testid="User-Name"]');
            const authorLink = authorElement?.querySelector('a[href^="/"]');
            const authorName = authorElement?.querySelector('span')?.textContent || '';
            const handle = authorLink?.href?.split('/').pop() || '';
            
            // Get post text
            const textElement = article.querySelector('[data-testid="tweetText"]');
            const text = textElement?.textContent || '';
            
            // Get engagement metrics
            const replyButton = article.querySelector('[data-testid="reply"]');
            const likeButton = article.querySelector('[data-testid="like"]');
            const retweetButton = article.querySelector('[data-testid="retweet"]');
            
            // Extract numbers from aria-labels
            const likes = likeButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
            const replies = replyButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
            const retweets = retweetButton?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
            
            // Get timestamp
            const timeElement = article.querySelector('time');
            const timestamp = timeElement?.getAttribute('datetime') || '';
            const displayTime = timeElement?.textContent || '';
            
            // Get URL
            const timeLink = timeElement?.closest('a');
            const url = timeLink?.href || '';
            
            // Check for media
            const hasMedia = article.querySelector('[data-testid="tweetPhoto"], [data-testid="videoPlayer"]') !== null;
            
            posts.push({
                author: authorName,
                handle: '@' + handle,
                text: text,
                likes: parseInt(likes),
                replies: parseInt(replies),
                retweets: parseInt(retweets),
                timestamp: displayTime,
                url: url,
                hasMedia: hasMedia
            });
        } catch (e) {
            console.error('Error parsing post:', e);
        }
    }
    
    return JSON.stringify(posts, null, 2);
}

extractXPosts();