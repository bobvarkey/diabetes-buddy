import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname } from 'path';

const OUT_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md';

const fnString = `() => {
  const articles = Array.from(document.querySelectorAll('article'));
  const posts = [];
  for (const article of articles) {
    try {
      const authorEl = article.querySelector('[data-testid="User-Name"]');
      const displayName = authorEl?.querySelector('a span')?.innerText?.trim() || '';
      const handle = authorEl?.querySelector('a[href^="/"]')?.getAttribute('href')?.replace(/^\\//, '') || '';
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.innerText.trim() : '';
      const timeEl = article.querySelector('time');
      const time = timeEl ? timeEl.getAttribute('datetime') : '';
      const linkEl = timeEl?.closest('a') || article.querySelector('a[href*="/status/"]');
      const relativeUrl = linkEl ? linkEl.getAttribute('href') : '';
      const url = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : 'https://x.com' + relativeUrl.split('?')[0]) : '';

      const getStat = (testid) => {
        const el = article.querySelector('[data-testid="' + testid + '"]');
        if (!el) return null;
        const txt = el.innerText.trim();
        const m = txt.match(/([\\d.,]+)([KMB]?)/i);
        if (!m) return null;
        let n = parseFloat(m[1].replace(/,/g, ''));
        const suf = m[2].toUpperCase();
        if (suf === 'K') n *= 1000;
        if (suf === 'M') n *= 1000000;
        if (suf === 'B') n *= 1000000000;
        return Math.round(n);
      };

      const replies = getStat('reply') ?? 0;
      const reposts = getStat('retweet') ?? 0;
      const likes = getStat('like') ?? 0;
      const bookmarks = getStat('bookmark') ?? 0;
      const views = getStat('analyticsButton') ?? 0;

      if (text && handle) {
        posts.push({ author: displayName, handle, text, time, url, replies, reposts, likes, bookmarks, views });
      }
    } catch (e) {}
  }
  return posts;
}`;

function runCli(args) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, PATH: '/Users/bobvarkey/.nvm/versions/node/v24.19.0/bin:' + process.env.PATH };
    const proc = spawn('/Users/bobvarkey/.nvm/versions/node/v24.19.0/bin/node', [
      '/Users/bobvarkey/.nvm/versions/node/v24.19.0/lib/node_modules/openclaw/openclaw.mjs',
      'browser', 'evaluate', '--fn', fnString, '--timeout', '30000', '--json'
    ], { env, shell: false });
    let out = '';
    let err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', code => {
      if (code !== 0) return reject(new Error(`CLI exited ${code}: ${err || out}`));
      resolve(out);
    });
  });
}

async function main() {
  const output = await runCli();
  // CLI prints config warnings and then JSON. Extract last JSON block.
  // CLI output contains config warnings and then a JSON object. Strip leading warning block and parse the last JSON object.
  const raw = output.replace(/Config warnings:[\s\S]*?├─+┤[\s\S]*?┴─+┴/m, '').trim();
  const parsed = JSON.parse(raw);
  const posts = (Array.isArray(parsed) ? parsed : parsed.result || []).slice(0, 10);

  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '---',
    `title: "X Neurology News Scrape — ${today}"`,
    `query: "https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today"`,
    `scraped_at: ${new Date().toISOString()}`,
    'source: x.com',
    '---',
    '',
    `# X Neurology News — ${today}`,
    '',
    `Scraped ${posts.length} top posts matching: neurology OR #neurotwitter OR #NeuroX (top, today).`,
    '',
    '## Posts',
    ''
  ];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const flags = [];
    if (p.likes > 100) flags.push(`🔥 ${p.likes.toLocaleString()} likes`);
    const breakingTerms = /breaking|just published|new study|announced|fda|approval|trial results|emergency use|guidelines|alert|warning/i;
    if (breakingTerms.test(p.text)) flags.push('🚨 breaking news');
    lines.push(`### ${i + 1}. ${p.author} (@${p.handle})`);
    lines.push(`- **URL:** ${p.url}`);
    lines.push(`- **Time:** ${p.time || 'N/A'}`);
    lines.push(`- **Engagement:** ❤️ ${p.likes.toLocaleString()}  🔄 ${p.reposts.toLocaleString()}  💬 ${p.replies.toLocaleString()}  🔖 ${p.bookmarks.toLocaleString()}  👁️ ${p.views.toLocaleString()}`);
    if (flags.length) lines.push(`- **Flags:** ${flags.join(' | ')}`);
    lines.push('');
    lines.push('> ' + p.text.split('\n').join('\n> '));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  if (!posts.length) {
    lines.push('_No posts extracted. X may require login or changed markup._');
    lines.push('');
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
  console.log(`Saved ${posts.length} posts to ${OUT_PATH}`);
  console.log(JSON.stringify(posts, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
