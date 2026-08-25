#!/bin/zsh
set -e
source ~/.nvm/nvm.sh
nvm use 24.19.0
TOKEN=$(jq -r '.gateway.auth.token' /Users/bobvarkey/.openclaw/openclaw.json)
openclaw browser open 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today' --profile=openclaw --label=neuro1 --token="$TOKEN" --json
