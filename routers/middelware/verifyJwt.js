import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET


export function authenticateToken (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
}


// export const authMiddleware = (req, res, next) => {
//     // Get the JWT token from the Authorization header
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: 'Auth failed!' });
//     }
  
//     try {
//       // Verify the JWT token using the secret key
//       const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//       // Extract the user ID and email from the token's payload
//       const userId = decodedToken.id;
//       const userEmail = decodedToken.email;
//       // Store the user information in the request object
//       req.userId = userId;
//       req.userEmail = userEmail;
//       // Call the next middleware function
//       next();
//     } catch (error) {
//       res.status(401).json({ message: 'Auth failed!' });
//     }
//   };