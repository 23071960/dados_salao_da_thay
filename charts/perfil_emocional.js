async function carregarGraficoPerfilEmocional() {
    try {
        const { data, error } = await supabase
            .from('perfil_emocional')
            .select(`
                medo,
                autoestima,
                felicidade,
                motivacao,
                aparencia,
                estresse,
                equilibrio_emocional,
                alegria,
                tristeza,
                raiva
            `);

        if (error) throw error;

        if (!data || data.length === 0) {
            console.warn("Nenhum dado de perfil emocional encontrado");
            return;
        }

        // Calcula a média para cada campo
        const campos = [
            "medo",
            "autoestima",
            "felicidade",
            "motivacao",
            "aparencia",
            "estresse",
            "equilibrio_emocional",
            "alegria",
            "tristeza",
            "raiva"
        ];

        const medias = campos.map(campo => {
            const total = data.reduce((acc, curr) => {
                // Verifica se o valor não é nulo e é um número válido
                const valor = Number(curr[campo]);
                return !isNaN(valor) ? acc + valor : acc;
            }, 0);
            return (total / data.length) || 0; // Evita NaN e usa 0 como padrão
        });

        console.log("📊 Médias Calculadas:", medias);

        const ctx = document.getElementById('perfilEmocionalChart')?.getContext('2d');
        if (!ctx) {
            console.error("Canvas 'perfilEmocionalChart' não encontrado");
            return;
        }

        if (window.perfilEmocionalChart instanceof Chart) {
            window.perfilEmocionalChart.destroy();
        }

        window.perfilEmocionalChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: campos.map(campo => campo.charAt(0).toUpperCase() + campo.slice(1)),
                datasets: [{
                    label: 'Média Emocional',
                    data: medias,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Perfil Emocional Médio dos Clientes'
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 10, // Ajustar conforme os valores máximos da sua escala
                        ticks: {
                            stepSize: 1,
                            beginAtZero: true
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Erro ao carregar gráfico de perfil emocional:", err.message);
    }
}
