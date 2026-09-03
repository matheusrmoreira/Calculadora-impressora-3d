let graficoComposicao;
let graficoProjecao;

function formatarBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function inicializarGraficos() {
  const ctx1 = document.getElementById('graficoComposicao').getContext('2d');
  graficoComposicao = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Filamento', 'Energia', 'Manutenção', 'Lucro'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#38bdf8', '#fbbf24', '#f87171', '#4ade80'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f8fafc' } }
      }
    }
  });

  const ctx2 = document.getElementById('graficoProjecao').getContext('2d');
  graficoProjecao = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Custo de Produção Total (R$)',
          data: [],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Preço de Venda Total (R$)',
          data: [],
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#f8fafc' } }
      }
    }
  });
}

function atualizarPrecoMaterial() {
  const select = document.getElementById('material');
  const inputPreco = document.getElementById('precoFilamento');
  
  if (select.value !== 'custom') {
    inputPreco.value = select.value;
  }
  calcular();
}

function calcular() {
  const gramasUnitarias = parseFloat(document.getElementById('gramas').value) || 0;
  const precoFilamento = parseFloat(document.getElementById('precoFilamento').value) || 0;
  const taxaFalha = parseFloat(document.getElementById('taxaFalha').value) || 0;
  const horasTotais = parseFloat(document.getElementById('horas').value) || 0; 
  const tarifaKwh = parseFloat(document.getElementById('tarifaKwh').value) || 0;
  const taxaManutencaoHora = parseFloat(document.getElementById('taxaManutencao').value) || 0;
  const margemLucro = parseFloat(document.getElementById('margemLucro').value) || 0;
  const qtdPecas = parseInt(document.getElementById('quantidade').value) || 1;

  const gramasTotais = gramasUnitarias * qtdPecas;

  const custoGrama = precoFilamento / 1000;
  const custoFilamentoBase = gramasTotais * custoGrama;
  const custoFilamentoComFalha = custoFilamentoBase * (1 + (taxaFalha / 100));
  
  const custoEnergia = horasTotais * 0.15 * tarifaKwh; 
  const custoManutencao = horasTotais * taxaManutencaoHora;

  const custoTotal = custoFilamentoComFalha + custoEnergia + custoManutencao;
  const valorLucro = custoTotal * (margemLucro / 100);
  const precoVendaTotal = custoTotal + valorLucro;
  const precoVendaUnitario = qtdPecas > 0 ? (precoVendaTotal / qtdPecas) : 0;

  document.getElementById('resFilamento').innerText = formatarBRL(custoFilamentoComFalha);
  document.getElementById('resEnergia').innerText = formatarBRL(custoEnergia);
  document.getElementById('resManutencao').innerText = formatarBRL(custoManutencao);
  document.getElementById('resCustoTotal').innerText = formatarBRL(custoTotal);
  document.getElementById('resPrecoUnitario').innerText = formatarBRL(precoVendaUnitario);
  document.getElementById('resPrecoVenda').innerText = formatarBRL(precoVendaTotal);

  if (graficoComposicao) {
    graficoComposicao.data.datasets[0].data = [
      custoFilamentoComFalha.toFixed(2),
      custoEnergia.toFixed(2),
      custoManutencao.toFixed(2),
      valorLucro.toFixed(2)
    ];
    graficoComposicao.update();
  }

  if (graficoProjecao) {
    const labelsHoras = [];
    const dataCustos = [];
    const dataPrecos = [];

    const limiteHoras = Math.max(horasTotais * 2, 12);
    const passo = Math.max(1, Math.ceil(limiteHoras / 6));

    for (let h = 1; h <= limiteHoras; h += passo) {
      labelsHoras.push(`${h}h`);
      const e = h * 0.15 * tarifaKwh;
      const m = h * taxaManutencaoHora;
      const c = custoFilamentoComFalha + e + m;
      const v = c * (1 + (margemLucro / 100));
      
      dataCustos.push(c.toFixed(2));
      dataPrecos.push(v.toFixed(2));
    }

    graficoProjecao.data.labels = labelsHoras;
    graficoProjecao.data.datasets[0].data = dataCustos;
    graficoProjecao.data.datasets[1].data = dataPrecos;
    graficoProjecao.update();
  }
}

window.onload = () => {
  inicializarGraficos();
  calcular();
};