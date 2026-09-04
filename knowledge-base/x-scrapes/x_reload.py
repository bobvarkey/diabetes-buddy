import json, time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp("http://127.0.0.1:18800")
    ctx = browser.contexts[0]
    page = ctx.pages[0]
    page.bring_to_front()
    for attempt in range(4):
        page.goto("https://x.com/home", wait_until="domcontentloaded")
        time.sleep(8)
        n = page.evaluate("document.querySelectorAll('article[data-testid=\"tweet\"]').length")
        print(f"attempt {attempt}: count={n}")
        if n > 0:
            break
    body = page.evaluate("document.body ? document.body.innerText.slice(0,300) : ''")
    print("BODY:", body)
    browser.close()
