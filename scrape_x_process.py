#!/usr/bin/env python3
import sqlite3
import json
import os
from datetime import datetime

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_DIR = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
REPORT_PATH = os.path.join(REPORT_DIR, "x-scrape-2026-05-22.md")

# Posts collected from browser scraping on 2026-09-01 (local Calcutta)
POSTS = [
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Anjan Gupta", "handle": "ACSCardiology", "date": "2026-08-29T15:43:05.000Z", "text": "Stent-retriever thrombectomy followed by conventional PCI in patients with large thrombus burden undergoing primary PCI ≤8 hours of symptom onset was associated with reduced infarct size versus conventional PCI alone.", "url": "https://x.com/ACSCardiology/status/2093726139973816747", "likes": 0, "replies": 0, "retweets": 0, "views": 23},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Xendela", "handle": "toshihiko_KMR", "date": "2026-08-29T09:33:14.000Z", "text": "やりすぎ血栓回収？――『血栓が取れる』と『患者が助かる』は別だった https://xendela.info/2026/08/MTEVT.html?spref=tw… Endovascular thrombectomy for acute ischemic stroke: evolving patient selection, procedural strategies, and adjunctive therapies 再開通成功と機能予後改善のあいだにある“大きな溝”。", "url": "https://x.com/toshihiko_KMR/status/2093633060172652699", "likes": 0, "replies": 0, "retweets": 0, "views": 23},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Whitfield Lewis, MD", "handle": "whitfieldlewis6", "date": "2026-08-31T10:22:58.000Z", "text": "The NIHSS is the score we use to gauge the severity of an acute stroke. The score ranges from 0 to 42, with 0 typically conveying a normal neurologic exam and 42 representing the other end of the spectrum, a devastating stroke with profound neurologic deficits. Most patients", "url": "https://x.com/whitfieldlewis6/status/2094370355066343772", "likes": 30, "replies": 3, "retweets": 0, "views": 3425},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Filippo Farina", "handle": "Farippo84", "date": "2026-08-31T11:10:34.000Z", "text": "My opinion is that the problem isn't so much documenting a non-immediately disabling deficit, but rather accepting not to treat a patient with intracranial occlusion. We know that these patients tend to deteriorate over time with catastrophic consequences.", "url": "https://x.com/Farippo84/status/2094382332006351236", "likes": 2, "replies": 1, "retweets": 0, "views": 67},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Whitfield Lewis, MD", "handle": "whitfieldlewis6", "date": "2026-08-31T11:29:38.000Z", "text": "Many of them don’t but I’ve seen at least two that did deteriorate significantly. Those two parents obviously would have benefited from an initial thrombectomy. Hopefully the ENDOLOW is positive. I actually think a thrombectomy may be less risky than TNK in terms of risks", "url": "https://x.com/whitfieldlewis6/status/2094387131586134487", "likes": 0, "replies": 0, "retweets": 0, "views": 54},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Oleg", "handle": "Oleg127756", "date": "2026-08-26T15:40:58.000Z", "text": "@elonmusk I had an MCA stroke in February this year. I’m fighting every day to walk again and regain my independence. My wife has been by my side through it all. I dream of returning to work and, one day, driving a Cybertruck. #Stroke #StrokeRecovery #Cybertruck", "url": "https://x.com/Oleg127756/status/2092638441435541605", "likes": 2, "replies": 0, "retweets": 0, "views": 158},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "ChatGPT", "handle": "ChatGPT", "date": "2026-08-28T19:44:32.000Z", "text": "Give ChatGPT Work one good example, and let it cook. Mention @ Template Creator in Work on desktop or web, then upload a file or share a link to: Word docs, Excel spreadsheets, and PowerPoint presentations, Google Docs, Sheets, and Slides, PDFs and other reference files", "url": "https://x.com/ChatGPT/status/2093424514726285341", "likes": 2020, "replies": 98, "retweets": 0, "views": 217136},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "YW8INTHEQ", "handle": "YW8INTHEQ_", "date": "2026-08-31T06:58:07.000Z", "text": "For those whom suffered a stroke or caring for someone whom suffered a stroke ! I hope this helps Helps with aphasia as a tool using @ChatGPT #chatgpt #stroke #strokesurvivor #viral #help #strokeawareness", "url": "https://x.com/YW8INTHEQ_/status/2094318803081695313", "likes": 0, "replies": 0, "retweets": 0, "views": 42},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Neurology Journal", "handle": "GreenJournal", "date": "2025-05-04T19:05:46.000Z", "text": "Endovascular Thrombectomy in Large Ischemic Core Strokes: Pushing the Limits https://hubs.la/Q03kXDtt0 #NeuroX", "url": "https://x.com/GreenJournal/status/1919106195769409621", "likes": 25, "replies": 1, "retweets": 0, "views": 2905},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Diagnostic Imaging", "handle": "Dx_imaging", "date": "2026-08-28T23:00:02.000Z", "text": "How #AI Enabled #EnterpriseImaging is Improving the Quality and Access to Timely Care for Patients with Acute #Stroke https://diagnosticimaging.com/view/ai-enabled-enterprise-imaging-quality-access-timely-care-acute-stroke… @RadiologyACR @ARRS_Radiology @RSNA @RapidAI @TheASNR #radiology #RadRes", "url": "https://x.com/Dx_imaging/status/2093473711689244832", "likes": 0, "replies": 0, "retweets": 0, "views": 418},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "sumitsonu", "handle": "drsumitsonu", "date": "2026-08-28T02:11:39.000Z", "text": "How a Neurointerventionist Looks at CTA Before Thrombectomy https://drsumitsonu.substack.com/p/how-a-neurointerventionist-looks?r=90agss&utm_campaign=post&utm_medium=email…", "url": "https://x.com/drsumitsonu/status/2093159545275293802", "likes": 0, "replies": 0, "retweets": 0, "views": 1},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Neurology Journal", "handle": "GreenJournal", "date": "2026-08-05T19:09:32.000Z", "text": "This review examines the current literature on a new wave of adjunctive and multiple thrombolytic dosing strategies for both intravenous thrombolysis (IVT) alone and IVT combined with endovascular thrombectomy for acute ischemic stroke: https://hubs.la/Q04rgfvq0", "url": "https://x.com/GreenJournal/status/2085080785736946007", "likes": 33, "replies": 0, "retweets": 0, "views": 3891},
    {"query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", "author": "Jay Mohan, D.O., FACC, FSCAI, FASE, RPVI", "handle": "DrJayMohan", "date": "2022-11-11T17:08:40.000Z", "text": "1/ For the fellows and #ACCEarlyCareer! It’s a coronary thrombus! When to consider thrombectomy? What do you do? Let’s walk through this…#Tweetorial #Cardiotwitter #Cardiology #STEMI", "url": "https://x.com/DrJayMohan/status/1591115708125310976", "likes": 464, "replies": 21, "retweets": 0, "views": 0},
    {"query": "cerebral AVM OR intracranial aneurysm OR endovascular", "author": "Dr.Marlon Villanueva™ 𝕏", "handle": "MarlonVFZR", "date": "2026-08-26T17:56:06.000Z", "text": "", "url": "https://x.com/MarlonVFZR/status/2092672450395865156", "likes": 0, "replies": 0, "retweets": 0, "views": 408},
    {"query": "cerebral AVM OR intracranial aneurysm OR endovascular", "author": "SREEVATSA NADIG DM FSCAI FESC", "handle": "nadig_cardio", "date": "2026-08-24T05:33:34.000Z", "text": "Typically, #RadialFirst is considered very safe, and severe or fatal vascular complications are fortunately rare. #cardiotwitter Radial artery occlusion and forearm haematomas are usually benign. However, bleeding from the subclavian artery or its branches can be easily missed.", "url": "https://x.com/nadig_cardio/status/2091760806950302054", "likes": 41, "replies": 1, "retweets": 0, "views": 8193},
    {"query": "cerebral AVM OR intracranial aneurysm OR endovascular", "author": "Endovascular Today", "handle": "EVToday", "date": "2026-08-24T21:11:19.000Z", "text": "IceCure’s ProSense Cryoablation System to Be Distributed by Scovas Medical in the Netherlands | @IceCureMedical", "url": "https://x.com/EVToday/status/2091996801968541906", "likes": 0, "replies": 0, "retweets": 0, "views": 528},
    {"query": "cerebral AVM OR intracranial aneurysm OR endovascular", "author": "XRP Ledger Announces", "handle": "XRPL__A", "date": "2025-05-17T08:52:57.000Z", "text": "An unusual phenomenon, noticed after flow diverter placement for unruptured aneurysms- new onset headache. Some of~ our patients had, but I did not have an explanation for it until this paper-[ Cephalgia following Flow Diversion of Unruptured Intracranial Aneurysms. World", "url": "https://x.com/XRPL__A/status/1923663013703242043", "likes": 41, "replies": 1, "retweets": 0, "views": 2615},
]

def init_db(conn):
    cur = conn.cursor()
    # posts table already exists in memory_x_posts.db; ensure runs table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_at TEXT,
            query TEXT,
            new_posts INTEGER,
            total_posts INTEGER
        )
    """)
    conn.commit()

def save_posts(conn, posts):
    cur = conn.cursor()
    new_count = 0
    total_count = len(posts)
    for p in posts:
        try:
            cur.execute("""
                INSERT INTO posts (url, query, author_name, handle, date, text, likes, replies, retweets, views, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (p["url"], p["query"], p["author"], p["handle"], p["date"], p["text"],
                  p.get("likes", 0), p.get("replies", 0), p.get("retweets", 0), p.get("views", 0),
                  datetime.utcnow().isoformat()))
            new_count += 1
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    return new_count, total_count

def append_report(posts, new_count, total_count):
    os.makedirs(REPORT_DIR, exist_ok=True)
    run_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"\n## X Scrape Run — {run_time}\n",
        f"**Queries:** neurointervention/thrombectomy/stroke; cerebral AVM/aneurysm/endovascular\n",
        f"**New posts inserted:** {new_count}\n",
        f"**Total posts examined:** {total_count}\n\n",
        "### Posts\n",
        "| Author | Handle | Date | Likes | Replies | Views | URL | Text |\n",
        "|--------|--------|------|-------|---------|-------|-----|------|\n",
    ]
    for p in posts:
        text = p["text"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {p['author']} | @{p['handle']} | {p['date'][:10]} | {p.get('likes',0)} | {p.get('replies',0)} | {p.get('views',0)} | {p['url']} | {text} |\n")
    lines.append("\n### High-engagement posts (>50 likes)\n\n")
    high = [p for p in posts if p.get("likes", 0) > 50]
    if high:
        for p in high:
            text = p["text"].replace("\n", " ")
            lines.append(f"- **{p['author']}** (@{p['handle']}) — {p.get('likes',0)} likes, {p.get('replies',0)} replies, {p.get('views',0)} views\n  {text[:200]}{'...' if len(text)>200 else ''}\n  {p['url']}\n")
    else:
        lines.append("_None found this run._\n")
    lines.append("\n---\n")
    with open(REPORT_PATH, "a", encoding="utf-8") as f:
        f.writelines(lines)

def main():
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    new_count, total_count = save_posts(conn, POSTS)
    append_report(POSTS, new_count, total_count)
    conn.close()
    print(json.dumps({
        "new_posts": new_count,
        "total_examined": total_count,
        "high_engagement": [p["url"] for p in POSTS if p.get("likes", 0) > 50]
    }))

if __name__ == "__main__":
    main()
