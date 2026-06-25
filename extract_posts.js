const articles = document.querySelectorAll("article");
const posts = [];
articles.forEach(article => {
  try {
    const textEl = article.querySelector("[data-testid='tweetText']");
    const linkEl = article.querySelector("a[href*='/status/']");
    const timeEl = article.querySelector("time");
    const handleLinks = article.querySelectorAll("a[href^='/']");
    const authorSpan = article.querySelector("span");
    
    const text = textEl ? textEl.textContent : "";
    const url = linkEl ? "https://x.com" + linkEl.getAttribute("href").split("/photo")[0].split("?")[0] : "";
    const date = timeEl ? timeEl.getAttribute("datetime") : "";
    const handle = handleLinks[1] ? handleLinks[1].getAttribute("href").replace("/", "@") : "";
    const authorName = authorSpan ? authorSpan.textContent : "";
    
    // Extract engagement from aria-labels
    const buttons = article.querySelectorAll("button");
    let replies = 0, reposts = 0, likes = 0, views = 0;
    buttons.forEach(btn => {
      const label = btn.getAttribute("aria-label") || "";
      const numMatch = label.match(/(\d+)/);
      if (label.includes("Replies") || label.includes("Reply")) {
        replies = numMatch ? parseInt(numMatch[1]) : 0;
      } else if (label.includes("reposts") || label.includes("Repost")) {
        reposts = numMatch ? parseInt(numMatch[1]) : 0;
      } else if (label.includes("Likes") || label.includes("Like")) {
        likes = numMatch ? parseInt(numMatch[1]) : 0;
      }
    });
    
    const viewsLink = article.querySelector("a[href*='analytics']");
    if (viewsLink) {
      const viewsText = viewsLink.textContent;
      if (viewsText.includes("K")) {
        const num = parseFloat(viewsText.match(/[\d.]+/)[0]);
        views = Math.round(num * 1000);
      } else {
        views = parseInt(viewsText.replace(/,/g, "").match(/\d+/)?.[0] || "0");
      }
    }
    
    if (text || authorName) {
      posts.push({
        authorName,
        handle,
        text,
        date,
        url,
        replies,
        reposts,
        likes,
        views
      });
    }
  } catch (e) {
    console.log("Error:", e);
  }
});
JSON.stringify(posts);