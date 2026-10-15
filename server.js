// 本機試玩用的小伺服器：node server.js 然後打開 http://localhost:5173
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'docs');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };

http.createServer((req, res) => {
  const p = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^([/\\])+/, '');
  const file = path.join(root, p || 'index.html');
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(5173, () => console.log('http://localhost:5173'));
