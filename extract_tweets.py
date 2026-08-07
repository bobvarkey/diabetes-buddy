#!/usr/bin/env python3
import re
import json
from datetime import datetime

# Read the snapshot data from stdin or file
snapshot = """
- generic [ref=e2]:
  - generic:
    - generic:
      - heading "To view keyboard shortcuts, press question mark View keyboard shortcuts" [level=2] [ref=e3]:
        - generic [ref=e4]: To view keyboard shortcuts, press question mark
        - link "View keyboard shortcuts" [ref=e5] [cursor=pointer]:
          - /url: /i/keyboard_shortcuts
      - generic [ref=e6]:
        - button "Skip to home timeline" [ref=e7] [cursor=pointer]
        - button "Skip to trending" [ref=e9] [cursor=pointer]
        - banner [ref=e11]:
          - generic [ref=e13]:
            - generic [ref=e14]:
              - heading "X" [level=1] [ref=e16] [cursor=pointer]:
                - link "X" [ref=e17]:
                  - /url: /home
                  - img [ref=e19]
              - navigation "Primary" [ref=e23]:
                - link "Home" [ref=e24] [cursor=pointer]:
                  - /url: /home
                  - img [ref=e27]
                - link "Search and explore" [ref=e30] [cursor=pointer]:
                  - /url: /explore
                  - img [ref=e33]
                - link "Notifications (12 unread notifications)" [ref=e36] [cursor=pointer]:
                  - /url: /notifications
                  - generic [ref=e38]:
                    - img [ref=e39]
                    - generic "12 unread items" [ref=e42]:
                      - generic [ref=e43]: "12"
                - link "Follow" [ref=e44] [cursor=pointer]:
                  - /url: /i/connect_people
                  - img [ref=e47]
                - link "Direct Messages" [ref=e50] [cursor=pointer]:
                  - /url: /i/chat
                  - img [ref=e53]
                - link "SuperGrok" [ref=e56] [cursor=pointer]:
                  - /url: /i/grok
                  - generic [ref=e58]:
                    - img [ref=e59]
                    - generic "undefined unread items" [ref=e62]
                - link "Profile" [ref=e63] [cursor=pointer]:
                  - /url: /Cognito2026
                  - img [ref=e66]
                - button "More menu items" [ref=e69] [cursor=pointer]:
                  - img [ref=e72]
              - link "Post" [ref=e76] [cursor=pointer]:
                - /url: /compose/post
                - img [ref=e78]
            - button "Account menu" [ref=e84] [cursor=pointer]:
              - generic [ref=e92]:
                - generic:
                  - generic:
                    - generic:
                      - generic "Cognito":
                        - img "Cognito"
        - main [ref=e95]:
          - generic "Home timeline" [ref=e100]:
            - generic [ref=e101]:
              - generic [ref=e102]:
                - generic [ref=e107]:
                  - button "Back" [ref=e109] [cursor=pointer]:
                    - img [ref=e111]
                  - search "Search" [ref=e119]:
                    - generic [ref=e124]:
                      - img [ref=e126]
                      - combobox "Search query" [ref=e131]: "neurology OR #neurotwitter OR #NeuroX"
                  - button "More" [ref=e133] [cursor=pointer]:
                    - img [ref=e135]
                - navigation [ref=e139]:
                  - generic [ref=e140]:
                    - generic:
                      - button "Previous" [disabled]:
                        - generic:
                          - img
                    - tablist [ref=e142]:
                      - tab "Top" [selected] [ref=e143] [cursor=pointer]:
                        - generic [ref=e146]: Top
                      - tab "Latest" [ref=e148] [cursor=pointer]:
                        - generic [ref=e151]: Latest
                      - tab "People" [ref=e152] [cursor=pointer]:
                        - generic [ref=e155]: People
                      - tab "Media" [ref=e156] [cursor=pointer]:
                        - generic [ref=e159]: Media
                      - tab "Lists" [ref=e160] [cursor=pointer]:
                        - generic [ref=e163]: Lists
                    - generic:
                      - button "Next" [disabled]:
                        - generic:
                          - img
              - generic:
                - generic:
                  - status:
                    - button:
                      - generic:
                        - img
                        - generic: See new posts
            - region "Search timeline" [ref=e165]:
              - heading "Search timeline" [level=1] [ref=e166]
              - 'generic "Timeline: Search timeline" [ref=e167]':
                - 'article "Neurology Journal @GreenJournal Jul 10 Neurology Podcast: Dr. Chris Boes and Dr. José Merino discuss the journal's history, its evolution, and what lies ahead for the future of Neurology. Listen now: hubs.la/Q04p66Jx0 #Neurology75 @ChrisBoesMD Embedded video Play Video 1 reply, 4 reposts, 11 likes, 2273 views" [ref=e172] [cursor=pointer]':
                  - generic [ref=e178]:
                    - link [ref=e190]:
                      - /url: /GreenJournal
                    - generic [ref=e193]:
                      - generic [ref=e195]:
                        - generic [ref=e198]:
                          - link "Neurology Journal" [ref=e201]:
                            - /url: /GreenJournal
                            - generic [ref=e204]: Neurology Journal
                          - generic [ref=e206]:
                            - link "@GreenJournal" [ref=e208]:
                              - /url: /GreenJournal
                              - generic [ref=e209]: "@GreenJournal"
                            - generic [ref=e210]: ·
                            - link "Jul 10" [ref=e212]:
                              - /url: /GreenJournal/status/2075361900808777998
                              - time [ref=e213]: Jul 10
                        - generic [ref=e215]:
                          - button "Grok actions" [ref=e217]:
                            - img [ref=e222]
                          - button "More" [ref=e228]:
                            - img [ref=e232]
                      - generic [ref=e236]:
                        - text: "Neurology Podcast: Dr. Chris Boes and Dr. José Merino discuss the journal's history, its evolution, and what lies ahead for the future of Neurology. Listen now:"
                        - link "hubs.la/Q04p66Jx0" [ref=e237]:
                          - /url: https://t.co/0WfYglw0Ug
                        - link "#Neurology75" [ref=e239]:
                          - /url: /hashtag/Neurology75?src=hashtag_click
                        - link "@ChrisBoesMD" [ref=e242]:
                          - /url: /ChrisBoesMD
                      - generic [ref=e259]:
                        - generic "Embedded video" [ref=e262]
                        - button "Play Video" [ref=e269]:
                          - img [ref=e270]
                      - group "1 reply, 4 reposts, 11 likes, 2273 views" [ref=e276]:
                        - button "1 Reply. Reply" [ref=e278]:
                          - generic [ref=e279]:
                            - img [ref=e282]
                            - generic [ref=e287]: "1"
                        - button "4 reposts. Repost" [ref=e289]:
                          - generic [ref=e290]:
                            - img [ref=e293]
                            - generic [ref=e298]: "4"
                        - button "11 Likes. Like" [ref=e300]:
                          - generic [ref=e301]:
                            - img [ref=e304]
                            - generic [ref=e309]: "11"
                        - link "2273 views. View post analytics" [ref=e311]:
                          - /url: /GreenJournal/status/2075361900808777998/analytics
                          - generic [ref=e312]:
                            - img [ref=e315]
                            - generic [ref=e320]: 2.2K
                        - button "Bookmark" [ref=e322]:
                          - img [ref=e326]
                        - button "Share post" [ref=e331]:
                          - img [ref=e335]
"""

def extract_tweets_from_snapshot(snapshot_text):
    tweets = []
    
    # Find all article elements
    article_pattern = r'- article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        tweet = {}
        
        # Extract author and handle
        # Pattern: "Author Name @handle Date ..."
        author_match = re.search(r'^(.+?)\s+(@[\w]+)', article_text)
        if author_match:
            tweet['author'] = author_match.group(1).strip()
            tweet['handle'] = author_match.group(2)
        
        # Extract date - look for patterns like "Jul 10", "Jul 12", "8 hours ago", etc.
        date_match = re.search(r'(@[\w]+\s+)(\d+ hours? ago|\w+ \d+)', article_text)
        if date_match:
            tweet['date'] = date_match.group(2)
        
        # Extract text - everything between the date and engagement metrics
        # Find the text after the date and before the engagement numbers
        text_match = re.search(r'(\d+ hours? ago|\w+ \d+)\s+(.+?)(?=\d+ repl|\d+ repost)', article_text)
        if text_match:
            tweet['text'] = text_match.group(2).strip()
        else:
            # Try another pattern
            text_match2 = re.search(r'(@[\w]+\s+\w+ \d+)\s+(.+?)(?=\d+ repl|\d+ repost)', article_text)
            if text_match2:
                tweet['text'] = text_match2.group(2).strip()
        
        # Extract engagement metrics
        replies_match = re.search(r'(\d+) repl', article_text)
        reposts_match = re.search(r'(\d+) repost', article_text)
        likes_match = re.search(r'(\d+) like', article_text)
        views_match = re.search(r'(\d+[\d,K]*) view', article_text)
        bookmarks_match = re.search(r'(\d+) bookmark', article_text)
        
        tweet['replies'] = int(replies_match.group(1)) if replies_match else 0
        tweet['reposts'] = int(reposts_match.group(1)) if reposts_match else 0
        tweet['likes'] = int(likes_match.group(1)) if likes_match else 0
        tweet['views'] = views_match.group(1) if views_match else "0"
        tweet['bookmarks'] = int(bookmarks_match.group(1)) if bookmarks_match else 0
        
        # Extract URL from the snapshot text (need to search in full snapshot)
        url_pattern = r'/url: (/[^\s]+status/(\d+))'
        # This will be done in a second pass
        
        if 'text' in tweet and tweet['text']:
            tweets.append(tweet)
    
    return tweets

# Parse the snapshot
tweets = extract_tweets_from_snapshot(snapshot)

# Print results
print(json.dumps(tweets, indent=2))