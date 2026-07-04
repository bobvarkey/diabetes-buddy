Array.from(document.querySelectorAll("article")).map(a => {
  const authorEl = a.querySelector("a[href^='/']");
  const handleEl = a.querySelectorAll("a[href^='/']")[1];
  const textEl = a.querySelector("[data-testid='tweetText']") || a.querySelector("div[lang]");
  const timeEl = a.querySelector("time");
  const url = a.querySelector("a[href*='/status/']")?.href || "";
  const likesText = a.textContent.match(/(\d+(?:\.\d+)?[Kk]?)\s*Likes?/)?.[1] || "0";
  const viewsText = a.textContent.match(/(\d+(?:\.\d+)?[Kk]?)\s*views/)?.[1] || "0";
  return {
    author: authorEl?.textContent?.trim() || "",
    handle: handleEl?.textContent?.trim() || "",
    text: textEl?.textContent?.trim() || "",
    date: timeEl?.getAttribute("datetime") || "",
    displayDate: timeEl?.textContent?.trim() || "",
    url,
    likes: likesText,
    views: viewsText
  };
});