#!/usr/bin/env python3
"""
Simple Telegram Streaming Bot
Shows typing indicators while processing, then sends message
"""

import asyncio
import requests
from datetime import datetime

# Configuration - UPDATE THIS WITH YOUR FULL BOT TOKEN
BOT_TOKEN = "8501124030:AAHc0eMbOkmzp0DxeCYX-KG6Wkf0bIlSntE"
CHAT_ID = "8201058694"

async def send_typing_action(duration_seconds=3):
    """Send typing indicator to Telegram for specified duration"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendChatAction"
    
    start = datetime.now()
    while (datetime.now() - start).total_seconds() < duration_seconds:
        try:
            requests.post(url, json={
                "chat_id": CHAT_ID,
                "action": "typing"
            })
            print("⌨️ typing...", end="\r", flush=True)
        except Exception as e:
            print(f"Error sending typing: {e}")
        await asyncio.sleep(4)  # Telegram clears typing after 5 seconds

def send_message(text):
    """Send a message to Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    response = requests.post(url, json={
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "HTML"
    })
    return response.json()

async def stream_message(text, typing_duration=3):
    """Stream a message: show typing indicator, then send"""
    print(f"⏳ Streaming: Showing typing for {typing_duration}s...")
    
    # Show typing indicator
    await send_typing_action(typing_duration)
    
    # Send the actual message
    print(f"\n✉️ Sending message...")
    result = send_message(text)
    
    if result.get("ok"):
        print(f"✅ Message sent successfully!")
        return result["result"]["message_id"]
    else:
        print(f"❌ Error: {result}")
        return None

async def interactive_mode():
    """Interactive mode: type messages to stream"""
    print("\n🤖 Telegram Streaming Bot")
    print("=" * 40)
    print("Type your message and press Enter.")
    print("The bot will show 'typing...' then send.")
    print("Type 'quit' to exit.\n")
    
    while True:
        try:
            text = input("📝 Message: ").strip()
            
            if text.lower() == 'quit':
                print("👋 Goodbye!")
                break
            
            if text:
                await stream_message(text, typing_duration=2)
                print()
        
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break

async def demo_mode():
    """Demo: send a few streaming messages"""
    print("\n🎬 Running demo mode...")
    
    messages = [
        "👋 Hello! This is a streaming message.",
        "⏳ Watch the typing indicator...",
        "✅ Messages arrive after typing stops!",
    ]
    
    for msg in messages:
        await stream_message(msg, typing_duration=2)
        await asyncio.sleep(1)
    
    print("\n✅ Demo complete!")

def send_now(text):
    """Send a message immediately without streaming"""
    result = send_message(text)
    if result.get("ok"):
        print(f"✅ Sent: {text[:50]}...")
        return result["result"]["message_id"]
    else:
        print(f"❌ Error: {result}")
        return None

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--demo":
            # Run demo mode
            asyncio.run(demo_mode())
        elif sys.argv[1] == "--send" and len(sys.argv) > 2:
            # Send message directly
            message = " ".join(sys.argv[2:])
            send_now(message)
        else:
            print("Usage:")
            print("  python3 telegram_streaming_simple.py           # Interactive mode")
            print("  python3 telegram_streaming_simple.py --demo    # Demo mode")
            print("  python3 telegram_streaming_simple.py --send <message>")
    else:
        # Run interactive mode
        asyncio.run(interactive_mode())