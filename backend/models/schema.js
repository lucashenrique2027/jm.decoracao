import {
  pgSchema,
  serial,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const jm = pgSchema('jm');

/* =========================================================
   ENUMS
========================================================= */

export const statusPedidoEnum = jm.enum('status_pedido', [
  'pendente',
  'confirmado',
  'rejeitado',
  'entregue',
]);

export const statusPagamentoEnum = jm.enum(
  'status_pagamento',
  [
    'aguardando_pagamento',
    'pago',
    'expirado',
    'cancelado',
    'falhou',
  ]
);

export const userRoleEnum = jm.enum('user_role', [
  'admin',
  'colaborador',
  'cliente',
]);

/* =========================================================
   ADMIN
========================================================= */

export const admin = jm.table('admin', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  role: userRoleEnum('role')
    .notNull()
    .default('colaborador'),
  lojaId: integer('loja_id').references(
    () => loja.id
  ),
  criadoEm: timestamp('criado_em', {
    withTimezone: true,
  }).defaultNow(),
});

/* =========================================================
   CLIENTES
========================================================= */

export const clientes = jm.table('clientes', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  telefone: text('telefone').notNull(),
  cep: text('cep').notNull(),
  endereco: text('endereco'),
  bairro: text('bairro'),
  cidade: text('cidade'),
  estado: text('estado').default('SP'),
  criadoEm: timestamp('criado_em', {
    withTimezone: true,
  }).defaultNow(),
});

/* =========================================================
   CATEGORIAS
========================================================= */

export const categorias = jm.table('categorias', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  criadoEm: timestamp('criado_em', {
    withTimezone: true,
  }).defaultNow(),
});

/* =========================================================
   PRODUTOS
========================================================= */

export const produtos = jm.table('produtos', {
  id: serial('id').primaryKey(),

  nome: text('nome').notNull(),

  descricao: text('descricao'),

  precoVarejo: numeric(
    'preco_varejo',
    {
      precision: 10,
      scale: 2,
    }
  )
    .notNull()
    .default('0'),

  precoAtacado: numeric(
    'preco_atacado',
    {
      precision: 10,
      scale: 2,
    }
  ),

  quantidadeMinimaAtacado:
    integer('quantidade_minima_atacado'),

  categoriaId: integer('categoria_id')
    .references(() => categorias.id, {
      onDelete: 'restrict',
    }),

  imagemUpload: text('imagem_upload'),

  disponivel: boolean('disponivel')
    .default(true),

  estoque: integer('estoque')
    .default(0),

  criadoEm: timestamp('criado_em', {
    withTimezone: true,
  }).defaultNow(),

  desativadoEm: timestamp(
    'desativado_em',
    {
      withTimezone: true,
      mode: 'date',
    }
  ),
});

/* =========================================================
   ZONAS ENTREGA
========================================================= */

export const zonasEntrega = jm.table(
  'zonas_entrega',
  {
    id: serial('id').primaryKey(),

    cidade: text('cidade').notNull(),

    bairro: text('bairro'),

    cepPrefixo: text('cep_prefixo')
      .notNull(),

    ativo: boolean('ativo')
      .default(true),

    criadoEm: timestamp('criado_em', {
      withTimezone: true,
    }).defaultNow(),
  }
);

/* =========================================================
   PEDIDOS
========================================================= */

export const pedidos = jm.table('pedidos', {
  id: serial('id').primaryKey(),

  clienteId: integer('cliente_id')
    .references(() => clientes.id),

  status: statusPedidoEnum('status')
    .notNull()
    .default('pendente'),

  observacaoEntrega:
    text('observacao_entrega'),

  subtotal: numeric('subtotal', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),

  frete: numeric('frete', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),

  total: numeric('total', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),

  nomeRecebedor:
    text('nome_recebedor').notNull(),

  telefoneEntrega:
    text('telefone_entrega').notNull(),

  cepEntrega:
    text('cep_entrega').notNull(),

  enderecoEntrega:
    text('endereco_entrega').notNull(),

  bairroEntrega:
    text('bairro_entrega').notNull(),

  cidadeEntrega:
    text('cidade_entrega').notNull(),

  estadoEntrega: text('estado_entrega')
    .notNull()
    .default('SP'),

  criadoEm: timestamp('criado_em', {
    withTimezone: true,
  }).defaultNow(),
});

/* =========================================================
   PAGAMENTOS
========================================================= */

export const pagamentos = jm.table(
  'pagamentos',
  {
    id: serial('id').primaryKey(),

    pedidoId: integer('pedido_id')
      .notNull()
      .unique()
      .references(() => pedidos.id, {
        onDelete: 'cascade',
      }),

    tokenPagamento:
      text('token_pagamento')
        .notNull()
        .unique(),

    status:
      statusPagamentoEnum('status')
        .notNull()
        .default('aguardando_pagamento'),

    valor: numeric('valor', {
      precision: 10,
      scale: 2,
    }).notNull(),

    metodoPagamento:
      text('metodo_pagamento')
        .notNull()
        .default('pix_simulado'),

    qrCodeVisual:
      text('qr_code_visual'),

    qrCodePayload:
      text('qr_code_payload'),

    expiracaoPagamento:
      timestamp(
        'expiracao_pagamento',
        {
          withTimezone: true,
        }
      ),

    pagoEm: timestamp('pago_em', {
      withTimezone: true,
    }),

    criadoEm: timestamp('criado_em', {
      withTimezone: true,
    }).defaultNow(),

    atualizadoEm: timestamp(
      'atualizado_em',
      {
        withTimezone: true,
      }
    ).defaultNow(),
  },

  (table) => ({
    idxPedidoPagamento:
      uniqueIndex(
        'idx_pagamentos_pedido'
      ).on(table.pedidoId),

    idxTokenPagamento:
      uniqueIndex(
        'idx_pagamentos_token'
      ).on(table.tokenPagamento),
  })
);

/* =========================================================
   PEDIDO ITENS
========================================================= */

export const pedidoItens = jm.table(
  'pedido_itens',
  {
    id: serial('id').primaryKey(),

    pedidoId: integer('pedido_id')
      .references(() => pedidos.id, {
        onDelete: 'cascade',
      }),

    produtoId: integer('produto_id')
      .references(() => produtos.id),

    quantidade: integer('quantidade')
      .notNull()
      .default(1),

    precoUnitario: numeric(
      'preco_unitario',
      {
        precision: 10,
        scale: 2,
      }
    ).notNull(),
  }
);

/* =========================================================
   CARRINHOS
========================================================= */

export const carrinhos = jm.table(
  'carrinhos',
  {
    id: serial('id').primaryKey(),

    clienteId: integer('cliente_id')
      .notNull()
      .unique()
      .references(() => clientes.id, {
        onDelete: 'cascade',
      }),

    criadoEm: timestamp('criado_em', {
      withTimezone: true,
    }).defaultNow(),

    atualizadoEm: timestamp(
      'atualizado_em',
      {
        withTimezone: true,
      }
    ).defaultNow(),
  }
);

/* =========================================================
   CARRINHO ITENS
========================================================= */

export const carrinhoItens = jm.table(
  'carrinho_itens',

  {
    id: serial('id').primaryKey(),

    carrinhoId: integer('carrinho_id')
      .notNull()
      .references(() => carrinhos.id, {
        onDelete: 'cascade',
      }),

    produtoId: integer('produto_id')
      .notNull()
      .references(() => produtos.id),

    quantidade: integer('quantidade')
      .notNull()
      .default(1),

    precoUnitario: numeric(
      'preco_unitario',
      {
        precision: 10,
        scale: 2,
      }
    ).notNull(),

    criadoEm: timestamp('criado_em', {
      withTimezone: true,
    }).defaultNow(),
  },

  (table) => ({
    unicoProdutoCarrinho:
      uniqueIndex(
        'unico_produto_no_carrinho'
      ).on(
        table.carrinhoId,
        table.produtoId
      ),
  })
);

export const loja = jm.table('loja', {
  id: serial('id').primaryKey(),

  nome: text('nome').notNull(),

  cep: text('cep'),
  endereco: text('endereco'),
  numero: text('numero'),
  bairro: text('bairro'),
  cidade: text('cidade'),
  estado: text('estado').default('SP'),

  criadoEm: timestamp('criado_em', {
    withTimezone: true,
  }).defaultNow(),
});