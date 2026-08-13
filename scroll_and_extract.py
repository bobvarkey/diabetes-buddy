#!/usr/bin/env python3
import json
import subprocess
import time
from pathlib import Path

def run_eval(js_path, out_path):
    cmd = ['openclaw', 'browser', 'evaluate', '--fn', Path(js_path).read_text(),
           '--token', '9d070e5cfb935bf8614f92573eaf0e484d39fcdd3fd76163', '--timeout', '60000']
    env = {'PATH': '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'}
    r = subprocess.run(cmd, capture_output=True, text=True, env=env)
    for line in reversed(r.stdout.strip().splitlines()):
        line = line.strip()
        if line.startswith('{'):
            try:
                data = json.loads(line)
                Path(out_path).write_text(json.dumps(data, indent=2, ensure_ascii=False))
                return data
            except Exception:
                pass
    return None

def scroll():
    cmd = ['openclaw', 'browser', 'evaluate', '--fn',
           '() => { window.scrollTo(0, document.body.scrollHeight); return document.body.scrollHeight; }',
           '--token', '9d070e5cfb935bf8614f92573eaf0e484d39fcdd3fd76163', '--timeout', '30000']
    env = {'PATH': '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'}
    subprocess.run(cmd, capture_output=True, text=True, env=env)

all_posts = []
seen_urls = set()
for i in range(6):
    data = run_eval('/Users/bobvarkey/.openclaw/workspace/extract_x_posts_eval.js', '/tmp/x_neuro1_eval.json')
    if data and 'posts' in data:
        for p in data['posts']:
            if p['url'] and p['url'] not in seen_urls:
                seen_urls.add(p['url'])
                all_posts.append(p)
    print(f"Pass {i+1}: total unique posts {len(all_posts)}")
    scroll()
    time.sleep(2)

Path('/tmp/x_neuro1_all.json').write_text(json.dumps({'count': len(all_posts), 'posts': all_posts}, indent=2, ensure_ascii=False))
print(f"Final unique posts: {len(all_posts)}")
