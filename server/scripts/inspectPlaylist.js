import fs from 'fs';

const PLAYLIST_ID = 'PLzgycZElueFjEi_wdWoEYhU0_qBlSCXTB';

const res = await fetch(
  'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00',
          hl: 'ar',
          gl: 'EG',
        },
      },
      browseId: `VL${PLAYLIST_ID}`,
    }),
  }
);

const data = await res.json();
fs.writeFileSync(new URL('./playlist-raw.json', import.meta.url), JSON.stringify(data));
const s = JSON.stringify(data);
const ids = [...s.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]);
console.log('unique ids', [...new Set(ids)].length);
console.log([...new Set(ids)]);
console.log('playlistVideoRenderer', (s.match(/playlistVideoRenderer/g) || []).length);
console.log('lockupViewModel', (s.match(/lockupViewModel/g) || []).length);
