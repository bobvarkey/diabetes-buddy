#!/usr/bin/env python3
"""
Real-time Telegram Message Monitor
Shows new messages as they arrive
Run this in a separate terminal to see messages in real-time
"""

import json
import time
import os
from datetime import datetime

MESSAGE_FILE = "/tmp/telegram_messages.json"
SEEN_FILE = "/tmp/telegram_seen_ids.txt"

def load_seen():
    """Load seen message IDs"""
    try:
        with open(SEEN_FILE, 'r') as f:
            return set(f.read().strip().split('\n'))
    except:
        return set()

def save_seen(msg_id):
    """Save message ID as seen"""
    with open(SEEN_FILE, 'a') as f:
        f.write(f"{msg_id}\n")

def monitor():
    """Monitor for new messages"""
    print("="*70)
    print("👀 Telegram Message Monitor")
    print("="*70)
    print(f"Watching: {MESSAGE_FILE}")
    print("Press Ctrl+C to stop")
    print("="*70 + "\n")

    seen = load_seen()

    try:
        while True:
            try:
                with open(MESSAGE_FILE, 'r') as f:
                    messages = json.load(f)

                for msg in messages:
                    msg_id = f"{msg['timestamp']}_{msg['message_id']}"

                    if msg_id not in seen:
                        # New message!
                        print(f"\n{'='*70}")
                        print(f"📥 NEW MESSAGE [{msg['timestamp']}]")
                        print(f"📱 Chat: {msg['chat_name']}")
                        print(f"👤 From: {msg['sender']}")
                        print(f"💬 {msg['text']}")
                        print(f"{'='*70}")

                        save_seen(msg_id)
                        seen.add(msg_id)

            except Exception as e:
                pass

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n\n👋 Stopped")

if __name__ == "__main__":
    monitor()