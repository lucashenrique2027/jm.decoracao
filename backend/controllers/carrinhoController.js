import { pool } from '../models/db.js';

/* =========================================================
   HELPER — localizar ou criar carrinho do cliente
========================================================= */
async function obterOuCriarCarrinho(db, clienteId) {
  const { rows } = await db.query(
    `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`,
    [clienteId]
  );
  if (rows[0]) return rows[0];

  const { rows: novo } = await db.query(
    `INSERT INTO jm.carrinhos (cliente_id) VALUES ($1) RETURNING id`,
    [clienteId]
  );
  return novo[0];
}

/* =========================================================
   ADICIONAR PRODUTO AO CARRINHO
   POST /api/carrinho/adicionar
========================================================= */
export const adicionarProdutosAoCarrinho = async (req, res) => {
  const clienteId = req.user.id;
  const { produtoId, quantidade } = req.body;
  const qtd = parseInt(quantidade);

  if (isNaN(qtd) || qtd <= 0)
    return res.status(400).json({ erro: 'Quantidade inválida' });

  try {
    const { rows: prodRows } = await pool.query(
      `SELECT id, preco_varejo FROM jm.produtos WHERE id = $1`,
      [produtoId]
    );
    const produto = prodRows[0];
    if (!produto)
      return res.status(404).json({ erro: 'Produto não encontrado' });

    const carrinho = await obterOuCriarCarrinho(pool, clienteId);

    const { rows: itemRows } = await pool.query(
      `SELECT id, quantidade FROM jm.carrinho_itens
       WHERE carrinho_id = $1 AND produto_id = $2`,
      [carrinho.id, produtoId]
    );
    const itemExistente = itemRows[0];

    if (itemExistente) {
      await pool.query(
        `UPDATE jm.carrinho_itens SET quantidade = $1 WHERE id = $2`,
        [itemExistente.quantidade + qtd, itemExistente.id]
      );
    } else {
      await pool.query(
        `INSERT INTO jm.carrinho_itens (carrinho_id, produto_id, quantidade, preco_unitario)
         VALUES ($1,$2,$3,$4)`,
        [carrinho.id, produtoId, qtd, produto.preco_varejo]
      );
    }

    return res.status(200).json({ mensagem: 'Carrinho atualizado com sucesso' });

  } catch (erro) {
    console.error('[adicionarProdutos]', erro);
    return res.status(500).json({ erro: 'Erro ao adicionar produto' });
  }
};

/* =========================================================
   OBTER CARRINHO ATIVO
   GET /api/carrinho
========================================================= */
export const obterCarrinhoAtivo = async (req, res) => {
  const clienteId = req.user.id;

  try {
    const { rows: carrinhoRows } = await pool.query(
      `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`,
      [clienteId]
    );
    const carrinho = carrinhoRows[0];

    if (!carrinho)
      return res.json({ mensagem: 'Carrinho vazio', itens: [] });

    const { rows: itens } = await pool.query(
      `SELECT ci.id,
              ci.produto_id       AS "produtoId",
              ci.quantidade,
              ci.preco_unitario   AS "precoUnitario",
              p.nome              AS "nomeProduto",
              p.imagem_upload     AS "imagem",
              p.estoque           AS "estoqueAtual"
       FROM jm.carrinho_itens ci
       LEFT JOIN jm.produtos p ON p.id = ci.produto_id
       WHERE ci.carrinho_id = $1`,
      [carrinho.id]
    );

    const total = itens.reduce(
      (acc, item) => acc + Number(item.precoUnitario) * item.quantidade,
      0
    );

    return res.json({ carrinhoId: carrinho.id, total, itens });

  } catch (erro) {
    console.error('[obterCarrinhoAtivo]', erro);
    return res.status(500).json({ erro: 'Erro ao carregar carrinho' });
  }
};

/* =========================================================
   SINCRONIZAR CARRINHO
   PUT /api/carrinho/sincronizar
   Recebe a lista completa de itens do frontend e reconcilia
   com o banco em uma única transação.
========================================================= */
export const sincronizarCarrinho = async (req, res) => {
  const clienteId = req.user.id;
  const { itens } = req.body;

  if (!Array.isArray(itens))
    return res.status(400).json({ erro: 'Formato inválido' });

  const db = await pool.connect();
  try {
    await db.query('BEGIN');

    const carrinho = await obterOuCriarCarrinho(db, clienteId);

    // Itens atuais no banco
    const { rows: itensBanco } = await db.query(
      `SELECT id, produto_id, quantidade FROM jm.carrinho_itens WHERE carrinho_id = $1`,
      [carrinho.id]
    );

    const bancoMap   = new Map(itensBanco.map(i => [i.produto_id, i]));
    const payloadMap = new Map(itens.map(i => [Number(i.produtoId), Number(i.quantidade)]));

    const todosIds = [...new Set([...bancoMap.keys(), ...payloadMap.keys()])];

    if (todosIds.length === 0) {
      await db.query(`DELETE FROM jm.carrinho_itens WHERE carrinho_id = $1`, [carrinho.id]);
      await db.query('COMMIT');
      return res.json({ mensagem: 'Carrinho sincronizado' });
    }

    // Busca preços de todos os produtos envolvidos de uma vez
    const { rows: produtos } = await db.query(
      `SELECT id, preco_varejo FROM jm.produtos WHERE id = ANY($1::int[])`,
      [todosIds]
    );
    const produtosMap = new Map(produtos.map(p => [p.id, p]));

    for (const produtoId of todosIds) {
      const itemBanco    = bancoMap.get(produtoId);
      const qtdNova      = payloadMap.get(produtoId) ?? 0;
      const produto      = produtosMap.get(produtoId);

      if (!produto)
        throw Object.assign(new Error(`Produto ${produtoId} não encontrado`), { status: 404 });

      if (qtdNova <= 0 && itemBanco) {
        await db.query(`DELETE FROM jm.carrinho_itens WHERE id = $1`, [itemBanco.id]);
      } else if (itemBanco && qtdNova > 0) {
        await db.query(
          `UPDATE jm.carrinho_itens SET quantidade = $1 WHERE id = $2`,
          [qtdNova, itemBanco.id]
        );
      } else if (!itemBanco && qtdNova > 0) {
        await db.query(
          `INSERT INTO jm.carrinho_itens (carrinho_id, produto_id, quantidade, preco_unitario)
           VALUES ($1,$2,$3,$4)`,
          [carrinho.id, produtoId, qtdNova, produto.preco_varejo]
        );
      }
    }

    await db.query(
      `UPDATE jm.carrinhos SET atualizado_em = NOW() WHERE id = $1`,
      [carrinho.id]
    );

    await db.query('COMMIT');
    return res.status(200).json({ mensagem: 'Carrinho sincronizado com sucesso' });

  } catch (erro) {
    await db.query('ROLLBACK');
    console.error('[sincronizarCarrinho]', erro);
    const httpStatus = erro.status || 500;
    return res.status(httpStatus).json({ erro: erro.message || 'Erro ao sincronizar carrinho' });
  } finally {
    db.release();
  }
};