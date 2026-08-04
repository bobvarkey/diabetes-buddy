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
    const key = time + "|" + text.slice(0,80);
    if (!seen.has(key)) {
      seen.set(key, { author, handle, text, date: time, url: link, engagement: group });
    }
  });
};
collect();
let lastY = -1;
let unchanged = 0;
while (unchanged < 5) {
  window.scrollBy(0, 1500);
  await new Promise(r => setTimeout(r, 900));
  collect();
  if (window.scrollY === lastY) {
    unchanged++;
  } else {
    lastY = window.scrollY;
    unchanged = 0;
  }
}
return { y: window.scrollY, count: seen.size, posts: [...seen.values()] };
