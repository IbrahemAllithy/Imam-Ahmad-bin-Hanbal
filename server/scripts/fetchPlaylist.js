import fs from 'fs';

const PLAYLIST_ID = 'PLzgycZElueFjEi_wdWoEYhU0_qBlSCXTB';

const browse = async (token = null) => {
  const body = {
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20240101.00.00',
        hl: 'ar',
        gl: 'EG',
      },
    },
  };
  if (token) body.continuation = token;
  else body.browseId = `VL${PLAYLIST_ID}`;

  const res = await fetch(
    'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  return res.json();
};

const videos = [];
const seen = new Set();
let continuation = null;

const walk = (node) => {
  if (!node || typeof node !== 'object') return;

  if (node.lockupViewModel?.contentId) {
    const id = node.lockupViewModel.contentId;
    const title =
      node.lockupViewModel.metadata?.lockupMetadataViewModel?.title
        ?.content ||
      node.lockupViewModel.metadata?.title?.content ||
      id;
    if (id && id.length === 11 && !seen.has(id)) {
      seen.add(id);
      videos.push({
        index: videos.length + 1,
        id,
        title: String(title).trim(),
      });
    }
  }

  if (node.playlistVideoRenderer?.videoId) {
    const r = node.playlistVideoRenderer;
    const id = r.videoId;
    const title =
      r.title?.runs?.map((x) => x.text).join('') ||
      r.title?.simpleText ||
      id;
    if (!seen.has(id)) {
      seen.add(id);
      videos.push({
        index: Number(r.index?.simpleText || videos.length + 1),
        id,
        title,
      });
    }
  }

  if (node.continuationItemRenderer) {
    continuation =
      node.continuationItemRenderer?.continuationEndpoint?.continuationCommand
        ?.token ||
      node.continuationItemRenderer?.continuationEndpoint?.command
        ?.continuationCommand?.token ||
      continuation;
  }

  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') walk(v);
  }
};

let data = await browse();
walk(data);

let guard = 0;
while (continuation && guard < 40) {
  guard += 1;
  const token = continuation;
  continuation = null;
  data = await browse(token);
  walk(data);
}

videos.forEach((v, i) => {
  v.index = i + 1;
});

fs.writeFileSync(
  new URL('./playlist-videos.json', import.meta.url),
  JSON.stringify(videos, null, 2),
  'utf8'
);
console.log('COUNT', videos.length);
console.log(videos.slice(0, 5));
console.log('...');
console.log(videos.slice(-3));
