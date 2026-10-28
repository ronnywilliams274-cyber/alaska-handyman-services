const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.mp4':'video/mp4'};
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const name = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
  if (name.includes('/') || name.includes('\\') || !types[path.extname(name)]) { res.writeHead(404).end(); return; }
  const file = path.join(root, name);
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(name)]);
    res.setHeader('Cache-Control', 'no-store');
    const range = req.headers.range && /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    if (range) {
      const start = Number(range[1]), end = Math.min(Number(range[2]) || stat.size - 1, stat.size - 1);
      if (start > end) { res.writeHead(416).end(); return; }
      res.writeHead(206, {'Content-Range':`bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges':'bytes','Content-Length':end-start+1});
      fs.createReadStream(file,{start,end}).pipe(res);
    } else {
      res.writeHead(200, {'Content-Length':stat.size});
      fs.createReadStream(file).pipe(res);
    }
  });
}).listen(3000, '127.0.0.1', () => console.log('Local preview: http://127.0.0.1:3000'));
