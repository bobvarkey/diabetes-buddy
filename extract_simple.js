const articles = document.querySelectorAll("article");
const results = [];
for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const data = {};
  const tweetText = article.querySelector("[data-testid=tweetText]");
  if (tweetText) {
    data.text = tweetText.textContent;
  }
  results.push(data);
}
JSON.stringify(results);