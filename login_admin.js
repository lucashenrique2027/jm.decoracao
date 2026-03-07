// Configuração Supabase
const SUPABASE_URL = 'https://pubyfyfivodmnzrwpdhe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D87EPGcjKSxvp_GN5oaqxA_BsCL4EfY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

// Versão defensiva de showTab — evita erro se funções não estiverem definidas
function showTab(id) {
    try {
        document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
        const el = document.getElementById(id);
        if (!el) { console.warn('Aba não encontrada:', id); return; }
        el.style.display = 'block';

        // Chama renderizações só se existirem
        if (id === 'estoque' && typeof renderEstoque === 'function') renderEstoque();
        if (id === 'pedidos' && typeof renderPedidos === 'function') renderPedidos();
        if (id === 'usuarios' && typeof renderClientes === 'function') renderClientes();
        if (id === 'graficos' && typeof renderGrafico === 'function') renderGrafico();
    } catch (err) {
        console.error('Erro em showTab:', err);
    }
}

// --- FUNÇÃO PARA SALVAR ---
async function salvarProduto() {
    try {
        const nome = document.getElementById('n-nome').value;
        const preco = document.getElementById('n-preco').value;
        const desc = document.getElementById('n-desc').value;

        if(!nome || !preco) return alert("Preencha nome e preço!");

        const { error } = await supabaseClient.from('produtos').upsert([
            { 
                nome: nome, 
                preco: parseFloat(preco), 
                descricao: desc, 
                status: 'Disponível' 
            }
        ], { onConflict: 'nome' });

        if(!error) {
            alert("Produto salvo com sucesso!");
            // evita reload completo; atualiza estoque e limpa inputs
            document.getElementById('n-nome').value = '';
            document.getElementById('n-preco').value = '';
            document.getElementById('n-desc').value = '';
            if (typeof renderEstoque === 'function') renderEstoque();
            showTab('estoque');
        } else {
            alert("Erro no Supabase: " + (error.message || JSON.stringify(error)));
        }
    } catch (err) {
        console.error('Erro salvarProduto:', err);
        alert('Erro inesperado ao salvar produto.');
    }
}

// --- ESTOQUE COM VALORES ---
async function renderEstoque() {
    try {
        const { data: produtos, error } = await supabaseClient.from('produtos').select('*').order('nome', { ascending: true });
        if (error) { console.error('Erro renderEstoque:', error); return; }
        if(!produtos) return;

        document.getElementById('sel-prod-estoque').innerHTML = '<option value="">-- Selecionar Produto --</option>' + produtos.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');
        document.querySelector('#tabela-estoque tbody').innerHTML = produtos.map(p => `
            <tr>
                <td>${escapeHtml(p.nome)}</td>
                <td>R$ ${formatMoney(p.preco)}</td>
                <td><span class="status-badge ${p.status === 'Esgotado' ? 'badge-esg' : 'badge-disp'}">${escapeHtml(p.status || 'Disponível')}</span></td>
                <td><button class="btn-del" onclick="removerItem('produtos', '${p.id}', '${escapeHtml(p.nome)}')">Excluir</button></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erro renderEstoque (catch):', err);
    }
}

async function atualizarEstoque() {
    try {
        const nome = document.getElementById('sel-prod-estoque').value;
        const status = document.getElementById('sel-status').value;
        if (!nome) return alert('Selecione um produto.');
        await supabaseClient.from('produtos').update({ status }).eq('nome', nome);
        renderEstoque();
        alert("Status atualizado!");
    } catch (err) {
        console.error('Erro atualizarEstoque:', err);
        alert('Erro ao atualizar status.');
    }
}

// --- PEDIDOS CONECTADOS ---
async function renderPedidos() {
    try {
        const { data: pedidos, error } = await supabaseClient.from('pedidos').select('*').order('id', {ascending: false});
        if (error) { console.error('Erro renderPedidos:', error); return; }
        if(!pedidos) {
            document.querySelector('#tabela-pedidos tbody').innerHTML = '<tr><td colspan="5">Nenhum pedido.</td></tr>';
            document.getElementById('total-dinheiro').innerText = 'R$ 0,00';
            document.getElementById('total-pedidos-count').innerText = '0';
            return;
        }

        let total = 0;
        document.querySelector('#tabela-pedidos tbody').innerHTML = pedidos.map(ped => {
            // tenta ler campos de identidade; adapta se nomes diferem
            const displayId = ped.id_unico ?? ped.id ?? '';
            const clienteNome = ped.cliente_nome ?? ped.cliente ?? '';
            const produtoNome = ped.produto_nome ?? ped.produto ?? '';
            const statusEntrega = ped.status_entrega ?? ped.status ?? '';

            // soma somente se existir campo total numérico
            if (typeof ped.total === 'number') total += ped.total;

            return `<tr>
                <td>#${escapeHtml(displayId)}</td>
                <td><b>${escapeHtml(clienteNome)}</b></td>
                <td>${escapeHtml(produtoNome)}</td>
                <td>
                    <select onchange="mudarStatusPedido('${ped.id}', this.value)" class="${statusEntrega === 'Entregue' ? 'badge-disp' : statusEntrega === 'Enviado' ? 'badge-env' : 'badge-prep'}">
                        <option value="Preparo" ${statusEntrega === 'Preparo' ? 'selected' : ''}>Preparo</option>
                        <option value="Enviado" ${statusEntrega === 'Enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="Entregue" ${statusEntrega === 'Entregue' ? 'selected' : ''}>Entregue</option>
                    </select>
                </td>
                <td><button class="btn-del" onclick="removerItem('pedidos', '${ped.id}', 'Pedido #${escapeHtml(displayId)}')">Excluir</button></td>
            </tr>`;
        }).join('');

        document.getElementById('total-dinheiro').innerText = "R$ " + formatMoney(total);
        document.getElementById('total-pedidos-count').innerText = pedidos.length;
    } catch (err) {
        console.error('Erro renderPedidos (catch):', err);
    }
}

async function mudarStatusPedido(id, status) {
    try {
        await supabaseClient.from('pedidos').update({ status_entrega: status }).eq('id', id);
        renderPedidos();
    } catch (err) {
        console.error('Erro mudarStatusPedido:', err);
    }
}

// --- CLIENTES ---
async function renderClientes() {
    try {
        const { data: clientes, error } = await supabaseClient.from('clientes').select('*').order('nome', { ascending: true });
        if (error) { console.error('Erro renderClientes:', error); return; }
        if(!clientes) {
            document.querySelector('#tabela-clientes tbody').innerHTML = '<tr><td colspan="3">Nenhum cliente.</td></tr>';
            return;
        }
        document.querySelector('#tabela-clientes tbody').innerHTML = clientes.map(cli => `
            <tr>
                <td>${escapeHtml(cli.nome)}</td>
                <td>${escapeHtml(cli.cpf || '')}</td>
                <td><button class="btn-del" onclick="removerItem('clientes', '${cli.id}', '${escapeHtml(cli.nome)}')">Remover</button></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erro renderClientes (catch):', err);
    }
}

async function cadastrarClienteManual() {
    try {
        const n = document.getElementById('manual-nome').value;
        const c = document.getElementById('manual-cpf').value;
        if(!n || c.length < 14) return alert("Dados inválidos.");
        await supabaseClient.from('clientes').insert([{ nome: n, cpf: c, endereco: "Admin" }]);
        document.getElementById('manual-nome').value = '';
        document.getElementById('manual-cpf').value = '';
        renderClientes();
    } catch (err) {
        console.error('Erro cadastrarClienteManual:', err);
        alert('Erro ao cadastrar cliente.');
    }
}

// --- LIXEIRA E EXCLUSÃO ---
async function removerItem(tabela, id, nome) {
    try {
        if(confirm(`Remover ${nome} permanentemente?`)) {
            await supabaseClient.from(tabela).delete().eq('id', id);
            const tbody = document.querySelector('#lixeira-pedidos tbody');
            tbody.innerHTML += `<tr><td>${escapeHtml(nome)}</td><td>${escapeHtml(tabela)}</td><td>Removido</td></tr>`;
            alert("Item removido!");
            if(tabela === 'produtos') renderEstoque();
            if(tabela === 'pedidos') renderPedidos();
            if(tabela === 'clientes') renderClientes();
        }
    } catch (err) {
        console.error('Erro removerItem:', err);
        alert('Erro ao remover item.');
    }
}

// --- EXTRAS ---
async function exportarBackup() {
    try {
        const { data: p } = await supabaseClient.from('produtos').select('*');
        const { data: c } = await supabaseClient.from('clientes').select('*');
        const blob = new Blob([JSON.stringify({produtos: p, clientes: c}, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = "backup_jm.json"; a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Erro exportarBackup:', err);
        alert('Erro ao exportar backup.');
    }
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Relatorio JM Arte em Vidro", 10, 10);
    doc.save("pedidos.pdf");
}

function renderGrafico() {
    const ctx = document.getElementById('chartVendas').getContext('2d');
    new Chart(ctx, { type: 'line', data: { labels: ['S', 'T', 'Q', 'Q', 'S'], datasets: [{ label: 'Vendas', data: [5, 10, 8, 15, 12], borderColor: '#25D366' }] } });
}

function mascararCPF(i) { i.value = i.value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); }
function sair() { sessionStorage.clear(); window.location.href = "index.html"; }

function formatMoney(v) { return (Number(v || 0)).toFixed(2).replace('.', ','); }
function escapeHtml(str) { if (str === null || str === undefined) return ''; return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

// Inicialização segura após carregar DOM
window.addEventListener('DOMContentLoaded', () => {
    try {
        // mostra a aba inicial sem depender de window.onload
        showTab('add-prod');
        // pré-carregar dados (não bloqueante)
        if (typeof renderEstoque === 'function') renderEstoque();
        if (typeof renderClientes === 'function') renderClientes();
        if (typeof renderPedidos === 'function') renderPedidos();
    } catch (err) {
        console.error('Erro na inicialização:', err);
    }
});