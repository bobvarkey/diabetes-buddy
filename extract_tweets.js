const articles = Array.from(document.querySelectorAll("article"));
const results = [];
for (let i = 0; i < Math.min(5, articles.length); i++) {
  const a = articles[i];
  const link = a.querySelector("a[href*=\"/status/\"]");
  const url = link ? link.href : "";
  const authorEl = a.querySelector("a[href^=\"/"][role=\"link\"] span");
  const author = authorEl ? authorEl.textContent.trim() : "";
  const handleEl = a.querySelector("a[href^=\"/\"] span");
  const handle = handleEl ? handleEl.textContent.trim() : "";
  const timeEl = a.querySelector("time");
  const date = timeEl ? timeEl.getAttribute("datetime") : "";
  const textEl = a.querySelector("[data-testid=\"tweetText\"]");
  const text = textEl ? textEl.textContent : "";
  results.push({ author, handle, date, text, url });
}
return results;