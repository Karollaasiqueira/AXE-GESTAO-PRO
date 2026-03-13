const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  try {
    const { status, tipo, data } = req.query;
    const where = {};

    if (req.userRole === 'CLIENTE') {
      where.clienteId = req.userId;
    } else if (req.userRole === 'MEDIUM') {
      where.mediumId = req.userId;
    }

    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    if (data) {
      const startOfDay = new Date(data);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data);
      endOfDay.setHours(23, 59, 59, 999);
      where.data = { gte: startOfDay, lte: endOfDay };
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: { select: { id: true, name: true, email: true, telefone: true } },
        medium: { select: { id: true, name: true } }
      },
      orderBy: [{ prioridade: 'desc' }, { createdAt: 'asc' }]
    });

    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.filaDodia = async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const fila = await prisma.agendamento.findMany({
      where: {
        data: { gte: hoje, lte: fimDoDia },
        status: { in: ['PENDENTE', 'CONFIRMADO'] }
      },
      include: {
        cliente: { select: { id: true, name: true, telefone: true } },
        medium: { select: { id: true, name: true } }
      },
      orderBy: [{ prioridade: 'desc' }, { createdAt: 'asc' }]
    });

    res.json({
      data: hoje.toISOString().split('T')[0],
      total: fila.length,
      fila
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: req.params.id },
      include: {
        cliente: { select: { id: true, name: true, email: true, telefone: true } },
        medium: { select: { id: true, name: true } }
      }
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento nao encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { clienteId, mediumId, data, tipo, prioridade = 0, observacoes } = req.body;

    if (!data || !tipo) {
      return res.status(400).json({ error: 'Data e tipo sao obrigatorios' });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId: clienteId || req.userId,
        mediumId,
        data: new Date(data),
        tipo,
        prioridade,
        observacoes
      },
      include: {
        cliente: { select: { id: true, name: true } },
        medium: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { data, tipo, mediumId, prioridade, observacoes } = req.body;

    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: {
        ...(data && { data: new Date(data) }),
        ...(tipo && { tipo }),
        ...(mediumId && { mediumId }),
        ...(prioridade !== undefined && { prioridade }),
        ...(observacoes !== undefined && { observacoes })
      },
      include: {
        cliente: { select: { id: true, name: true } },
        medium: { select: { id: true, name: true } }
      }
    });

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmar = async (req, res) => {
  try {
    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMADO', confirmado: true }
    });

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: { status: 'CANCELADO' }
    });

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    await prisma.agendamento.delete({ where: { id: req.params.id } });
    res.json({ message: 'Agendamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
