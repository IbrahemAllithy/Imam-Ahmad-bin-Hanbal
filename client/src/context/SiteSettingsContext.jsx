import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getStorageUrl } from '../services/api';
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_STORAGE_KEY,
} from '../utils/defaultSiteSettings';
import { sheikh as defaultSheikhImage, logo as defaultLogo } from '../assets';

const SiteSettingsContext = createContext(null);

const deepMerge = (base, override) => {
  if (!override || typeof override !== 'object') return base;
  const result = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(override).forEach((key) => {
    const value = override[key];
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (value && typeof value === 'object') {
      result[key] = deepMerge(base?.[key] || {}, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};

const readLocalSettings = () => {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeLocalSettings = (settings) => {
  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const local = readLocalSettings();
    return local ? deepMerge(DEFAULT_SITE_SETTINGS, local) : DEFAULT_SITE_SETTINGS;
  });
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((next) => {
    const merged = deepMerge(DEFAULT_SITE_SETTINGS, next || {});
    setSettings(merged);
    writeLocalSettings(merged);
    return merged;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      if (data?.data) {
        applySettings(data.data);
      }
    } catch {
      // Keep defaults / last known settings when offline — do not invent local "published" edits
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const title = settings.branding?.metaTitle || settings.branding?.siteName;
    if (title) document.title = title;

    const description = settings.branding?.metaDescription;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [settings.branding]);

  const saveSettings = useCallback(
    async (nextSettings, files = {}) => {
      const formData = new FormData();
      formData.append('settings', JSON.stringify(nextSettings));
      if (files.logo) formData.append('logo', files.logo);
      if (files.sheikhImage) formData.append('sheikhImage', files.sheikhImage);

      const { data } = await api.put('/settings', formData);
      const saved = applySettings(data.data);
      return { success: true, data: saved, source: 'api' };
    },
    [applySettings]
  );

  const getImageUrl = useCallback((path, fallback) => {
    if (!path) return fallback;
    return getStorageUrl(path) || fallback;
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refresh,
      saveSettings,
      applySettings,
      getImageUrl,
      sheikhImage: getImageUrl(settings.branding?.sheikhImageUrl, defaultSheikhImage),
      logoImage: getImageUrl(settings.branding?.logoUrl, defaultLogo),
      categoryNames: (settings.categories || []).map((c) => c.name).filter(Boolean),
    }),
    [settings, loading, refresh, saveSettings, applySettings, getImageUrl]
  );

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return ctx;
};
