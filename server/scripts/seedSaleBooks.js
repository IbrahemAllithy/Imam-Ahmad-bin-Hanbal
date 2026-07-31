import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import SaleBook from '../models/SaleBook.js';
import SiteSettings from '../models/SiteSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_COVERS_DIR = path.join(__dirname, '..', 'seed', 'sale-covers');

// Cover files are checked into the repo (server/seed/sale-covers), served via
// the /seed-covers static route — unlike /storage, which is gitignored and
// not guaranteed to survive a redeploy.
const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await SaleBook.countDocuments();
  if (existing > 0) {
    console.log(`SaleBook already has ${existing} entries — skipping seed.`);
  } else {
    const files = fs
      .readdirSync(SEED_COVERS_DIR)
      .filter((f) => /\.(jpe?g|png)$/i.test(f))
      .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));

    let order = 0;
    for (const file of files) {
      await SaleBook.create({
        title: `كتاب ${order + 1}`,
        coverImage: `/seed-covers/${file}`,
        order,
      });
      order += 1;
    }
    console.log(`Imported ${order} sale books.`);
  }

  const settings = await SiteSettings.getSingleton();
  if (!settings.bookStore?.whatsappNumber) {
    settings.set('bookStore', { whatsappNumber: '+201102085387' });
  }
  const hasLink = (settings.navbar?.links || []).some((l) => l.to === '/buy-books');
  if (!hasLink) {
    settings.navbar.links.push({ to: '/buy-books', label: 'شراء الكتب' });
  }
  await settings.save();
  console.log('Site settings updated: bookStore + navbar link ensured.');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
