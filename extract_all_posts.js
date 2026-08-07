function extractAllPosts() {
  const articles = document.querySelectorAll("article");
  const results = [];
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    try {
      const data = {
        author: "",
        handle: "",
        date: "",
        text: "",
        url: "",
        metrics: {}
      };
      
      // Get tweet text
      const tweetText = article.querySelector("[data-testid=tweetText]");
      if (tweetText) {
        data.text = tweetText.textContent || "";
      }
      
      // Get author info - try multiple selectors
      const userNames = article.querySelectorAll("[data-testid=User-Name] a");
      if (userNames.length > 0) {
        data.author = userNames[0].textContent || "";
        const href = userNames[0].getAttribute("href") || "";
        if (href.startsWith("/")) {
          data.handle = href.substring(1);
        }
      }
      
      // Get date
      const timeEl = article.querySelector("time");
      if (timeEl) {
        data.date = timeEl.getAttribute("datetime") || timeEl.textContent || "";
      }
      
      // Get post URL
      const allLinks = article.querySelectorAll("a[href*='/status/']");
      if (allLinks.length > 0) {
        const href = allLinks[0].getAttribute("href") || "";
        data.url = href.startsWith("/") ? "https://x.com" + href : href;
      }
      
      // Get metrics from aria-labels
      const buttons = article.querySelectorAll("button[aria-label]");
      for (let j = 0; j < buttons.length; j++) {
        const btn = buttons[j];
        const label = btn.getAttribute("aria-label") || "";
        const text = btn.textContent || "0";
        const num = parseInt(text.replace(/[^0-9]/g, "")) || 0;
        
        if (label.includes("repl")) {
          data.metrics.replies = num;
        } else if (label.includes("repost") || label.includes("Repost")) {
          data.metrics.reposts = num;
        } else if (label.includes("Like") || label.includes("like")) {
          data.metrics.likes = num;
        } else if (label.includes("bookmark") || label.includes("Bookmark")) {
          data.metrics.bookmarks = num;
        } else if (label.includes("view") || label.includes("View")) {
          data.metrics.views = num;
        }
      }
      
      results.push(data);
    } catch (e) {
      results.push({error: e.message});
    }
  }
  
  return results;
}
extractAllPosts();