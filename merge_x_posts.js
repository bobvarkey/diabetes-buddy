const fs = require('fs');
const files = process.argv.slice(2);
const seen = new Set();
const all = [];
for (const f of files) {
  if (!fs.existsSync(f)) { console.error('missing', f); continue; }
  const text = fs.readFileSync(f, 'utf8');
  // find the last { ... } JSON object in the file (the actual tool result after stderr)
  const match = text.match(/\{[\s\S]*\}(?!\s*\})/g);
  if (!match) { console.error('no json object in', f); continue; }
  const obj = JSON.parse(match[match.length - 1]);
  let posts = [];
  if (obj.result) {
    try { posts = JSON.parse(obj.result); } catch(e) { posts = []; }
  } else if (Array.isArray(obj)) {
    posts = obj;
  }
  for (const p of posts) {
    const key = p.tweetUrl || p.text;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(p);
  }
}
console.log(JSON.stringify(all, null, 2));
