#!/usr/bin/env python3
"""
Telegram Message Reader
Reads messages from your Telegram account using Telethon
"""

import asyncio
import json
from telethon import TelegramClient
from telethon.tl.types import PeerUser, PeerChat, PeerChannel
from datetime import datetime

# Configuration
API_ID = None  # Will be set by user
API_HASH = None  # Will be set by user
PHONE = None  # Will be set by user

def print_messages(messages, limit=20):
    """Pretty print messages"""
    for msg in messages[:limit]:
        sender = getattr(msg.sender, 'first_name', 'Unknown')
        if hasattr(msg.sender, 'last_name') and msg.sender.last_name:
            sender += f" {msg.sender.last_name}"
        
        date = msg.date.strftime('%Y-%m-%d %H:%M:%S')
        text = msg.text or '[Media/Non-text]'
        
        print(f"\n{'='*60}")
        print(f"📅 {date}")
        print(f"👤 From: {sender}")
        print(f"💬 {text}")
        print(f"{'='*60}")

async def list_chats(client):
    """List all chats"""
    print("\n📋 Your Chats:")
    print("="*60)
    
    async for dialog in client.iter_dialogs(limit=30):
        unread = f" ({dialog.unread_count} unread)" if dialog.unread_count else ""
        print(f"  • {dialog.name}{unread}")
    print("="*60)

async def get_recent_messages(client, chat_name=None, chat_id=None, limit=50):
    """Get recent messages from a chat"""
    try:
        if chat_id:
            entity = await client.get_entity(chat_id)
        elif chat_name:
            # Search for chat by name
            async for dialog in client.iter_dialogs():
                if chat_name.lower() in dialog.name.lower():
                    entity = dialog.entity
                    break
            else:
                print(f"❌ Chat '{chat_name}' not found")
                return
        else:
            # Get the first chat (most recent)
            async for dialog in client.iter_dialogs(limit=1):
                entity = dialog.entity
                break
        
        print(f"\n📥 Fetching messages from: {getattr(entity, 'title', getattr(entity, 'first_name', 'Unknown'))}")
        print("="*60)
        
        messages = await client.get_messages(entity, limit=limit)
        
        for msg in reversed(messages):  # Show oldest to newest
            sender = "Unknown"
            if msg.sender:
                sender = getattr(msg.sender, 'first_name', 'Unknown')
                if hasattr(msg.sender, 'last_name') and msg.sender.last_name:
                    sender += f" {msg.sender.last_name}"
            
            date = msg.date.strftime('%Y-%m-%d %H:%M:%S')
            text = msg.text or '[Media/Non-text]'
            
            print(f"\n[{date}] {sender}:")
            print(f"  {text}")
        
        print(f"\n{'='*60}")
        print(f"✅ Showing {len(messages)} messages")
        
    except Exception as e:
        print(f"❌ Error: {e}")

async def interactive_mode(client):
    """Interactive message reader"""
    await list_chats(client)
    
    while True:
        print("\n📝 Options:")
        print("  1. Enter chat name to read messages")
        print("  2. Enter chat ID to read messages")
        print("  3. Type 'recent' to see recent messages from all chats")
        print("  4. Type 'quit' to exit")
        
        choice = input("\n🎯 Your choice: ").strip()
        
        if choice.lower() == 'quit':
            break
        elif choice.lower() == 'recent':
            print("\n📥 Fetching recent messages from all chats...")
            async for dialog in client.iter_dialogs(limit=10):
                print(f"\n{'='*60}")
                print(f"📱 {dialog.name}")
                print(f"{'='*60}")
                messages = await client.get_messages(dialog.entity, limit=5)
                for msg in reversed(messages):
                    sender = "Unknown"
                    if msg.sender:
                        sender = getattr(msg.sender, 'first_name', 'Unknown')
                    text = msg.text or '[Media]'
                    print(f"  {sender}: {text}")
        else:
            # Try to find chat by name
            await get_recent_messages(client, chat_name=choice)

async def main():
    """Main function"""
    print("\n🤖 Telegram Message Reader")
    print("="*60)
    
    # Check if credentials are set
    if not API_ID or not API_HASH or not PHONE:
        print("\n⚠️  Configuration needed!")
        print("\nTo use this script, you need:")
        print("  1. API_ID from https://my.telegram.org/apps")
        print("  2. API_HASH from https://my.telegram.org/apps")
        print("  3. Your phone number (with country code)")
        print("\nSet them in the script or pass as arguments.")
        return
    
    client = TelegramClient('telegram_reader', API_ID, API_HASH)
    
    try:
        await client.start(phone=PHONE)
        print("✅ Connected to Telegram!")
        
        await interactive_mode(client)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await client.disconnect()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 4:
        API_ID = int(sys.argv[1])
        API_HASH = sys.argv[2]
        PHONE = sys.argv[3]
        
        client = TelegramClient('telegram_reader', API_ID, API_HASH)
        
        async def run():
            await client.start(phone=PHONE)
            print("✅ Connected to Telegram!")
            await interactive_mode(client)
            await client.disconnect()
        
        asyncio.run(run())
    else:
        asyncio.run(main())