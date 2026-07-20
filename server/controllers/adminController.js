import Lecture from '../models/Lecture.js';
import Article from '../models/Article.js';
import Book from '../models/Book.js';
import Contact from '../models/Contact.js';

export const getStats = async (_req, res, next) => {
  try {
    const [lectures, articles, books, contacts, unreadContacts] = await Promise.all([
      Lecture.countDocuments(),
      Article.countDocuments(),
      Book.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
    ]);

    const [recentLectures, recentArticles, recentBooks, recentContacts] = await Promise.all([
      Lecture.find().sort({ createdAt: -1 }).limit(5).select('title category createdAt'),
      Article.find().sort({ createdAt: -1 }).limit(5).select('title category createdAt'),
      Book.find().sort({ createdAt: -1 }).limit(5).select('title author createdAt'),
      Contact.find().sort({ createdAt: -1 }).limit(5).select('name subject read createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        counts: { lectures, articles, books, contacts, unreadContacts },
        recent: {
          lectures: recentLectures,
          articles: recentArticles,
          books: recentBooks,
          contacts: recentContacts,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
