const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Like `protect`, but does not 401 if no/invalid token — req.user stays undefined.
// Use for endpoints that should serve both authenticated and anonymous callers.
const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    // ignore — treat as anonymous
  }
  next();
};

module.exports = { optionalAuth };
