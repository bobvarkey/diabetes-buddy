function extractPosts() {
  const articles = Array.from(document.querySelectorAll('article')).slice(0, 12);
  return articles.map(function(a, i) {
    const user = a.querySelector('[data-testid="User-Name"]');
    let name = '';
    let handle = '';
    if (user) {
      const spans = user.querySelectorAll('span');
      for (let j = 0; j < spans.length; j++) {
        const t = spans[j].innerText;
        if (j === 0) name = t;
        if (t.indexOf('@') === 0) { handle = t; break; }
      }
      if (!handle) {
        const link = user.querySelector('a[href^="/"]');
        if (link) handle = link.getAttribute('href');
      }
    }
    const time = a.querySelector('time');
    const text = a.querySelector('[data-testid="tweetText"]');
    let url = '';
    if (time && time.parentElement) url = time.parentElement.getAttribute('href');
    const reply = a.querySelector('[data-testid="reply"]');
    const retweet = a.querySelector('[data-testid="retweet"]');
    const like = a.querySelector('[data-testid="like"]');
    return {
      index: i,
      name: name,
      handle: handle,
      time: time ? time.getAttribute('datetime') : '',
      timeText: time ? time.innerText : '',
      url: url,
      text: text ? text.innerText : '',
      reply: reply ? reply.innerText : '0',
      retweet: retweet ? retweet.innerText : '0',
      like: like ? like.innerText : '0'
    };
  });
}
