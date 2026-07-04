const articles = document.querySelectorAll("article");
const tweets = [];
for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const tweet = {};
  
  const nameEl = article.querySelector("[data-testid='User-Name']");
  const nameText = nameEl ? nameEl.textContent : "";
  const parts = nameText.split("@");
  tweet.author = parts[0].trim();
  
  const handleMatch = nameText.match(/@\w+/);
  tweet.handle = handleMatch ? handleMatch[0] : "";
  
  const textEl = article.querySelector("[data-testid='tweetText']");
  tweet.text = textEl ? textEl.textContent : "";
  
  const timeEl = article.querySelector("time");
  tweet.date = timeEl ? timeEl.getAttribute("datetime") : "";
  
  const linkEl = article.querySelector("a[href*='/status/']");
  tweet.url = linkEl ? "https://x.com" + linkEl.getAttribute("href") : "";
  
  const fullText = article.textContent;
  const replyMatch = fullText.match(/(\d+)\s*(replies?|Reply)/i);
  tweet.replies = replyMatch ? parseInt(replyMatch[1]) : 0;
  
  const repostMatch = fullText.match(/(\d+)\s*(reposts?|Repost)/i);
  tweet.reposts = repostMatch ? parseInt(repostMatch[1]) : 0;
  
  const likeMatch = fullText.match(/(\d+)\s*(likes?|Likes?|Like)/i);
  tweet.likes = likeMatch ? parseInt(likeMatch[1]) : 0;
  
  const viewMatch = fullText.match(/(\d+[.,]?\d*[KM]?)\s*(views?|Views)/i);
  tweet.views = viewMatch ? viewMatch[1] : "0";
  
  if (tweet.text) {
    tweets.push(tweet);
  }
}
return JSON.stringify(tweets, null, 2);