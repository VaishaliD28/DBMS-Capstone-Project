const app = require('../backend/app');

module.exports = (req, res) => {
  // If Vercel strips /api from req.url, restore it for Express route matching
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
