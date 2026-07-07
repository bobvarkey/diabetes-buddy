#!/bin/bash
# Process X screenshots for neurointervention search

# Neurointervention search screenshots
echo "Processing neurointervention screenshots..."
for i in {1..5}; do
    screenshot="/Users/bobvarkey/.openclaw/workspace/x-scrape-neuro-$(printf %02d $i).png"
    if [ -f "$screenshot" ]; then
        echo "Found: $screenshot"
    fi
done

# AVM/aneurysm search screenshots  
echo ""
echo "Processing AVM/aneurysm screenshots..."
for i in {1..5}; do
    screenshot="/Users/bobvarkey/.openclaw/workspace/x-scrape-avm-$(printf %02d $i).png"
    if [ -f "$screenshot" ]; then
        echo "Found: $screenshot"
    fi
done