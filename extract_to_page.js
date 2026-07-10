const articles = document.querySelectorAll("article");
const results = [];

for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const result = {};
  
  // Get aria-label which contains author and content
  result.ariaLabel = article.getAttribute("aria-label") || "";
  
  // Get tweet text
  const tweetText = article.querySelector('[data-testid="tweetText"]');
  result.text = tweetText ? tweetText.innerText : "";
  
  // Get author - from links
  const authorLinks = article.querySelectorAll('a[href^="/"]');
  for (const link of authorLinks) {
    const href = link.getAttribute("href") || "";
    if (href.match(/^\/[a-zA-Z0-9_]+$/) && !href.includes("status")) {
      result.handle = href;
      break;
    }
  }
  
  // Get datetime
  const timeEl = article.querySelector("time");
  result.datetime = timeEl ? timeEl.getAttribute("datetime") : "";
  
  // Get post URL
  const statusLink = article.querySelector('a[href*="/status/"]');
  result.url = statusLink ? statusLink.href : "";
  
  // Get engagement from aria-label on role=group
  const group = article.querySelector('[role="group"]');
  if (group) {
    const label = group.getAttribute("aria-label") || "";
    result.groupLabel = label;
  }
  
  results.push(result);
}

// Output to console
console.log("===POST_DATA_START===");
console.log(JSON.stringify(results, null, 2));
console.log("===POST_DATA_END===");

results.length;