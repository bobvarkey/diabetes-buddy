import re
import json
import sys

def parse_aria_snapshot(aria_text):
    """Parse aria snapshot to extract tweet information"""
    tweets = []
    
    # Split into articles (each article is a tweet)
    article_pattern = r'article "([^"]*?)"'
    articles = re.findall(article_pattern, aria_text)
    
    for article in articles:
        tweet_data = {
            'raw_text': article,
            'author': '',
            'handle': '',
            'text': '',
            'likes': '0',
            'retweets': '0',
            'replies': '0',
            'views': '',
            'date': ''
        }
        
        # Extract engagement metrics from the article text
        # Pattern: "X replies, Y reposts, Z likes, B bookmarks, V views"
        metrics_match = re.search(r'(\d+)\s*replies?,\s*(\d+)\s*reposts?,\s*(\d+)\s*likes?,\s*(\d+)\s*bookmarks?,\s*(\d+)\s*views', article)
        if metrics_match:
            tweet_data['replies'] = metrics_match.group(1)
            tweet_data['retweets'] = metrics_match.group(2)
            tweet_data['likes'] = metrics_match.group(3)
            tweet_data['views'] = metrics_match.group(5)
        
        # Extract author name and handle from the beginning
        # Pattern: "Author Name @handle Date"
        author_match = re.match(r'^([A-Za-z\s]+?)\s+(@[\w]+)', article)
        if author_match:
            tweet_data['author'] = author_match.group(1).strip()
            tweet_data['handle'] = author_match.group(2)
        
        tweets.append(tweet_data)
    
    return tweets

# Read from stdin or file
if len(sys.argv) > 1:
    with open(sys.argv[1], 'r') as f:
        aria_text = f.read()
else:
    aria_text = sys.stdin.read()

tweets = parse_aria_snapshot(aria_text)
print(json.dumps(tweets, indent=2))