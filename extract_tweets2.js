const posts = [];
const articles = document.querySelectorAll("article");
console.log("Found " + articles.length + " articles");

articles.forEach((article, idx) => {
  try {
    console.log("Processing article " + idx);
    
    // Get all text content
    const allText = article.textContent;
    
    // Extract post text from tweetText element
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent : "";
    
    // Extract engagement from group role
    const groupEl = article.querySelector('[role="group"]');
    let likes = "0", replies = "0", reposts = "0", views = "0";
    
    if (groupEl) {
      const groupLabel = groupEl.getAttribute("aria-label") || "";
      // Parse "2 replies, 6 reposts, 23 likes, 7 bookmarks, 4223 views"
      const likesMatch = groupLabel.match(/(\d+)\s+likes?/);
      const repliesMatch = groupLabel.match(/(\d+)\s+replies?/);
      const repostsMatch = groupLabel.match(/(\d+)\s+reposts?/);
      const viewsMatch = groupLabel.match(/(\d+)\s+views?/);
      
      if (likesMatch) likes = likesMatch[1];
      if (repliesMatch) replies = repliesMatch[1];
      if (repostsMatch) reposts = repostsMatch[1];
      if (viewsMatch) views = viewsMatch[1];
    }
    
    // Extract date
    const timeEl = article.querySelector("time");
    const dateStr = timeEl ? timeEl.getAttribute("datetime") : "";
    
    // Extract post URL
    const statusLink = article.querySelector('a[href*="/status/"]');
    const postUrl = statusLink ? statusLink.href : "";
    
    // Extract author from aria-label of article
    const articleLabel = article.getAttribute("aria-label") || "";
    
    posts.push({
      ariaLabel: articleLabel.substring(0, 300),
      text: text.substring(0, 500),
      date: dateStr,
      url: postUrl,
      likes: likes,
      replies: replies,
      reposts: reposts,
      views: views
    });
  } catch (e) {
    console.log("Error: " + e.message);
  }
});

JSON.stringify(posts);