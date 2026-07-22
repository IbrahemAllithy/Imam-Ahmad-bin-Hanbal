import path from 'path';
import fs from 'fs';
import { STORAGE_PATHS } from '../middleware/upload.js';

// Deletes a previously-uploaded file given its public path (e.g. "/storage/covers/xyz.jpg").
export const removeStorageFile = (publicPath) => {
  if (!publicPath) return;
  const relative = publicPath.replace(/^\/storage\//, '');
  const fullPath = path.join(STORAGE_PATHS.STORAGE_ROOT, relative);
  if (fullPath.startsWith(STORAGE_PATHS.STORAGE_ROOT) && fs.existsSync(fullPath)) {
    fs.unlink(fullPath, () => {});
  }
};
