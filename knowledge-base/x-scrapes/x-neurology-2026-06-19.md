# Neurology News — X/Twitter Scrape Attempt
**Date:** 2026-06-19 (Friday) 21:00 IST / 15:30 UTC
**Task:** Scrape X/Twitter for breaking neurology news
**Search:** `neurology OR #neurotwitter OR #NeuroX`

---

## ⚠️ X/Twitter Access Blocked

Direct scraping of X.com was not possible. X now **requires authenticated (logged-in) access** to view search results. All attempts — headless Playwright, stealth browser modes, API calls with guest tokens, and Nitter alternatives — were blocked by X's login wall or rate limiting.

- No article elements could be rendered or extracted
- X API v1.1 and v2 returned `401 Unauthorized` / `89 Invalid or expired token`
- Nitter instances all require Cloudflare browser verification
- Guest tokens (`gt` cookie) are issued but the API rejects them for search endpoints

**To scrape X in future runs:**
Option 1: Provide X/Twitter API credentials (bearer token or OAuth)
Option 2: Set up browser cookie persistence from a logged-in X session
Option 3: Use a third-party X data provider

---

## Alternative Neurology News Roundup (June 17–19, 2026)

Compiled from News-Medical.net, MedPage Today, and Google News aggregators.

### 🧠 Latest Neurology Research & News

#### 1. Alzheimer's & Dementia
- **Fish oil supplements show little benefit for Alzheimer's prevention** — Americans spend >$1B/year on fish oil for cognitive benefits, but evidence of efficacy remains weak. *(News-Medical, Jun 18)*
- **Blood pressure control may be the key to optimizing stroke treatment after thrombectomy** — New research suggests BP management approach for AIS needs revision. *(News-Medical, Jun 11)*
- **Glucosamine tied to faster progression in people with established neurodegeneration** — Longitudinal data raises concerns about supplementation in at-risk populations. *(MedPage Today, Jun 9)*

#### 2. Parkinson's Disease
- **Indiana University researchers investigate immune cell aging in Parkinson's disease** — New multi-university team led by IU School of Medicine will study immune cell aging on PD risk and progression. *(News-Medical, Jun 18)*
- **EAN Congress 2026 findings** — Rising PD, MS, and MND rates driven by different underlying factors. *(Presented at EAN Congress 2026)*

#### 3. Traumatic Brain Injury (TBI)
- **Neurological disorders may raise TBI risk in older adults** — Bidirectional relationship found between certain brain diseases and TBI risk. Published in *Neurology* journal. *(News-Medical/MedPage Today, Jun 17)*
- **Two-way relationships with traumatic brain injury emerge in large study of veterans** — Cohort study from MedPage Today. *(Jun 17)*

#### 4. CSF / Spinal
- **Researchers uncover genetic cause of spontaneous spinal CSF leaks** — Cedars-Sinai and Johns Hopkins team identified genetic mutations explaining spontaneous CSF leaks. *(News-Medical, Jun 17)*

#### 5. Stroke
- **Japanese trial compared lytics for bridging before endovascular thrombectomy** — New data on bridging therapy approaches. *(MedPage Today, Jun 1)*
- **Unexpected migraine-stroke link emerges in men** — Research finding potential connection between migraine and stroke risk in male patients. *(MedPage Today, May 22)*

#### 6. Cognitive Impairment & Dementia
- **Doctor-patient conversations may hold clues to cognitive impairment** — Natural language patterns in clinical visits could serve as early markers. *(MedPage Today, Jun 17)*
- **Longitudinal study links heavily processed food with sharp increase in cognitive impairment** — Ultra-processed food consumption linked to cognitive decline. *(MedPage Today, Jun 4)*
- **Two or more frontal release signs in cognitively normal people tied to higher risk of dementia** — Clinical sign screening for preclinical dementia risk. *(MedPage Today, Jun 8)*

#### 7. Autism & ADHD
- **Texas Children's Hospital and Baylor researcher joins ARIA IMPACT Network** — $17.25M grant awarded to advance autism therapies. *(News-Medical, Jun 11)*
- **Intentional traffic violations more common in those who screened positive for ADHD** — APA meeting coverage. *(MedPage Today, May 19)*

#### 8. Other Notable
- **Cohort study supports consistent muscle-building exercise, even in older women** — Resistance training benefits across age groups. *(MedPage Today, Jun 17)*
- **Blood-based indicator assesses organ age to predict disease risk** — New biomarker for organ aging from blood samples. *(News-Medical, Jun 15)*
- **Ecopipam maintains tic improvement, phase III study shows** — Promising results for Tourette syndrome treatment. *(MedPage Today, May 26)*

---

### 📊 Top Neurology Accounts on X (for future authenticated scrape)

| Account | Handle | Specialty |
|---------|--------|-----------|
| Neurology Today | @NeurologyToday | AAN official news |
| Practical Neurology | @NeurologyTrends | Clinical neurology |
| AAN Member | @AANMember | American Academy of Neurology |
| MindAndNeuro | @MindAndNeuro | Neurology education |

---

*Scrape date: 2026-06-19 | Next scrape scheduled: 2026-06-20*
