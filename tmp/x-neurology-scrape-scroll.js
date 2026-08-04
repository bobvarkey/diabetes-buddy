const seen = new Map();
const collect = () => {
  [...document.querySelectorAll("article")].forEach((a, i) => {
    const time = a.querySelector("time")?.getAttribute("datetime");
    if (!time) return;
    const text = a.querySelector('[data-testid="tweetText"]')?.innerText?.trim().replace(/\n/g, " ") ?? "";
    const group = a.querySelector('[role="group"]')?.innerText?.trim().replace(/\n/g, " ") ?? "";
    const link = a.querySelector("time")?.closest("a")?.href || "";
    const authorSpans = a.querySelector('[data-testid="User-Name"]')?.querySelectorAll("span");
    const author = authorSpans?.[0]?.innerText?.trim() || "";
    const handle = authorSpans?.[1]?.innerText?.trim() || "";
    seen.set(time + "|" + text.slice(0,40), { author, handle, text, date: time, url: link, engagement: group });
  });
};
collect();
for (let i=0; i<30; i++) {
  window.scrollBy(0, 1000);
  await new Promise(r => setTimeout(r, 600));
  collect();
}
return { y: window.scrollY, count: seen.size, posts: [...seen.values()] };
