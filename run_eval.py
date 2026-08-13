#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

js_path = Path(sys.argv[1])
js = js_path.read_text()
cmd = ['openclaw', 'browser', 'evaluate', '--fn', js, '--token', '9d070e5cfb935bf8614f92573eaf0e484d39fcdd3fd76163', '--timeout', '60000', '--json']
env = {'PATH': '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'}
result = subprocess.run(cmd, capture_output=True, text=True, env=env)
try:
    data = json.loads(result.stdout)
    payload = data.get('result')
    s = json.dumps(payload, indent=2, ensure_ascii=False)
    if len(sys.argv) > 2:
        Path(sys.argv[2]).write_text(s)
    print(s)
except Exception as e:
    print('ERROR:', e, file=sys.stderr)
    print(result.stdout)
    print(result.stderr, file=sys.stderr)
    sys.exit(1)
