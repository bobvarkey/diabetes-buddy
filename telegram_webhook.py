#!/usr/bin/env python3
"""
Telegram Webhook - Forwards messages to OpenClaw
Receives Telegram updates via webhook and sends them to a local endpoint
"""

import asyncio
import json
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
from datetime import datetime

# Configuration
BOT_TOKEN = "8501124030:AAHc0eMbOkmzp0DxeCYX-KG6Wkf0bIlSntE"
OPENCLAW_SESSION = "agent:contentgen:start"  # This session
PORT = 8443  # Local webhook port

# Global message storage
recent_messages = []

class WebhookHandler(BaseHTTPRequestHandler):
    """Handle incoming Telegram webhooks"""
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass
    
    def do_POST(self):
        """Handle POST requests from Telegram"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            update = json.loads(body.decode('utf-8'))
            
            # Process the update
            process_update(update)
            
            # Send OK response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            
        except Exception as e:
            print(f"❌ Error processing webhook: {e}")
            self.send_response(500)
            self.end_headers()

def process_update(update):
    """Process incoming Telegram update"""
    global recent_messages
    
    try:
        if 'message' in update:
            msg = update['message']
            
            # Extract message data
            chat_id = msg['chat']['id']
            chat_name = msg['chat'].get('title', 
                         msg['chat'].get('first_name', 'Unknown'))
            
            sender = msg['from']['first_name']
            if 'last_name' in msg['from']:
                sender += f" {msg['from']['last_name']}"
            
            text = msg.get('text', '[Media/Non-text]')
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Store message
            message_data = {
                'timestamp': timestamp,
                'chat_id': chat_id,
                'chat_name': chat_name,
                'sender': sender,
                'text': text
            }
            recent_messages.append(message_data)
            
            # Keep only last 100 messages
            recent_messages = recent_messages[-100:]
            
            # Print to console
            print(f"\n{'='*60}")
            print(f"📥 NEW MESSAGE [{timestamp}]")
            print(f"📱 Chat: {chat_name} (ID: {chat_id})")
            print(f"👤 From: {sender}")
            print(f"💬 {text}")
            print(f"{'='*60}\n")
            
            # Forward to OpenClaw session
            forward_to_openclaw(message_data)
            
        elif 'edited_message' in update:
            msg = update['edited_message']
            print(f"\n✏️ EDITED MESSAGE in chat {msg['chat']['id']}")
            print(f"📝 {msg.get('text', '[Media]')}\n")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def forward_to_openclaw(message_data):
    """Forward message to OpenClaw session"""
    try:
        # Store in local file for OpenClaw to read
        with open('/tmp/telegram_messages.json', 'w') as f:
            json.dump(recent_messages, f, indent=2)
        
        print(f"✅ Message saved to /tmp/telegram_messages.json")
        
    except Exception as e:
        print(f"❌ Error forwarding: {e}")

def setup_webhook():
    """Setup Telegram webhook"""
    print(f"\n🔗 Setting up webhook...")
    
    # Delete existing webhook
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook"
    requests.get(url)
    
    # For local testing, we'll use getUpdates polling instead
    # Production would need a public HTTPS URL (ngrok, etc.)
    print("⚠️  Local webhook setup requires a public URL.")
    print("   Using polling mode instead...")
    
    return False

def start_polling():
    """Poll for updates (alternative to webhook)"""
    print(f"\n🔄 Starting polling mode...")
    print(f"   Bot will check for new messages every 2 seconds\n")
    
    last_update_id = 0
    
    while True:
        try:
            # Get updates
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
            params = {
                'offset': last_update_id + 1,
                'timeout': 30,
                'allowed_updates': ['message', 'edited_message']
            }
            
            response = requests.get(url, params=params, timeout=35)
            data = response.json()
            
            if data['ok'] and data['result']:
                for update in data['result']:
                    last_update_id = update['update_id']
                    process_update(update)
            
            # Small delay before next poll
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Polling error: {e}")
            time.sleep(5)

def get_recent_messages(limit=20):
    """Get recent messages"""
    try:
        with open('/tmp/telegram_messages.json', 'r') as f:
            messages = json.load(f)
            return messages[-limit:]
    except:
        return []

if __name__ == "__main__":
    import time
    
    print("\n🤖 Telegram Webhook / Polling Service")
    print("="*60)
    print(f"Bot Token: {BOT_TOKEN[:20]}...")
    print(f"Session: {OPENCLAW_SESSION}")
    print("="*60)
    
    # Test bot connection
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
        r = requests.get(url)
        if r.json()['ok']:
            bot_info = r.json()['result']
            print(f"\n✅ Connected to @{bot_info['username']}")
            print(f"   Bot: {bot_info['first_name']}")
        else:
            print("❌ Invalid bot token")
            exit(1)
    except Exception as e:
        print(f"❌ Connection error: {e}")
        exit(1)
    
    print("\n📥 Listening for messages...")
    print("   Press Ctrl+C to stop\n")
    
    # Start polling (easier than webhook for local testing)
    try:
        start_polling()
    except KeyboardInterrupt:
        print("\n\n👋 Stopped by user")
        print(f"📊 Total messages received: {len(recent_messages)}")