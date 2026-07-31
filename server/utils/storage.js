import path from 'path';
import fs from 'fs';
import { STORAGE_PATHS } from '../middleware/upload.js';
import { isR2Url, deleteFromR2ByUrl } from '../config/r2.js';

// Deletes a previously-uploaded file given its public path/URL — either an R2 object URL
// or a legacy local "/storage/covers/xyz.jpg" path (from before the R2 migration).
export const removeStorageFile = (publicPath) => {
  if (!publicPath) return;

  if (isR2Url(publicPath)) {
    deleteFromR2ByUrl(publicPath);
    return;
  }

  const relative = publicPath.replace(/^\/storage\//, '');
  const fullPath = path.join(STORAGE_PATHS.STORAGE_ROOT, relative);
  if (fullPath.startsWith(STORAGE_PATHS.STORAGE_ROOT) && fs.existsSync(fullPath)) {
    fs.unlink(fullPath, () => {});
  }
};
