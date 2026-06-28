#!/bin/bash

# Create directory if needed
mkdir -p /Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes

# Get current date for filename
DATE="2026-05-22"
OUTPUT="/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-${DATE}.md"

# Start markdown file
cat > "$OUTPUT" << 'HEADER'
# X/Twitter Neurology News Scrape
**Date:** Friday, June 26th, 2026 - 03:00 (Asia/Calcutta)
**Search Query:** neurology OR #neurotwitter OR #NeuroX
**URL:** https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top

---

HEADER

echo "Created header at: $OUTPUT"