exports.errorHandler = (err, req, res, next) => {
  console.error('Erro:', err.stack);

  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Erro de validacao no banco de dados',
      code: err.code
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
