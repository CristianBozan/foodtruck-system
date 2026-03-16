const API_PEDIDOS = "http://localhost:3000/pedidos";
const API_ITENS = "http://localhost:3000/itens-pedido";

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case "finalizado":
      return "status-finalizado";
    case "cancelado":
      return "status-cancelado";
    default:
      return "status-andamento"; // qualquer outro status
  }
}

async function carregarPedidos() {
  try {
    const resPedidos = await fetch(API_PEDIDOS);
    const pedidos = await resPedidos.json();

    const tbody = document.querySelector("#tabelaPedidos tbody");
    tbody.innerHTML = "";

    for (const pedido of pedidos) {
      // busca itens do pedido
      const resItens = await fetch(`${API_ITENS}?id_pedido=${pedido.id_pedido}`);
      const itens = await resItens.json();

      const itensHTML = itens.map(i => 
        `<li>${i.quantidade}x ${i.Produto?.nome || "Produto"} (R$ ${parseFloat(i.subtotal).toFixed(2)})</li>`
      ).join("");

      const statusClass = getStatusClass(pedido.status);

      tbody.innerHTML += `
        <tr>
          <td>${pedido.id_pedido}</td>
          <td>${pedido.id_mesa}</td>
          <td>${pedido.id_atendente}</td>
          <td class="${statusClass}">${pedido.status}</td>
          <td><ul class="itens-lista">${itensHTML}</ul></td>
          <td>
            <button class="btn btn-success btn-sm btn-acao" onclick="finalizarPedido(${pedido.id_pedido})">Finalizar</button>
            <button class="btn btn-danger btn-sm btn-acao" onclick="cancelarPedido(${pedido.id_pedido})">Cancelar</button>
          </td>
        </tr>
      `;
    }
  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
  }
}

async function finalizarPedido(id) {
  try {
    await fetch(`${API_PEDIDOS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalizado" })
    });
    alert(`Pedido ${id} finalizado!`);
    carregarPedidos();
  } catch (err) {
    console.error("Erro ao finalizar pedido:", err);
  }
}

async function cancelarPedido(id) {
  try {
    await fetch(`${API_PEDIDOS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" })
    });
    alert(`Pedido ${id} cancelado!`);
    carregarPedidos();
  } catch (err) {
    console.error("Erro ao cancelar pedido:", err);
  }
}

carregarPedidos();
