const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
try {
const authHeader = req.headers.authorization;


if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    message: "Authentication required. Please log in.",
  });
}

const token = authHeader.split(" ")[1];

if (!token) {
  return res.status(401).json({
    message: "Authentication token is missing.",
  });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);

if (!decoded.userId) {
  return res.status(401).json({
    message: "Invalid authentication token.",
  });
}

req.userId = decoded.userId;

next();


} catch (error) {
return res.status(401).json({
message: "Invalid or expired token. Please log in again.",
});
}
}

module.exports = authMiddleware;
