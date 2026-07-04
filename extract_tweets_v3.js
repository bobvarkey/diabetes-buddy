const articles = document.querySelectorAll("article[data-testid='tweet']");
const tweets = [];
for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const tweet = {};
  
  // Get tweet text
  const textEl = article.querySelector("[data-testid='tweetText']");
  tweet.text = textEl ? textEl.textContent.trim() : "";
  
  // Get author info
  const nameEl = article.querySelector("[data-testid='User-Name']");
  if (nameEl) {
    const nameText = nameEl.textContent;
    const handleMatch = nameText.match(/@[\w]+/);
    tweet.handle = handleMatch ? handleMatch[0] : "";
    tweet.author = nameText.split("@")[0].trim();
  } else {
    tweet.author = "";
    tweet.handle = "";
  }
  
  // Get URL
  const timeLink = article.querySelector("time");
  if (timeLink && timeLink.parentElement && timeLink.parentElement.tagName === "A") {
    tweet.url = "https://x.com" + timeLink.parentElement.getAttribute("href");
    tweet.date = timeLink.getAttribute("datetime");
  } else {
    tweet.url = "";
    tweet.date = "";
  }
  
  // Get engagement metrics using aria-label
  const replyBtn = article.querySelector("[data-testid='reply']");
  const repostBtn = article.querySelector("[data-testid='retweet']");
  const likeBtn = article.querySelector("[data-testid='like']");
  const viewBtn = article.querySelector("[data-testid='viewCount']");
  
  // Parse numbers from aria-labels
  tweet.replies = replyBtn ? (replyBtn.getAttribute("aria-label") || "").match(/(\d+)/)?.[1] || "0" : "0";
  tweet.reposts = repostBtn ? (repostBtn.getAttribute("aria-label") || "").match(/(\d+)/)?.[1] || "0" : "0";
  tweet.likes = likeBtn ? (likeBtn.getAttribute("aria-label") || "").match(/(\d+)/)?.[1] || "0" : "0";
  tweet.views = viewBtn ? viewBtn.textContent.trim() : "0";
  
  if (tweet.text) {
    tweets.push(tweet);
  }
}

return JSON.stringify({
  count: tweets.length,
  tweets: tweets
}, null, 2);