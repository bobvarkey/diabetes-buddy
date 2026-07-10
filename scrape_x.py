#!/usr/bin/env python3
"""
Complete X/Twitter scraper using browser CLI
"""
import subprocess
import json
import time
import os
import sys
from datetime import datetime

# Add workspace to path
sys.path.insert(0, '/Users/bobvarkey/.openclaw/workspace')
from parse_x_aria import parse_aria_snapshot, save_to_sqlite, append_markdown_report

def run_browser_command(cmd):
    """Run browser CLI command and return output"""
    full_cmd = f"openclaw browser {cmd}"
    result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True)
    return result.stdout

def focus_tab(tab_name):
    """Focus a browser tab by name"""
    print(f"Focusing tab: {tab_name}")
    run_browser_command(f"focus {tab_name}")

def get_snapshot(limit=1000):
    """Get aria snapshot of current page"""
    print(f"Capturing aria snapshot (limit: {limit})...")
    output = run_browser_command(f"snapshot --format aria --limit {limit}")
    return output

def scroll_down():
    """Scroll down to load more posts"""
    print("Scrolling down...")
    run_browser_command("press End")
    time.sleep(2)  # Wait for content to load

def scrape_search_query(query_label, url, tab_name, db_path, report_path):
    """Scrape a search query"""
    print(f"\n{'='*60}")
    print(f"Scraping: {query_label}")
    print(f"URL: {url}")
    print(f"{'='*60}\n")
    
    # Focus the tab
    focus_tab(tab_name)
    time.sleep(2)
    
    all_posts = []
    scroll_count = 0
    max_scrolls = 3  # Limit scrolls to avoid rate limits
    
    while scroll_count < max_scrolls:
        # Get snapshot
        snapshot = get_snapshot(limit=2000)
        
        # Parse posts
        posts = parse_aria_snapshot(snapshot, query_label)
        print(f"Found {len(posts)} posts in snapshot")
        
        all_posts.extend(posts)
        
        # Scroll for more
        scroll_down()
        scroll_count += 1
        time.sleep(3)  # Be gentle
    
    # Remove duplicates based on handle + text
    seen = set()
    unique_posts = []
    for post in all_posts:
        key = (post['handle'], post['text'][:100])
        if key not in seen:
            seen.add(key)
            unique_posts.append(post)
    
    print(f"\nTotal unique posts found: {len(unique_posts)}")
    
    # Save to database
    if unique_posts:
        print(f"Saving to database: {db_path}")
        inserted, duplicates = save_to_sqlite(unique_posts, db_path)
        print(f"Inserted: {inserted}, Duplicates: {duplicates}")
        
        # Append to markdown report
        print(f"Appending to report: {report_path}")
        append_markdown_report(unique_posts, report_path, query_label)
    
    return unique_posts

def main():
    # Paths
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
    
    # Create report directory
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    # Initialize report file
    if not os.path.exists(report_path):
        with open(report_path, 'w') as f:
            f.write(f"# X/Twitter Scrapes\n\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Search queries with their tab names
    queries = [
        {
            'label': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke',
            'url': 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today',
            'tab': 'neurointervention-stroke-search'
        },
        {
            'label': 'cerebral AVM OR intracranial aneurysm OR endovascular',
            'url': 'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today',
            'tab': 't97'  # From earlier tab listing
        }
    ]
    
    total_posts = 0
    total_high_engagement = 0
    
    for query in queries:
        posts = scrape_search_query(
            query['label'],
            query['url'],
            query['tab'],
            db_path,
            report_path
        )
        
        total_posts += len(posts)
        total_high_engagement += sum(1 for p in posts if p['likes'] > 50)
    
    print(f"\n{'='*60}")
    print(f"SCRAPING COMPLETE")
    print(f"{'='*60}")
    print(f"Total posts found: {total_posts}")
    print(f"High-engagement posts (>50 likes): {total_high_engagement}")
    print(f"Database: {db_path}")
    print(f"Report: {report_path}")
    print(f"{'='*60}\n")
    
    # Send notification
    message = f"✅ X/Twitter Scrape Complete\n\n"
    message += f"📊 Total posts: {total_posts}\n"
    message += f"🔥 High-engagement (>50 likes): {total_high_engagement}\n"
    message += f"📁 Database: memory_x_posts.db\n"
    message += f"📝 Report: x-scrape-2026-05-22.md"
    
    print(message)

if __name__ == '__main__':
    main()