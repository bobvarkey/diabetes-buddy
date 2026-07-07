#!/usr/bin/env python3
import re
import json
import sqlite3
from datetime import datetime
from pathlib import Path

def parse_aria_to_tweets(aria_text):
    """Parse aria snapshot to extract tweet data"""
    tweets = []
    
    # Split by article elements
    articles = re.split(r'- article "(?=[^"]+(?:Replying to|@|hours ago|minutes ago|Jun|Jul))', aria_text)
    
    for article in articles[1:]:  # Skip first empty split
        try:
            tweet = {}
            
            # Extract author - first quoted string after "article"
            author_match = re.search(r'^([^"]+)@"', article)
            if author_match:
                tweet['author'] = author_match.group(1).strip()
            
            # Extract handle - pattern like @username
            handle_match = re.search(r'@(\w+)', article)
            if handle_match:
                tweet['handle'] = '@' + handle_match.group(1)
            
            # Extract timestamp
            time_patterns = [
                r'(\d+ (?:minutes?|hours?|days?) ago)',
                r'(Jun \d+)',
                r'(Jul \d+)',
                r'(Jan \d+)',
                r'(Feb \d+)',
                r'(Mar \d+)',
                r'(Apr \d+)',
                r'(May \d+)',
                r'(Aug \d+)',
                r'(Sep \d+)',
                r'(Oct \d+)',
                r'(Nov \d+)',
                r'(Dec \d+)'
            ]
            
            for pattern in time_patterns:
                time_match = re.search(pattern, article)
                if time_match:
                    tweet['timestamp'] = time_match.group(1)
                    break
            
            # Extract text content - between timestamp and engagement metrics
            text_match = re.search(r'(?:ago|Jun \d+|Jul \d+|Aug \d+)\s+(.+?)(?=\d+ (?:replies|likes|views|reposts)|$)', article, re.DOTALL)
            if text_match:
                tweet['text'] = text_match.group(1).strip()
            
            # Extract engagement metrics
            replies_match = re.search(r'(\d+) (?:Replies|reply)', article, re.IGNORECASE)
            reposts_match = re.search(r'(\d+) (?:reposts|repost)', article, re.IGNORECASE)
            likes_match = re.search(r'(\d+) (?:Likes|likes|like)', article, re.IGNORECASE)
            views_match = re.search(r'(\d+) views', article, re.IGNORECASE)
            
            tweet['replies'] = int(replies_match.group(1)) if replies_match else 0
            tweet['reposts'] = int(reposts_match.group(1)) if reposts_match else 0
            tweet['likes'] = int(likes_match.group(1)) if likes_match else 0
            tweet['views'] = int(views_match.group(1)) if views_match else 0
            
            # Generate URL from handle and timestamp
            if 'handle' in tweet:
                # We don't have the status ID, so we'll use the handle
                tweet['url'] = f"https://x.com/{tweet['handle'][1:]}"
            
            if tweet.get('text') or tweet.get('author'):
                tweets.append(tweet)
                
        except Exception as e:
            print(f"Error parsing article: {e}")
            continue
    
    return tweets

def save_to_database(tweets, db_path):
    """Save tweets to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            timestamp TEXT,
            text TEXT,
            replies INTEGER,
            reposts INTEGER,
            likes INTEGER,
            views INTEGER,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(handle, text, timestamp)
        )
    ''')
    
    # Insert tweets
    inserted_count = 0
    for tweet in tweets:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, timestamp, text, replies, reposts, likes, views, url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                tweet.get('author', ''),
                tweet.get('handle', ''),
                tweet.get('timestamp', ''),
                tweet.get('text', ''),
                tweet.get('replies', 0),
                tweet.get('reposts', 0),
                tweet.get('likes', 0),
                tweet.get('views', 0),
                tweet.get('url', '')
            ))
            if cursor.rowcount > 0:
                inserted_count += 1
        except Exception as e:
            print(f"Error inserting tweet: {e}")
    
    conn.commit()
    conn.close()
    
    return inserted_count

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python parse_aria.py <aria_file>")
        sys.exit(1)
    
    aria_file = sys.argv[1]
    with open(aria_file, 'r') as f:
        aria_text = f.read()
    
    tweets = parse_aria_to_tweets(aria_text)
    print(f"Extracted {len(tweets)} tweets")
    
    # Save to database
    db_path = Path.home() / '.openclaw' / 'workspace' / 'memory_x_posts.db'
    inserted = save_to_database(tweets, str(db_path))
    print(f"Inserted {inserted} new tweets into database")
    
    # Print tweets for verification
    for i, tweet in enumerate(tweets, 1):
        print(f"\n--- Tweet {i} ---")
        print(f"Author: {tweet.get('author', 'N/A')}")
        print(f"Handle: {tweet.get('handle', 'N/A')}")
        print(f"Time: {tweet.get('timestamp', 'N/A')}")
        print(f"Text: {tweet.get('text', 'N/A')[:100]}...")
        print(f"Likes: {tweet.get('likes', 0)} | Views: {tweet.get('views', 0)}")