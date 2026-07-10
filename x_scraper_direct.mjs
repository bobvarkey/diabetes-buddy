import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
async function initDb(dbPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS x_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT,
      handle TEXT,
      date TEXT,
      text TEXT,
      likes INTEGER DEFAULT 0,
      retweets INTEGER DEFAULT 0,
      replies INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      url TEXT UNIQUE,
      search_query TEXT,
      scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
}

// Parse engagement metric
function parseMetric(value) {
  if (!value) return 0;
  const str = String(value).trim();
  
  if (str.includes('K')) {
    const num = parseFloat(str.replace('K', ''));
    return Math.round(num * 1000);
  } else if (str.includes('M')) {
    const num = parseFloat(str.replace('M', ''));
    return Math.round(num * 1000000);
  }
  
  const num = parseInt(str.replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Extract posts from aria snapshot
function extractPostsFromAria(snapshot, searchQuery) {
  const posts = [];
  const lines = snapshot.split('\n');
  
  let currentPost = null;
  let postText = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // X/Twitter post structure in aria
    if (line.includes('tweet') || line.includes('[article]')) {
      if (currentPost && postText.length > 0) {
        currentPost.text = postText.join(' ').trim();
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
        url: '',
        search_query: searchQuery
      };
      postText = [];
    }
    
    if (currentPost) {
      // Extract handle (@username)
      const handleMatch = line.match(/@(\w+)/);
      if (handleMatch && !currentPost.handle) {
        currentPost.handle = handleMatch[1];
      }
      
      // Extract author name (usually before the handle)
      const authorMatch = line.match(/(?:by\s+)?([A-Z][a-zA-Z\s]+)\s*@/);
      if (authorMatch && !currentPost.author) {
        currentPost.author = authorMatch[1].trim();
      }
      
      // Extract engagement metrics
      const metricsMatch = line.match(/(\d+[KM]?)\s*(replies?|reposts?|likes?|views?)/i);
      if (metricsMatch) {
        const value = parseMetric(metricsMatch[1]);
        const metric = metricsMatch[2].toLowerCase();
        
        if (metric.includes('like')) currentPost.likes = value;
        else if (metric.includes('repost')) currentPost.retweets = value;
        else if (metric.includes('repl')) currentPost.replies = value;
        else if (metric.includes('view')) currentPost.views = value;
      }
      
      // Collect post text (not metrics or metadata)
      if (!line.match(/^\s*\d+\s*(replies?|reposts?|likes?|views?)/i) &&
          !line.includes('tweet') &&
          !line.includes('[article]') &&
          !line.match(/@\w+/) ||
          (line.match(/@\w+/) && postText.length > 0)) {
        const cleanLine = line.trim();
        if (cleanLine && !cleanLine.startsWith('[') && cleanLine.length > 10) {
          postText.push(cleanLine);
        }
      }
    }
  }
  
  // Don't forget the last post
  if (currentPost && postText.length > 0) {
    currentPost.text = postText.join(' ').trim();
    posts.push(currentPost);
  }
  
  return posts;
}

// Save posts to database
async function savePostsToDb(posts, db) {
  let inserted = 0;
  let duplicates = 0;
  
  for (const post of posts) {
    try {
      await db.run(
        `INSERT OR IGNORE INTO x_posts 
         (author, handle, date, text, likes, retweets, replies, views, url, search_query)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          post.author,
          post.handle,
          post.date,
          post.text,
          post.likes,
          post.retweets,
          post.replies,
          post.views,
          post.url,
          post.search_query
        ]
      );
      
      if (this.lastID) {
        inserted++;
      } else {
        duplicates++;
      }
    } catch (err) {
      console.error('Error inserting post:', err.message);
    }
  }
  
  return { inserted, duplicates };
}

// Generate markdown report
function generateReport(posts, outputPath, searchQuery) {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();
  
  let report = `\n\n---\n\n## Scrape: ${timestamp}\n\n`;
  report += `**Search Query:** ${searchQuery}\n\n`;
  report += `**Total Posts:** ${posts.length}\n\n`;
  
  const highEngagement = posts.filter(p => p.likes > 50);
  
  if (highEngagement.length > 0) {
    report += `### High-Engagement Posts (>50 likes): ${highEngagement.length}\n\n`;
    
    for (const post of highEngagement) {
      report += `#### @${post.handle || 'unknown'}\n`;
      report += `- **Author:** ${post.author || 'Unknown'}\n`;
      report += `- **Likes:** ${post.likes} | **Retweets:** ${post.retweets} | **Replies:** ${post.replies}\n`;
      report += `- **Text:** ${post.text.substring(0, 300)}${post.text.length > 300 ? '...' : ''}\n\n`;
    }
  }
  
  report += `### All Posts (${posts.length})\n\n`;
  
  for (const post of posts) {
    report += `- **@${post.handle || 'unknown'}** (${post.likes} likes): ${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}\n`;
  }
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.appendFileSync(outputPath, report);
  
  return {
    total: posts.length,
    highEngagement: highEngagement.length
  };
}

export { initDb, extractPostsFromAria, savePostsToDb, generateReport, parseMetric };