const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  console.log('Received token:', token);

  const actualToken = token.split(' ')[1];
  console.log('Actual token:', actualToken);

  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log('Decoded payload:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
