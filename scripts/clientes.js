import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Configuração do Supabase
    const supabaseUrl = 'https://hufrtioqiywncqghboal.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZnJ0aW9xaXl3bmNxZ2hib2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODE3MTksImV4cCI6MjA2MDc1NzcxOX0.SNwH57bVGYwspmsDkRi5kwvZcTiwPba0NOobT-kFko8';
    
const supabase = createClient(supabaseUrl, supabaseKey);

const clientesList = document.getElementById("clientesList");
const clienteForm = document.getElementById("clienteForm");
const deleteBtn = document.getElementById("deleteBtn");

async function loadClientes() {
    const { data, error } = await supabase.from("clientes").select("*");
    if (error) {
        alert("Erro ao carregar clientes");
        return;
    }
    clientesList.innerHTML = "";
    data.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome;
        clientesList.appendChild(option);
    });
}

clientesList.addEventListener("change", async () => {
    const id = clientesList.value;
    const { data } = await supabase.from("clientes").select("*").eq("id", id).single();
    document.getElementById("clienteId").value = data.id;
    document.getElementById("nome").value = data.nome;
    document.getElementById("telefone").value = data.telefone;
    document.getElementById("email").value = data.email;
    deleteBtn.style.display = "inline-block";
});

clienteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("clienteId").value;
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;

    if (id) {
        await supabase.from("clientes").update({ nome, telefone, email }).eq("id", id);
        alert("Cliente atualizado com sucesso!");
    } else {
        await supabase.from("clientes").insert([{ nome, telefone, email }]);
        alert("Cliente cadastrado com sucesso!");
    }
    loadClientes();
    clienteForm.reset();
});

deleteBtn.addEventListener("click", async () => {
    const id = document.getElementById("clienteId").value;
    await supabase.from("clientes").delete().eq("id", id);
    alert("Cliente excluído com sucesso!");
    loadClientes();
    clienteForm.reset();
    deleteBtn.style.display = "none";
});


document.getElementById("refreshBtn").addEventListener("click", loadClientes);

loadClientes();
