import re
import json
import sys
from datetime import datetime

def parse_aria_snapshot(aria_text):
    """Parse aria snapshot to extract tweet information"""
    tweets = []
    
    # Find all article elements
    article_pattern = r'article "([^"]*?)"'
    articles = re.findall(article_pattern, aria_text)
    
    for article_text in articles:
        tweet_data = {
            'author': '',
            'handle': '',
            'text': '',
            'likes': '0',
            'retweets': '0',
            'replies': '0',
            'views': '',
            'date': '',
            'url': '',
            'hashtags': []
        }
        
        # Extract engagement metrics from the end of article text
        # Pattern: "X replies, Y reposts, Z likes, B bookmarks, V views"
        metrics_pattern = r'(\d+)\s*replies?,\s*(\d+)\s*reposts?,\s*(\d+)\s*likes?'
        metrics_match = re.search(metrics_pattern, article_text)
        if metrics_match:
            tweet_data['replies'] = metrics_match.group(1)
            tweet_data['retweets'] = metrics_match.group(2)
            tweet_data['likes'] = metrics_match.group(3)
        
        # Extract views
        views_match = re.search(r'(\d+)\s*views?$', article_text)
        if views_match:
            tweet_data['views'] = views_match.group(1)
        
        # Extract hashtags
        hashtags = re.findall(r'#(\w+)', article_text)
        tweet_data['hashtags'] = hashtags
        
        # Extract author and handle - pattern: "Name @handle Date"
        author_pattern = r'^([A-Za-z0-9\s\.]+?)\s+(@[\w]+)'
        author_match = re.match(author_pattern, article_text)
        if author_match:
            tweet_data['author'] = author_match.group(1).strip()
            tweet_data['handle'] = author_match.group(2)
        
        # Extract date - look for month names or date patterns
        date_patterns = [
            r'([A-Z][a-z]{2}\s+\d{1,2})',  # Jun 12, May 9, etc
            r'(\d{1,2}\s+[A-Z][a-z]{2})',  # 12 Jun, 9 May
            r'([A-Z][a-z]{2}\s+\d{1,2},?\s+\d{4})',  # Jun 12, 2022
            r'(\d{4}-\d{2}-\d{2})'  # 2022-02-08
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, article_text)
            if date_match:
                tweet_data['date'] = date_match.group(1)
                break
        
        # Extract URL (if any link in the tweet)
        url_pattern = r'(https?://[^\s]+)'
        url_match = re.search(url_pattern, article_text)
        if url_match:
            tweet_data['url'] = url_match.group(1)
        
        # Extract the text content between handle and metrics
        # Find where the tweet text starts (after @handle and date)
        text_start = article_text.find(tweet_data['handle']) + len(tweet_data['handle']) if tweet_data['handle'] else 0
        
        # Find potential date markers and skip them
        date_markers = ['Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ', 'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec ']
        for marker in date_markers:
            if marker in article_text[text_start:]:
                text_start = article_text.find(marker, text_start) + len(marker)
                # Skip any day numbers
                while text_start < len(article_text) and (article_text[text_start].isdigit() or article_text[text_start] in ' ,'):
                    text_start += 1
                break
        
        # Find where metrics start (at the end)
        text_end = article_text.rfind('replies')
        if text_end == -1:
            text_end = len(article_text)
        
        # Extract text
        tweet_data['text'] = article_text[text_start:text_end].strip()
        
        tweets.append(tweet_data)
    
    return tweets

# Read from stdin or file
if len(sys.argv) > 1:
    with open(sys.argv[1], 'r') as f:
        aria_text = f.read()
else:
    aria_text = sys.stdin.read()

# Remove warning lines
aria_text = '\n'.join([line for line in aria_text.split('\n') if not line.startswith('Config warnings') and not line.startswith('◇') and not line.startswith('│')])

tweets = parse_aria_snapshot(aria_text)
print(json.dumps(tweets, indent=2))