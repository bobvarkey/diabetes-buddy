#!/bin/zsh
set -e
source ~/.nvm/nvm.sh
nvm use 24.19.0
TOKEN=$(jq -r '.gateway.auth.token' /Users/bobvarkey/.openclaw/openclaw.json)
openclaw browser snapshot neuro1 --token="$TOKEN" --format ai
