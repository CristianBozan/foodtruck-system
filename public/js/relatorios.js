checkAuth();
mostrarUsuario();

async function carregarRelatorios() {
  const headers = getAuthHeaders();

  // Faturamento por Dia
  try {
    const res = await fetch('/relatorios/vendas-por-dia', { headers });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();

    const labels  = data.map(d => d.data);
    const valores = data.map(d => parseFloat(d.total_vendas));

    new Chart(document.getElementById('chartVendasDia'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Faturamento (R$)',
          data: valores,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40,167,69,0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } catch (err) { console.error('Erro vendas-por-dia:', err); }

  // Vendas por Forma de Pagamento
  try {
    const res = await fetch('/relatorios/vendas-por-pagamento', { headers });
    const data = await res.json();
    const labels  = data.map(d => d.forma_pagamento);
    const valores = data.map(d => parseFloat(d.total_vendas));

    new Chart(document.getElementById('chartPagamento'), {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: ['#007bff','#ffc107','#28a745','#dc3545','#6f42c1']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } catch (err) { console.error('Erro vendas-por-pagamento:', err); }

  // Resumo Geral
  try {
    const res = await fetch('/relatorios/resumo', { headers });
    const data = await res.json();
    const el = document.getElementById('resumo');
    el.innerHTML = `
      <li class="list-group-item"><strong>Quantidade de Vendas:</strong> ${data.quantidade_vendas ?? 0}</li>
      <li class="list-group-item"><strong>Faturamento Total:</strong> R$ ${parseFloat(data.faturamento_total || 0).toFixed(2)}</li>
      <li class="list-group-item"><strong>Ticket Médio:</strong> R$ ${parseFloat(data.ticket_medio || 0).toFixed(2)}</li>
    `;
  } catch (err) { console.error('Erro resumo:', err); }
}

carregarRelatorios();
