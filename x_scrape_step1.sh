#!/bin/zsh
set -e
PROFILE=openclaw
URL1="https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke%20since%3Atoday\u0026src=typed_query\u0026f=top"

echo "Navigating to first search..."
openclaw --profile $PROFILE browser navigate "$URL1"
sleep 8

echo "Scrolling to load more posts..."
for i in {1..12}; do
  openclaw --profile $PROFILE browser evaluate --fn 'function scrollDown(){ window.scrollBy(0, 900); return "ok"; }' > /dev/null
  sleep 2.5
done

echo "Extracting posts..."
FN=$(cat /Users/bobvarkey/.openclaw/workspace/extract_posts.js)
openclaw --profile $PROFILE browser evaluate --fn "$FN" | tail -n 1 > /tmp/x_posts_query1.json

echo "Saved first query results to /tmp/x_posts_query1.json"
wc -c /tmp/x_posts_query1.json
head -c 500 /tmp/x_posts_query1.json
