console.log("[DEBUG] Iniciando supabase.js");

// ==============================
// 🚀 Configuração do Supabase
// ==============================
const supabaseUrl = 'https://hufrtioqiywncqghboal.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZnJ0aW9xaXl3bmNxZ2hib2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODE3MTksImV4cCI6MjA2MDc1NzcxOX0.SNwH57bVGYwspmsDkRi5kwvZcTiwPba0NOobT-kFko8';

try {
    // Cria o cliente Supabase imediatamente
    window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
    console.log("✅ Cliente Supabase criado:", window.supabase);
} catch (error) {
    console.error("❌ Erro ao criar o cliente Supabase:", error.message);
}

// ==============================
// 🌐 Verificação de Conexão
// ==============================
(async () => {
    try {
        const { error } = await window.supabase.from('clientes').select('id').limit(1);
        if (error) {
            console.error("❌ Erro ao conectar ao Supabase:", error.message);
        } else {
            console.log("✅ Conexão com Supabase verificada com sucesso.");
        }
    } catch (error) {
        console.error("❌ Erro inesperado ao verificar conexão:", error.message);
    }
})();
