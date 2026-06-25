#!/usr/bin/env python3
"""
Read messages from /tmp/telegram_messages.json
"""

import json
import sys
from datetime import datetime

try:
    with open('/tmp/telegram_messages.json', 'r') as f:
        messages = json.load(f)
    
    if not messages:
        print("No messages yet.")
        print("\n💡 Send a message to @macminibotyBot on Telegram")
        sys.exit(0)
    
    print(f"\n📧 Last {len(messages)} message(s):\n")
    print("="*70)
    
    for msg in messages:
        print(f"\n[{msg['timestamp']}]")
        print(f"📱 Chat: {msg['chat_name']} (ID: {msg['chat_id']})")
        print(f"👤 From: {msg['sender']} (ID: {msg['sender_id']})")
        print(f"💬 {msg['text']}")
        print("-"*70)
    
    print(f"\n✅ Total: {len(messages)} messages")
    
except FileNotFoundError:
    print("No messages file yet.")
    print("\n💡 Send a message to @macminibotyBot on Telegram")
except Exception as e:
    print(f"Error: {e}")