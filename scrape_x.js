function extractPosts(){
  function parseNum(t){ if(!t) return null; let m=t.match(/[\d.]+[KMB]?/); if(!m) return null; let v=parseFloat(m[0].replace(/K/,"e3").replace(/M/,"e6").replace(/B/,"e9")); return isNaN(v)?null:v;}
  const arts=document.querySelectorAll("article");
  const posts=[];
  arts.forEach(a=>{
    try{
      const author = a.querySelector('[data-testid="User-Name"] a');
      const name=author ? (author.querySelector("span")?.textContent?.trim()||author.textContent.trim()) : "";
      const handle=author ? author.getAttribute("href")?.replace("/","") : "";
      const timeEl=a.querySelector("time");
      const postDate=timeEl?timeEl.getAttribute("datetime")||timeEl.textContent:"";
      const url=timeEl?timeEl.closest("a")?.href:"";
      const textEls=a.querySelectorAll('[data-testid="tweetText"]');
      const text=textEls.length?Array.from(textEls).map(e=>e.textContent).join("\n"):"";
      const group=a.querySelector('[role="group"]');
      let likes=null,replies=null,reposts=null,bookmarks=null,views=null;
      if(group){
        group.querySelectorAll("button").forEach(b=>{
          const label=b.getAttribute("aria-label")||"";
          const num=b.textContent.trim();
          if(label.includes("Like")) likes=parseNum(num);
          else if(label.includes("Reply")) replies=parseNum(num);
          else if(label.includes("Repost")||label.includes("retweet")) reposts=parseNum(num);
          else if(label.includes("Bookmark")) bookmarks=parseNum(num);
        });
        const viewLink=group.querySelector('a[href*="/analytics"]');
        if(viewLink) views=parseNum(viewLink.textContent.trim());
      }
      if(name||text) posts.push({name,handle,postDate,text,url,likes,replies,reposts,bookmarks,views});
    }catch(e){}
  });
  return {count:posts.length, posts:posts};
}
function scrollAndCollect(times=5, callback){
  let postsMap = new Map();
  let prevCount=0;
  let i=0;
  function collect(){
    const r=extractPosts();
    r.posts.forEach(p=>{ if(p.url) postsMap.set(p.url, p); });
    if(i>=times){
      if(callback) callback({count:postsMap.size, posts:Array.from(postsMap.values())});
      return;
    }
    i++;
    window.scrollBy(0,1200);
    setTimeout(collect, 1200);
  }
  collect();
}
// Run
scrollAndCollect(5, r=>{ window.__X_SCRAPED = r; });
