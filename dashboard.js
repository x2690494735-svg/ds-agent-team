const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3458;
const LOG_FILE = path.join(__dirname, 'core', 'activity.jsonl');
const HTML_FILE = path.join(__dirname, 'dashboard.html');

function recent(n = 50) {
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    return data.trim().split('\n').slice(-n).map(l => JSON.parse(l)).reverse();
  } catch (e) { return []; }
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/activity') {
    const items = recent(50);
    const stats = {};
    items.forEach(i => {
      if (!i.agent) return;
      if (!stats[i.agent]) stats[i.agent] = { sent: 0, received: 0 };
      if (i.type === 'send') stats[i.agent].sent++;
      else stats[i.agent].received++;
    });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({ items, stats }));
    return;
  }

  fs.readFile(HTML_FILE, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log('Dashboard: http://localhost:' + PORT));
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.log('Dashboard: port ' + PORT + ' in use (already running)');
  else throw e;
});

module.exports = server;
