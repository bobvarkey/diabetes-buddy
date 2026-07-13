#!/usr/bin/env python3
import sqlite3
import json
from datetime import datetime

# All collected posts from the searches
neurointervention_posts = [
    {"author":"Neurology Journal","handle":"","text":"Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: https://hubs.la/Q04l5L0Q0 \n#Stroke","url":"https://x.com/GreenJournal/status/2065190115090042937","datetime":"2026-06-11T21:51:07.000Z","timeText":"Jun 12","replies":"2 Replies. Reply","reposts":"6 reposts. Repost","likes":"23 Likes. Like","views":""},
    {"author":"Derrick Torres (DTwizzle)","handle":"","text":"Update on my mother Lenore \nMom is currently in the hospital awaiting test results to check for fluid on her lungs. If clear, she should be discharged soon.\nThis has all been very sudden for us. She was recently diagnosed with AFib (atrial fibrillation), and just last week she","url":"https://x.com/DTwizzle17/status/2076015253440053609","datetime":"2026-07-11T18:46:21.000Z","timeText":"5h","replies":"0 Replies. Reply","reposts":"0 reposts. Repost","likes":"1 Like. Like","views":""},
    {"author":"David Kirk","handle":"","text":"\nMy father had afib which later progressed into copd. I wish I knew half of what I know today about health and wellness while he was still alive. \n\nI recommend staying as far away from the medical industrial complex as possible.","url":"https://x.com/DavidDKirk/status/2076096441865621581","datetime":"2026-07-12T00:08:58.000Z","timeText":"24m","replies":"1 Reply. Reply","reposts":"0 reposts. Repost","likes":"0 Likes. Like","views":""},
    {"author":"David Kirk","handle":"","text":"They will likely prescribe blood thinners for reduced risk of stroke (it's literally poison.)","url":"https://x.com/DavidDKirk/status/2076096568080671120","datetime":"2026-07-12T00:09:28.000Z","timeText":"24m","replies":"1 Reply. Reply","reposts":"0 reposts. Repost","likes":"0 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"Neurology Podcast: Drs. Dan Ackerman & Luciano Sposato discuss the topic of embolic #stroke of undetermined source & the controversies surrounding cardiac monitoring & anticoagulation. Listen now: https://bit.ly/3SNKTep\nArticle: https://bit.ly/3yFykeb \n@SposatoL @DrDanAckerman","url":"https://x.com/GreenJournal/status/1823455255310295316","datetime":"2024-08-13T20:23:05.000Z","timeText":"Aug 14, 2024","replies":"1 Reply. Reply","reposts":"8 reposts. Repost","likes":"22 Likes. Like","views":""},
    {"author":"✰darryn (minionpilled)","handle":"","text":"Boss makes a dollar you make a dime and that's why you #stroke on company time","url":"https://x.com/darrynlol/status/2074542388727382236","datetime":"2026-07-07T17:13:43.000Z","timeText":"Jul 7","replies":"1 Reply. Reply","reposts":"0 reposts. Repost","likes":"2 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"This study found that the HERMES-24 score was highly predictive of 90-day outcome among patients with #stroke due to large vessel occlusion and small ischemic core for those presenting in the late time window, irrespective of intervention: https://hubs.la/Q03DdQhP0","url":"https://x.com/GreenJournal/status/1958154140586033470","datetime":"2025-08-20T13:08:22.000Z","timeText":"Aug 20, 2025","replies":"2 Replies. Reply","reposts":"9 reposts. Repost","likes":"30 Likes. Like","views":""},
    {"author":"Peter A. McCullough, MD, MPH®","handle":"","text":"Katie Couric: Vaccine Evangelist, Breast Cancer, and a Brain That Forgot\n\nTragedy of COVID-19 vaccination playing out in public figures as audiences connect the dots @McCulloughFund https://open.substack.com/pub/petermcculloughmd/p/katie-couric-vaccine-evangelist-breast?r=14jb45&utm_campaign=post-expanded-share&utm_medium=web…","url":"https://x.com/P_McCulloughMD/status/2075861379827781915","datetime":"2026-07-11T08:34:55.000Z","timeText":"15h","replies":"8 Replies. Reply","reposts":"48 reposts. Repost","likes":"152 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"Endovascular Thrombectomy for Large Ischemic Core Stroke: A Systematic Review and Meta-Analysis of Randomized Controlled Trials\nhttps://hubs.la/Q03kXKJv0","url":"https://x.com/GreenJournal/status/1919394130108559480","datetime":"2025-05-05T14:09:55.000Z","timeText":"May 5, 2025","replies":"2 Replies. Reply","reposts":"14 reposts. Repost","likes":"32 Likes. Like","views":""},
    {"author":"XRP Ledger Announces","handle":"","text":"LIST (Local intra-sinus thrombolysis) in Cerebral venous thrombosis - Due to a rock hard clot, aspiration thrombectomy was unsuccessful and IA 36 hour infusion of 1mg/hour tPA resulted in partial recanalisation","url":"https://x.com/XRPL__A/status/1644569777942454274","datetime":"2023-04-08T05:16:04.000Z","timeText":"Apr 8, 2023","replies":"2 Replies. Reply","reposts":"7 reposts. Repost","likes":"39 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"This study assessed duration of benefit and risk of clopidogrel-aspirin in patients with mild ischemic #stroke or transient ischemic attack. Learn more: https://bit.ly/3TAaLe8","url":"https://x.com/GreenJournal/status/1837975935179518145","datetime":"2024-09-22T22:03:05.000Z","timeText":"Sep 23, 2024","replies":"1 Reply. Reply","reposts":"10 reposts. Repost","likes":"30 Likes. Like","views":""},
    {"author":"XRP Ledger Announces","handle":"","text":"A game changer in chronic subdural hematoma?\n\n New Era in cSDH Treatment: Trans-vascular MMAe + Drainage in One Step\n\n A breakthrough tech allows Middle Meningeal Artery embolization (MMAe) and subdural hematoma (cSDH) drainage in a single endovascular procedure.\n\nHere's","url":"https://x.com/XRPL__A/status/1921917508380237978","datetime":"2025-05-12T13:16:56.000Z","timeText":"May 12, 2025","replies":"1 Reply. Reply","reposts":"8 reposts. Repost","likes":"52 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"Distinguishing Distinct Neural Systems for Proximal vs Distal Upper Extremity Motor Control After Acute #Stroke: https://bit.ly/3OwAemu\n\n#NeuroTwitter","url":"https://x.com/GreenJournal/status/1684742407466754048","datetime":"2023-07-28T01:47:45.000Z","timeText":"Jul 28, 2023","replies":"0 Replies. Reply","reposts":"8 reposts. Repost","likes":"37 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"This study investigates the pathway-specific correspondence between structural and functional changes resulting from focal subcortical #stroke and their causal influence on clinical symptoms. Read the article: http://bit.ly/3JW8dmt\n\n#NeuroTwitter #Neurology","url":"https://x.com/GreenJournal/status/1625073316909182976","datetime":"2023-02-13T10:04:05.000Z","timeText":"Feb 13, 2023","replies":"0 Replies. Reply","reposts":"6 reposts. Repost","likes":"17 Likes. Like","views":""},
    {"author":"Barry King","handle":"","text":"Any Day Now @realDonaldTrump will Be #Hospitalized In #WalterReed For A #Stroke","url":"https://x.com/ardribarre/status/2075367536183353742","datetime":"2026-07-09T23:52:33.000Z","timeText":"Jul 10","replies":"1 Reply. Reply","reposts":"2 reposts. Repost","likes":"1 Like. Like","views":""},
    {"author":"UFO Phenom Has Religious Foundation","handle":"","text":"Most transparent White House EVER 4got mention to Americans Trump suffered at least 2 strokes becoz both live on camera\n\nGod knows how many mini strokes hes suffered. With each sinks further in dementia & dilusions of grandeur.\n\n#Stroke #WhiteHouse Ballroom Arch Kennedy Center","url":"https://x.com/SignsTimesRNow/status/2075411967272276146","datetime":"2026-07-10T02:49:06.000Z","timeText":"Jul 10","replies":"0 Replies. Reply","reposts":"0 reposts. Repost","likes":"0 Likes. Like","views":""},
]

avm_posts = [
    {"author":"Behindwoods","handle":"","text":"Angiography மூலம் உயிரைக் காப்பாற்றும் சிகிச்சை..\n\nDr. Babu Ezhumalai is a Senior Interventional Cardiologist at MGM Healthcare, Nelson Manickam Road, Chennai, specializing in Complex High-Risk (CHIP) angioplasty , structural heart interventions, leadless pacemaker","url":"https://x.com/behindwoods/status/2075513201454968964","datetime":"2026-07-10T09:31:23.000Z","timeText":"Jul 10","replies":"0 Replies. Reply","reposts":"0 reposts. Repost","likes":"2 Likes. Like","views":""},
    {"author":"Vineeth Jaison","handle":"","text":"Endovascular Mechanical Thrombectomy for a young adult within 2 hours of occlusion - TICI 3 achieved patient improved from GCS improved from E2M2Vt to E4V4M6 within 24 hours @pb10_bmt @preethijaison #cmcludhiana Post EVT video #neurointervention","url":"https://x.com/JaisonVineeth/status/1066664837932097536","datetime":"2018-11-25T12:08:09.000Z","timeText":"Nov 25, 2018","replies":"3 Replies. Reply","reposts":"10 reposts. Repost","likes":"13 Likes. Like","views":""},
    {"author":"Texas Endovascular","handle":"","text":"\"She told us we gave her life back.\"\n\nOne patient came to us with #fibroids so severe she needed a blood transfusion every month. \n\nAfter #UFE, she was back to work in about 10 days and no longer dealing with anemia, heavy bleeding, or transfusions.\n\nhttps://texaseva.com/fibroids/?utm_source=Social&utm_medium=post&utm_campaign=UFE…","url":"https://x.com/TXEndovascular/status/2074158531477946541","datetime":"2026-07-06T15:48:24.000Z","timeText":"Jul 6","replies":"0 Replies. Reply","reposts":"0 reposts. Repost","likes":"0 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"Endovascular Treatment in Acute Ischemic Stroke Due to Occlusion of Medium or Distal Vessels: A Systematic Review and Meta-Analysis\nhttps://hubs.ly/Q03GgWhH0","url":"https://x.com/GreenJournal/status/1961791252703138228","datetime":"2025-08-30T14:00:57.000Z","timeText":"Aug 30, 2025","replies":"0 Replies. Reply","reposts":"17 reposts. Repost","likes":"46 Likes. Like","views":""},
    {"author":"Godavari vascular and chest Center","handle":"","text":"𝐓𝐡𝐞 𝐑𝐢𝐠𝐡𝐭 𝐓𝐫𝐞𝐚𝐭𝐦𝐞𝐧𝐭. 𝐓𝐡𝐞 𝐑𝐢𝐠𝐡𝐭 𝐓𝐢𝐦𝐞.\n:- 91-741 6622 540 +91-799 5664 366\n#godavarivascularandchestcenter #VascularSurgery #VascularCare #PatientFirst #ExpertCare #BetterOutcomes #Endovascular #VasishtaHospitals #PatientCare #ExpertDoctors","url":"https://x.com/godavarivasculr/status/2075824657018790060","datetime":"2026-07-11T06:08:59.000Z","timeText":"18h","replies":"0 Replies. Reply","reposts":"0 reposts. Repost","likes":"0 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"This study provides Class II evidence that for patients with acute large vessel ischemic #stroke undergoing endovascular therapy (EVT), nerinetide did not significantly decrease early post-EVT infarct growth compared with placebo. https://bit.ly/41KeKaE\n\n#NeuroTwitter","url":"https://x.com/GreenJournal/status/1750170614785089742","datetime":"2024-01-24T14:56:05.000Z","timeText":"Jan 24, 2024","replies":"0 Replies. Reply","reposts":"15 reposts. Repost","likes":"31 Likes. Like","views":""},
]

neurology_posts = [
    {"author":"Medical Global Academy","handle":"","text":"68M. Sudden weakness. Slurred speech. Non-contrast CT shows a hyperdense spot in the left basal ganglia. \n\nCall it wrong, and thrombolysis kills the patient. Stroke or bleed? Answer inside \n#Neurology #StrokeCare #MedTwitter #ClinicalCase #EmergencyMedicine","url":"https://x.com/MGA_Courses/status/2075950739390681452","datetime":"2026-07-11T14:30:00.000Z","timeText":"7h","replies":"","reposts":"","likes":"","views":""},
    {"author":"CortiCare","handle":"","text":"We're excited to be back at ASET Annual Conference 2026, and yes... The CortiCare Podcast recording studio is coming with us!\n\nOne of our favorite parts of ASET has become sitting down with the people who make this profession what it is.\n\nThe conversations aren't scripted.","url":"https://x.com/corticare/status/2075671544223723770","datetime":"2026-07-10T20:00:34.000Z","timeText":"Jul 11","replies":"","reposts":"","likes":"","views":""},
    {"author":"Neurology Journal","handle":"","text":"This retrospective study evaulated the effectiveness of levodopa/carbidopa in slowing the progression of MJD/SCA3. Read more: https://hubs.la/Q04nqvZv0","url":"https://x.com/GreenJournal/status/2075932022548082795","datetime":"2026-07-11T13:15:37.000Z","timeText":"8h","replies":"","reposts":"","likes":"","views":""},
    {"author":"Dr.Arun Kumar Rajput PT-Neurology Etawah UP","handle":"","text":"अपनी सरल कार्यशैली, निष्पक्ष छवि और जनता से सीधे जुड़ाव के लिए लोकप्रिय जनपद इटावा के एडिशनल एसपी श्री अभय नाथ त्रिपाठी सर (PPS 2000 बैच) को भारतीय पुलिस सेवा (IPS) में प्रमोशन मिलने पर उन्हें ढ़ेर सारी शुभकामनाएं I \n\n#UPPolice #Etawah #Etawahpolice \n@Uppolice @Abhayy2k1","url":"https://x.com/ArunNeuro/status/2073767702666334358","datetime":"2026-07-05T13:55:23.000Z","timeText":"Jul 5","replies":"","reposts":"","likes":"","views":""},
]

# Extra posts from scrolling
extra_posts = [
    {"author":"Continuum: Lifelong Learning in Neurology","handle":"","text":"Key Point 5 from the article Sex Differences in Stroke Diagnosis, Treatment, and Outcome by Dr. Cheryl E. Carcel from the June #CerebrovascularDisease issue, which is available to subscribers at https://hubs.la/Q04lXgfT0. #NeuroTwitter #MedEd","url":"https://x.com/ContinuumAAN/status/2075686499597668390","datetime":"2026-07-10T21:00:00.000Z","timeText":"Jul 11","replies":"0 Replies. Reply","reposts":"1 repost. Repost","likes":"9 Likes. Like","views":""},
    {"author":"Neurology Journal","handle":"","text":"Parkinson Disease Pathogenic Variants: Cross-Ancestry Analysis and Microarray Data Validation https://hubs.la/Q04n-LyF0 \n\n#ParkinsonDisease","url":"https://x.com/GreenJournal/status/2076086838800818210","datetime":"2026-07-11T23:30:48.000Z","timeText":"1h","replies":"0 Replies. Reply","reposts":"2 reposts. Repost","likes":"3 Likes. Like","views":""},
    {"author":"Momentum Healthcare","handle":"","text":"A headache may disrupt your day, but a migraine can significantly impact your overall well-being.\n\nWhile headaches are common, migraines are a complex neurological disorder that often comes with symptoms beyond head pain, including nausea, sensitivity to light and sound, and","url":"https://x.com/momentumHCare/status/2076089609310642569","datetime":"2026-07-11T23:41:49.000Z","timeText":"54m","replies":"0 Replies. Reply","reposts":"1 repost. Repost","likes":"2 Likes. Like","views":""},
]

def parse_engagement_count(s):
    """Extract numeric count from engagement string like '152 Likes. Like'"""
    if not s:
        return 0
    try:
        # Handle formats like "152 Likes. Like" or "1 Like. Like" or ""
        parts = s.split()
        if parts and parts[0].isdigit():
            return int(parts[0])
        elif parts and parts[0].replace(',', '').isdigit():
            return int(parts[0].replace(',', ''))
    except:
        pass
    return 0

def main():
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            author TEXT,
            handle TEXT,
            text TEXT,
            datetime TEXT,
            time_text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views TEXT,
            search_query TEXT,
            scraped_at TEXT,
            is_new INTEGER DEFAULT 1
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_posts_url ON posts(url)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_posts_datetime ON posts(datetime)')
    
    all_posts = []
    
    # Process all posts with their search query
    for post in neurointervention_posts:
        post['search_query'] = 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
        all_posts.append(post)
    
    for post in avm_posts:
        post['search_query'] = 'cerebral AVM OR intracranial aneurysm OR endovascular'
        all_posts.append(post)
    
    for post in neurology_posts:
        post['search_query'] = 'neurology OR #neurotwitter OR #NeuroX'
        all_posts.append(post)
    
    for post in extra_posts:
        post['search_query'] = 'neurology OR #neurotwitter OR #NeuroX'
        all_posts.append(post)
    
    scraped_at = datetime.utcnow().isoformat()
    new_posts = []
    high_engagement_posts = []
    
    for post in all_posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (url, author, handle, text, datetime, time_text, replies, reposts, likes, views, search_query, scraped_at, is_new)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ''', (
                post.get('url', ''),
                post.get('author', ''),
                post.get('handle', ''),
                post.get('text', ''),
                post.get('datetime', ''),
                post.get('timeText', ''),
                parse_engagement_count(post.get('replies', '')),
                parse_engagement_count(post.get('reposts', '')),
                parse_engagement_count(post.get('likes', '')),
                post.get('views', ''),
                post.get('search_query', ''),
                scraped_at
            ))
            if cursor.rowcount > 0:
                new_posts.append(post)
                if parse_engagement_count(post.get('likes', '')) > 50:
                    high_engagement_posts.append(post)
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM posts')
    total_count = cursor.fetchone()[0]
    
    # Get count by search query
    cursor.execute('SELECT search_query, COUNT(*) FROM posts GROUP BY search_query')
    query_counts = cursor.fetchall()
    
    conn.close()
    
    print(f"Total posts in database: {total_count}")
    print(f"New posts added: {len(new_posts)}")
    print(f"High engagement posts (>50 likes): {len(high_engagement_posts)}")
    print("\nPosts by search query:")
    for query, count in query_counts:
        print(f"  {query}: {count}")
    
    # Output for markdown
    print("\n--- MARKDOWN OUTPUT ---")
    print(f"Total: {len(new_posts)}")
    for p in new_posts[:5]:
        print(f"  - {p.get('author', 'Unknown')}: {p.get('text', '')[:80]}...")

if __name__ == '__main__':
    main()