function extractPosts() {
  function parseCount(s) {
    if (!s) return 0;
    s = s.toString().trim().replace(/,/g, "").replace(/\u202f/g, "").replace(/\xa0/g, "").toLowerCase();
    var mult = 1;
    if (s.endsWith("k")) { mult = 1000; s = s.slice(0, -1); }
    else if (s.endsWith("m")) { mult = 1000000; s = s.slice(0, -1); }
    var n = parseFloat(s);
    return isNaN(n) ? 0 : Math.round(n * mult);
  }
  var posts = [];
  document.querySelectorAll("article").forEach(function(a) {
    try {
      var links = Array.from(a.querySelectorAll("a"));
      var statusLink = null;
      links.forEach(function(l) {
        var h = l.getAttribute("href") || "";
        if (!statusLink && h.includes("/status/") && !h.includes("/analytics")) { statusLink = l; }
      });
      if (!statusLink) return;

      var userLinks = links.filter(function(l) {
        var h = l.getAttribute("href") || "";
        return h.startsWith("/") && !h.includes("/status/") && !h.includes("/hashtag") && h.split("/").filter(Boolean).length === 1;
      });
      var handle = "";
      var author = "";
      userLinks.forEach(function(l) {
        var t = (l.innerText || "").trim();
        if (t.startsWith("@") && !handle) { handle = t.replace("@", ""); }
        else if (t && !t.startsWith("@") && t.length > author.length && !/^\d+[mhdw]$/.test(t) && t !== "Follow") { author = t; }
      });
      if (!handle && userLinks.length) {
        handle = userLinks[0].getAttribute("href").replace("/", "").split("?")[0];
      }

      var timeEl = a.querySelector("time");
      var date = timeEl ? timeEl.getAttribute("datetime") : "";
      var textEl = a.querySelector('[data-testid="tweetText"]');
      var text = textEl ? textEl.innerText : "";
      var replies = 0, reposts = 0, likes = 0, views = 0, bookmarks = 0;
      a.querySelectorAll("button,[role='button']").forEach(function(b) {
        var aria = (b.getAttribute("aria-label") || "").toLowerCase();
        var tid = (b.getAttribute("data-testid") || "").toLowerCase();
        var visible = (b.innerText || "").trim();
        var countText = "";
        if (/\d/.test(aria)) countText = aria;
        else if (/\d/.test(visible)) countText = visible;
        if (aria.indexOf("replies") >= 0 || aria.indexOf("reply") >= 0 || tid.indexOf("reply") >= 0) { replies = parseCount(countText) || replies; }
        if (aria.indexOf("reposts") >= 0 || aria.indexOf("repost") >= 0 || tid.indexOf("retweet") >= 0) { reposts = parseCount(countText) || reposts; }
        if (aria.indexOf("likes") >= 0 || aria.indexOf("like") >= 0 || tid.indexOf("like") >= 0) { likes = parseCount(countText) || likes; }
        if (aria.indexOf("bookmarks") >= 0 || aria.indexOf("bookmark") >= 0 || tid.indexOf("bookmark") >= 0) { bookmarks = parseCount(countText) || bookmarks; }
        if (aria.indexOf("views") >= 0 || aria.indexOf("view") >= 0 || tid.indexOf("analytics") >= 0) { views = parseCount(countText) || views; }
      });
      posts.push({
        author: author,
        handle: handle,
        date: date,
        text: text,
        replies: replies,
        reposts: reposts,
        likes: likes,
        views: views,
        bookmarks: bookmarks,
        url: "https://x.com" + statusLink.getAttribute("href").split("?")[0]
      });
    } catch (e) {}
  });
  return JSON.stringify(posts);
}
