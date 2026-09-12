import User from "../models/User.js";

export const requireHealthRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).select("healthRole");
      if (!user || !allowedRoles.includes(user.healthRole)) {
        return res.status(403).json({ message: "Access denied for your role." });
      }
      req.healthRole = user.healthRole;
      next();
    } catch (error) {
      res.status(500).json({ message: "Role check failed." });
    }
  };
};