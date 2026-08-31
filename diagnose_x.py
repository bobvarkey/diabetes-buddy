import sys, json, base64, os, time
sys.path.insert(0, "/Users/bobvarkey/.local/share/uv/tools/harness/lib/python3.12/site-packages")
from helpers import list_tabs, switch_tab, screenshot, js, page_info

tabs = list_tabs(include_chrome=False)
print("Tabs:", json.dumps(tabs[:10], indent=2))

# Find first X tab and switch
x_tab = [t for t in tabs if t.get("url", "").startswith("https://x.com")]
if x_tab:
    switch_tab(x_tab[0]["targetId"])
    time.sleep(1)
    info = page_info()
    print("Page info:", json.dumps(info, indent=2))
    # Take screenshot
    path = "/tmp/x_neuro1_check.png"
    screenshot(path, full=False)
    print("Screenshot saved:", path)
    # Check body text
    body = js("document.body ? document.body.innerText.slice(0,3000) : 'no body'")
    print("Body preview:", body[:2000])
    # Count articles
    art = js("document.querySelectorAll('article').length")
    print("Article count:", art)
else:
    print("No X tab found")
