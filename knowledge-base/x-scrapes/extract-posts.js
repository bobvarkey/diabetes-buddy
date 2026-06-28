const posts = [];
const articles = document.querySelectorAll("article");

articles.forEach((article, index) => {
  if (index >= 15) return;
  
  const data = {};
  
  // Author
  const authorLink = article.querySelector("a[href^='/']");
  if (authorLink) {
    const authorText = authorLink.innerText;
    data.author = authorText.split("\n")[0];
  }
  
  // Handle - find all spans and look for one starting with @
  const allSpans = article.querySelectorAll("span");
  for (const span of allSpans) {
    const text = span.innerText;
    if (text && text.startsWith("@")) {
      data.handle = text;
      break;
    }
  }
  
  // Text
  const textElement = article.querySelector('[data-testid="tweetText"]');
  if (textElement) {
    data.text = textElement.innerText;
  }
  
  // Engagement
  const groupElement = article.querySelector('[role="group"]');
  if (groupElement) {
    data.engagement = groupElement.getAttribute("aria-label") || "";
  }
  
  // URL - construct from handle
  if (data.handle) {
    const timeElement = article.querySelector("time");
    const parentLink = timeElement?.closest("a");
    if (parentLink) {
      data.url = "https://x.com" + parentLink.getAttribute("href");
    }
  }
  
  if (data.text) {
    posts.push(data);
  }
});

JSON.stringify(posts, null, 2);