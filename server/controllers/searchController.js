import Lecture from '../models/Lecture.js';
import Article from '../models/Article.js';
import Book from '../models/Book.js';
import { publishedFilter } from '../utils/publish.js';
import { escapeRegex } from '../utils/sanitize.js';

export const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().slice(0, 100);
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { lectures: [], articles: [], books: [] },
      });
    }

    const regex = { $regex: escapeRegex(q), $options: 'i' };
    const pub = publishedFilter();

    const [lectures, articles, books] = await Promise.all([
      Lecture.find({
        ...pub,
        $or: [{ title: regex }, { description: regex }, { series: regex }, { category: regex }],
      })
        .sort({ order: 1, createdAt: -1 })
        .limit(12)
        .select('title series category youtubeId createdAt'),
      Article.find({
        ...pub,
        $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { category: regex }],
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .select('title excerpt category coverImage createdAt'),
      Book.find({
        ...pub,
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
