export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "No tienes permiso para realizar esta acción." });
    }
    return next();
  };
}
