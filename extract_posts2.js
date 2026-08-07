function extractPosts() {
  const articles = document.querySelectorAll("article");
  const results = [];
  
  articles.forEach((article, idx) => {
    try {
      const data = {
        index: idx,
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
      
      // Get author info
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
      const statusLinks = article.querySelectorAll("a");
      for (const link of statusLinks) {
        const href = link.getAttribute("href") || "";
        if (href.includes("/status/")) {
          data.url = href.startsWith("/") ? "https://x.com" + href : href;
          break;
        }
      }
      
      // Get metrics from aria-labels
      const buttons = article.querySelectorAll("button[aria-label]");
      buttons.forEach(btn => {
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
      });
      
      results.push(data);
    } catch (e) {
      results.push({error: e.message, index: idx});
    }
  });
  
  return JSON.stringify(results, null, 2);
}
extractPosts();