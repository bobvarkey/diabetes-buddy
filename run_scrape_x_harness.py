#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/bobvarkey/.openclaw/skills/browser-harness')

from helpers import *          # noqa: F403,F401
from admin import ensure_daemon # noqa: F401

ensure_daemon()

script_path = '/Users/bobvarkey/.openclaw/workspace/scrape_x.py'
with open(script_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Execute the workspace script in a module-like namespace so its top-level
# definitions are true globals (browser-harness's own exec runs inside a
# function, which breaks module-style scripts that reference top-level vars
# from nested functions).
namespace = {
    '__name__': '__main__',
    '__file__': script_path,
}
# Seed namespace with all helper functions so scrape_x.py can use them.
for name, obj in list(globals().items()):
    if not name.startswith('_'):
        namespace[name] = obj

exec(code, namespace)
