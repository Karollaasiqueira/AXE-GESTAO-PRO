const API_URL = window.location.origin + '/api';

// ============ ESTADO ============
let currentUser = null;
let token = localStorage.getItem('token');

// ============ INICIALIZACAO ============
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    loadProfile();
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('agendamento-form').addEventListener('submit', handleNewAgendamento);
});

// ============ AUTENTICACAO ============
async function handleLogin(e) {
  e.preventDefault();
  hideAlerts();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert('login-alert', data.error || 'Erro ao fazer login');
      return;
    }

    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    showDashboard();

  } catch (err) {
    showAlert('login-alert', 'Erro de conexao com o servidor');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideAlerts();

  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const telefone = document.getElementById('reg-phone').value;

  if (password.length < 6) {
    showAlert('login-alert', 'A senha deve ter no minimo 6 caracteres');
    return;
  }

  try {
    const res = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, telefone })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert('login-alert', data.error || 'Erro ao criar conta');
      return;
    }

    showAlert('login-success', 'Conta criada com sucesso! Faca login.');
    toggleForms();

  } catch (err) {
    showAlert('login-alert', 'Erro de conexao com o servidor');
  }
}

async function loadProfile() {
  try {
    const res = await fetch(API_URL + '/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      logout();
      return;
    }

    const data = await res.json();
    currentUser = data;
    showDashboard();

  } catch (err) {
    logout();
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('dashboard-page').style.display = 'none';
  document.getElementById('dashboard-page').className = 'dashboard';
  document.getElementById('login-form').reset();
}

// ============ DASHBOARD ============
function showDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('dashboard-page').style.display = 'block';
  document.getElementById('dashboard-page').className = 'dashboard';

  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-role').textContent = currentUser.role;
  document.getElementById('welcome-msg').textContent = 'Bem-vindo, ' + currentUser.name.split(' ')[0] + '!';

  showSection('home');
  loadStats();
}

function showSection(section) {
  // Esconder secoes
  document.getElementById('section-agendamentos').style.display = 'none';
  document.getElementById('section-usuarios').style.display = 'none';

  // Mostrar/esconder grid de modulos
  const statsGrid = document.querySelector('.stats-grid');
  const modulesGrid = document.querySelector('.modules-grid');
  const welcomeCard = document.querySelector('.welcome-card');

  if (section === 'home') {
    statsGrid.style.display = '';
    modulesGrid.style.display = '';
    welcomeCard.style.display = '';
  } else {
    statsGrid.style.display = 'none';
    modulesGrid.style.display = 'none';
    welcomeCard.style.display = 'none';
    document.getElementById('section-' + section).style.display = 'block';

    if (section === 'agendamentos') loadAgendamentos();
    if (section === 'usuarios') loadUsuarios();
  }
}

async function loadStats() {
  // Estatisticas simuladas (serao reais quando a API estiver completa)
  document.getElementById('stat-agendamentos').textContent = '0';
  document.getElementById('stat-usuarios').textContent = '1';
  document.getElementById('stat-pagamentos').textContent = '0';
  document.getElementById('stat-confirmados').textContent = '0';
}

// ============ AGENDAMENTOS ============
let agendamentos = [];

async function loadAgendamentos() {
  try {
    const res = await fetch(API_URL + '/agendamentos', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.ok) {
      agendamentos = await res.json();
      renderAgendamentos();
    } else {
      // API de agendamentos ainda nao existe, mostrar dados locais
      renderAgendamentos();
    }
  } catch (err) {
    renderAgendamentos();
  }
}

function renderAgendamentos() {
  const tbody = document.getElementById('agendamentos-table');

  if (agendamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">Nenhum agendamento cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = agendamentos.map(ag => {
    const prioridades = ['Nao-socio', 'Co-suplente', 'Socio'];
    const data = new Date(ag.data).toLocaleDateString('pt-BR') + ' ' + new Date(ag.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return '<tr>' +
      '<td>' + (ag.clienteNome || currentUser.name) + '</td>' +
      '<td>' + ag.tipo + '</td>' +
      '<td>' + data + '</td>' +
      '<td>' + (prioridades[ag.prioridade] || 'Nao-socio') + '</td>' +
      '<td><span class="status-badge ' + ag.status.toLowerCase() + '">' + ag.status + '</span></td>' +
      '</tr>';
  }).join('');
}

async function handleNewAgendamento(e) {
  e.preventDefault();

  const tipo = document.getElementById('ag-tipo').value;
  const data = document.getElementById('ag-data').value;
  const observacoes = document.getElementById('ag-obs').value;

  try {
    const res = await fetch(API_URL + '/agendamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        tipo,
        data: new Date(data).toISOString(),
        observacoes,
        clienteId: currentUser.id
      })
    });

    if (res.ok) {
      const newAg = await res.json();
      agendamentos.push(newAg);
    } else {
      // Salvar localmente se a API nao suportar ainda
      agendamentos.push({
        tipo,
        data: new Date(data).toISOString(),
        observacoes,
        status: 'PENDENTE',
        prioridade: 0,
        clienteNome: currentUser.name
      });
    }
  } catch (err) {
    // Salvar localmente
    agendamentos.push({
      tipo,
      data: new Date(data).toISOString(),
      observacoes,
      status: 'PENDENTE',
      prioridade: 0,
      clienteNome: currentUser.name
    });
  }

  renderAgendamentos();
  closeModal('agendamento');
  document.getElementById('agendamento-form').reset();
}

// ============ USUARIOS ============
async function loadUsuarios() {
  const tbody = document.getElementById('usuarios-table');

  // Mostrar usuario atual (API de listar usuarios pode ser adicionada depois)
  if (currentUser) {
    const data = currentUser.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR')
      : '-';

    tbody.innerHTML = '<tr>' +
      '<td>' + currentUser.name + '</td>' +
      '<td>' + currentUser.email + '</td>' +
      '<td><span class="user-role">' + currentUser.role + '</span></td>' +
      '<td>' + data + '</td>' +
      '</tr>';
  }
}

// ============ UI HELPERS ============
function toggleForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleText = document.getElementById('toggle-text');
  const toggleLink = document.getElementById('toggle-link');

  hideAlerts();

  if (loginForm.style.display === 'none') {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    toggleText.textContent = 'Nao tem conta?';
    toggleLink.textContent = 'Criar conta';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    toggleText.textContent = 'Ja tem conta?';
    toggleLink.textContent = 'Fazer login';
  }
}

function showAlert(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.style.display = 'block';
}

function hideAlerts() {
  document.getElementById('login-alert').style.display = 'none';
  document.getElementById('login-success').style.display = 'none';
}

function openModal(name) {
  document.getElementById('modal-' + name).classList.add('active');
}

function closeModal(name) {
  document.getElementById('modal-' + name).classList.remove('active');
}
