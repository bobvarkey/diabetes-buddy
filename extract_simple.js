(function() {
  const posts = [];
  const articles = document.querySelectorAll("article");
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    try {
      const ariaLabel = article.getAttribute("aria-label") || "";
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.textContent : "";
      const timeEl = article.querySelector("time");
      const dateStr = timeEl ? timeEl.getAttribute("datetime") : "";
      const linkEl = article.querySelector('a[href*="/status/"]');
      const postUrl = linkEl ? linkEl.href : "";
      const groupEl = article.querySelector('[role="group"]');
      
      let likes = "0", replies = "0", reposts = "0", views = "0";
      if (groupEl) {
        const label = groupEl.getAttribute("aria-label") || "";
        const l = label.match(/(\d+)\s+likes?/);
        const r = label.match(/(\d+)\s+replies?/);
        const rp = label.match(/(\d+)\s+reposts?/);
        const v = label.match(/(\d+)\s+views?/);
        if (l) likes = l[1];
        if (r) replies = r[1];
        if (rp) reposts = rp[1];
        if (v) views = v[1];
      }
      
      posts.push({
        aria: ariaLabel.substring(0, 200),
        text: text.substring(0, 400),
        date: dateStr,
        url: postUrl,
        likes: likes,
        replies: replies,
        reposts: reposts,
        views: views
      });
    } catch (e) {}
  }
  
  return JSON.stringify(posts);
})();