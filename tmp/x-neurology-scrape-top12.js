const seen = new Set();
let posts = [];
let lastY = -1;
let unchanged = 0;
while (posts.length < 12 && unchanged < 6) {
  const articles = [...document.querySelectorAll("article")];
  articles.forEach(a => {
    const time = a.querySelector("time")?.getAttribute("datetime");
    if (!time) return;
    const text = a.querySelector('[data-testid="tweetText"]')?.innerText?.trim().replace(/\n/g, " ") ?? "";
    const group = a.querySelector('[role="group"]')?.innerText?.trim().replace(/\n/g, " ") ?? "";
    const link = a.querySelector("time")?.closest("a")?.href || "";
    const authorSpans = a.querySelector('[data-testid="User-Name"]')?.querySelectorAll("span");
    const author = authorSpans?.[0]?.innerText?.trim() || "";
    const handle = authorSpans?.[1]?.innerText?.trim() || "";
    const key = time + "|" + text.slice(0,80);
    if (!seen.has(key)) {
      seen.add(key);
      posts.push({ author, handle, text, date: time, url: link, engagement: group });
    }
  });
  window.scrollBy(0, 1000);
  await new Promise(r => setTimeout(r, 1000));
  if (window.scrollY === lastY) {
    unchanged++;
  } else {
    lastY = window.scrollY;
    unchanged = 0;
  }
}
return { y: window.scrollY, count: posts.length, posts: posts.slice(0,12) };
