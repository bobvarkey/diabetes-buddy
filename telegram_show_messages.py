#!/usr/bin/env python3
"""
Telegram Message Listener - Shows all incoming messages
Polls for updates and displays them in real-time
"""

import requests
import json
import time
from datetime import datetime

BOT_TOKEN = "8501124030:AAHc0eMbOkmzp0DxeCYX-KG6Wkf0bIlSntE"
MESSAGE_FILE = "/tmp/telegram_messages.json"

def get_updates(offset=0, timeout=30):
    """Get updates from Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    params = {
        'offset': offset,
        'timeout': timeout,
        'allowed_updates': ['message', 'edited_message', 'channel_post', 'edited_channel_post']
    }
    try:
        r = requests.get(url, params=params, timeout=timeout+5)
        return r.json()
    except Exception as e:
        print(f"❌ Error getting updates: {e}")
        return {'ok': False, 'result': []}

def process_update(update):
    """Process and display an update"""
    result = None
    
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
        
        # Display
        print(f"\n{'='*70}")
        print(f"📥 NEW MESSAGE [{timestamp}]")
        print(f"📱 Chat: {chat_name} (ID: {chat_id})")
        print(f"👤 From: {sender} (ID: {msg['from']['id']})")
        print(f"💬 {text}")
        print(f"{'='*70}")
        
        result = {
            'timestamp': timestamp,
            'chat_id': chat_id,
            'chat_name': chat_name,
            'sender': sender,
            'sender_id': msg['from']['id'],
            'text': text,
            'message_id': msg['message_id'],
            'type': 'message'
        }
        
    elif 'edited_message' in update:
        msg = update['edited_message']
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        text = msg.get('text', '[Media/File]')
        
        print(f"\n✏️ EDITED MESSAGE [{timestamp}]")
        print(f"📝 {text}")
        print(f"{'='*70}")
        
        result = {
            'timestamp': timestamp,
            'text': text,
            'message_id': msg['message_id'],
            'type': 'edited_message'
        }
    
    return result

def save_message(msg_data):
    """Save message to file"""
    if not msg_data:
        return
    
    try:
        # Read existing
        try:
            with open(MESSAGE_FILE, 'r') as f:
                messages = json.load(f)
        except:
            messages = []
        
        # Add new
        messages.append(msg_data)
        
        # Keep last 100
        messages = messages[-100:]
        
        # Save
        with open(MESSAGE_FILE, 'w') as f:
            json.dump(messages, f, indent=2)
            
        print(f"✅ Saved to {MESSAGE_FILE}")
        
    except Exception as e:
        print(f"❌ Error saving: {e}")

def main():
    print("\n" + "="*70)
    print("🤖 Telegram Message Listener")
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
    print(f"   Messages file: {MESSAGE_FILE}")
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
                    msg_data = process_update(update)
                    if msg_data:
                        save_message(msg_data)
            
            # Small delay
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Stopped by user")
        print(f"📊 Messages saved to: {MESSAGE_FILE}")

if __name__ == "__main__":
    main()