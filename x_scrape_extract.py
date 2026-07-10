#!/usr/bin/env python3
import sqlite3
import json
import os
from datetime import datetime

# Posts extracted from X/Twitter searches
# Search 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke
# Search 2: cerebral AVM OR intracranial aneurysm OR endovascular

posts_data = [
    # From neurointervention/stroke search
    {
        "id": "2073511013022843388",
        "author": "SVIN",
        "handle": "@svinsociety",
        "date": "2026-07-05",
        "text": "Happy Independence Day from SVIN! As we celebrate Independence Day, we also recognize the dedication of the clinicians, researchers, and partners who work tirelessly to advance stroke care and improve patient outcomes every day. Wishing our community a safe and happy Fourth of",
        "replies": "0",
        "reposts": "8",
        "likes": "14",
        "bookmarks": "0",
        "views": "585",
        "url": "https://x.com/svinsociety/status/2073511013022843388",
        "search_query": "neurointervention stroke"
    },
    {
        "id": "1661885380415635456",
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2023-05-26",
        "text": "The results of this large international case-control study suggest that individual and cumulative symptoms of sleep disturbance may be important modifiable risk factors of #stroke. Learn more: bit.ly/3IEULBU #CME: Read the article then click \"CME Course\" tab to begin.",
        "replies": "1",
        "reposts": "26",
        "likes": "70",
        "bookmarks": "13",
        "views": "11597",
        "url": "https://x.com/GreenJournal/status/1661885380415635456",
        "search_query": "neurointervention stroke"
    },
    {
        "id": "2074472557420355651",
        "author": "Robert Kalyesubula,MD, FISN(USA), PhD-FRCP(London)",
        "handle": "@rkalyes1",
        "date": "2026-07-08",
        "text": "Dear Surgeons, How often do you use Tranexamic acid for non-cardiac surgeries to reduce the need for blood transfusion? Hospital Policy of Tranexamic Acid to Reduce Transfusion in Major Noncardiac Surgery | New England Journal of Medicine nejm.org/doi/full/10.10...",
        "replies": "0",
        "reposts": "0",
        "likes": "40",
        "bookmarks": "0",
        "views": "2799",
        "url": "https://x.com/rkalyes1/status/2074472557420355651",
        "search_query": "neurointervention stroke"
    },
    {
        "id": "1769210321384755427",
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2024-03-17",
        "text": "Study data suggest secondary stroke prevention with #statins in patients with ischemic stroke or transient ischemic attack & cerebral microbleeds is associated with reduction of stroke & ischemic #stroke without increased risk of intracranial hemorrhage: bit.ly/4af2VfG",
        "replies": "1",
        "reposts": "9",
        "likes": "64",
        "bookmarks": "13",
        "views": "6852",
        "url": "https://x.com/GreenJournal/status/1769210321384755427",
        "search_query": "neurointervention stroke"
    },
    {
        "id": "1751308208252355033",
        "author": "Jessica Campos, MD",
        "handle": "@DrJessicaCampos",
        "date": "2024-01-27",
        "text": "The day started w aspiration vs stent retriever thrombectomy by Dr. Tyler Cole — highlighting the benefits of stent retriever for PCA occlusions, combination techniques for termination occlusions, & likely similar results in MCA/ICA occlusions. #neurosurgery #neurointervention",
        "replies": "0",
        "reposts": "2",
        "likes": "15",
        "bookmarks": "0",
        "views": "2584",
        "url": "https://x.com/DrJessicaCampos/status/1751308208252355033",
        "search_query": "neurointervention stroke"
    },
    # From AVM/aneurysm/endovascular search
    {
        "id": "1871925639206306170",
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2024-12-25",
        "text": "Association Between Time to Treatment and Outcomes of Endovascular Therapy vs Medical Management in Patients With Large Ischemic Stroke: bit.ly/3ZE1UKr #NeuroTwitter #NeuroX",
        "replies": "1",
        "reposts": "5",
        "likes": "12",
        "bookmarks": "3",
        "views": "2961",
        "url": "https://x.com/GreenJournal/status/1871925639206306170",
        "search_query": "avm aneurysm endovascular"
    },
    {
        "id": "2071466781127135541",
        "author": "Endovascular Expert",
        "handle": "@EndovascularEx",
        "date": "2026-06-29",
        "text": "When a doctor chooses a specialist for his own treatment, trust speaks for itself. Watch Dr. Rajesh Acharya share his personal experience after Advanced Laser Treatment for Varicose Veins. RGHS | CGHS | Railway | ESIC +91 9782415566 #VaricoseVeins #LaserTreatment #Jaipur",
        "replies": "0",
        "reposts": "0",
        "likes": "1",
        "bookmarks": "0",
        "views": "60",
        "url": "https://x.com/EndovascularEx/status/2071466781127135541",
        "search_query": "avm aneurysm endovascular"
    },
    {
        "id": "2073146134957056413",
        "author": "Whitfield Lewis, MD 🇦🇬 🇺🇸",
        "handle": "@whitfieldlewis6",
        "date": "2026-07-04",
        "text": "This is a CT scan of the brain, axial view. This is a patient who presented with a 1-day history of stroke-like symptoms. What vascular distribution is affected here? What are the symptoms and signs typically for this type of stroke? Why? #FOAMed",
        "replies": "4",
        "reposts": "9",
        "likes": "46",
        "bookmarks": "11",
        "views": "4329",
        "url": "https://x.com/whitfieldlewis6/status/2073146134957056413",
        "search_query": "avm aneurysm endovascular"
    },
    {
        "id": "2073160690878321115",
        "author": "Medical Sphere",
        "handle": "@MedicalSphereAI",
        "date": "2026-07-04",
        "text": "All models agree the CT is most consistent with an ACA territory infarct involving the medial frontal/parietal parasagittal cortex, with an acute/subacute ischemic appearance and the classic expectation of contralateral leg-predominant weakness/sensory loss plus possible abulia",
        "replies": "0",
        "reposts": "0",
        "likes": "1",
        "bookmarks": "1",
        "views": "257",
        "url": "https://x.com/MedicalSphereAI/status/2073160690878321115",
        "search_query": "avm aneurysm endovascular"
    },
]

def parse_metric(metric_str):
    """Convert metric string like '1.2K' or '4.3K' to integer"""
    if not metric_str:
        return 0
    metric_str = str(metric_str).replace(',', '').strip()
    try:
        if 'K' in metric_str.upper():
            return int(float(metric_str.upper().replace('K', '')) * 1000)
        elif 'M' in metric_str.upper():
            return int(float(metric_str.upper().replace('M', '')) * 1000000)
        else:
            return int(float(metric_str))
    except:
        return 0

def save_posts(posts, db_path):
    """Save posts to database"""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    new_count = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts
                (author_name, handle, datetime, text, url, replies, reposts, likes, bookmarks, views, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['url'],
                post['replies'],
                post['reposts'],
                post['likes'],
                post.get('bookmarks', '0'),
                post['views'],
                post['search_query']
            ))
            if cursor.rowcount > 0:
                new_count += 1
        except Exception as e:
            print(f"Error inserting post {post['id']}: {e}")

    conn.commit()
    conn.close()
    return new_count

def generate_markdown_report(posts, output_path):
    """Generate markdown report"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Sort by likes (high engagement first)
    sorted_posts = sorted(posts, key=lambda x: parse_metric(x['likes']), reverse=True)

    with open(output_path, 'w') as f:
        f.write("# X/Twitter Neurointervention Scrape Report\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write(f"**Posts Found:** {len(posts)}\n\n")
        f.write("---\n\n")

        # Summary
        f.write("## Summary\n\n")
        high_engagement = [p for p in posts if parse_metric(p['likes']) >= 50]
        f.write(f"- Total posts scraped: **{len(posts)}**\n")
        f.write(f"- High-engagement posts (≥50 likes): **{len(high_engagement)}**\n\n")

        if high_engagement:
            f.write("### High-Engagement Posts\n\n")
            for post in sorted(high_engagement, key=lambda x: parse_metric(x['likes']), reverse=True):
                likes = parse_metric(post['likes'])
                views = parse_metric(post['views'])
                f.write(f"**{post['author']}** ({post['handle']}) - {likes} likes, {views} views\n\n")
                f.write(f"> {post['text'][:200]}{'...' if len(post['text']) > 200 else ''}\n\n")
                f.write(f"[View post]({post['url']})\n\n---\n\n")

        # All posts
        f.write("## All Posts\n\n")
        f.write(f"### Search 1: Neurointervention/Stroke\n\n")
        neuro_posts = [p for p in sorted_posts if p['search_query'] == 'neurointervention stroke']
        for post in neuro_posts:
            f.write(f"#### {post['author']} ({post['handle']})\n\n")
            f.write(f"**Date:** {post['date']}\n\n")
            f.write(f"**Text:** {post['text']}\n\n")
            f.write(f"**Metrics:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views\n\n")
            f.write(f"**URL:** {post['url']}\n\n---\n\n")

        f.write(f"### Search 2: AVM/Aneurysm/Endovascular\n\n")
        avm_posts = [p for p in sorted_posts if p['search_query'] == 'avm aneurysm endovascular']
        for post in avm_posts:
            f.write(f"#### {post['author']} ({post['handle']})\n\n")
            f.write(f"**Date:** {post['date']}\n\n")
            f.write(f"**Text:** {post['text']}\n\n")
            f.write(f"**Metrics:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views\n\n")
            f.write(f"**URL:** {post['url']}\n\n---\n\n")

if __name__ == "__main__":
    db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
    report_path = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"

    # Save to database
    new_count = save_posts(posts_data, db_path)
    print(f"Saved {new_count} new posts to database")

    # Generate markdown report
    generate_markdown_report(posts_data, report_path)
    print(f"Generated markdown report at {report_path}")

    # Summary
    high_engagement = [p for p in posts_data if parse_metric(p['likes']) >= 50]
    print(f"\n=== SUMMARY ===")
    print(f"Total posts found: {len(posts_data)}")
    print(f"New posts saved: {new_count}")
    print(f"High-engagement posts (≥50 likes): {len(high_engagement)}")

    if high_engagement:
        print("\nHigh-engagement posts:")
        for post in sorted(high_engagement, key=lambda x: parse_metric(x['likes']), reverse=True):
            print(f"  - {post['author']}: {post['likes']} likes - {post['text'][:60]}...")