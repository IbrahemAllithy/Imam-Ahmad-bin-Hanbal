// يستورد كل قوائم PLAYLIST_CATALOG (قناة أصحاب الحديث) كسلاسل Lecture في قاعدة البيانات.
// تشغيل: node scripts/importYoutubeCatalog.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';
import { PLAYLIST_CATALOG } from './playlistCatalog.js';

const truncate = (s, max = 200) => {
  const t = String(s || '').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
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

const fetchPlaylistVideos = async (playlistId) => {
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

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ متصل بقاعدة البيانات');

  const onlyId = process.env.ONLY_PLAYLIST_ID;
  const list = onlyId
    ? PLAYLIST_CATALOG.filter((p) => p.id === onlyId)
    : PLAYLIST_CATALOG;
  console.log(`📚 عدد القوائم المطلوب معالجتها: ${list.length}`);

  const now = new Date();
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  const summary = [];

  for (const entry of list) {
    const { id: playlistId, series: SERIES, category: CATEGORY } = entry;
    process.stdout.write(`\n▶ ${SERIES} (${CATEGORY}) … `);

    let videos;
    try {
      videos = await fetchPlaylistVideos(playlistId);
    } catch (err) {
      console.log(`❌ فشل الجلب: ${err.message}`);
      summary.push({ series: SERIES, error: err.message });
      continue;
    }

    if (!videos.length) {
      console.log('⚠️ لا يوجد فيديوهات، تخطّي');
      summary.push({ series: SERIES, videos: 0 });
      continue;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const v of videos) {
      const youtubeId = v.id;
      const order = Number(v.index) || 0;
      const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}&list=${playlistId}`;
      const title = truncate(v.title || `${SERIES} — الدرس ${order}`);
      const description = truncate(
        `الدرس ${order} من سلسلة (${SERIES}).\n\nالعنوان على يوتيوب: ${v.title}`,
        5000
      );

      const existing = await Lecture.findOne({ youtubeId, series: SERIES });

      if (existing) {
        const needsUpdate =
          existing.category !== CATEGORY || existing.order !== order;
        if (needsUpdate) {
          existing.category = CATEGORY;
          existing.order = order;
          existing.youtubeUrl = youtubeUrl;
          await existing.save();
          updated += 1;
        } else {
          skipped += 1;
        }
        continue;
      }

      await Lecture.create({
        title,
        youtubeUrl,
        youtubeId,
        category: CATEGORY,
        series: SERIES,
        description,
        order,
        publishedAt: now,
        quizQuestions: [],
        quizItems: [],
      });
      created += 1;
    }

    totalCreated += created;
    totalUpdated += updated;
    totalSkipped += skipped;
    console.log(`✅ ${videos.length} فيديو — أضيف ${created} / حُدّث ${updated} / تخطّي ${skipped}`);
    summary.push({ series: SERIES, videos: videos.length, created, updated, skipped });
  }

  console.log('\n——— النتيجة الإجمالية ———');
  console.log(`مضاف: ${totalCreated} | محدّث: ${totalUpdated} | متخطّى: ${totalSkipped}`);
  console.log(`عدد السلاسل المعالجة: ${summary.length} / ${list.length}`);

  const failed = summary.filter((s) => s.error);
  if (failed.length) {
    console.log('\n⚠️ سلاسل فشلت:');
    failed.forEach((f) => console.log(`  - ${f.series}: ${f.error}`));
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('❌ فشل الاستيراد:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
