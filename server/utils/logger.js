const levels = { error: 0, warn: 1, info: 2 };

const log = (level, message, meta = {}) => {
  if (levels[level] > levels.info) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  security: (message, meta) => log('warn', `[SECURITY] ${message}`, meta),
};

export default logger;
