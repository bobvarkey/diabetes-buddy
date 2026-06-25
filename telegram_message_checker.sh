#!/bin/bash
# Telegram Message Checker - Run periodically via cron
# Checks for new messages and saves them for OpenClaw to read

MESSAGES_FILE="/tmp/telegram_messages.json"
LAST_CHECK_FILE="/tmp/telegram_last_check.txt"

# Run the Python script to check for new messages
python3 ~/.openclaw/workspace/telegram_show_messages.py &

# Give it a moment to capture any new messages
sleep 2

# Kill the background process after a short time
pkill -f "telegram_show_messages.py" 2>/dev/null

# Display any new messages
if [ -f "$MESSAGES_FILE" ]; then
    # Get last message timestamp
    LAST_TIME=""
    if [ -f "$LAST_CHECK_FILE" ]; then
        LAST_TIME=$(cat "$LAST_CHECK_FILE")
    fi

    # Get latest message
    LATEST=$(python3 -c "
import json
try:
    with open('$MESSAGES_FILE', 'r') as f:
        messages = json.load(f)
    if messages:
        latest = messages[-1]
        print(f\"{latest['timestamp']}|{latest['sender']}|{latest['text']}\")
except:
    pass
" 2>/dev/null)

    # Save latest timestamp
    if [ -n "$LATEST" ]; then
        echo "$LATEST" | cut -d'|' -f1 > "$LAST_CHECK_FILE"

        # Check if new message
        if [ "$LATEST" != "$LAST_TIME" ]; then
            echo "📬 New Telegram message detected"
            echo "$LATEST"
        fi
    fi
fi