function extractPosts() {
  const posts = [];
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  articles.forEach((article, idx) => {
    // Skip feedback prompts that are also articles? They usually have different structure
    // Try to find user name
    const userLink = article.querySelector('a[role="link"][href^="/"]');
    let author = '';
    let handle = '';
    let profileUrl = '';
    if (userLink) {
      profileUrl = userLink.href;
      // The first such link is usually avatar/profile
      const nameContainer = article.querySelector('[data-testid="User-Name"]');
      if (nameContainer) {
        const links = nameContainer.querySelectorAll('a[role="link"]');
        if (links.length >= 1) author = links[0].textContent.trim();
        if (links.length >= 2) handle = links[1].textContent.trim();
      }
    }
    if (!author) {
      // fallback: find any element containing @handle near top
      const allLinks = article.querySelectorAll('a[role="link"]');
      for (const a of allLinks) {
        const t = a.textContent.trim();
        if (t.startsWith('@')) { handle = t; break; }
      }
    }

    const timeEl = article.querySelector('time');
    const date = timeEl ? timeEl.textContent.trim() : '';
    const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
    const tweetUrl = timeEl ? timeEl.closest('a')?.href || '' : '';

    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent.trim() : '';

    // Engagement metrics
    let replies = 0, reposts = 0, likes = 0, bookmarks = 0, views = 0;
    const group = article.querySelector('[role="group"]');
    if (group) {
      const btns = group.querySelectorAll('button, a');
      btns.forEach(btn => {
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        const valText = btn.textContent.trim();
        const val = parseMetric(valText);
        if (label.includes('reply')) replies = val;
        else if (label.includes('repost')) reposts = val;
        else if (label.includes('like')) likes = val;
        else if (label.includes('bookmark')) bookmarks = val;
        else if (label.includes('view')) views = val;
      });
    }

    // Also try to extract from article aria-label if present
    const ariaLabel = article.getAttribute('aria-label') || '';

    posts.push({
      author,
      handle,
      date,
      datetime,
      text,
      replies,
      reposts,
      likes,
      bookmarks,
      views,
      tweetUrl,
      profileUrl,
      ariaLabel
    });
  });
  return posts;
}

function parseMetric(s) {
  if (!s) return 0;
  s = s.replace(/,/g, '').toUpperCase();
  const match = s.match(/([0-9.]+)([KMB]?)\s*/);
  if (!match) return 0;
  let num = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'K') num *= 1000;
  else if (suffix === 'M') num *= 1000000;
  else if (suffix === 'B') num *= 1000000000;
  return Math.round(num);
}

return JSON.stringify(extractPosts(), null, 2);
