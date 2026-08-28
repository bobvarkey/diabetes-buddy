() => {
  const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
  return articles.map((a, i) => {
    const userInfo = a.querySelector('div[data-testid="User-Name"]');
    const links = userInfo ? Array.from(userInfo.querySelectorAll('a[href^="/"]')) : [];
    const displayNameEl = links[0] ? links[0].querySelector('span') : null;
    const handleEl = links[1] || links[0] || null;
    const timeEl = a.querySelector('time');
    const textEl = a.querySelector('div[data-testid="tweetText"]');
    const text = textEl ? textEl.innerText : '';
    const url = timeEl && timeEl.parentElement ? 'https://x.com' + (timeEl.parentElement.getAttribute('href') || '') : '';
    const date = timeEl ? timeEl.getAttribute('datetime') : '';
    const metrics = { replies: 0, retweets: 0, likes: 0, bookmarks: 0 };
    a.querySelectorAll('button[aria-label]').forEach(b => {
      const label = b.getAttribute('aria-label') || '';
      const numMatch = label.match(/(\d[\d,]*(?:\.\d+)?)\s*(K?)/);
      const val = numMatch ? (numMatch[2] ? parseFloat(numMatch[1].replace(/,/g, '')) * 1000 : parseInt(numMatch[1].replace(/,/g, ''))) : 0;
      if (label.includes('Like')) metrics.likes = val;
      else if (label.includes('Reply')) metrics.replies = val;
      else if (label.includes('Repost') || label.includes('Retweet')) metrics.retweets = val;
      else if (label.includes('Bookmark')) metrics.bookmarks = val;
    });
    let views = 0;
    const viewLink = a.querySelector('a[href$="/analytics"]');
    if (viewLink) {
      const txt = viewLink.innerText || '';
      const m = txt.match(/(\d[\d,]*(?:\.\d+)?)\s*(K|M?)/);
      if (m) views = m[2] === 'K' ? parseFloat(m[1].replace(/,/g, '')) * 1000 : m[2] === 'M' ? parseFloat(m[1].replace(/,/g, '')) * 1000000 : parseInt(m[1].replace(/,/g, ''));
    }
    return {
      index: i,
      author: displayNameEl ? displayNameEl.innerText : '',
      handle: handleEl ? handleEl.innerText : '',
      date,
      text,
      url,
      ...metrics,
      views
    };
  });
}
