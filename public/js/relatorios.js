const API_URL = "http://localhost:3000/relatorios";

// Faturamento por Dia
fetch(`${API_URL}/vendas-por-dia`)
  .then(res => res.json())
  .then(data => {
    const labels = data.map(d => d.data);
    const valores = data.map(d => d.total_vendas);

    new Chart(document.getElementById("chartVendasDia"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Faturamento (R$)",
          data: valores,
          borderColor: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  });

// Vendas por Forma de Pagamento
fetch(`${API_URL}/vendas-por-pagamento`)
  .then(res => res.json())
  .then(data => {
    const labels = data.map(d => d.forma_pagamento);
    const valores = data.map(d => d.total_vendas);

    new Chart(document.getElementById("chartPagamento"), {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: ["#007bff", "#ffc107", "#28a745", "#dc3545", "#6f42c1"]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  });

// Resumo Geral
fetch(`${API_URL}/resumo`)
  .then(res => res.json())
  .then(data => {
    const resumoEl = document.getElementById("resumo");
    resumoEl.innerHTML = `
      <li class="list-group-item"><strong>Quantidade de Vendas:</strong> ${data.quantidade_vendas}</li>
      <li class="list-group-item"><strong>Faturamento Total:</strong> R$ ${parseFloat(data.faturamento_total).toFixed(2)}</li>
      <li class="list-group-item"><strong>Ticket Médio:</strong> R$ ${parseFloat(data.ticket_medio).toFixed(2)}</li>
    `;
  });
