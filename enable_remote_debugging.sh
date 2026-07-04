#!/bin/bash
# Enable Chrome Remote Debugging for Browser Automation
# Run this script once to enable automated X/Twitter scraping

echo "=== Chrome Remote Debugging Setup ==="
echo ""
echo "This script will help enable Chrome remote debugging for browser automation."
echo ""

# Check if Chrome is running
if ! pgrep -x "Google Chrome" > /dev/null; then
    echo "Starting Chrome..."
    open -a "Google Chrome"
    sleep 3
fi

# Open the remote debugging page
echo "Opening Chrome remote debugging settings..."
echo ""
echo "⚠️  PLEASE COMPLETE THESE STEPS IN CHROME:"
echo "   1. Look for the 'Discover network targets' section"
echo "   2. Tick the checkbox to enable it"
echo "   3. If a permission dialog appears, click 'Allow'"
echo ""
echo "Waiting for remote debugging to be enabled..."

osascript -e 'tell application "Google Chrome" to activate' \
          -e 'tell application "Google Chrome" to open location "chrome://inspect/#remote-debugging"'

# Wait for the port file
for i in {1..60}; do
    if [ -f "$HOME/Library/Application Support/Google/Chrome/DevToolsActivePort" ]; then
        echo ""
        echo "✅ Remote debugging is now enabled!"
        echo ""
        echo "You can now run browser automation tasks."
        exit 0
    fi
    sleep 1
    if [ $((i % 5)) -eq 0 ]; then
        echo "Still waiting... ($i/60 seconds)"
    fi
done

echo ""
echo "❌ Timeout: Remote debugging not enabled after 60 seconds."
echo "   Please manually enable it in Chrome at: chrome://inspect/#remote-debugging"
exit 1