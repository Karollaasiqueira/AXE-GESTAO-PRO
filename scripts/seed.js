const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Criar usuário ADMIN
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@terreiro.com' },
    update: {},
    create: {
      email: 'admin@terreiro.com',
      password: adminPassword,
      name: 'Administrador do Sistema',
      role: 'ADMIN',
      status: true
    }
  });
  console.log('Admin criado:', admin.email);

  // Criar MEDIUM
  const mediumPassword = await bcrypt.hash('medium123', 10);
  const medium = await prisma.user.upsert({
    where: { email: 'joao.silva@terreiro.com' },
    update: {},
    create: {
      email: 'joao.silva@terreiro.com',
      password: mediumPassword,
      name: 'João Silva',
      role: 'MEDIUM',
      telefone: '11999999999',
      status: true
    }
  });
  console.log('Medium criado:', medium.email);

  // Criar CLIENTE
  const clientPassword = await bcrypt.hash('cliente123', 10);
  const cliente = await prisma.user.upsert({
    where: { email: 'maria@email.com' },
    update: {},
    create: {
      email: 'maria@email.com',
      password: clientPassword,
      name: 'Maria Oliveira',
      role: 'CLIENTE',
      telefone: '11988888888',
      status: true
    }
  });
  console.log('Cliente criado:', cliente.email);

  console.log('');
  console.log('Seed concluido com sucesso!');
  console.log('');
  console.log('CREDENCIAIS DE TESTE:');
  console.log('  Admin:   admin@terreiro.com / admin123');
  console.log('  Medium:  joao.silva@terreiro.com / medium123');
  console.log('  Cliente: maria@email.com / cliente123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
