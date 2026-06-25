#!/usr/bin/env python3
"""
Telegram to OpenClaw Auto-Forwarder
Monitors for new messages and displays them in real-time
"""

import requests
import json
import time
from datetime import datetime
import subprocess

BOT_TOKEN = "850112…SntE"
MESSAGE_FILE = "/tmp/telegram_messages.json"
LAST_MESSAGE_FILE = "/tmp/telegram_last_message.txt"

def get_updates(offset=0, timeout=30):
    """Get updates from Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    params = {
        'offset': offset,
        'timeout': timeout,
        'allowed_updates': ['message', 'edited_message']
    }
    try:
        r = requests.get(url, params=params, timeout=timeout+5)
        return r.json()
    except Exception as e:
        return {'ok': False, 'result': []}

def process_and_forward(update):
    """Process update and prepare to forward"""
    if 'message' in update:
        msg = update['message']
        
        # Chat info
        chat_id = msg['chat']['id']
        chat_type = msg['chat']['type']
        
        # Chat name
        if chat_type == 'private':
            chat_name = msg['chat'].get('first_name', 'Unknown')
            if 'last_name' in msg['chat']:
                chat_name += f" {msg['chat']['last_name']}"
        else:
            chat_name = msg['chat'].get('title', 'Unknown')
        
        # Sender
        sender = msg['from'].get('first_name', 'Unknown')
        if 'last_name' in msg['from']:
            sender += f" {msg['from']['last_name']}"
        
        # Text
        text = msg.get('text', '[Media/File]')
        
        # Timestamp
        timestamp = datetime.fromtimestamp(msg['date']).strftime('%Y-%m-%d %H:%M:%S')
        
        return {
            'timestamp': timestamp,
            'chat_id': chat_id,
            'chat_name': chat_name,
            'sender': sender,
            'sender_id': msg['from']['id'],
            'text': text,
            'message_id': msg['message_id'],
            'type': 'message'
        }
    
    return None

def save_and_display(msg_data):
    """Save message and display it"""
    if not msg_data:
        return
    
    # Save to messages file
    try:
        try:
            with open(MESSAGE_FILE, 'r') as f:
                messages = json.load(f)
        except:
            messages = []
        
        messages.append(msg_data)
        messages = messages[-100:]
        
        with open(MESSAGE_FILE, 'w') as f:
            json.dump(messages, f, indent=2)
    except:
        pass
    
    # Display formatted message
    print(f"\n{'='*70}")
    print(f"📥 NEW MESSAGE [{msg_data['timestamp']}]")
    print(f"📱 Chat: {msg_data['chat_name']} (ID: {msg_data['chat_id']})")
    print(f"👤 From: {msg_data['sender']} (ID: {msg_data['sender_id']})")
    print(f"💬 {msg_data['text']}")
    print(f"{'='*70}\n")

def main():
    print("\n" + "="*70)
    print("🔄 Telegram → OpenClaw Auto-Forwarder")
    print("="*70)
    
    # Test connection
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
    r = requests.get(url)
    
    if r.json()['ok']:
        bot = r.json()['result']
        print(f"✅ Connected to @{bot['username']}")
        print(f"   Bot: {bot['first_name']} (ID: {bot['id']})")
    else:
        print("❌ Failed to connect")
        return
    
    print(f"\n📥 Listening for messages...")
    print(f"   Messages will appear here in real-time")
    print(f"   Press Ctrl+C to stop")
    print("="*70 + "\n")
    
    last_update_id = 0
    
    try:
        while True:
            # Get updates
            updates = get_updates(offset=last_update_id + 1)
            
            if updates['ok'] and updates['result']:
                for update in updates['result']:
                    last_update_id = update['update_id']
                    msg_data = process_and_forward(update)
                    if msg_data:
                        save_and_display(msg_data)
            
            # Small delay
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Stopped by user")

if __name__ == "__main__":
    main()