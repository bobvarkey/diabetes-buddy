#!/bin/zsh
source ~/.nvm/nvm.sh
nvm use 24.19.0 >/dev/null 2>&1
openclaw browser focus neuro-q2 >/dev/null 2>&1
for i in $(seq 1 12); do
  openclaw browser evaluate --fn 'window.scrollTo(0, document.body.scrollHeight); return "scroll";' >/dev/null 2>&1
  sleep 1.5
done
openclaw browser evaluate --fn "$(cat /Users/bobvarkey/.openclaw/workspace/extract_x_posts.js)" > /tmp/x_q2_posts_all.json 2>/tmp/x_q2_err.log
echo "DONE"
