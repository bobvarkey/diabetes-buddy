#!/usr/bin/env python3
"""
Show latest Telegram messages
Quick command to check recent messages
"""

import json
import sys
from datetime import datetime

MESSAGE_FILE = "/tmp/telegram_messages.json"

def main():
    try:
        with open(MESSAGE_FILE, 'r') as f:
            messages = json.load(f)

        if not messages:
            print("📭 No messages yet")
            print("\n💡 Send a message to @macminibotyBot on Telegram")
            return

        # Show last 5 messages
        count = min(5, len(messages))

        print(f"\n📬 Last {count} message(s):\n")

        for msg in messages[-count:]:
            print(f"{'='*60}")
            print(f"⏰ {msg['timestamp']}")
            print(f"👤 {msg['sender']}: {msg['text']}")

        print(f"{'='*60}")
        print(f"\n📊 Total messages: {len(messages)}")
        print(f"📁 File: {MESSAGE_FILE}")

        # Show how to read all
        if len(messages) > 5:
            print(f"\n💡 Read all: python3 ~/.openclaw/workspace/telegram_read.py")

    except FileNotFoundError:
        print("📭 No messages file yet")
        print("\n💡 Send a message to @macminibotyBot on Telegram")
        print("   Then run: python3 ~/.openclaw/workspace/telegram_show_messages.py &")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()