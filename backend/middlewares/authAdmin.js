
const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin only"
      });
    }

    // 4. Attach user info to request
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = authAdmin;



