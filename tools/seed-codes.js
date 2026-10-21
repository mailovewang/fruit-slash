// 2.0.0 上線時用：把現有玩家的好友碼先登記好（codes/{好友碼} = { uid, rc }），避免別人在玩家更新前搶先登記。
// 用法：node tools/seed-codes.js          → 只計算，不寫入
//       node tools/seed-codes.js --write  → 真的寫入
// 需要電腦上的 firebase 指令已登入專案擁有者帳號。不會印出恢復碼。
const fs = require('fs'), os = require('os'), path = require('path');
const PROJECT = 'fruit-slash-31820', WRITE = process.argv.includes('--write');
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

async function token() {
  const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: cfg.tokens.refresh_token,
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com', client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi' }) }).then(r => r.json());
  return r.access_token;
}
async function list(H, coll, mask) {
  const out = []; let page = '';
  do {
    const q = new URLSearchParams({ pageSize: '300' }); mask.forEach(m => q.append('mask.fieldPaths', m)); if (page) q.set('pageToken', page);
    const r = await fetch(`${BASE}/${coll}?${q}`, { headers: H }).then(r => r.json());
    out.push(...(r.documents || [])); page = r.nextPageToken || '';
  } while (page);
  return out;
}
(async () => {
  const H = { authorization: 'Bearer ' + await token(), 'content-type': 'application/json' };
  const saves = await list(H, 'saves', ['save.friendCode', 'updatedAt']);
  const profiles = await list(H, 'profiles', ['code', 'updatedAt']);
  const existing = new Set((await list(H, 'codes', ['uid'])).map(d => d.name.split('/').pop()));
  // 好友碼 → 最新的存檔（恢復碼）；好友碼 → 最新的 uid
  const byCode = {}, uidOf = {};
  for (const d of saves) {
    const fc = d.fields && d.fields.save && d.fields.save.mapValue.fields && d.fields.save.mapValue.fields.friendCode;
    if (!fc) continue;
    const code = fc.stringValue, rc = d.name.split('/').pop(), t = (d.fields.updatedAt || {}).timestampValue || '';
    if (!byCode[code] || byCode[code].t < t) byCode[code] = { rc, t };
  }
  for (const d of profiles) {
    const code = d.fields && d.fields.code && d.fields.code.stringValue, t = (d.fields.updatedAt || {}).timestampValue || '';
    if (code && (!uidOf[code] || uidOf[code].t < t)) uidOf[code] = { uid: d.name.split('/').pop(), t };
  }
  const todo = Object.entries(byCode).filter(([code]) => !existing.has(code));
  console.log(`存檔 ${saves.length} 份・有好友碼 ${Object.keys(byCode).length} 組・已登記 ${existing.size} 組・要登記 ${todo.length} 組（其中 ${todo.filter(([c]) => uidOf[c]).length} 組有排行榜帳號）`);
  if (!WRITE) return console.log('（只計算，沒有寫入。加 --write 才會寫）');
  let ok = 0;
  for (const [code, { rc }] of todo) {
    const body = { fields: { uid: { stringValue: uidOf[code] ? uidOf[code].uid : '' }, rc: { stringValue: rc } } };
    const r = await fetch(`${BASE}/codes?documentId=${code}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
    if (r.ok) ok++; else console.log('失敗', code, r.status);
  }
  console.log(`已登記 ${ok} 組`);
})().catch(e => console.log('ERR', e.message));
