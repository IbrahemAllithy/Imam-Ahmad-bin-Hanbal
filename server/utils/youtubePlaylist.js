// مشترك بين سكربت الاستيراد من الطرفية (scripts/importYoutubeCatalog.js) ولوحة التحكم.
export const extractPlaylistId = (input) => {
  const value = String(input || '').trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const listParam = url.searchParams.get('list');
    if (listParam) return listParam;
  } catch {
    // ليس رابطاً صالحاً — افترض أن القيمة نفسها معرّف القائمة
  }
  return /^[\w-]{10,}$/.test(value) ? value : null;
};

const browse = async (playlistId, token = null) => {
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
  else body.browseId = `VL${playlistId}`;

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

export const fetchPlaylistVideos = async (playlistId) => {
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
        videos.push({ index: videos.length + 1, id, title: String(title).trim() });
      }
    }

    if (node.playlistVideoRenderer?.videoId) {
      const r = node.playlistVideoRenderer;
      const id = r.videoId;
      const title =
        r.title?.runs?.map((x) => x.text).join('') || r.title?.simpleText || id;
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

  let data = await browse(playlistId);
  walk(data);

  let guard = 0;
  while (continuation && guard < 60) {
    guard += 1;
    const token = continuation;
    continuation = null;
    data = await browse(playlistId, token);
    walk(data);
  }

  videos.forEach((v, i) => {
    v.index = i + 1;
  });
  return videos;
};
