// Dashboard principal
checkAuth();
mostrarUsuario();

async function carregarDashboard() {
  const headers = getAuthHeaders();

  // Resumo Geral
  try {
    const res = await fetch('/relatorios/resumo', { headers });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    document.getElementById('faturamento').textContent =
      'R$ ' + parseFloat(data.faturamento_total || 0).toFixed(2);
    document.getElementById('qtdVendas').textContent = data.quantidade_vendas || 0;
    document.getElementById('ticketMedio').textContent =
      'R$ ' + parseFloat(data.ticket_medio || 0).toFixed(2);
  } catch (err) {
    console.error('Erro ao carregar resumo:', err);
  }

  // Faturamento por Dia
  try {
    const res = await fetch('/relatorios/vendas-por-dia', { headers });
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
          backgroundColor: 'rgba(40,167,69,0.15)',
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  } catch (err) {
    console.error('Erro ao carregar vendas por dia:', err);
  }

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
      options: { responsive: true }
    });
  } catch (err) {
    console.error('Erro ao carregar pagamentos:', err);
  }
}

carregarDashboard();
