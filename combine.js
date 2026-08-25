const fs=require('fs');
const path=require('path');

const queries=[
  {file:'neuro1_full.json', label:'neurointervention OR thrombectomy OR #Neurointervention OR #stroke', url:'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today'},
  {file:'neuro2_full.json', label:'cerebral AVM OR intracranial aneurysm OR endovascular', url:'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today'}
];

const dbPath='/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db';
const reportDir='/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes';
const reportPath=path.join(reportDir,'x-scrape-2026-05-22.md');

let db;
try{
  const sqlite3=require('sqlite3').verbose();
  fs.mkdirSync(path.dirname(dbPath),{recursive:true});
  db=new sqlite3.Database(dbPath);
  db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT,
      search_url TEXT,
      author TEXT,
      handle TEXT,
      post_date TEXT,
      text TEXT,
      likes INTEGER,
      replies INTEGER,
      reposts INTEGER,
      bookmarks INTEGER,
      url TEXT UNIQUE,
      scraped_at TEXT
    )`);
  });
} catch(e){
  console.error('sqlite3 not available:', e.message);
  process.exit(1);
}

const now=new Date().toISOString();
const insert=db.prepare(`INSERT OR IGNORE INTO posts (created_at, search_url, author, handle, post_date, text, likes, replies, reposts, bookmarks, url, scraped_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

let totals={total:0, new:0, perQuery:{}, highEngagement:[]};
const allPosts=[];
function stripWarnings(text){
  // remove OpenClaw CLI decoration before JSON body
  const idx=text.indexOf('{');
  return idx>=0?text.slice(idx):text;
}
queries.forEach(q=>{
  const raw=JSON.parse(stripWarnings(fs.readFileSync(path.join('/Users/bobvarkey/.openclaw/workspace',q.file),'utf8')));
  const posts=raw.posts||[];
  totals.perQuery[q.label]=0;
  posts.forEach(p=>{
    totals.total++;
    allPosts.push({...p, search_url:q.url, search_label:q.label});
    insert.run(now, q.url, p.name, p.handle, p.postDate, p.text, p.likes, p.replies, p.reposts, p.bookmarks, p.url, now, function(err){
      if(err) console.error('insert err', err.message);
      else if(this.changes > 0) totals.new++;
    });
    totals.perQuery[q.label]++;
    if(p.likes > 50) totals.highEngagement.push({...p, query:q.label});
  });
});
insert.finalize();
db.close();

fs.mkdirSync(reportDir,{recursive:true});
let md=`# X/Twitter scrape – 2026-05-22

Scraped at: ${now}

## Summary
- Total posts collected: ${totals.total}
- New posts inserted into DB: ${totals.new}
- Posts per query:
${Object.entries(totals.perQuery).map(([k,v])=>`  - ${k}: ${v}`).join('\n')}
- High-engagement posts (>50 likes): ${totals.highEngagement.length}

## Errors / notes
- X's dynamic timeline requires scrolling; extraction collected articles currently in the DOM.
- The "likes" metric is read from the aria-label of each article's action group; some older posts may show null metrics.
- No login wall or rate-limit error was observed during scraping.

## High-engagement posts
`;
if(totals.highEngagement.length===0){
  md+='No posts with >50 likes in this run.\n\n';
} else {
  totals.highEngagement.forEach(p=>{
    md+=`### ${p.name} (${p.handle}) — ${p.likes} likes\n- Date: ${p.postDate}\n- Query: ${p.query}\n- URL: ${p.url}\n- Text: ${p.text.replace(/\n/g,' ')}\n- Replies: ${p.replies ?? 'n/a'} | Reposts: ${p.reposts ?? 'n/a'} | Views: ${p.views ?? 'n/a'}\n\n`;
  });
}

md+=`## All collected posts\n`;
allPosts.forEach(p=>{
  md+=`### ${p.name} (${p.handle})\n- Date: ${p.postDate}\n- Likes: ${p.likes ?? 'n/a'} | Replies: ${p.replies ?? 'n/a'} | Reposts: ${p.reposts ?? 'n/a'}\n- URL: ${p.url}\n- Query: ${p.search_label}\n- ${p.text.replace(/\n/g,' ')}\n\n`;
});

fs.appendFileSync(reportPath, md);
console.log(JSON.stringify(totals,null,2));
