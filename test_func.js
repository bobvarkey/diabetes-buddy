const articles = document.querySelectorAll("article");
const count = articles.length;
const first = articles[0];
const text = first ? first.querySelector("[data-testid=tweetText]")?.textContent : "no text";
JSON.stringify({count, firstText: text});