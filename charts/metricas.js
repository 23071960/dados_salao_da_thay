document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔄 Iniciando carregamento dos dados...");

    try {
        // Primeiro carrega as métricas principais
        await carregarMetricasPrincipais();
        
        // Depois carrega os gráficos
        await carregarGraficoAgendamentos();
        await carregarGraficoServicos();
        await carregarGraficoPerfilEmocional();
        
        console.log("✅ Todos os dados foram carregados com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao carregar os dados:", error.message);
    }
});

// =================== MÉTRICAS PRINCIPAIS ===================
async function carregarMetricasPrincipais() {
    console.log("📊 Carregando métricas principais...");
    
    try {
        // 1. Clientes Hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const { data: clientesData, error: clientesError } = await window.supabase
            .from('clientes')
            .select('*', { count: 'exact' })
            .gte('data_cadastro', hoje.toISOString());
        
        if (clientesError) throw clientesError;
        document.getElementById('clientesHoje').textContent = clientesData.length || 0;
        console.log(`👥 Clientes hoje: ${clientesData.length}`);

        // 2. Agendamentos Hoje
        const { data: agendamentosData, error: agendamentosError } = await window.supabase
            .from('agendamentos')
            .select('*', { count: 'exact' })
            .gte('data_consulta', hoje.toISOString())
            .lte('data_consulta', new Date(hoje.getTime() + 86400000).toISOString());
        
        if (agendamentosError) throw agendamentosError;
        document.getElementById('totalAgendamentos').textContent = agendamentosData.length || 0;
        console.log(`📅 Agendamentos hoje: ${agendamentosData.length}`);

        // 3. Faturamento Mensal (com campo valor_cobrado e pago como booleano)
        try {
            const dataAtual = new Date();
            const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
            const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
            
            console.log("📅 Período do mês:", primeiroDiaMes.toISOString(), "até", ultimoDiaMes.toISOString());
            
            const { data: faturamentoData, error: faturamentoError } = await window.supabase
                .from('agendamentos')
                .select('valor_cobrado')
                .eq('pago', true) // pago é booleano (true/false)
                .gte('data_consulta', primeiroDiaMes.toISOString())
                .lte('data_consulta', ultimoDiaMes.toISOString());
            
            console.log("💰 Dados de faturamento:", faturamentoData);
            
            if (faturamentoError) throw faturamentoError;
            
            const faturamentoTotal = faturamentoData.reduce((sum, item) => {
                const valor = parseFloat(item.valor_cobrado) || 0;
                return sum + valor;
            }, 0);
            
            console.log("💰 Total calculado:", faturamentoTotal);
            
            document.getElementById('faturamentoMensal').textContent = 
                `R$ ${faturamentoTotal.toFixed(2).replace('.', ',')}`;
            
        } catch (e) {
            console.error("⚠️ Erro ao carregar faturamento mensal:", e);
            document.getElementById('faturamentoMensal').textContent = "R$ 0,00";
        }

        // 4. Avaliação Média (como não tem tabela, vamos definir como 0)
        document.getElementById('avaliacaoMedia').textContent = "0.0";
        console.log("⭐ Avaliação média: 0.0 (tabela não implementada)");

    } catch (error) {
        console.error("❌ Erro ao carregar métricas principais:", error);
        throw error;
    }
}

// =================== GRÁFICO DE PERFIL EMOCIONAL ===================
async function carregarGraficoPerfilEmocional() {
    console.log("😊 Carregando gráfico de perfil emocional...");

    try {
        // Usando a tabela clientes conforme sua estrutura
        const { data, error } = await window.supabase
            .from('clientes')
            .select('felicidade, autoestima, motivacao');
        
        if (error) throw error;

        if (!data || data.length === 0) {
            console.warn("⚠️ Nenhum dado de cliente encontrado para perfil emocional");
            return;
        }

        // Converter textos para números (caso estejam armazenados como texto)
        const processarValor = (valor) => {
            if (typeof valor === 'number') return valor;
            if (typeof valor === 'string') {
                const num = parseInt(valor);
                return isNaN(num) ? 5 : num; // Valor padrão 5 se não puder converter
            }
            return 5; // Valor padrão
        };

        const labels = ['Felicidade', 'Autoestima', 'Motivação'];
        const valores = [
            data.reduce((sum, item) => sum + processarValor(item.felicidade), 0) / data.length,
            data.reduce((sum, item) => sum + processarValor(item.autoestima), 0) / data.length,
            data.reduce((sum, item) => sum + processarValor(item.motivacao), 0) / data.length
        ];

        criarGrafico('perfilEmocionalChart', 'radar', labels, valores, {
            label: 'Perfil Emocional Médio',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Erro ao carregar gráfico de perfil emocional:", error);
    }
}

// =================== FUNÇÃO PARA CRIAR GRÁFICOS ===================
function criarGrafico(elementId, tipo, labels, dados, opcoes) {
    const ctx = document.getElementById(elementId);

    if (!ctx) {
        console.error(`❌ Elemento <canvas> com id '${elementId}' não encontrado.`);
        return null;
    }

    // Destrói gráfico existente se houver
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    const novoGrafico = new Chart(ctx, {
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

    // Armazena referência ao gráfico no elemento canvas
    ctx.chart = novoGrafico;
    
    return novoGrafico;
}

// =================== GRÁFICO DE AGENDAMENTOS ===================
async function carregarGraficoAgendamentos() {
    console.log("📅 Carregando gráfico de agendamentos...");

    try {
        const { data, error } = await window.supabase
            .from('agendamentos')
            .select('data_consulta')
            .order('data_consulta', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            console.warn("⚠️ Nenhum dado de agendamento encontrado");
            return;
        }

        // Agrupa por data
        const contagem = data.reduce((acc, item) => {
            const dataFormatada = new Date(item.data_consulta).toLocaleDateString('pt-BR');
            acc[dataFormatada] = (acc[dataFormatada] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(contagem);
        const valores = Object.values(contagem);

        criarGrafico('agendamentosChart', 'bar', labels, valores, {
            label: 'Agendamentos por Data',
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Erro ao carregar gráfico de agendamentos:", error);
    }
}

// =================== GRÁFICO DE SERVIÇOS ===================
async function carregarGraficoServicos() {
    console.log("✂️ Carregando gráfico de serviços...");

    try {
        const { data, error } = await window.supabase
            .from('servicos_agendados')  // Assumindo que existe esta tabela de relacionamento
            .select('servico_id, servicos(nome)');

        if (error) throw error;

        if (!data || data.length === 0) {
            console.warn("⚠️ Nenhum dado de serviço encontrado");
            return;
        }

        // Contagem por serviço
        const contagem = data.reduce((acc, item) => {
            const nomeServico = item.servicos?.nome || 'Desconhecido';
            acc[nomeServico] = (acc[nomeServico] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(contagem);
        const valores = Object.values(contagem);

        criarGrafico('servicosChart', 'pie', labels, valores, {
            label: 'Serviços Realizados',
            backgroundColor: [
                '#4CAF50', '#FF9800', '#F44336', 
                '#2196F3', '#9C27B0', '#00BCD4',
                '#FFEB3B', '#795548', '#607D8B'
            ],
            borderColor: '#FFFFFF',
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Erro ao carregar gráfico de serviços:", error);
    }
}