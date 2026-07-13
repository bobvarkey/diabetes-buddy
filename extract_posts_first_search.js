const tweets = [];
const articles = document.querySelectorAll('article');
articles.forEach(a => {
  const time = a.querySelector('time');
  const link = a.querySelector('a[href*="/status/"]');
  const url = link ? 'https://x.com' + link.getAttribute('href') : '';
  const authorEl = a.querySelector('a[href^="/"]');
  const handle = authorEl ? authorEl.getAttribute('href').replace('/', '@') : '';
  const spans = a.querySelectorAll('span');
  let author = '';
  for (const s of spans) {
    const text = s.textContent;
    if (text && !text.startsWith('@') && text.length < 50 && !text.includes('Reply') && !text.includes('repost') && !text.includes('Like')) {
      author = text;
      break;
    }
  }
  const textDivs = a.querySelectorAll('div[lang]');
  const text = Array.from(textDivs).map(d => d.textContent).join(' ').replace(/Show more/g, '').trim();
  const buttons = a.querySelectorAll('button');
  let replies = '0', reposts = '0', likes = '0';
  buttons.forEach(b => {
    const label = b.getAttribute('aria-label') || '';
    const match = label.match(/(\d+)/);
    if (label.includes('Repl') && match) replies = match[1];
    if (label.includes('repost') && match) reposts = match[1];
    if (label.includes('Like') && match) likes = match[1];
  });
  const viewLink = a.querySelector('a[href*="/analytics"]');
  const views = viewLink ? viewLink.textContent.replace(/[^0-9K.]/g, '') : '0';
  if (text && url) {
    tweets.push({author, handle, text, replies, reposts, likes, views, date: time?.textContent, url});
  }
});
tweets;