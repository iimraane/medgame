export const PRODUCTION_ORIGINS = ['https://whatsapp.immo.harpytech.fr', 'https://medgame.harpytech.fr'];
export const LOCAL_VITE_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function isLoopbackDevelopmentOrigin(origin) {
  try {
    const url = new URL(origin);
    return origin === url.origin
      && url.protocol === 'http:'
      && ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getAllowedOrigins(environment = process.env.NODE_ENV) {
  return environment === 'production'
    ? PRODUCTION_ORIGINS
    : [...PRODUCTION_ORIGINS, ...LOCAL_VITE_ORIGINS];
}

export function isAllowedOrigin(origin, environment = process.env.NODE_ENV) {
  return getAllowedOrigins(environment).includes(origin)
    || (environment !== 'production' && isLoopbackDevelopmentOrigin(origin));
}

export function createOriginGuard(environment = process.env.NODE_ENV) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    if (origin && !isAllowedOrigin(origin, environment)) {
      return res.status(403).json({ error: 'Origine non autorisée.' });
    }

    if (!origin && referer) {
      try {
        if (!isAllowedOrigin(new URL(referer).origin, environment)) {
          return res.status(403).json({ error: 'Referer non autorisé.' });
        }
      } catch {
        return res.status(403).json({ error: 'Referer non autorisé.' });
      }
    }

    next();
  };
}
