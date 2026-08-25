(function(){
  function parseNum(t){ if(!t) return null; let m=t.match(/[\d.]+[KMB]?/); if(!m) return null; let val=m[0].replace(/K/i,'e3').replace(/M/i,'e6').replace(/B/i,'e9'); let v=parseFloat(val); return isNaN(v)?null:v;}
  function parseGroup(text){
    const nums=text.match(/[\d.]+[KMB]?/g)||[];
    return {replies:nums[0]?parseNum(nums[0]):null, reposts:nums[1]?parseNum(nums[1]):null, likes:nums[2]?parseNum(nums[2]):null, views:nums[3]?parseNum(nums[3]):null};
  }
  const arts=document.querySelectorAll('article');
  const posts=[];
  arts.forEach(a=>{
    try{
      const nameEl=a.querySelector('[data-testid="User-Name"]');
      const name=nameEl?nameEl.textContent.split('@')[0].trim():'';
      const handle=nameEl?('@' + (nameEl.textContent.split('@')[1]?.split('·')[0].trim()||'')) : '';
      const timeEl=a.querySelector('time');
      const postDate=timeEl?timeEl.getAttribute('datetime')||timeEl.textContent:'';
      const url=timeEl?timeEl.closest('a')?.href:'';
      const txtEl=a.querySelector('[data-testid="tweetText"]');
      const text=txtEl?txtEl.textContent:'';
      const groupEl=a.querySelector('[role="group"]');
      const g=groupEl?parseGroup(groupEl.textContent):{};
      posts.push({name,handle,postDate,text,url,likes:g.likes,replies:g.replies,reposts:g.reposts,bookmarks:null,views:g.views});
    }catch(e){}
  });
  return {count:posts.length, posts};
})()
