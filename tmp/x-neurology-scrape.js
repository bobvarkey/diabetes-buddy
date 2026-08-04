const articles = [...document.querySelectorAll("article")];
const posts = articles.slice(0, 15).map((a, i) => {
  const authorName = a.querySelector('[data-testid="User-Name"]');
  const textEl = a.querySelector('[data-testid="tweetText"]');
  const timeEl = a.querySelector("time");
  const group = a.querySelector('[role="group"]');
  const link = timeEl?.closest("a");
  const getText = (el) => el?.innerText?.trim().replace(/\n/g, " ") ?? "";
  const spans = authorName ? [...authorName.querySelectorAll("span")] : [];
  const name = spans[0]?.innerText?.trim() || "";
  const handle = spans[1]?.innerText?.trim() || "";
  return {
    index: i,
    author: name,
    handle: handle,
    text: getText(textEl),
    date: timeEl?.getAttribute("datetime") || getText(timeEl),
    url: link ? new URL(link.href, location.origin).href : "",
    engagement: getText(group),
  };
});
return posts;
