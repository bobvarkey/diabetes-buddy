(async function(){
  function parseNum(t){ if(!t) return null; let m=t.match(/[\d.]+[KMB]?/i); if(!m) return null; let val=m[0].replace(/K/i,'e3').replace(/M/i,'e6').replace(/B/i,'e9'); let v=parseFloat(val); return isNaN(v)?null:v;}
  function parseGroup(text){
    const nums=text.match(/[\d.]+[KMB]?/gi)||[];
    return {replies:nums[0]?parseNum(nums[0]):null, reposts:nums[1]?parseNum(nums[1]):null, likes:nums[2]?parseNum(nums[2]):null, views:nums[3]?parseNum(nums[3]):null};
  }
  const seen=new Map();
  const start=Date.now();
  const duration=15000;
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
        const groupEl=a.querySelector('[role="group"]');
        const g=groupEl?parseGroup(groupEl.textContent):{};
        if(url) seen.set(url, {name,handle,postDate,text,url,likes:g.likes,replies:g.replies,reposts:g.reposts,bookmarks:null,views:g.views});
      }catch(e){}
    });
    window.scrollBy(0, 900);
    await new Promise(r=>setTimeout(r, 900));
    const count=seen.size;
    if(count===lastCount && Date.now()-start > 6000) break;
    lastCount=count;
  }
  return {count:seen.size, posts:Array.from(seen.values())};
})()
