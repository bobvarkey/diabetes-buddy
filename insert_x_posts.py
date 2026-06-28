#!/usr/bin/env python3
import sqlite3
from datetime import datetime

# Database path
DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'

# Posts collected from X/Twitter searches
posts = [
    # Search 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Jun 12',
        'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke',
        'url': 'https://x.com/GreenJournal/status/2065190115090042937',
        'replies': 2, 'reposts': 6, 'likes': 23, 'views': 4125,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Jun 11',
        'text': 'This study looked at the safety and outcomes of IV thrombolysis after dabigatran reversal in patients with acute ischemic #stroke: hubs.la/Q04k_Mx10',
        'url': 'https://x.com/GreenJournal/status/2065103391504605437',
        'replies': 2, 'reposts': 9, 'likes': 34, 'views': 4693,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Johanna Ospel, MD PhD',
        'author_handle': '@johanna_ospel',
        'date': '3 hours ago',
        'text': '🚨 New @esmintsociety @ESOstroke @ESNRad multi-society #consensus statement on evidence standards for high-risk #EVT #stroke 🧠 devices in @JNIS_BMJ: jnis.bmj.com/content/early/',
        'url': 'https://x.com/johanna_ospel/status/2069973017988628659',
        'replies': 0, 'reposts': 0, 'likes': 0, 'views': 61,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Jan 7',
        'text': 'The Brain Care Score (BCS), a tool encompassing 12 modifiable risk factors, is associated with #stroke in a biracial cohort and shows larger effect sizes among Black compared with White individuals: hubs.la/Q03ZFPCk0 @DrBenjaminTan @SavvinaPrap @CDAndersonMD',
        'url': 'https://x.com/GreenJournal/status/2008903418484527433',
        'replies': 3, 'reposts': 2, 'likes': 23, 'views': 2194,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Vighnesh Rane',
        'author_handle': '@Vighrane01',
        'date': '39 minutes ago',
        'text': 'This finding on echo is called clot in transit. In Pulmonary embolism it is a mobile thrombus in the right atrium or right ventricle, usually en route from the systemic venous circulation to the pulmonary arteries. It is a high-risk finding because it can embolize at any time',
        'url': 'https://x.com/Vighrane01/status/2070022708788965536',
        'replies': 0, 'reposts': 0, 'likes': 1, 'views': 80,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Aug 14, 2025',
        'text': 'This meta-analysis indicates that switching to warfarin after a #stroke while on direct oral anticoagulants (DOACs) seems less effective and safe in stroke recurrence prevention, intracranial hemorrhage, and mortality compared with DOAC-based strategies: hubs.la/Q03CfBQk0',
        'url': 'https://x.com/GreenJournal/status/1955765782186496311',
        'replies': 1, 'reposts': 16, 'likes': 40, 'views': 3206,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'RADIOLOGISTS',
        'author_handle': '@DrAyubaD',
        'date': '20 minutes ago',
        'text': 'Headache and seizures. Infarct or tumor? 👇 👇 #MedX',
        'url': 'https://x.com/DrAyubaD/status/2070027511405126136',
        'replies': 1, 'reposts': 2, 'likes': 4, 'views': 88,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Aug 20, 2025',
        'text': 'This study found that the HERMES-24 score was highly predictive of 90-day outcome among patients with #stroke due to large vessel occlusion and small ischemic core for those presenting in the late time window, irrespective of intervention: hubs.la/Q03DdQhP0',
        'url': 'https://x.com/GreenJournal/status/1958154140586033470',
        'replies': 2, 'reposts': 9, 'likes': 30, 'views': 5511,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Stroke: Vascular and Interventional Neurology',
        'author_handle': '@SVINJournal',
        'date': 'Jun 24',
        'text': 'This study evaluated rapid lateral flow tests for D-dimer and GFAP blood biomarkers combined with FAST symptoms, demonstrating high specificity for identification of LVO stroke. Future prehospital use might facilitate thrombectomy access for LVO patients. ahajrnls.org/4w4tgIe',
        'url': 'https://x.com/SVINJournal/status/2069509489816899897',
        'replies': 0, 'reposts': 2, 'likes': 2, 'views': 627,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'May 2, 2025',
        'text': 'Influence of Asymptomatic Hemorrhagic Transformation After Endovascular Treatment on Stroke Outcome: A Population-Based Study hubs.la/Q03kyBRC0 #stroke #NeuroTwitter',
        'url': 'https://x.com/GreenJournal/status/1918060779187617827',
        'replies': 2, 'reposts': 12, 'likes': 28, 'views': 2746,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Aug 9, 2025',
        'text': 'Incidence, Associations, and Mechanisms of Unexplained Early Neurologic Deterioration After Thrombectomy in Stroke Patients hubs.la/Q03C1sB90 #NeuroX',
        'url': 'https://x.com/GreenJournal/status/1954242858749161793',
        'replies': 1, 'reposts': 27, 'likes': 103, 'views': 9920,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Apr 30, 2024',
        'text': 'Thrombectomy vs Medical Management for Posterior Cerebral Artery Stroke: Systematic Review, Meta-Analysis, and Real-World Data bit.ly/3QiYKbr',
        'url': 'https://x.com/GreenJournal/status/1785118896917184762',
        'replies': 0, 'reposts': 24, 'likes': 79, 'views': 11027,
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    # Search 2: cerebral AVM OR intracranial aneurysm OR endovascular
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Jun 20',
        'text': 'This study evaluated the safety and efficacy of IV thrombolysis before thrombectomy in patients with anterior-circulation large-vessel occlusion due to carotid artery dissection: hubs.la/Q04lZVrc0',
        'url': 'https://x.com/GreenJournal/status/2068054703309496743',
        'replies': 0, 'reposts': 3, 'likes': 17, 'views': 1895,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'May 10',
        'text': 'The aim of this study was to explore whether patients with Parkinson disease exhibit greater cerebral small vessel disease burden than healthy controls. Learn more: hubs.la/Q04fZNb30',
        'url': 'https://x.com/GreenJournal/status/2053189874572779697',
        'replies': 0, 'reposts': 8, 'likes': 47, 'views': 4406,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Dec 22, 2025',
        'text': 'Teaching NeuroImage: Necrotizing Granulomatous Encephalitis in a Patient After a Pericallosal Aneurysm Stent-Assisted Coil hubs.la/Q03YmqLX0 #NeuroTwitter #NeurologyRF',
        'url': 'https://x.com/GreenJournal/status/2003122674059342146',
        'replies': 1, 'reposts': 29, 'likes': 91, 'views': 5436,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Aug 17, 2025',
        'text': 'Epidemiologic, Clinical, and Radiologic Study of Cerebral Amyloid Angiopathy–Related Inflammation in Northern Ireland hubs.la/Q03D1Rq80',
        'url': 'https://x.com/GreenJournal/status/1957112387049312297',
        'replies': 0, 'reposts': 41, 'likes': 127, 'views': 13268,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Jason Jones',
        'author_handle': '@jonesville',
        'date': 'Feb 20, 2024',
        'text': 'In 1988, Joe Biden had to have surgery on his brain to correct an intracranial hemorrhage from a cerebral aneurysm. Did you know a brain hemorrhage can lead to brain damage that can cause issues with cognition, speech, and movement?',
        'url': 'https://x.com/jonesville/status/1759778416231055396',
        'replies': 62, 'reposts': 168, 'likes': 390, 'views': 32337,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Oct 31, 2025',
        'text': 'Variants of cerebral amyloid angiopathy (CAA) have been increasingly reported. This study reports on a case series of patients with iatrogenic CAA who developed clinical and radiologic features of CAA-related inflammation: hubs.la/Q03Pbnr20',
        'url': 'https://x.com/GreenJournal/status/1984322473358164394',
        'replies': 1, 'reposts': 26, 'likes': 108, 'views': 5274,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Neurology Journal',
        'author_handle': '@GreenJournal',
        'date': 'Oct 29, 2025',
        'text': 'This systematic review and meta-analysis found that the addition of diffusion MRI tractography is associated with a reduced risk of postoperative neurologic deficits in intracranial resective surgeries: hubs.ly/Q03Pcbr30',
        'url': 'https://x.com/GreenJournal/status/1983288726944919848',
        'replies': 3, 'reposts': 14, 'likes': 59, 'views': 4031,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author_name': 'Medzonetv',
        'author_handle': '@Medzonetv',
        'date': '12 hours ago',
        'text': 'A 45‑year‑old man suddenly says: "I can\'t see out of my right eye." No pain. Just darkness. He thought it was stress. Vision still gone 30 minutes later. Fundoscopy shows a pale retina with a cherry‑red spot. Diagnosis?',
        'url': 'https://x.com/Medzonetv/status/2069839937143185421',
        'replies': 7, 'reposts': 1, 'likes': 15, 'views': 2728,
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
]

def insert_posts():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    scrape_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    inserted = 0
    skipped = 0
    
    for post in posts:
        try:
            cursor.execute('''
                INSERT INTO x_posts 
                (author, handle, date, text, replies, reposts, likes, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author_name'],
                post['author_handle'],
                post['date'],
                post['text'],
                post['replies'],
                post['reposts'],
                post['likes'],
                post['views'],
                post['url'],
                post['search_query'],
                scrape_date
            ))
            inserted += 1
        except sqlite3.IntegrityError:
            skipped += 1
    
    conn.commit()
    conn.close()
    
    print(f"Inserted: {inserted} posts")
    print(f"Skipped (duplicates): {skipped} posts")

if __name__ == '__main__':
    insert_posts()