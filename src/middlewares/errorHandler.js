// Middleware de tratamento de erros - sempre retorna JSON
exports.errorHandler = (err, req, res, next) => {
  console.error('Erro:', err.stack);

  // Erro de validação do Prisma
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Erro de validação no banco de dados',
      code: err.code
    });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  // Erro de JSON inválido no body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
