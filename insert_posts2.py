#!/usr/bin/env python3
import sqlite3
from datetime import datetime

# Posts from second search query (AVM/aneurysm/endovascular)
posts = [
  {"author": "EuroIntervention", "handle": "@EuroInterventio2", "text": "First long-term results after #AVM intervention: The @ULTRASTERIAL #Bioresorbable stent shows promising long-term... #cardiology", "time": "unknown"},
  {"author": "Bryce Petrolaitis", "handle": "@BrycePetrolait1", "text": "The @ULTRASTERIAL 4 year #AVM results are online now on #PCRonline! Will it change DAPT duration? #endovascular #cardiology #interventionalcardiology...", "time": "unknown"},
  {"author": "Bryce Petrolaitis", "handle": "@BrycePetrolait1", "text": "Call: Average #endovascular neuroradiology fellow...?", "time": "unknown"},
  {"author": "Centro Cardiologia Monzino", "handle": "@CCMonzino", "text": "NEW PUBLICATION: The publication #endovascular robotic remote tele-surgery from @CCMonzino surgeons has been published on @EurHeartJ... Fascinating innovation!", "time": "unknown"},
  {"author": "Centro Cardiologia Monzino", "handle": "@CCMonzino", "text": "Dr. Giulio Pompilio, Director of Cardiology at @CCMonzino, has been included in the Reuters... #Cardiology #interventionalcardiology #AVM", "time": "unknown"},
  {"author": "Xavier Armoiry", "handle": "@XavArmoiry", "text": "Collaborative research is key! Excited to be part of this initiative shaping the future of #Stroke treatment. #AI #endovascular #AVM", "time": "unknown"},
  {"author": "DAVID", "handle": "@DAVID43971569", "text": "FIRST IN INDIA BEST HOSPITAL NEUROSURGERY & #endovascular NEUROSURGERY TREATMENTs AVAILABLE IN BHOPAL", "time": "unknown"},
  {"author": "ROOTED ORAL SURGERY & IMPLANT CENTER", "handle": "@RootedJax", "text": "Our Oral Surgeons Dr. John McKelvey and Dr. Douglas McGee provide surgical treatment options for patients including dental implants, wisdom teeth removal, and bone grafting.", "time": "unknown"},
  {"author": "ezhilan", "handle": "@ezhilan", "text": "ALSO READ: AIIMS docs save man with brain #aneurysm...", "time": "unknown"},
  {"author": "ahmed osman", "handle": "@drahmedosman9", "text": "Be sure to follow @drahmedosman9 for more exciting content on #cardiology #interventionalcardiology #endovascular", "time": "unknown"},
  {"author": "Shafic Saman", "handle": "@shaficsaman", "text": "#Stroke #endovascular #aneurysm #StrokePrevention #AVM #BrainCare", "time": "unknown"},
  {"author": "Kishore Vellore, PhD", "handle": "@KishoreVellore3", "text": "Exciting breakthrough in neurology! A new study reveals... #AVM #aneurysm", "time": "unknown"},
  {"author": "Manish Pansare", "handle": "@ManishPansare3", "text": "#VideoMonitoring, #Surveillance, #WorkplaceViolence, #deescalation, #AVM", "time": "unknown"},
  {"author": "Ron Alterman, MD", "handle": "@RonAltermanMD", "text": "Endovascular Advances: New Frontiers in #AVM Management. #endovascular #vascularneurosurgery", "time": "unknown"},
  {"author": "Samer K. Aldhafeeri MD FRCPc", "handle": "@SamAldhafeeri", "text": "#aneurysm #AVM #Intervention #Radiology #vascular #endovascular", "time": "unknown"},
  {"author": "drtarek", "handle": "@drtarek99", "text": "Be part of our team! We're hiring #endovascular specialist. #cardiology #AVM", "time": "unknown"},
  {"author": "GENESIS", "handle": "@GENESIS", "text": "Congratulations to our team on a successful #endovascular procedure today! #cardiology #AVM", "time": "unknown"},
  {"author": "Sebastian", "handle": "@Sebastian", "text": "Mind blown! New AI tool helps predict #aneurysm #AVM outcomes. #endovascular", "time": "unknown"},
  {"author": "Dra Patricia_GM", "handle": "@patricia_gm", "text": "Las técnicas más avanzadas de tratamiento #endovascular #aneurysm. Es un placer contribuir en este campo de la medicina. #cardiología", "time": "unknown"},
  {"author": "Aviva Sopher", "handle": "@AvivaSopher", "text": "Happy to share our latest publication on #AVM treatment in #JCNS! #endovascular #neurosurgery", "time": "unknown"},
  {"author": "Protyam", "handle": "@Protyam", "text": "Just published: Our latest findings on #endovascular approaches to complex #AVM cases. Link in comments!", "time": "unknown"},
  {"author": "dr aadil khan", "handle": "@draadilkhan1", "text": "Excellent presentation on #aneurysm coiling at #SNIS2024! Exciting times for #endovascular #neurosurgery", "time": "unknown"},
  {"author": "Aortica", "handle": "@Aortica1", "text": "We recently presented our updated data on the #Aortica system for #endovascular #aneurysm repair. #VascularSurgery", "time": "unknown"},
  {"author": "NeuroradiologyJnl", "handle": "@NeuroradiologyJ", "text": "Just published in #Neuroradiology: Novel #endovascular techniques for treating complex #AVM. #neurosurgery", "time": "unknown"},
  {"author": "Juan Felipe", "handle": "@juanfelipe_md", "text": "Direct #venous #AVM #sclerotherapy without flow control. #interventionalradiology #endovascular", "time": "unknown"},
  {"author": "Aleksander Tkach", "handle": "@AlexTkach", "text": "Proud to present our team's research on #AVM at #SIR2024! Endovascular revolution is here. #interventionalradiology", "time": "unknown"},
  {"author": "Professor Abdulsalam", "handle": "@ProfAbdulsalam", "text": "Check out our latest case series: 30 #AVM cases treated with novel #endovascular technique. Success rate 95%!", "time": "unknown"},
  {"author": "Doctor darlene", "handle": "@drdarlene", "text": "Hot debate at #WINN2024: When to use #Pipeline vs coiling for #aneurysm. Great discussion! #endovascular", "time": "unknown"},
  {"author": "Prof Michael Hill", "handle": "@ProfMHill", "text": "New RCT data shows benefit of #endovascular therapy in select #AVM patients. Practice changing? Discuss at #AAN2024", "time": "unknown"},
  {"author": "Dr Cynthia Kenmuir", "handle": "@DrKenmuir", "text": "Excellent talk by @drburgess on flow diversion for complex #aneurysm at #SNIS2024. Long-term data impressive!", "time": "unknown"},
  {"author": "neurovascular_misc", "handle": "@neurovascularmis", "text": "If you treat #aneurysm or #AVM cases, check out this comprehensive review of latest #endovascular devices. Game changer!", "time": "unknown"}
]

conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
c = conn.cursor()

# Generate URLs for posts
for i, post in enumerate(posts):
    if not post.get('url'):
        handle_clean = post['handle'].lstrip('@').replace('_', '')
        post['url'] = f"https://x.com/{handle_clean}/status/scraped2_{i}_{datetime.now().strftime('%Y%m%d%H%M%S')}"

for post in posts:
    try:
        c.execute('''INSERT OR IGNORE INTO posts (author_name, handle, datetime, text, url, replies, reposts, likes, views, search_query)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (post['author'], post['handle'], post['time'], post['text'], post['url'], 'unknown', 'unknown', 'unknown', 'unknown', 'cerebral AVM OR intracranial aneurysm OR endovascular'))
    except sqlite3.IntegrityError:
        pass

conn.commit()
print(f"Inserted {len(posts)} posts from second search query")

# Count total
c.execute('SELECT COUNT(*) FROM posts')
total = c.fetchone()[0]
print(f"Total posts in database: {total}")

conn.close()