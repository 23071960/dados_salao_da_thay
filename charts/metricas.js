// metricas.js - Versão Revisada e Otimizada

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔄 Iniciando carregamento dos gráficos...");

    try {
        await carregarGraficoAgendamentos();
        await carregarGraficoServicos();
        await carregarGraficoPerfilEmocional();
    } catch (error) {
        console.error("❌ Erro ao carregar os gráficos:", error.message);
    }
});

// Função genérica para criar gráficos
function criarGrafico(elementId, tipo, labels, dados, opcoes) {
    const ctx = document.getElementById(elementId);

    if (!ctx) {
        console.error(`❌ Elemento <canvas> com id '${elementId}' não encontrado.`);
        return null;
    }

    return new Chart(ctx, {
        type: tipo,
        data: {
            labels: labels,
            datasets: [{
                label: opcoes.label,
                data: dados,
                backgroundColor: opcoes.backgroundColor,
                borderColor: opcoes.borderColor,
                borderWidth: 1
            }]
        },
        options: opcoes.options
    });
}

// =================== Gráfico de Agendamentos ===================
async function carregarGraficoAgendamentos() {
    console.log("🔄 Carregando gráfico de agendamentos...");

    const { data, error } = await window.supabase
        .from('agendamentos')
        .select('data_consulta');

    if (error) throw error;

    console.log("✅ Dados de Agendamentos:", data);

    const contagem = data.reduce((acc, item) => {
        const dataFormatada = new Date(item.data_consulta).toLocaleDateString('pt-BR');
        acc[dataFormatada] = (acc[dataFormatada] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(contagem);
    const valores = Object.values(contagem);

    console.log("📊 Labels para gráfico de Agendamentos:", labels);
    console.log("📊 Valores para gráfico de Agendamentos:", valores);

    criarGrafico('graficoAgendamentos', 'bar', labels, valores, {
        label: 'Agendamentos por Data',
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// =================== Gráfico de Serviços ===================
async function carregarGraficoServicos() {
    console.log("🔄 Carregando gráfico de serviços...");

    const { data, error } = await window.supabase
        .from('servicos')
        .select('servico');

    if (error) throw error;

    console.log("✅ Dados de Serviços:", data);

    const contagem = data.reduce((acc, item) => {
        acc[item.servico] = (acc[item.servico] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(contagem);
    const valores = Object.values(contagem);

    criarGrafico('graficoServicos', 'pie', labels, valores, {
        label: 'Serviços Realizados',
        backgroundColor: [
            '#4CAF50',
            '#FF9800',
            '#F44336',
            '#2196F3',
            '#9C27B0'
        ],
        borderColor: '#FFFFFF',
        options: {
            responsive: true
        }
    });
}

// =================== Gráfico de Perfil Emocional ===================
async function carregarGraficoPerfilEmocional() {
    console.log("🔄 Carregando gráfico de perfil emocional...");

    const { data, error } = await window.supabase
        .from('perfil_emocional')
        .select('felicidade, estresse, motivacao');

    if (error) throw error;

    console.log("✅ Dados de Perfil Emocional:", data);

    const labels = ['Felicidade', 'Estresse', 'Motivação'];
    const valores = [
        data.reduce((sum, item) => sum + item.felicidade, 0),
        data.reduce((sum, item) => sum + item.estresse, 0),
        data.reduce((sum, item) => sum + item.motivacao, 0)
    ];

    criarGrafico('graficoPerfilEmocional', 'radar', labels, valores, {
        label: 'Perfil Emocional',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
}
