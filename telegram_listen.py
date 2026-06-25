#!/usr/bin/env python3
"""
Telegram Message Listener - Polls for new messages
Shows incoming messages in real-time
"""

import requests
import json
import time
from datetime import datetime

BOT_TOKEN = "8501124030:AAHc0eMbOkmzp0DxeCYX-KG6Wkf0bIlSntE"

def get_me():
    """Get bot info"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
    r = requests.get(url)
    return r.json()

def get_updates(offset=0, timeout=30):
    """Get new messages"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    params = {
        'offset': offset,
        'timeout': timeout,
        'allowed_updates': ['message', 'edited_message']
    }
    r = requests.get(url, params=params, timeout=timeout+5)
    return r.json()

def process_message(update):
    """Process and display message"""
    if 'message' in update:
        msg = update['message']
        
        # Get chat info
        chat_id = msg['chat']['id']
        chat_type = msg['chat']['type']
        
        # Get chat name
        if chat_type == 'private':
            chat_name = msg['chat'].get('first_name', 'Unknown')
            if 'last_name' in msg['chat']:
                chat_name += f" {msg['chat']['last_name']}"
        else:
            chat_name = msg['chat'].get('title', 'Unknown')
        
        # Get sender
        sender = msg['from'].get('first_name', 'Unknown')
        if 'last_name' in msg['from']:
            sender += f" {msg['from']['last_name']}"
        
        # Get text
        text = msg.get('text', '[Media/Non-text]')
        
        # Timestamp
        timestamp = datetime.fromtimestamp(msg['date']).strftime('%Y-%m-%d %H:%M:%S')
        
        # Display
        print(f"\n{'='*70}")
        print(f"📥 NEW MESSAGE [{timestamp}]")
        print(f"📱 Chat: {chat_name} (ID: {chat_id}, Type: {chat_type})")
        print(f"👤 From: {sender} (ID: {msg['from']['id']})")
        print(f"💬 {text}")
        print(f"{'='*70}\n")
        
        # Save to file for OpenClaw to read
        save_message(msg, chat_name, sender, text, timestamp)
        
    elif 'edited_message' in update:
        msg = update['edited_message']
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        print(f"\n✏️ EDITED MESSAGE [{timestamp}]")
        print(f"📝 {msg.get('text', '[Media]')}\n")

def save_message(msg, chat_name, sender, text, timestamp):
    """Save message to file"""
    try:
        data = {
            'timestamp': timestamp,
            'chat_id': msg['chat']['id'],
            'chat_name': chat_name,
            'sender': sender,
            'sender_id': msg['from']['id'],
            'text': text,
            'message_id': msg['message_id']
        }
        
        # Read existing messages
        try:
            with open('/tmp/telegram_messages.json', 'r') as f:
                messages = json.load(f)
        except:
            messages = []
        
        # Add new message
        messages.append(data)
        
        # Keep last 100
        messages = messages[-100:]
        
        # Save back
        with open('/tmp/telegram_messages.json', 'w') as f:
            json.dump(messages, f, indent=2)
            
    except Exception as e:
        print(f"❌ Error saving: {e}")

def main():
    print("\n🤖 Telegram Message Listener")
    print("="*70)
    
    # Test connection
    bot_info = get_me()
    if bot_info['ok']:
        print(f"✅ Connected to @{bot_info['result']['username']}")
        print(f"   Bot: {bot_info['result']['first_name']}")
    else:
        print("❌ Invalid bot token")
        return
    
    print("\n📥 Listening for new messages...")
    print("   (Messages sent TO your bot will appear here)")
    print("   Press Ctrl+C to stop\n")
    
    last_update_id = 0
    
    try:
        while True:
            # Poll for updates
            updates = get_updates(offset=last_update_id + 1, timeout=30)
            
            if updates['ok'] and updates['result']:
                for update in updates['result']:
                    last_update_id = update['update_id']
                    process_message(update)
            
            # Small delay
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Stopped by user")
        print("📊 Messages saved to: /tmp/telegram_messages.json")

if __name__ == "__main__":
    main()