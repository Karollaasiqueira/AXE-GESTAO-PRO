const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar permissões
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
