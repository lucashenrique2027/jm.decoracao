// CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://pubyfyfivodmnzrwpdhe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D87EPGcjKSxvp_GN5oaqxA_BsCL4EfY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const produtosFixos = [
    { nome: "Vaso Girassol", img: "img/girasol WhatsApp Image 2025-08-13 at 17.14.00.jpeg" },
    { nome: "Jogo Suqueira + 6 Copos", img: "img/6 copos suqueira Image 1 de set. de 2025, 13_30_19.png" },
    { nome: "Pote Sustentável T", img: "img/pode T Image 8 de set. de 2025, 22_31_52.png" },
    { nome: "Vaso Design Geométrico", img: "img/Vaso de vidro com design geométrico.png" },
    { nome: "Taça de Cristal Premium", img: "img/taça- Image 28 de set. de 2025, 14_21_19.png" },
    { nome: "Vaso Coloriquadra", img: "img/vaso-coloriquadra Image 1 de set. de 2025, 16_28_27.png" }
];

async function carregarVitrine() {
    const vitrine = document.getElementById('vitrine');
    const { data: produtosDB } = await supabaseClient.from('produtos').select('*');
    
    vitrine.innerHTML = produtosFixos.map((p, index) => {
        // MANTIDO: Busca os dados no banco para cada produto da sua lista fixa
        const dbProd = produtosDB ? produtosDB.find(db => db.nome === p.nome) : null;
        const esgotado = dbProd && dbProd.status === "Esgotado";

        // NOVO: Apenas prepara o preço e a descrição se existirem
        const precoHTML = dbProd && dbProd.preco ? `<p style="color: #25D366; font-weight: bold; font-size: 18px; margin: 5px 0;">R$ ${parseFloat(dbProd.preco).toFixed(2).replace('.', ',')}</p>` : "";
        const descHTML = dbProd && dbProd.descricao ? `<p style="font-size: 11px; color: #777; margin-bottom: 10px;">${dbProd.descricao}</p>` : "";

        // Substitua o trecho dentro do seu .map pelo código abaixo:
return `
    <div class="card-item" style="${esgotado ? 'opacity: 0.7;' : ''}">
        <div class="selo-status" style="background: ${esgotado ? '#e74c3c' : '#25D366'}">${esgotado ? 'ESGOTADO' : 'DISPONÍVEL'}</div>
        <div class="img-container"><img src="${p.img}" style="${esgotado ? 'filter: grayscale(1);' : ''}"></div>
        <p><b>${p.nome}</b></p>
        
        ${precoHTML} 
        ${descHTML} 
        
        <div class="compra-acoes">
            <div class="controle-qtd">
                <button class="btn-qtd" onclick="altQtd(${index}, -1)" ${esgotado ? 'disabled' : ''}>-</button>
                <input type="number" id="qtd-${index}" value="1" class="qtd-seletor" readonly>
                <button class="btn-qtd" onclick="altQtd(${index}, 1)" ${esgotado ? 'disabled' : ''}>+</button>
            </div>
            <button class="btn-add" ${esgotado ? 'disabled style="background:#ccc;"' : ''} onclick="pedir('${p.nome}', ${index})">
                ${esgotado ? 'Sem Estoque' : 'Pedir'}
            </button>
        </div>
        <button class="btn-info" onclick="window.open('https://wa.me/5511972011983?text=Olá, quero detalhes sobre: ${p.nome}')">WhatsApp</button>
    </div>
`;
    }).join('');
    verificarLogin();
}

// ATUALIZAÇÃO EM TEMPO REAL (SEM PRECISAR DE F5)
supabaseClient.channel('jm-updates').on('postgres_changes', { event: '*', schema: 'public' }, () => {
    carregarVitrine();
}).subscribe();

async function pedir(nome, index) {
    const user = JSON.parse(localStorage.getItem('user_jm_logado'));
    if(!user) return abrirModalEscolha();
    
    const qtd = document.getElementById(`qtd-${index}`).value;
    const { error } = await supabaseClient.from('pedidos').insert([{
        id_unico: Math.floor(1000 + Math.random() * 9000),
        cliente_nome: user.nome,
        cliente_cpf: user.cpf,
        produto_nome: `${qtd}x ${nome}`,
        status_entrega: "Preparo"
    }]);

    if(!error) alert("Pedido enviado!");
}

async function fazerLogin() {
    const cpf = document.getElementById('login-cpf').value;
    const { data: cliente, error } = await supabaseClient.from('clientes').select('*').eq('cpf', cpf).single();

    if(cliente) {
        localStorage.setItem('user_jm_logado', JSON.stringify(cliente));
        fecharModais();
        location.reload(); 
    } else {
        alert("CPF não encontrado.");
    }
}

async function salvarCliente() {
    const n = document.getElementById('nome-cli').value;
    const c = document.getElementById('cpf-cli').value;
    const end = document.getElementById('end-cli').value;
    const cep = document.getElementById('cep-cli').value;
    const obs = document.getElementById('obs-cli').value;

    if(!n || !c || !end) return alert("Preencha Nome, CPF e Endereço.");

    const { error } = await supabaseClient.from('clientes').insert([{
        nome: n, cpf: c, endereco: end, cep: cep, observacoes: obs
    }]);

    if(!error) {
        localStorage.setItem('user_jm_logado', JSON.stringify({ nome: n, cpf: c }));
        alert("Cadastro realizado!");
        location.reload();
    } else {
        alert("Erro no cadastro ou CPF já existe.");
    }
}

async function verificarLogin() {
    const user = JSON.parse(localStorage.getItem('user_jm_logado'));
    if(user) {
        document.getElementById('nome-usuario-logado').innerText = "Olá, " + user.nome.split(' ')[0];
        document.getElementById('info-perfil').innerText = user.nome;
        document.getElementById('menu-logado').style.display = 'block';
        document.getElementById('menu-deslogado').style.display = 'none';
        
        const { data: pedidos } = await supabaseClient.from('pedidos').select('*').eq('cliente_cpf', user.cpf).order('id', { ascending: false });
        if(pedidos) {
            document.getElementById('status-pedidos-menu').innerHTML = pedidos.map(p => `
                <div class="status-item">${p.produto_nome}: <b>${p.status_entrega}</b></div>
            `).join('');
        }
    }
}

function altQtd(idx, d) {
    const input = document.getElementById(`qtd-${idx}`);
    let v = parseInt(input.value) + d;
    if(v < 1) v = 1; 
    input.value = v;
}

function toggleUserMenu() { const m = document.getElementById('dropdown-menu'); m.style.display = m.style.display === 'block' ? 'none' : 'block'; }
function fecharModais() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }
function abrirModalEscolha() { fecharModais(); document.getElementById('modalEscolha').style.display = 'flex'; }
function abrirModalLogin() { fecharModais(); document.getElementById('modalLogin').style.display = 'flex'; }
function abrirModalCadastro() { fecharModais(); document.getElementById('modalCadastro').style.display = 'flex'; }
function logoutUsuario() { localStorage.removeItem('user_jm_logado'); location.reload(); }
function mascaraCPF(i) { i.value = i.value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); }
function mascaraCEP(i) { i.value = i.value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"); }

// ALTERAÇÃO AQUI: Agora abre o Admin em nova aba sem tirar o cliente da Vitrine
function executarAcessoAdmin() { 
    if(prompt("Senha:") === "1234") { 
        sessionStorage.setItem("logado","true"); 
        window.open("login_admin.html", "_blank"); 
    } 
}

window.onload = carregarVitrine;