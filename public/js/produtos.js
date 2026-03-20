checkAuth();
mostrarUsuario();

async function carregarProdutos() {
  const res = await fetch('/produtos', { headers: getAuthHeaders() });
  if (res.status === 401) { logout(); return; }
  const produtos = await res.json();

  const tbody = document.querySelector('#tabelaProdutos tbody');
  tbody.innerHTML = '';

  if (!Array.isArray(produtos) || produtos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum produto cadastrado.</td></tr>';
    return;
  }

  produtos.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.id_produto}</td>
        <td>${p.nome}</td>
        <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
        <td>${p.estoque_atual ?? '—'}</td>
        <td><span class="badge ${p.status === 'ativo' ? 'bg-success' : 'bg-secondary'}">${p.status || '—'}</span></td>
      </tr>
    `;
  });
}

document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msgProduto');
  msg.className = 'mt-2';

  const body = {
    nome:   document.getElementById('nome').value.trim(),
    preco:  parseFloat(document.getElementById('preco').value),
    estoque_atual: parseInt(document.getElementById('estoque').value) || 0
  };

  const res = await fetch('/produtos', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });

  if (res.status === 401) { logout(); return; }

  if (res.ok) {
    msg.textContent = 'Produto adicionado com sucesso!';
    msg.classList.add('alert', 'alert-success');
    msg.classList.remove('d-none');
    e.target.reset();
    carregarProdutos();
  } else {
    const err = await res.json();
    msg.textContent = err.error || 'Erro ao adicionar produto.';
    msg.classList.add('alert', 'alert-danger');
    msg.classList.remove('d-none');
  }

  setTimeout(() => msg.classList.add('d-none'), 3000);
});

carregarProdutos();
