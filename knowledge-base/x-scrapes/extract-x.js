(() => {
  const articles = Array.from(document.querySelectorAll("article[data-testid='tweet']")).slice(0, 12);
  return articles.map((a, i) => {
    const textEl = a.querySelector("div[lang]");
    const text = textEl ? textEl.innerText : "";
    const links = Array.from(a.querySelectorAll("a[href^='/']"));
    const authorLink = links.find(l => l.getAttribute("href").match(/^\/[A-Za-z0-9_]+$/));
    const author = authorLink ? authorLink.getAttribute("href").replace("/", "") : "";
    const displayName = authorLink ? authorLink.innerText.split("\n")[0] : "";
    const timeEl = a.querySelector("time");
    const time = timeEl ? timeEl.getAttribute("datetime") : "";
    const statusLink = links.find(l => l.getAttribute("href").includes("/status/"));
    const statusPath = statusLink ? statusLink.getAttribute("href") : "";
    const buttons = Array.from(a.querySelectorAll("button[aria-label]"));
    const metrics = buttons.map(b => b.getAttribute("aria-label")).filter(l => /replies|reposts|likes|views|bookmarks/i.test(l));
    const likesMatch = metrics.join(" ").match(/([0-9,.KM]+)\s+likes?/i);
    const likes = likesMatch ? likesMatch[1] : "";
    return { index: i, author, displayName, text: text.slice(0, 400), time, url: statusPath ? "https://x.com" + statusPath : "", metrics, likes };
  });
})()