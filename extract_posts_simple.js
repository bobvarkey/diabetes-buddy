const posts = [];
const articles = document.querySelectorAll("article");
for (const article of articles) {
  const text = article.querySelector("[data-testid=\"tweetText\"]")?.textContent || "";
  const author = article.querySelector("[data-testid=\"User-Name\"] span")?.textContent || "";
  const time = article.querySelector("time")?.getAttribute("datetime") || "";
  const url = article.querySelector("a[href*=\"/status/\"]")?.href || "";
  if (author && text && url) {
    posts.push({author, text, time, url});
  }
}
posts.length + " posts: " + posts.map(p => p.author).join(", ");