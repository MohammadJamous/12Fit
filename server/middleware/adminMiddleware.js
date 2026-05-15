const adminMiddleware = (req, res, next) => {
 
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "super_admin")) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};

module.exports = adminMiddleware;