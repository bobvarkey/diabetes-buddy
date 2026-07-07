const posts = [];
const articles = document.querySelectorAll("article");

articles.forEach((article, index) => {
  if (index >= 15) return; // Get a few extra to ensure we have 10
  
  const post = {};
  
  // Get author
  const authorLink = article.querySelector("a[href^='/'][role='link']");
  const authorName = article.querySelector("span");
  post.author = authorName ? authorName.textContent.trim() : "Unknown";
  post.handle = authorLink ? authorLink.getAttribute("href").replace("/", "@") : "";
  
  // Get text
  const textElement = article.querySelector("[data-testid='tweetText']") || article.querySelector("div[lang]");
  post.text = textElement ? textElement.textContent.trim() : "";
  
  // Get engagement
  const replyBtn = article.querySelector("[data-testid='reply']");
  const repostBtn = article.querySelector("[data-testid='retweet']");
  const likeBtn = article.querySelector("[data-testid='like']");
  const viewLink = article.querySelector("a[href*='/analytics']");
  
  post.replies = replyBtn ? (replyBtn.getAttribute("aria-label") || "0").replace(/[^0-9]/g, "") : "0";
  post.reposts = repostBtn ? (repostBtn.getAttribute("aria-label") || "0").replace(/[^0-9K]/g, "") : "0";
  post.likes = likeBtn ? (likeBtn.getAttribute("aria-label") || "0").replace(/[^0-9K]/g, "") : "0";
  post.views = viewLink ? viewLink.textContent.trim() : "0";
  
  // Get URL
  const timeLink = article.querySelector("time")?.closest("a");
  post.url = timeLink ? timeLink.href : "";
  
  // Get timestamp
  const timeElement = article.querySelector("time");
  post.timestamp = timeElement ? timeElement.textContent.trim() : "";
  
  // Get datetime attribute for better timestamp
  const datetime = timeElement ? timeElement.getAttribute("datetime") : "";
  post.datetime = datetime;
  
  posts.push(post);
});

return posts;