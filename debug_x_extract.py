import sys, time
sys.path.insert(0, "/Users/bobvarkey/.local/share/uv/tools/harness/lib/python3.12/site-packages")
from helpers import cdp, goto, wait_for_load, js

cdp("Emulation.setDeviceMetricsOverride", width=1280, height=900, deviceScaleFactor=1, mobile=False)

url = "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke%20since%3Atoday&src=typed_query&f=top"
print("Navigating...")
goto(url)
print("wait_for_load done")
time.sleep(8)

print("\n=== BODY TEXT (first 800 chars) ===")
print(js("document.body ? document.body.innerText.slice(0,800) : 'NO BODY'") or '')

print("\n=== ARTICLE COUNT ===")
print(js("document.querySelectorAll('article').length"))

print("\n=== ARTICLE HTML SNIPPETS ===")
htmls = js("Array.from(document.querySelectorAll('article')).slice(0,3).map(a => a.outerHTML.slice(0,800))")
for i, h in enumerate(htmls or []):
    print(f"--- article {i} ---")
    print(h[:800])

print("\n=== EXTRACT TEST ===")
result = js("""
(() => {
  const a = document.querySelector('article');
  if (!a) return 'no article';
  return {
    htmlLen: a.outerHTML.length,
    text: (a.innerText || '').slice(0,300),
    links: Array.from(a.querySelectorAll('a')).map(l => ({href: l.getAttribute('href'), text: l.innerText.slice(0,50)})),
    buttons: Array.from(a.querySelectorAll('button')).map(b => ({aria: b.getAttribute('aria-label'), text: b.innerText.slice(0,30)}))
  };
})()
""")
print(result)
