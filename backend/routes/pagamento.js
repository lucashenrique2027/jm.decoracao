import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = express.Router();

// Configura o cliente do Mercado Pago com o token do .env
const client = new MercadoPagoConfig({
  accessToken: process.env.,
});

// POST /api/pagamento — cria uma preferência de pagamento
router.post('/', async (req, res) => {
  try {
    const { itens, clienteEmail } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: 'Nenhum item no carrinho' });
    }

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        // Itens do carrinho
        items: itens.map(item => ({
          id: String(item.nome),
          title: item.nome,
          quantity: item.quantidade,
          unit_price: parseFloat(item.preco),
          currency_id: 'BRL',
        })),

        // Email do comprador (opcional)
        payer: {
          email: clienteEmail || 'comprador@teste.com',
        },

        // URLs de retorno após o pagamento
        back_urls: {
          success: 'http://localhost:8080/pagamento/sucesso',
          failure: 'http://localhost:8080/pagamento/erro',
          pending: 'http://localhost:8080/pagamento/pendente',
        },


        // Referência externa para identificar o pedido
        external_reference: `jm_${Date.now()}`,
      },
    });

    // Retorna o link de pagamento para o frontend
    res.json({
      url: resultado.init_point, // URL do Checkout Pro
      id: resultado.id,
    });

  } catch (erro) {
    console.error('Erro ao criar preferência:', erro);
    res.status(500).json({ erro: 'Erro ao processar pagamento' });
  }
});

export default router;