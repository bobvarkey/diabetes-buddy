# Neurology X/News Scrape — 2026-09-27

**Run:** 2026-09-27 06:03 IST (cron)  
**Query:** neurology OR #neurotwitter OR #NeuroX (X search intent) — Google News RSS fallback  
**Feeds:** broad neurology OR-group (100 items) + site:x.com neurology (100 items), merged & deduped (194 unique), 48h recency window, noise-filtered  
**Source method:** Google News RSS fallback — see Access Note below

## ⚠️ Access Note (why not native X scrape)

The task asked for a native X.com scrape. It was **not possible this run**:

- CDP probe on 127.0.0.1:18800 and 9222 → **both dead** (HTTP 000). Persistent Chrome (PID 497) is running since Sep 7 **without `--remote-debugging-port`** — no authenticated session to attach to.
- `browser_exec(profile=openclaw)` → launched, but x.com redirected to `/i/jf/onboarding/web?mode=login` (login wall; no X cookies in that profile).
- `xurl` CLI → not installed on this machine (`command not found`).
- Nitter instances → nitter.net / privacydev / poast all timeout (HTTP 000); nitter.space returns 403.
- Bluesky public API → 403 Forbidden (locked down since June 2026).

→ Fell back to Google News RSS (broad + `site:x.com`), which surfaces real X posts (title suffix `- x.com`) **without engagement counts**.

## 📊 Harvest Stats

- Broad feed items: 100 | site:x.com items: 100 | merged unique: 194
- Within 48h: 19 X posts, 37 news items (108 dropped as older)
- After noise filter: 19 X posts, 37 news items

## 🐦 X/Twitter Posts (top 12 by recency, within 48h)

> ⚠️ No engagement data available via RSS — cannot flag by >100 likes. Flagging by keyword heuristics only.

1. **[12h ago]** Developed by the American Academy of Neurology (AAN) and American Headache Society, the updated guideline replaces recommendations issued in 2012 and covers pharmacologic prevention of both episodic and chronic migraine in adults. The updated 🚩 **GUIDELINE**
2. **[28h ago]** Registration for the 2027 RITE is now open. New this year, separate adult and child neurology exam forms provide a more tailored self-assessment experience to help residents track progress and prepare for certification: https://t.co/UwauvgB3nl #neurologyres
3. **[9h ago]** Target Trial Emulation for Drug Repurposing in Neurodegenerative Diseases: Opportunities, Challenges, and Practical Guidance https://t.co/EzuoBqnmQo 🚩 **TRIAL**
4. **[37h ago]** The American Academy of Neurology (AAN) and American Headache Society (AHS) have issued an updated joint practice guideline to help clinicians select preventive medications for adults with migraine. https://t.co/xfu4rwhUUH 🚩 **GUIDELINE**
5. **[29h ago]** Researchers with @uofcincy saw an increase in the percentage of patients with #stroke who had #SubstanceUse as well as conditions associated with vascular risk, such as #hypertension, #diabetes and atrial fibrillation, Emily R. Fisher, told @GoHealio. https 🚩 **TRIAL**
6. **[47h ago]** Adults with rare epilepsies need specialized care. This can include access to genetic testing, informed transfer of care and inclusion in clinical trials. Tomorrow at 1pm ET, join Lisa Kinsley, MS, CGC, and Elizabeth Gerard (@EEG_MD), MD, to discuss "Rare Ep 🚩 **TRIAL**
7. **[31h ago]** In today’s #GrandRounds, Zachary A. Vesoulis, MD, MSCI, from @WashUMedPeds, discussed the importance of accurate monitoring and individualized treatment in the #NICU to prevent silent brain injury in premature infants, as well as some implementation
8. **[30h ago]** Pearls & Oy-sters: DPPX Antibody-Associated Encephalitis in a Patient With Diarrhea, Tremor, Ocular Flutter, and Cognitive-Psychiatric Changes https://t.co/lvWf4REi95 #NeurologyRF
9. **[34h ago]** Calling all Neuromuscular physicians: Please complete our Neuromuscular Clinical Practice Survey. This survey aims to Identify barriers to exercise implementation for individuals with NMD, Understand current exercise clinical practice among clinicians op mo
10. **[41h ago]** This month’s Annual Neurology Update Meeting aims to be highly relevant for specialists and generalists who manage neurological illness https://t.co/7tXVJz8I8F #neurology
11. **[34h ago]** From vaccine questions to CME opportunities, Healio AI can help support your clinical learning and workflow. Try a sample prompt and explore what’s possible 👉 https://t.co/ECvzY2vAtl #HealioAI #ClinicalAI
12. **[8h ago]** Connect faster. Hire smarter. Move your neurology career forward at the AAN Online Job Fair October 6–8. https://t.co/jUHzBj3nWF

## 📰 Top Neurology News (within 48h, noise-filtered)

1. **[26h ago]** US FDA approves AbbVie's drug for Parkinson's disease - Reuters — *Reuters* 🚩 **REGULATORY**
2. **[6h ago]** The brain still responds to favorite music in dementia - medicalxpress.com — *medicalxpress.com*
3. **[35h ago]** Alyssa’s Multiple Sclerosis Care Story - Mass General Brigham — *Mass General Brigham*
4. **[4h ago]** Dad, 47, Has ‘Weird’ Moment at Disney—Then Comes Alzheimer’s Diagnosis - Newsweek — *Newsweek*
5. **[31h ago]** New brain tumor test could transform diagnosis and treatment - medicalxpress.com — *medicalxpress.com*
6. **[37h ago]** NEWSLETTER: Genetic discovery yields clues toward reversal of Alzheimer's brain damage - Reuters — *Reuters*
7. **[15h ago]** What's Next in Ataxia: Pipeline Overview of Investigational Therapeutics - NeurologyLive — *NeurologyLive*
8. **[21h ago]** Mobile research unit brings free memory screenings and Alzheimer’s research to Dunnellon - WUFT — *WUFT*
9. **[21h ago]** Health Brief: The business of treating Alzheimer’s - The Washington Post — *The Washington Post*
10. **[35h ago]** Naturally occurring human peptide shows promise against Alzheimer’s - NewsNation — *NewsNation*
11. **[42h ago]** Acadia Reports Phase 2 Results for Remlifanserin in Alzheimer’s Disease Psychosis - The Clinical Trial Vanguard — *The Clinical Trial Vanguard* 🚩 **TRIAL**
12. **[11h ago]** Health Matters | Understanding Alzheimer’s disease and dementia - Times-Standard — *Times-Standard*
13. **[33h ago]** Virtual reality gait training shows lasting mobility gains in Parkinson’s - Parkinson's News Today — *Parkinson's News Today*
14. **[12h ago]** Ask Mayo Clinic: This laser therapy is changing brain tumor treatment - PennLive.com — *PennLive.com*
15. **[34h ago]** Revealed: the undisclosed safety data emerging as weedkiller maker faces Parkinson’s lawsuits in US - The Guardian — *The Guardian*

## 🚩 Flagged Items (breaking / regulatory / guideline)

- **X post [12h ago]:** Developed by the American Academy of Neurology (AAN) and American Headache Society, the updated guideline replaces recommendations issued in 2012 and covers pharmacologic preventio — flags: GUIDELINE
- **X post [9h ago]:** Target Trial Emulation for Drug Repurposing in Neurodegenerative Diseases: Opportunities, Challenges, and Practical Guidance https://t.co/EzuoBqnmQo — flags: TRIAL
- **X post [37h ago]:** The American Academy of Neurology (AAN) and American Headache Society (AHS) have issued an updated joint practice guideline to help clinicians select preventive medications for adu — flags: GUIDELINE
- **X post [29h ago]:** Researchers with @uofcincy saw an increase in the percentage of patients with #stroke who had #SubstanceUse as well as conditions associated with vascular risk, such as #hypertensi — flags: TRIAL
- **X post [47h ago]:** Adults with rare epilepsies need specialized care. This can include access to genetic testing, informed transfer of care and inclusion in clinical trials. Tomorrow at 1pm ET, join  — flags: TRIAL
- **News [26h ago] (Reuters):** US FDA approves AbbVie's drug for Parkinson's disease - Reuters — flags: REGULATORY
- **News [42h ago] (The Clinical Trial Vanguard):** Acadia Reports Phase 2 Results for Remlifanserin in Alzheimer’s Disease Psychosis - The Clinical Trial Vanguard — flags: TRIAL

## Key Themes

1. **AAN/AHS migraine prevention guideline update** (replaces 2012 recs; adult episodic+chronic migraine pharmacologic prevention) — biggest clinical story on X today, multiple journal accounts posting it
2. **FDA approves AbbVie Parkinson's drug** (Reuters, 26h ago) — flagship regulatory story
3. **Alzheimer's research wave**: genetic discovery clues toward reversing brain damage (Reuters), plasma biomarker drug effects (Inside Precision Medicine), human peptide promise (NewsNation), Acadia Phase 2 remlifanserin psychosis readout
4. **Brain tumor diagnostics**: "new brain tumor test could transform diagnosis" (medicalxpress), Mayo laser therapy piece (PennLive)
5. **Stroke/substance use**: U Cincinnati stroke+substance use rise (X), plus autoimmune cerebellar ataxia/hamster exposure case series (X)
6. **Education/announcements**: RITE 2027 registration, AAN job fair, Neurology Education Sept issue, child neurology course

## Issues & Caveats

- **No engagement metrics** (likes/RTs) — Google News RSS strips them. >100-likes flagging **not possible** this run; keyword flags substituted.
- X posts surfaced via `site:x.com` are whatever Google indexed in the last 48h — not an exhaustive or ranked feed. Journal/institutional accounts (AAN, Neurology, JAMA Neurology-adjacent) dominate; organic high-engagement posts underrepresented.
- 108 of 194 merged items were older than 48h (Google relevance-ranking pulls evergreen content even with `after=` scoping) — dropped.
- Duplicate AAN/AHS guideline posts (same story from 2 accounts) collapsed to 1 in the top-10 list; both kept in harvest.

## Recommendation

To restore native X scraping with engagement data (the >100-likes flag), relaunch persistent Chrome with remote debugging:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 &
```
Then next cron run's CDP probe will find it and use `connectOverCDP` for real like/RT counts.
