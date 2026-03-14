const produtosFixos = [

    { nome: "Vaso Girassol", img: "../assets/images/vaso-girassol.jpg" },

    { nome: "Jogo Suqueira + 6 Copos", img: "../assets/images/jogo-suqueira-6-copos.jpg" },

    { nome: "Pote Sustentável T", img: "../assets/images/pote-sustentavel-t.jpg" },

    { nome: "Vaso Design Geométrico", img: "../assets/images/vaso-design-geometrico.jpg" },

    { nome: "Taça de Cristal Premium", img: "../assets/images/taca-de-cristal-premium.jpg" },

    { nome: "Vaso Coloriquadra", img: "../assets/images/vaso-coloriquadra.jpg" }

];


export function carregarVitrine() {

    const vitrine = document.getElementById("vitrine");

    if (!vitrine) return;


    vitrine.innerHTML = produtosFixos.map((p, index) => {

        return `

        <div class="card-item">

            <div class="selo-status" style="background:#25D366">

                DISPONÍVEL

            </div>


            <div class="img-container">

                <img src="${p.img}">

            </div>


            <p><b>${p.nome}</b></p>


            <div class="compra-acoes">

                <div class="controle-qtd">

                    <button class="btn-qtd" onclick="altQtd(${index}, -1)">-</button>

                    <input type="number" id="qtd-${index}" value="1" class="qtd-seletor" readonly>

                    <button class="btn-qtd" onclick="altQtd(${index}, 1)">+</button>

                </div>


                <button class="btn-add"

                    onclick="pedir('${p.nome}', ${index})">

                    Pedir

                </button>

            </div>


            <button class="btn-info"

                onclick="window.open('https://wa.me/5511972011983?text=Olá, quero detalhes sobre: ${p.nome}')">

                WhatsApp

            </button>


        </div>

        `;

    }).join("");

}


function altQtd(idx, d) {

    const input = document.getElementById(`qtd-${idx}`);

    let v = parseInt(input.value) + d;

    if (v < 1) v = 1;

    input.value = v;

}


function pedir(nome, index) {

    alert("Pedido: " + nome);

}