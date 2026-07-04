const articles = Array.from(document.querySelectorAll("article"));
const posts = articles.map((article, index) => {
  const result = {
    index: index,
    authorName: "",
    authorHandle: "",
    text: "",
    engagement: {},
    timestamp: "",
    displayTime: "",
    url: ""
  };
  
  try {
    // Get author handle
    const authorLink = article.querySelector("a[href^='/']");
    if (authorLink) {
      result.authorHandle = authorLink.getAttribute("href").split("/")[1] || "";
    }
    
    // Get author display name
    const authorNameEl = article.querySelector("a[href^='/'] span");
    if (authorNameEl) {
      result.authorName = authorNameEl.textContent.trim();
    }
    
    // Get tweet text
    const textEl = article.querySelector("[data-testid='tweetText']");
    if (textEl) {
      result.text = textEl.textContent;
    }
    
    // Get timestamp
    const timeEl = article.querySelector("time");
    if (timeEl) {
      result.timestamp = timeEl.getAttribute("datetime") || "";
      result.displayTime = timeEl.textContent || "";
    }
    
    // Get URL
    const statusLink = article.querySelector("a[href*='/status/']");
    if (statusLink) {
      const href = statusLink.getAttribute("href");
      result.url = "https://x.com" + href.split("?")[0];
    }
    
    // Get engagement data
    const ariaLabels = [];
    article.querySelectorAll("[aria-label]").forEach(el => {
      const label = el.getAttribute("aria-label");
      if (label && (label.includes("replies") || label.includes("likes") || label.includes("reposts") || label.includes("views"))) {
        ariaLabels.push(label);
      }
    });
    result.engagementText = ariaLabels.join(" | ");
    
  } catch (e) {
    result.error = e.message;
  }
  
  return result;
});

JSON.stringify(posts, null, 2);