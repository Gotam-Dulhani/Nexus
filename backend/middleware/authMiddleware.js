const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    console.log(`Authenticated request from user: ${req.user.id}`);
    next();
  } catch (error) {
    console.error('JWT Verification failed:', error.message);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = protect;