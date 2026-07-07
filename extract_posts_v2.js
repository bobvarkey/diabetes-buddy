(function() {
  const articles = document.querySelectorAll("article");
  const posts = [];
  articles.forEach(article => {
    const post = { author: "", handle: "", date: "", text: "", metrics: { replies: 0, reposts: 0, likes: 0, views: 0 }, url: "" };
    const tweetLink = article.querySelector("a[href*=\"/status/\"]");
    if (tweetLink) {
      post.url = tweetLink.href;
    }
    const timeEl = article.querySelector("time");
    if (timeEl) {
      post.date = timeEl.getAttribute("datetime") || timeEl.textContent;
    }
    const tweetText = article.querySelector("[data-testid='tweetText']");
    if (tweetText) {
      post.text = tweetText.textContent.substring(0, 500);
    }
    const userLink = article.querySelector("a[href^='/'][role='link']");
    if (userLink && userLink.href) {
      post.handle = userLink.href.split("/").filter(p => p).pop();
    }
    const allLinks = article.querySelectorAll("a");
    allLinks.forEach(a => {
      if (a.href && a.href.match(/^https:\/\/x\.com\/[a-zA-Z0-9_]+$/)) {
        post.handle = a.href.split("/").pop();
      }
    });
    const ariaLabels = article.innerHTML.match(/aria-label="[^"]+"/g) || [];
    ariaLabels.forEach(label => {
      const m = label.match(/aria-label="([^"]+)"/);
      if (m) {
        const txt = m[1];
        if (txt.includes("Reply") && txt.includes(".")) {
          const num = txt.match(/(\d+)/);
          if (num) post.metrics.replies = parseInt(num[1]);
        }
        if (txt.includes("Repost") && txt.includes(".")) {
          const num = txt.match(/(\d+)/);
          if (num) post.metrics.reposts = parseInt(num[1]);
        }
        if (txt.includes("Like") && txt.includes(".")) {
          const num = txt.match(/(\d+)/);
          if (num) post.metrics.likes = parseInt(num[1]);
        }
      }
    });
    const buttons = article.querySelectorAll("button[aria-label]");
    buttons.forEach(btn => {
      const label = btn.getAttribute("aria-label") || "";
      const numMatch = label.match(/(\d+)/);
      if (label.includes("Reply") && numMatch) post.metrics.replies = parseInt(numMatch[1]);
      if (label.includes("repost") && numMatch) post.metrics.reposts = parseInt(numMatch[1]);
      if (label.includes("Like") && numMatch) post.metrics.likes = parseInt(numMatch[1]);
    });
    if (post.text || post.handle) {
      posts.push(post);
    }
  });
  return JSON.stringify(posts, null, 2);
})();