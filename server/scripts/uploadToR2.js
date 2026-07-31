import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { R2_ENABLED, uploadBufferToR2 } from '../config/r2.js';

/**
 * Uploads a local file to the R2 bucket and prints its public URL — the same bucket, folders
 * and uuid key scheme the upload middleware uses, for files that arrive outside the admin panel.
 *
 *   node scripts/uploadToR2.js "C:/path/to/book.pdf"
 *   node scripts/uploadToR2.js "C:/path/to/clip.mp4" videos
 *
 * The folder defaults to the one matching the file's type (pdfs / videos / covers).
 */
const [filePath, folderArg] = process.argv.slice(2);

if (!filePath) {
  console.error('Usage: node scripts/uploadToR2.js "<file>" [folder]');
  process.exit(1);
}

const FOLDER_BY_MIME = {
  'application/pdf': 'pdfs',
  'video/mp4': 'videos',
  'video/webm': 'videos',
  'video/quicktime': 'videos',
};

const run = async () => {
  if (!R2_ENABLED) {
    console.error(
      'R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,\n' +
        'R2_BUCKET_NAME and R2_PUBLIC_URL in server/.env (see .env.example), then rerun.'
    );
    process.exit(1);
  }

  const buffer = await fs.promises.readFile(filePath);
  const type = await fileTypeFromBuffer(buffer);
  if (!type) {
    console.error('Could not identify the file type from its contents.');
    process.exit(1);
  }

  const folder = folderArg || FOLDER_BY_MIME[type.mime] || 'covers';
  const ext = path.extname(filePath).toLowerCase() || `.${type.ext}`;
  const key = `${folder}/${uuidv4()}${ext}`;

  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`Uploading ${path.basename(filePath)} (${sizeMB}MB, ${type.mime}) → ${key}`);

  const url = await uploadBufferToR2(key, buffer, type.mime);
  console.log(`\n${url}`);
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
