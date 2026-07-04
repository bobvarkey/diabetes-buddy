#!/usr/bin/env python3
"""Parse X search results - v3 with better filtering."""
import re
import json
import sqlite3
import datetime

def parse_x_posts(text, query_label):
    lines = text.split('\n')
    posts = []
    
    # Known non-post users/entries
    skip_authors = {
        'Follow', 'Follow back', 'Show more', 'Terms of Service', 'Privacy Policy',
        'Cookie Policy', 'Accessibility', 'Ads info', 'More', 'Top', 'Latest',
        'People', 'Media', 'Lists', 'Search timeline', 'See new posts',
        'Who to follow', 'What\'s happening', 'Trending', 'Today\'s News',
        'Search filters', 'Translated from Spanish', 'Show original',
        'From anyone', 'People you follow', 'Location', 'Anywhere', 'Near you',
        'Advanced search', 'Business & finance', 'Trending', 'News'
    }
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not line or line.isdigit() or len(line) < 2:
            i += 1
            continue
        if line in skip_authors:
            i += 1
            continue
        if line.startswith(('To view', 'View keyboard', '© 20')):
            i += 1
            continue
        if '·' in line and 'Trending in' in line:
            i += 1
            continue
        if line.startswith('http'):
            i += 1
            continue
        if line in ['Quote']:
            i += 1
            continue
        
        # Check if this line is an author (next line is @handle)
        if i + 1 < len(lines):
            next_line = lines[i+1].strip()
            if next_line.startswith('@'):
                # Skip "Who to follow" and sidebar entries
                if line in skip_authors or '(' in line and ')' in line:
                    i += 1
                    continue
                if line in ['Follow', 'Follows you', 'Follow back']:
                    i += 1
                    continue
                
                author = line
                handle = next_line
                
                # Find the · separator and date
                j = i + 2
                while j < len(lines) and lines[j].strip() == '·':
                    j += 1
                
                date_str = ''
                if j < len(lines):
                    date_str = lines[j].strip()
                    j += 1
                
                # Skip "Translated from..." and "Show original"
                while j < len(lines):
                    l = lines[j].strip()
                    if l.startswith('Translated from') or l == 'Show original':
                        j += 1
                    else:
                        break
                
                # Collect text content
                text_lines = []
                k = j
                
                while k < len(lines):
                    l = lines[k].strip()
                    
                    # End conditions
                    if not l:
                        k += 1
                        # Check if next non-empty lines form engagement block
                        continue
                    
                    # Check if this line starts engagement metric block
                    if l.isdigit() and len(l) < 7:
                        # Check if it's followed by more digits/K numbers
                        eng_nums = [l]
                        for m in range(1, 6):
                            if k + m < len(lines):
                                nl = lines[k+m].strip()
                                if nl.isdigit() and len(nl) < 7:
                                    eng_nums.append(nl)
                                elif nl.endswith('K') and nl[:-1].replace(',','').replace('.','').isdigit():
                                    eng_nums.append(nl)
                                else:
                                    break
                            else:
                                break
                        
                        if len(eng_nums) >= 2:
                            # This is definitely an engagement block
                            break
                        else:
                            # Single number - keep as text
                            text_lines.append(l)
                            k += 1
                            continue
                    
                    # Check for next post pattern: this line + @handle on next
                    if k + 1 < len(lines) and lines[k+1].strip().startswith('@'):
                        if l not in ['', 'Quote', 'Show more']:
                            text_lines.append(l)
                        break
                    
                    # Check for "· date" pattern (next post)
                    if k + 2 < len(lines) and lines[k+1].strip() == '·':
                        if l not in ['', 'Quote']:
                            text_lines.append(l)
                        break
                    
                    if l == 'Quote' or l == 'Show more':
                        text_lines.append(l)
                        k += 1
                        continue
                    
                    text_lines.append(l)
                    k += 1
                
                # Extract engagement numbers from k onwards
                eng_numbers = []
                m = k
                while m < len(lines):
                    nl = lines[m].strip()
                    if nl.isdigit() and len(nl) < 7:
                        eng_numbers.append(int(nl))
                    elif nl.endswith('K') and nl[:-1].replace(',','').replace('.','').isdigit():
                        try:
                            val = float(nl[:-1].replace(',', '')) * 1000
                            eng_numbers.append(int(val))
                        except:
                            break
                    elif nl == '':
                        m += 1
                        continue
                    else:
                        break
                    m += 1
                
                # Parse engagement: replies, retweets, likes
                replies = eng_numbers[0] if len(eng_numbers) >= 1 else 0
                retweets = eng_numbers[1] if len(eng_numbers) >= 2 else 0
                likes = eng_numbers[2] if len(eng_numbers) >= 3 else 0
                views = str(eng_numbers[3]) if len(eng_numbers) >= 4 else ''
                
                text_content = '\n'.join(text_lines).strip()
                text_content = re.sub(r'\nShow more$', '', text_content)
                text_content = re.sub(r'\nQuote$', '', text_content)
                
                # Filter out junk posts
                if (len(text_content) > 10 and 
                    author not in skip_authors and
                    'Follow' not in author and
                    'Terms of' not in author and
                    '© 20' not in author and
                    not author.startswith('http') and
                    not text_content.startswith('Terms of')):
                    
                    posts.append({
                        'author': author,
                        'handle': handle,
                        'date': date_str,
                        'text': text_content[:500],
                        'likes': likes if isinstance(likes, int) else 0,
                        'retweets': retweets if isinstance(retweets, int) else 0,
                        'replies': replies if isinstance(replies, int) else 0,
                        'views': views,
                        'query': query_label
                    })
                
                # Advance past engagement block or text end
                if len(eng_numbers) > 0:
                    i = m
                else:
                    i = k + 1
                continue
        
        i += 1
    
    return posts


def main():
    today = datetime.date.today().isoformat()
    
    with open('x_raw_text.txt', 'r') as f:
        text1 = f.read()
    with open('x_raw_text_2.txt', 'r') as f:
        text2 = f.read()
    
    posts1 = parse_x_posts(text1, 'neurointervention/thrombectomy/stroke')
    posts2 = parse_x_posts(text2, 'cerebral AVM/aneurysm/endovascular')
    
    all_posts = posts1 + posts2
    
    # Deduplicate
    seen = set()
    unique_posts = []
    for p in all_posts:
        key = (p['text'][:80], p['handle'])
        if key not in seen:
            seen.add(key)
            unique_posts.append(p)
    
    print(f"\n{'='*70}")
    print(f"QUERY 1: neurointervention/thrombectomy/stroke — {len(posts1)} posts")
    print(f"{'='*70}")
    for p in posts1:
        print(f"\n  📍 {p['author']} {p['handle']} | {p['date']}")
        print(f"     ❤️ {p['likes']} | 🔁 {p['retweets']} | 💬 {p['replies']}")
        preview = p['text'][:150].replace('\n', ' | ')
        print(f"     {preview}...")
    
    print(f"\n{'='*70}")
    print(f"QUERY 2: cerebral AVM/aneurysm/endovascular — {len(posts2)} posts")
    print(f"{'='*70}")
    for p in posts2:
        print(f"\n  📍 {p['author']} {p['handle']} | {p['date']}")
        print(f"     ❤️ {p['likes']} | 🔁 {p['retweets']} | 💬 {p['replies']}")
        preview = p['text'][:150].replace('\n', ' | ')
        print(f"     {preview}...")
    
    # Save to SQLite
    db_path = 'memory_x_posts.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            likes INTEGER DEFAULT 0,
            retweets INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            views TEXT DEFAULT '',
            query TEXT,
            scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(text, handle, date)
        )
    ''')
    
    new_count = 0
    for p in unique_posts:
        try:
            c.execute('''
                INSERT OR IGNORE INTO x_posts (author, handle, date, text, likes, retweets, replies, views, query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (p['author'], p['handle'], p['date'], p['text'], 
                  p['likes'], p['retweets'], p['replies'], str(p['views']), p['query']))
            if c.rowcount > 0:
                new_count += 1
        except Exception as e:
            pass
    
    conn.commit()
    c.execute('SELECT COUNT(*) FROM x_posts')
    total = c.fetchone()[0]
    conn.close()
    
    # High engagement (>=50 likes)
    high_eng = [p for p in unique_posts if p['likes'] >= 50]
    high_eng_sorted = sorted(high_eng, key=lambda x: x['likes'], reverse=True)
    
    print(f"\n\n{'='*70}")
    print(f"📊 SUMMARY")
    print(f"{'='*70}")
    print(f"  Query 1 posts: {len(posts1)}")
    print(f"  Query 2 posts: {len(posts2)}")
    print(f"  New posts saved to DB: {new_count}")
    print(f"  Total posts in DB: {total}")
    
    print(f"\n🏆 HIGH ENGAGEMENT POSTS (≥50 likes): {len(high_eng_sorted)}")
    for p in high_eng_sorted:
        print(f"  #{p['likes']} ❤️ {p['author']} ({p['handle']})")
        print(f"     {p['text'][:100].replace(chr(10), ' ')}...")
    
    # Save JSON
    output = {
        'date': today,
        'query1_label': 'neurointervention/thrombectomy/stroke',
        'query2_label': 'cerebral AVM/aneurysm/endovascular',
        'query1_count': len(posts1),
        'query2_count': len(posts2),
        'new_saved': new_count,
        'total_in_db': total,
        'high_engagement_count': len(high_eng_sorted),
        'high_engagement': [{
            'author': p['author'],
            'handle': p['handle'],
            'date': p['date'],
            'likes': p['likes'],
            'retweets': p['retweets'],
            'text_preview': p['text'][:150]
        } for p in high_eng_sorted],
        'posts': unique_posts
    }
    
    with open('x_scrape_result.json', 'w') as f:
        json.dump(output, f, indent=2, default=str, ensure_ascii=False)
    
    # Generate markdown report
    report = generate_markdown_report(today, posts1, posts2, high_eng_sorted, new_count, total)
    
    # Save markdown
    report_dir = 'knowledge-base/x-scrapes'
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.join(report_dir, f'x-scrape-{today}.md')
    
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"\n📝 Report saved to {report_path}")
    print(f"✅ All done!")
    
    return unique_posts, new_count, total, high_eng_sorted, report


def generate_markdown_report(today, posts1, posts2, high_eng, new_count, total):
    lines = [
        f"# X Scrape Report — {today}",
        f"",
        f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M %Z')}",
        f"**New posts saved:** {new_count} | **Total in DB:** {total}",
        f"",
        f"---",
        f"",
        f"## Query 1: neurointervention / thrombectomy / #stroke",
        f"",
        f"**Posts found: {len(posts1)}**",
        f"",
        f"| Author | Handle | Date | Likes | Text Preview |",
        f"|--------|--------|------|-------|-------------|",
    ]
    
    for p in posts1:
        preview = p['text'][:80].replace('\n', ' ').replace('|', '/')
        author_clean = p['author'].replace('|', '/')
        lines.append(f"| {author_clean} | {p['handle']} | {p['date']} | {p['likes']} | {preview} |")
    
    lines.extend([
        f"",
        f"## Query 2: cerebral AVM / intracranial aneurysm / endovascular",
        f"",
        f"**Posts found: {len(posts2)}**",
        f"",
        f"| Author | Handle | Date | Likes | Text Preview |",
        f"|--------|--------|------|-------|-------------|",
    ])
    
    for p in posts2:
        preview = p['text'][:80].replace('\n', ' ').replace('|', '/')
        author_clean = p['author'].replace('|', '/')
        lines.append(f"| {author_clean} | {p['handle']} | {p['date']} | {p['likes']} | {preview} |")
    
    lines.extend([
        f"",
        f"## 🔥 High Engagement Posts (≥50 Likes)",
        f"",
        f"**Total: {len(high_eng)}**",
        f"",
    ])
    
    for p in high_eng:
        lines.extend([
            f"### ❤️ {p['likes']} — {p['author']} ({p['handle']})",
            f"**Date:** {p['date']} | **Retweets:** {p['retweets']} | **Replies:** {p['replies']}",
            f"",
            f"{p['text'][:300]}",
            f"",
        ])
    
    return '\n'.join(lines)


if __name__ == '__main__':
    import os
    main()
