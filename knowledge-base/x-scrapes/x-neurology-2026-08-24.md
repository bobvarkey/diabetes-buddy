# Neurology — X/Twitter Scrape

**Date:** 2026-08-24 (UTC)

## Method Note ⚠️

- **Browser (`profile=openclaw`) was login-walled** — `x.com/search?...` loaded an empty page (X requires an authenticated session for search timelines). Per the `x-google-news-fallback` skill, one failed navigate is sufficient to conclude the wall; no retry loop.
- **No xurl/x-cli token available** (`xurl` and `x-cli` not installed / no OAuth2 token).
- **Fell back to Google News RSS** (`site:x.com` query for X posts + broad query for general neuro news), filtered to last 2 days (since 2026-08-22).
- **Engagement data (likes/reposts) is UNAVAILABLE** via RSS wrappers — the ">100 likes" flag CANNOT be determined. Flags are keyword/recency-based only.

## Top X Posts (last 2 days, source x.com)

1. **Key Point 2 from the article Insomnia by Dr. Brandon R. Peters-Mathews, MD, FAAN, FAASM, from the August #SleepNeurology issue, which is available to subscribers at hubs.la/Q04r-k3L0. #NeuroTwitter #MedEd**
   - Author/handle: `Key Point 2 from the article Insomnia by`
   - Date: 2026-08-22 21:00 UTC
   - Source URL: https://news.google.com/rss/articles/CBMiY0FVX3lxTE42OHhFajhCMUV6amtlZE0wVXZsTllBaEotN3JWOG5NZnhZYzdoU0tKSUg5Rk9VLTdfRXR6ZFRsNF9YcDlXUlRxY2laQ0hQNDNFcTV5MzRScEVnZm1kTHB4TDJfaw?oc=5
2. **The February 2026 issue on Neurology of #SystemicDisease is now available for back issue purchase at hubs.la/Q04tJWlv0. #Neurology #NeuroTwitter #MedEd @AANmember**
   - Author/handle: `The February 2026 issue on Neurology of `
   - Date: 2026-08-22 15:00 UTC
   - Source URL: https://news.google.com/rss/articles/CBMiY0FVX3lxTE53MWx0Zm1oemtPaU5RMXM1aUJKa0RVdTBqZTh3b1cyNkd5QUZOODZYWVpBU1dVd1hYZ2hIcnNDMVBXN0JIR0c5My1raGZ6X2YtOVZhNGs0V1ZNS2JkcDRTY3p1QQ?oc=5

## Recent Neurology News (broad query, last 2 days)

1. **Experienced neurologist joins Novant Health, expanding access to specialty care in region - thestokesnews.com**
   - Source: thestokesnews.com | 2026-08-23 16:30 UTC
   - https://news.google.com/rss/articles/CBMihwJBVV95cUxON2F4SlZ5QnIwRy1LckpmbDJfMzU2TzFGMEdYTHdWM19SV3c5eVFGdXFnblVJbzNhLVFXTFNrLVFheVJoYmJJTnFwa3BsbXpHMTI1TmRrdFpCS3h5TjRWT1FTN2J5ZF8xRWNYWngxbGE0b2V4Y3NTVHhabFZwZ2NXTWNiYW8yS3g2M01PX3BLNHF6OW9LTmZzcS1xMHNlSng4UjdqV0NZcDNudTZ2akR0WWtZWGdYSXZhSGhmSXQxc0loTGdNNy1tQUUxbEI2SVdwZURRSW1nV3RoNGxILTBxWFNubjVSMkt2RUFKc2JZby1PQi1mRjB3V1p4bHRCenMyWGRXWXdMMA?oc=5
2. **People can sense mental decline, says new research powered by smartwatches - The Mercury News**
   - Source: The Mercury News | 2026-08-23 12:00 UTC
   - https://news.google.com/rss/articles/CBMijAFBVV95cUxQQU94cEtIUDNveUNJay1KWTdGS0tobG1yUDVVWUhsbm9HNHMwNmFncU1wTVVFeEV2cmllWmhpUGpneUVCbUVfQkt1UEt5NzYxQ1BOSUQ4U2pSOUlPUE16SXR2NVNhdXlTTXhFZzQ3Y3hhZnNlSFFvSWhGMWx4MUxpSktHXzJ0d1FabWh6LdIBkgFBVV95cUxOLXkwdDlGVXo5cm51cUlScXozOVF5OTlINmtaTGthTWI3bWFkNGQ4TU9mNzFqclZqM1RGMzB0VXlBdWR2d3VQMWcyYWx0M2hzc0hVRTFFQ1I1YmN4Wi1kYVA5bUNNRFU5ZjRXQXZqVmVoRDVwd0tGbURjYVIxSC00UmZUeWcwbm5nOFpJN0VWMk1hdw?oc=5
3. **Ernakulam General Hospital to launch full-time neurology services - Medical Dialogues**
   - Source: Medical Dialogues | 2026-08-23 09:30 UTC
   - https://news.google.com/rss/articles/CBMizgFBVV95cUxOV0VWa2FrZnF5VElDUVRuNGFFSi1XNHpteEpzNzJTeXpnUXV5LUp6bC1ZOTM1R05KRlBYRnJhaVlYSWlNWmJHOGsyemg5dW1ycFB0V0VzSy00U3VXM2FMZk5aampMRkw2RFM0a2ZjNUg5NWlTRjBPZHNXLWE3OHgxeDV4ZlZDYnJLRlZZUVhjZ1YzYlFmbWU0M3lMNEwydmRnVHZZVHBpWlNxRGVGaVJLVWg4ZUx6OUkzNHpneVF3ZkR1WlRPM3Z1MVlfclJ4QdIB0wFBVV95cUxPV1VkTGZPTUF1RFhWNEtFZ3Z4SU1ueWR6X0dxSEdxYzFFeXB6VkpfQTByLWkwOXJEUVNLek9hUTBSRWxaY1N0Q0FraU5pUXJrTWI3QUd1dlRCZW1QSS1iR2xSV1NfRC10UkJhS2Iyd010UDlUeEpLck5sQlNSWG0yYVYxbDFEMUIwNGlWcWZ2S1lBcGtaRjdyZkV4QXZONlRWYjg4NjlzN0RFNkNMdFF5aEd2N3o0NGhhVTNDSXdiQmZSa0tnSTlHbWhqdXMxSGR0cHM4?oc=5
4. **Neurology clinical researcher brings hope to patients after 10 childhood brain surgeries - Magnolia Reporter**
   - Source: Magnolia Reporter | 2026-08-23 08:00 UTC
   - https://news.google.com/rss/articles/CBMitAFBVV95cUxOamEyUGRJMXpldWx4MlU1WkZjZFFYQk5FZXhsZ3R0MnAtaGlHaXF5Zkd1bDZIZF9fMFp2VU9icFlhZTBzakNJenRGVDktQW1FQU9jR2ItZXFiMk1sT1NxQnFCNVI4TFI4cVdJRjlOemh0MkstdkRuajNkM0xlU2t0SHcyRDdZZU5ybEl4RmhobjFtYzRpblVjOTlCMWctZXhRUkVIbU5aYnpzVWxZMUZoUkx5MWM?oc=5
5. **KMC Hospital, Mangaluru highlights rising stroke risk among young adults - Daijiworld**
   - Source: Daijiworld | 2026-08-23 03:44 UTC
   - https://news.google.com/rss/articles/CBMiZEFVX3lxTE5maHg5S0JPNU1Cb1hvU1RJZFFEM2Q2T2V1RWVuYjBPb1d2cE1qNTdITEFQX2pEUGRkZFhTR2FXN3dqZ2xFWkV1TlJTN2daRGtRNk1CajNlMlZZU3NfbnUxTVhvaFI?oc=5
6. **RECAP: Neurology News Network - Week of August 22nd - NeurologyLive**
   - Source: NeurologyLive | 2026-08-22 18:21 UTC
   - https://news.google.com/rss/articles/CBMijgFBVV95cUxPSWJia2lWQ3V6NzNFeEg1UXhkUXBPQVNwNGZWYWsxclYxdURKZzF1VkdhTlRmZTZTajBaSnQ2YU5hQlJMX2d5aEtwckVva1YtOFpZUVkxeWNKX0RIdnVERWtvVFBfUU5QLTZ2UWhIb3NRTWxzb0ZTempBZUtiMWNOdERRanhlaEMxcjV1d3R3?oc=5
7. **Advancing Neurological Care Through Early Diagnosis, Expertise and Innovation - businessnewsthisweek.com**
   - Source: businessnewsthisweek.com | 2026-08-22 11:24 UTC
   - https://news.google.com/rss/articles/CBMiuAFBVV95cUxPT1QwRTFzZlh4amtoR0xzRGtTZFZrMDdpMGdwYkxWOFNXdExrbUY5VTNUNlJpWlV3ZWxaSHZDZERlOHFPakhLMWVyX1Fac1lCZmM3TXR4V0tabEd4WGRNZjVjNkpvZ2k1bjBaaTZmb3VFMHFrUnl1YmcxOVBJY2ROa2pTQUoxajVJbTRWVlV6QVliOWFleTRLa1dZb0cxeVN3QkI4cllBZ252SzdlMzlrZk55eWdHblFw?oc=5

## Flags

- **>100 likes flag:** NOT CALCULABLE (no engagement data via RSS fallback).
- **Notable / breaking-news candidates (keyword + recency based):**
   - ⭐ `People can sense mental decline, says new research powered by smartwatches - The Mercury News` (The Mercury News, 2026-08-23 12:00 UTC)
   - ⭐ `KMC Hospital, Mangaluru highlights rising stroke risk among young adults - Daijiworld` (Daijiworld, 2026-08-23 03:44 UTC)

---
_Generated automatically by Hermes cron. Method: browser-walled → Google News RSS fallback. Engagement data not available._
