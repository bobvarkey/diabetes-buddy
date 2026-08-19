# X/Twitter Neurology Scrape - 2026-08-18

> **Source:** Google News RSS fallback (X.com login wall + xurl 401 — direct X scraping unavailable this run)
> **Method:** Broad query (`neurology OR #neurotwitter OR #neuroX`) + `site:x.com` supplement, merged, noise-filtered, 48h recency window.
> **Note:** No engagement metrics (like counts) available via RSS fallback. ">100 likes" flag is approximated by breaking/notable keyword heuristics instead.

---

## ⚠️ BREAKING / NOTABLE (high priority)

| # | Post / Title | Source | Date (UTC) | Why flagged |
|---|--------------|--------|-----------|-------------|
| 1 | **Ractigen Completes Enrollment for RAG-17 in SOD1-ALS, Tanruprubart Shows Rapid Responses in GBS, Building a Multidisciplinary SMA Clinic** | NeurologyLive | 2026-08-16 | **Breaking — clinical trial** (ALS gene therapy enrollment complete; GBS response) |
| 2 | Among adults with **#Epilepsy** receiving DOACs, antiseizure med selection linked to different risks of thromboembolism, major bleeding, all-cause mortality (JAMA) | x.com | 2026-08-17 | **Breaking research** — stroke/bleed risk signal |
| 3 | Long COVID (NCNP, 806 pts): far greater **cognitive & psychiatric burden**; 52.9% stopped work/school, 42.5% suicidal thoughts | x.com | 2026-08-17 | **Breaking** — high clinical/public-health impact |
| 4 | Women ~2x Alzheimer's risk as men — new **estrogen** study (Stanford) in Neurology (Aug 12) | x.com | 2026-08-16 | **Breaking research** — mechanistic, high interest |
| 5 | Among veterans with prior **#TBI**, plasma p-tau217/Aβ42 blood test **missed >half of brain amyloid-positive** AD cases (JAMA) | x.com | 2026-08-15 | **Breaking** — diagnostic accuracy concern |

## Teaching Pearls / Clinical (X posts)

| # | Post / Title | Source | Date (UTC) |
|---|--------------|--------|-----------|
| 6 | A **posterior communicating artery aneurysm** can be small but clinically significant — 3rd nerve compression: sudden headache, double vision, dilated pupil | x.com | 2026-08-17 |
| 7 | **Wrist drop** 3-step evaluation — arm position before strength assessment | x.com | 2026-08-17 |
| 8 | Profound unexplained **encephalopathy after a fall** — MRI DWI/SWI 'starfield' pattern (PNJ, #NeuroTwitter #Neuroradiology) | x.com | 2026-08-16 |
| 9 | French neurologist **Charcot** — the "clinical gaze" and meticulous observation | x.com | 2026-08-17 |

## News / Pipeline

| # | Title | Source | Date (UTC) |
|---|-------|--------|-----------|
| 10 | The Shifting Landscape of **Secondary Stroke Prevention** | Neurology Advisor | 2026-08-17 |
| 11 | **This Week on NeurologyLive** — August 17, 2026 | NeurologyLive | 2026-08-17 |
| 12 | Glimpses from **Indian Stroke Association CME** "Save the Brain" — AIIMS New Delhi, centenary of **cerebral angiography** | x.com | 2026-08-17 |
| 13 | Dr. Esha Kataria joins Comprehensive Neurology Specialists, Johns Creek GA | x.com | 2026-08-15 |
| 14 | RECAP: Neurology News Network — Week of August 15th | NeurologyLive | 2026-08-15 |
| 15 | The Hidden Emotions in **Caregiving** | NeurologyLive | 2026-08-15 |
| 16 | Doctors: wearable smart tech helpful but has downsides | ABC7 New York | 2026-08-15 |
| 17 | Vehicle crashes into Neurology office in Waldorf, no injuries | The BayNet | 2026-08-17 |
| 18 | CNSP strategic pivot to oncology & neurology assets (financial) | TradingView | 2026-08-17 |
| 19 | Dr. Barbara Decker leads pack for women's neurologic health | Fredericksburg.com | 2026-08-16 |

---

## Issues
- **X.com login wall** — `browser_navigate` to X search redirected to `/i/jf/onboarding/web?mode=login`. No browser cookies/credentials in cron context.
- **xurl 401 Unauthorized** — OAuth token stale (`oauth2: (none)` in `xurl auth status`); needs interactive re-auth.
- **No engagement/like metrics** available via RSS fallback — ">100 likes" approximated by breaking-keyword heuristics.
- Fallback used per `social-search-fallback` skill (Google News RSS is the reliable path when X auth unavailable).
