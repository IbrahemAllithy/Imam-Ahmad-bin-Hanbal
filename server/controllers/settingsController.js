import SiteSettings, { DEFAULT_SETTINGS } from '../models/SiteSettings.js';
import { removeStorageFile } from '../utils/storage.js';

const SETTINGS_SECTIONS = [
  'branding',
  'hero',
  'homeAbout',
  'announcements',
  'exploreLinks',
  'cta',
  'aboutPage',
  'navbar',
  'footer',
  'contactPage',
  'categories',
];

const deepMerge = (target, source) => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }
  const result = { ...target };
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (value && typeof value === 'object') {
      result[key] = deepMerge(target?.[key] || {}, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};

const toPublicSettings = (doc) => {
  const plain = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, key, createdAt, updatedAt, ...settings } = plain;
  return settings;
};

export const getSettings = async (_req, res, next) => {
  try {
    const doc = await SiteSettings.getSingleton();
    res.json({ success: true, data: toPublicSettings(doc) });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const doc = await SiteSettings.getSingleton();
    const previousLogo = doc.branding?.logoUrl;
    const previousSheikh = doc.branding?.sheikhImageUrl;

    let payload = {};
    if (req.body.settings) {
      payload =
        typeof req.body.settings === 'string'
          ? JSON.parse(req.body.settings)
          : req.body.settings;
    } else {
      SETTINGS_SECTIONS.forEach((section) => {
        if (req.body[section] !== undefined) {
          payload[section] =
            typeof req.body[section] === 'string'
              ? JSON.parse(req.body[section])
              : req.body[section];
        }
      });
    }

    SETTINGS_SECTIONS.forEach((section) => {
      if (payload[section] === undefined) return;
      if (Array.isArray(payload[section])) {
        doc.set(section, payload[section]);
      } else if (payload[section] && typeof payload[section] === 'object') {
        doc.set(section, deepMerge(doc[section]?.toObject?.() || doc[section] || {}, payload[section]));
      } else {
        doc.set(section, payload[section]);
      }
    });

    if (req.files?.logo?.[0]) {
      doc.branding.logoUrl = `/storage/covers/${req.files.logo[0].filename}`;
    }
    if (req.files?.sheikhImage?.[0]) {
      doc.branding.sheikhImageUrl = `/storage/covers/${req.files.sheikhImage[0].filename}`;
    }

    await doc.save();

    if (req.files?.logo?.[0] && previousLogo && previousLogo !== doc.branding.logoUrl) {
      removeStorageFile(previousLogo);
    }
    if (
      req.files?.sheikhImage?.[0] &&
      previousSheikh &&
      previousSheikh !== doc.branding.sheikhImageUrl
    ) {
      removeStorageFile(previousSheikh);
    }

    res.json({ success: true, data: toPublicSettings(doc) });
  } catch (err) {
    next(err);
  }
};

export const resetSettings = async (_req, res, next) => {
  try {
    const doc = await SiteSettings.getSingleton();
    Object.assign(doc, { ...DEFAULT_SETTINGS, key: 'main' });
    await doc.save();
    res.json({ success: true, data: toPublicSettings(doc) });
  } catch (err) {
    next(err);
  }
};
