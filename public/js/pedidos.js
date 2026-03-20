checkAuth();
mostrarUsuario();

function getStatusClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'finalizado': return 'status-finalizado';
    case 'cancelado':  return 'status-cancelado';
    default:           return 'status-andamento';
  }
}

async function carregarPedidos() {
  const msg   = document.getElementById('msgPedidos');
  const tbody = document.querySelector('#tabelaPedidos tbody');

  msg.textContent = 'Carregando pedidos...';
  msg.classList.remove('d-none');

  try {
    const res = await fetch('/pedidos', { headers: getAuthHeaders() });
    if (res.status === 401) { logout(); return; }

    const pedidos = await res.json();
    msg.classList.add('d-none');
    tbody.innerHTML = '';

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum pedido encontrado.</td></tr>';
      return;
    }

    for (const pedido of pedidos) {
      let itensHTML = '—';
      try {
        const resItens = await fetch(`/itens-pedido?id_pedido=${pedido.id_pedido}`, { headers: getAuthHeaders() });
        if (resItens.ok) {
          const itens = await resItens.json();
          if (Array.isArray(itens) && itens.length > 0) {
            itensHTML = '<ul class="itens-lista mb-0">' +
              itens.map(i =>
                `<li>${i.quantidade}x ${i.Produto?.nome || 'Produto'} (R$ ${parseFloat(i.subtotal || 0).toFixed(2)})</li>`
              ).join('') + '</ul>';
          }
        }
      } catch { /* ignora erro de itens */ }

      const statusClass = getStatusClass(pedido.status);

      tbody.innerHTML += `
        <tr>
          <td>${pedido.id_pedido}</td>
          <td>${pedido.id_mesa}</td>
          <td>${pedido.id_atendente}</td>
          <td><span class="${statusClass}">${pedido.status}</span></td>
          <td>${itensHTML}</td>
          <td>
            <button class="btn btn-success btn-sm btn-acao me-1" onclick="atualizarStatus(${pedido.id_pedido},'finalizado')">Finalizar</button>
            <button class="btn btn-danger btn-sm btn-acao" onclick="atualizarStatus(${pedido.id_pedido},'cancelado')">Cancelar</button>
          </td>
        </tr>
      `;
    }
  } catch (err) {
    msg.textContent = 'Erro ao carregar pedidos.';
    msg.className = 'alert alert-danger';
    console.error(err);
  }
}

async function atualizarStatus(id, status) {
  const confirmMsg = status === 'finalizado' ? `Finalizar pedido #${id}?` : `Cancelar pedido #${id}?`;
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/pedidos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.status === 401) { logout(); return; }
    alert(`Pedido ${id} ${status}!`);
    carregarPedidos();
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err);
  }
}

carregarPedidos();
