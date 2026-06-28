#!/usr/bin/env python3
import json
import sys

# This script is meant to be run within a browser context
# We'll use the openclaw browser evaluate command to run it

script = """
const tweets = [];
const articles = Array.from(document.querySelectorAll('article'));

for (let i = 0; i < Math.min(articles.length, 10); i++) {
  const article = articles[i];
  const tweet = {};
  
  try {
    // Author
    const authorLink = article.querySelector('a[href^="/"]');
    tweet.handle = authorLink ? '@' + authorLink.pathname.split('/')[1] : '';
    const nameSpan = article.querySelector('a[href^="/"] span');
    tweet.author = nameSpan ? nameSpan.textContent : '';
    
    // Text
    const textDiv = article.querySelector('[data-testid="tweetText"]');
    tweet.text = textDiv ? textDiv.textContent : '';
    
    // URL
    const statusLink = article.querySelector('a[href*="/status/"]');
    tweet.url = statusLink ? statusLink.href : '';
    
    // Engagement
    const buttons = article.querySelectorAll('button[aria-label]');
    tweet.replies = 0;
    tweet.reposts = 0;
    tweet.likes = 0;
    tweet.views = 0;
    
    buttons.forEach(btn => {
      const label = btn.getAttribute('aria-label') || '';
      const num = parseInt((label.match(/(\d+,?\d*)/) || [0, '0'])[1].replace(',', ''));
      if (label.includes('repl')) tweet.replies = num;
      if (label.includes('repost') || label.includes('Retweet')) tweet.reposts = num;
      if (label.includes('Like')) tweet.likes = num;
      if (label.includes('view')) tweet.views = num;
    });
    
    tweets.push(tweet);
  } catch (e) {}
}

tweets;
"""

print(script)