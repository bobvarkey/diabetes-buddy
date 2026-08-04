#!/bin/zsh
set -e
PROFILE=openclaw
EXTRACT_JS_FILE=/Users/bobvarkey/.openclaw/workspace/extract_posts.js

URL1="https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke%20since%3Atoday\u0026src=typed_query\u0026f=top"
URL2="https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular%20since%3Atoday\u0026src=typed_query\u0026f=top"

function scroll_page() {
  for i in {1..12}; do
    openclaw --profile $PROFILE browser evaluate --fn 'function scrollDown(){ window.scrollBy(0, 900); return "ok"; }' > /dev/null
    sleep 2.5
  done
}

echo "=== FIRST QUERY ==="
openclaw --profile $PROFILE browser navigate "$URL1"
sleep 8
scroll_page
FN=$(cat "$EXTRACT_JS_FILE")
openclaw --profile $PROFILE browser evaluate --fn "$FN" | tail -n 1 > /tmp/x_posts_query1.json
python3 -c "import json; raw=json.load(open('/tmp/x_posts_query1.json')); data=json.loads(raw); print('First query posts:', len(data))"

echo "=== SECOND QUERY ==="
openclaw --profile $PROFILE browser navigate "$URL2"
sleep 8
scroll_page
FN=$(cat "$EXTRACT_JS_FILE")
openclaw --profile $PROFILE browser evaluate --fn "$FN" | tail -n 1 > /tmp/x_posts_query2.json
python3 -c "import json; raw=json.load(open('/tmp/x_posts_query2.json')); data=json.loads(raw); print('Second query posts:', len(data))"

echo "Done."
