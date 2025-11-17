const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/* ============================================================
   ✅ AUTHENTICATE ANY LOGGED IN USER (Admin OR Student)
   Stores -> req.user = { id, role, email }
============================================================ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token not provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Save decoded user info → (id, role, email)
    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ JWT Verification Failed:", err.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/* ============================================================
   ✅ ADMIN-ONLY ROUTE PROTECTION
============================================================ */
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied – Admins only",
    });
  }

  next();
}

/* ============================================================
   ✅ SUPERADMIN-ONLY PROTECTION (Optional)
============================================================ */
function superAdminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Access denied – Superadmin only",
    });
  }

  next();
}

module.exports = { authenticateToken, adminOnly, superAdminOnly };
