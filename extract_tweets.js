const tweets = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
const results = [];
tweets.forEach(tweet => {
  try {
    const authorName = tweet.querySelector('[data-testid="User-Name"] span')?.textContent || "";
    const handleEl = tweet.querySelector('a[href^="/"]');
    const href = handleEl?.href || "";
    let handle = "";
    if (href && href.includes("/")) {
      const parts = href.split("/");
      if (parts.length > 3) {
        handle = parts[3].split("?")[0];
        if (handle.startsWith("@")) handle = handle.substring(1);
      }
    }
    const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent || "";
    const likes = tweet.querySelector('[data-testid="like"]')?.textContent || "0";
    const retweets = tweet.querySelector('[data-testid="retweet"]')?.textContent || "0";
    const replies = tweet.querySelector('[data-testid="reply"]')?.textContent || "0";
    const views = tweet.querySelector('[data-testid="viewCount"]')?.textContent || "";
    const timeEl = tweet.querySelector('time');
    const date = timeEl?.getAttribute("datetime") || "";
    const urlEl = timeEl?.closest("a");
    const url = urlEl?.href || "";
    
    results.push({
      author: authorName,
      handle: handle,
      text: text,
      likes: likes,
      retweets: retweets,
      replies: replies,
      views: views,
      date: date,
      url: url
    });
  } catch (e) {
    // skip errors
  }
});
return results;