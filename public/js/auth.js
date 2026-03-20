// Utilitário de autenticação — importar antes de qualquer outro script

const TOKEN_KEY = 'ft_token';
const USER_KEY  = 'ft_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function salvarSessao(token, tipo_usuario, nome) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ tipo_usuario, nome }));
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'login.html';
}

// Redireciona para login se não houver token — chame em páginas protegidas
function checkAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Popula o nome do usuário no elemento #nomeUsuario, se existir
function mostrarUsuario() {
  const el = document.getElementById('nomeUsuario');
  if (el) {
    const user = getUser();
    el.textContent = user ? user.nome : '';
  }
}
