const fs = require('fs');
const path = require('path');

// Extract posts from current page state
function extractPostsFromSnapshot(snapshotText) {
  const posts = [];
  const lines = snapshotText.split('\n');
  
  let currentPost = null;
  let inPost = false;
  
  for (const line of lines) {
    // Detect post boundaries - X/Twitter structure
    if (line.includes('[article]') || line.includes('tweet') || line.includes('data-testid="tweet"')) {
      if (currentPost) {
        posts.push(currentPost);
      }
      currentPost = {
        author: '',
        handle: '',
        date: '',
        text: '',
        likes: 0,
        retweets: 0,
        replies: 0,
        views: 0,
        url: ''
      };
      inPost = true;
    }
    
    if (inPost && currentPost) {
      // Extract author info
      const authorMatch = line.match(/@\[?(\w+)\]?/);
      if (authorMatch && !currentPost.handle) {
        currentPost.handle = authorMatch[1];
      }
      
      // Extract engagement metrics
      const likesMatch = line.match(/(\d+[KM]?)\s*(likes?|replies?|reposts?|views?)/i);
      if (likesMatch) {
        const value = likesMatch[1];
        const metric = likesMatch[2].toLowerCase();
        const numValue = parseMetric(value);
        
        if (metric.includes('like')) currentPost.likes = numValue;
        else if (metric.includes('repl')) currentPost.replies = numValue;
        else if (metric.includes('repost') || metric.includes('retweet')) currentPost.retweets = numValue;
        else if (metric.includes('view')) currentPost.views = numValue;
      }
    }
  }
  
  if (currentPost) {
    posts.push(currentPost);
  }
  
  return posts;
}

function parseMetric(value) {
  if (value.endsWith('K')) {
    return parseFloat(value) * 1000;
  } else if (value.endsWith('M')) {
    return parseFloat(value) * 1000000;
  }
  return parseInt(value) || 0;
}

// Export for use
module.exports = { extractPostsFromSnapshot, parseMetric };