
const jwt = require("jsonwebtoken");

const authDoctor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check token existence
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Enforce doctor role
    if (decoded.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied - Doctor only"
      });
    }

    // 4. Attach minimal user info
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = authDoctor;
