(async function(){
  // Collect visible metrics across all group buttons using aria-labels
  function parseLabel(label){
    if(!label) return null;
    const m=label.match(/([\d.]+)([KMB]?)/i);
    if(!m) return null;
    let v=parseFloat(m[1]);
    const unit=m[2].toUpperCase();
    if(unit==='K') v*=1000;
    if(unit==='M') v*=1000000;
    if(unit==='B') v*=1000000000;
    return v;
  }
  function getMetrics(article){
    const group=article.querySelector('[role="group"]');
    const out={likes:null,replies:null,reposts:null,bookmarks:null,views:null};
    if(!group) return out;
    group.querySelectorAll('button').forEach(b=>{
      const label=b.getAttribute('aria-label')||'';
      const val=parseLabel(label);
      if(label.match(/reply/i)) out.replies=val;
      else if(label.match(/repost|retweet/i)) out.reposts=val;
      else if(label.match(/like/i)) out.likes=val;
      else if(label.match(/bookmark/i)) out.bookmarks=val;
    });
    const viewLink=group.querySelector('a[href*="/analytics"]');
    if(viewLink){
      const label=viewLink.getAttribute('aria-label')||viewLink.textContent;
      out.views=parseLabel(label);
    }
    return out;
  }
  const seen=new Map();
  const start=Date.now();
  const duration=18000;
  let lastCount=0;
  while(Date.now()-start < duration){
    const arts=document.querySelectorAll('article');
    arts.forEach(a=>{
      try{
        const nameEl=a.querySelector('[data-testid="User-Name"]');
        const full=nameEl?nameEl.textContent:'';
        const name=full.split('@')[0].trim();
        const handle='@' + (full.split('@')[1]?.split('·')[0].trim()||'');
        const timeEl=a.querySelector('time');
        const postDate=timeEl?timeEl.getAttribute('datetime')||timeEl.textContent:'';
        const url=timeEl?timeEl.closest('a')?.href:'';
        const txtEl=a.querySelector('[data-testid="tweetText"]');
        const text=txtEl?txtEl.textContent:'';
        const m=getMetrics(a);
        if(url) seen.set(url, {name,handle,postDate,text,url,likes:m.likes,replies:m.replies,reposts:m.reposts,bookmarks:m.bookmarks,views:m.views});
      }catch(e){}
    });
    window.scrollBy(0, 1000);
    await new Promise(r=>setTimeout(r, 1000));
    if(seen.size===lastCount && Date.now()-start > 8000) break;
    lastCount=seen.size;
  }
  return {count:seen.size, posts:Array.from(seen.values())};
})()
