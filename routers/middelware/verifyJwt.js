import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      // Check if the error is due to token expiration
      if (err.name === 'TokenExpiredError') {

        // Allow access to certain routes even if the token is expired
        if (req.url === '/api/auth/login' || req.url === '/api/auth/logout') {
          // Continue to the next middleware or route handler
          return next();
        }
      }
      return res.status(401).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}