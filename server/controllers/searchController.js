import Lecture from '../models/Lecture.js';
import Article from '../models/Article.js';
import Book from '../models/Book.js';

export const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { lectures: [], articles: [], books: [] },
      });
    }

    const regex = { $regex: q, $options: 'i' };
    const now = new Date();
    const publishedFilter = {
      $or: [{ publishedAt: { $exists: false } }, { publishedAt: null }, { publishedAt: { $lte: now } }],
    };

    const [lectures, articles, books] = await Promise.all([
      Lecture.find({
        ...publishedFilter,
        $or: [{ title: regex }, { description: regex }, { series: regex }, { category: regex }],
      })
        .sort({ order: 1, createdAt: -1 })
        .limit(12)
        .select('title series category youtubeId createdAt'),
      Article.find({
        ...publishedFilter,
        $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { category: regex }],
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .select('title excerpt category coverImage createdAt'),
      Book.find({
        ...publishedFilter,
        $or: [{ title: regex }, { author: regex }, { description: regex }, { category: regex }],
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .select('title author category coverImage createdAt'),
    ]);

    res.json({
      success: true,
      data: { lectures, articles, books },
      query: q,
    });
  } catch (err) {
    next(err);
  }
};
