const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  try {
    const where = {};

    if (req.userRole === 'CLIENTE') {
      where.userId = req.userId;
    }

    const { status, tipo } = req.query;
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const pagamentos = await prisma.pagamento.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pagamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento nao encontrado' });
    }

    res.json(pagamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { userId, tipo, valor, dataVencimento, metodo } = req.body;

    if (!userId || !tipo || !valor) {
      return res.status(400).json({ error: 'userId, tipo e valor sao obrigatorios' });
    }

    const pagamento = await prisma.pagamento.create({
      data: {
        userId,
        tipo,
        valor,
        dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
        metodo
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(pagamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registrarPagamento = async (req, res) => {
  try {
    const { metodo, transacaoId } = req.body;

    const pagamento = await prisma.pagamento.update({
      where: { id: req.params.id },
      data: {
        status: 'PAGO',
        dataPagamento: new Date(),
        ...(metodo && { metodo }),
        ...(transacaoId && { transacaoId })
      }
    });

    res.json(pagamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const pagamento = await prisma.pagamento.update({
      where: { id: req.params.id },
      data: { status: 'CANCELADO' }
    });

    res.json(pagamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.relatorio = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const where = {};

    if (mes && ano) {
      const inicio = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const fim = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59);
      where.createdAt = { gte: inicio, lte: fim };
    }

    const [pagamentos, totalPago, totalPendente] = await Promise.all([
      prisma.pagamento.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pagamento.aggregate({
        where: { ...where, status: 'PAGO' },
        _sum: { valor: true }
      }),
      prisma.pagamento.aggregate({
        where: { ...where, status: 'PENDENTE' },
        _sum: { valor: true }
      })
    ]);

    res.json({
      resumo: {
        totalPago: totalPago._sum.valor || 0,
        totalPendente: totalPendente._sum.valor || 0,
        quantidade: pagamentos.length
      },
      pagamentos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
