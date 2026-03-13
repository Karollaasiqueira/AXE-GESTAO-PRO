const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    if (req.userId !== req.params.id && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissao para editar este usuario' });
    }

    const { name, email, telefone, password } = req.body;
    const data = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (telefone !== undefined) data.telefone = telefone;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        telefone: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.alterarStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, name: true, status: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
