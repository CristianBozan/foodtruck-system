const API_URL = "http://localhost:3000/produtos";

// Carregar produtos
function carregarProdutos() {
  fetch(API_URL)
    .then(res => res.json())
    .then(produtos => {
      const tbody = document.querySelector("#tabelaProdutos tbody");
      tbody.innerHTML = "";
      produtos.forEach(p => {
        tbody.innerHTML += `
          <tr>
            <td>${p.id_produto}</td>
            <td>${p.nome}</td>
            <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
          </tr>
        `;
      });
    });
}

// Cadastrar produto
document.getElementById("formProduto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, preco })
  });

  // Limpa formulário e recarrega lista
  e.target.reset();
  carregarProdutos();
});

// Inicializa
carregarProdutos();
