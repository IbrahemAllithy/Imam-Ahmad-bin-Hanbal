import https from 'https';

const get = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(d));
      })
      .on('error', reject);
  });

const bases = [
  'https://imam-ahmad-bin-hanbal.vercel.app',
  'https://imam-ahmad-bin-hanbal-l1jp.vercel.app',
];

for (const base of bases) {
  const html = await get(`${base}/`);
  const m = html.match(/\/assets\/index-[^"']+\.js/);
  console.log('\nBASE', base);
  console.log('script', m && m[0]);
  if (!m) continue;
  const js = await get(`${base}${m[0]}`);
  const apis = [...new Set(js.match(/https?:\/\/[^"'\\\s)]+\/api/g) || [])];
  console.log('apis', apis);
  console.log('hasLocalhost', js.includes('localhost:5000'));
  const idx = js.indexOf('localhost:5000');
  if (idx !== -1) console.log('context', js.slice(Math.max(0, idx - 30), idx + 50));
}
