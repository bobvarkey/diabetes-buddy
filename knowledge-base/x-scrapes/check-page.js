import { writeFileSync } from 'fs';

const TARGET = '22B1DA50FCC87E846FAAD6F9196C44F5';
const WS_URL = `ws://127.0.0.1:18800/devtools/page/${TARGET}`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (pending.has(msg.id)) { pending.get(msg.id).resolve(msg); pending.delete(msg.id); }
  });
  return (method, params = {}) => new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, { resolve });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

async function run() {
  const ws = new WebSocket(WS_URL);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const send = await cdp(ws);
  await send('Runtime.enable');
  await send('Page.enable');
  await sleep(2000);

  // screenshot
  await send('Page.captureScreenshot', { format: 'png' }).then(r => {
    if (r.result?.data) writeFileSync('/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-screenshot.png', Buffer.from(r.result.data, 'base64'));
    console.log('screenshot saved', r.result?.data ? 'yes' : 'no', r.error);
  });

  // page source snippet
  const html = await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true });
  const text = html.result?.value || '';
  writeFileSync('/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-source.html', text.slice(0, 50000), 'utf8');
  console.log('source length', text.length);
  console.log('contains login:', /log in|sign in|login|grok|not logged|welcome to x|join x/i.test(text));
  console.log('contains articles:', text.includes('<article'));
  ws.close();
  await sleep(300);
}
run().catch(e => { console.error(e); process.exit(1); });
