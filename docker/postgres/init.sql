-- ─── SCHEMA ─────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS jm;
SET search_path TO jm;

-- ─── ROLES DE USUÁRIO ───────────────────────────────────
CREATE TYPE jm.user_role AS ENUM ('admin', 'colaborador', 'cliente');

-- ─── STATUS DO PEDIDO ───────────────────────────────────
CREATE TYPE jm.status_pedido AS ENUM ('pendente', 'confirmado', 'rejeitado', 'entregue');

CREATE TYPE jm.status_pagamento AS ENUM (
  'aguardando_pagamento',
  'pago',
  'expirado',
  'cancelado',
  'falhou'
);


CREATE TABLE IF NOT EXISTS jm.loja (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT DEFAULT 'SP',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USUÁRIOS (admin e colaboradores) ───────────────────
CREATE TABLE IF NOT EXISTS jm.admin (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role jm.user_role NOT NULL DEFAULT 'colaborador',
  loja_id INTEGER REFERENCES jm.loja(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);


-- ─── CLIENTES (conta pública) ───────────────────────────
CREATE TABLE IF NOT EXISTS jm.clientes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cep TEXT NOT NULL,
  endereco TEXT ,
  bairro TEXT ,
  cidade TEXT ,
  estado TEXT  DEFAULT 'SP',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jm.categorias (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUTOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.produtos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_varejo NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_atacado NUMERIC(10,2),
  quantidade_minima_atacado INTEGER,
  imagem_upload TEXT,
  categoria_id INTEGER REFERENCES jm.categorias(id) ON DELETE RESTRICT,
  disponivel BOOLEAN DEFAULT true,
  estoque INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  desativado_em TIMESTAMPTZ DEFAULT NULL
);

-- ─── ZONAS DE ENTREGA ───────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.zonas_entrega (
  id SERIAL PRIMARY KEY,
  cidade TEXT NOT NULL,
  bairro TEXT,
  cep_prefixo TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PEDIDOS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES jm.clientes(id),
  status jm.status_pedido NOT NULL DEFAULT 'pendente',
  -- observações gerais
  observacao_entrega TEXT,
  -- valores financeiros
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  frete NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- snapshot do endereço de entrega
  nome_recebedor TEXT NOT NULL,
  telefone_entrega TEXT NOT NULL,

  cep_entrega TEXT NOT NULL,
  endereco_entrega TEXT NOT NULL,
  bairro_entrega TEXT NOT NULL,
  cidade_entrega TEXT NOT NULL,
  estado_entrega TEXT NOT NULL DEFAULT 'SP',

  -- controle simples de pagamento
  pagamento_id TEXT,
  metodo_pagamento TEXT,
  pago_em TIMESTAMPTZ,

  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ITENS DO PEDIDO ────────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES jm.pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER REFERENCES jm.produtos(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL
);

-- ─── CARRINHOS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.carrinhos (
  id SERIAL PRIMARY KEY,

  cliente_id INTEGER NOT NULL UNIQUE
    REFERENCES jm.clientes(id)
    ON DELETE CASCADE,

  criado_em TIMESTAMPTZ DEFAULT NOW(),

  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jm.carrinho_itens (
  id SERIAL PRIMARY KEY,

  carrinho_id INTEGER NOT NULL
    REFERENCES jm.carrinhos(id)
    ON DELETE CASCADE,

  produto_id INTEGER NOT NULL
    REFERENCES jm.produtos(id),

  quantidade INTEGER NOT NULL DEFAULT 1,

  preco_unitario NUMERIC(10,2) NOT NULL,

  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jm.pagamentos (

  id SERIAL PRIMARY KEY,

  /* ===================================================
     RELAÇÃO COM PEDIDO
     1 pedido → 1 pagamento ativo
  =================================================== */

  pedido_id INTEGER NOT NULL UNIQUE
    REFERENCES jm.pedidos(id)
    ON DELETE CASCADE,

  /* ===================================================
     IDENTIDADE / CONTINUIDADE
  =================================================== */

  token_pagamento TEXT NOT NULL UNIQUE,

  /* ===================================================
     ESTADO DO PAGAMENTO
  =================================================== */

  status jm.status_pagamento NOT NULL
    DEFAULT 'aguardando_pagamento',

  /* ===================================================
     DADOS FINANCEIROS
  =================================================== */

  valor NUMERIC(10,2) NOT NULL,

  metodo_pagamento TEXT NOT NULL
    DEFAULT 'pix_simulado',

  /* ===================================================
     QR CODE / COBRANÇA
  =================================================== */

  qr_code_visual TEXT,

  qr_code_payload TEXT,

  /* ===================================================
     CONTROLE TEMPORAL
  =================================================== */

  expiracao_pagamento TIMESTAMPTZ,

  pago_em TIMESTAMPTZ,

  criado_em TIMESTAMPTZ DEFAULT NOW(),

  atualizado_em TIMESTAMPTZ DEFAULT NOW(),

  /* ===================================================
     GARANTIAS
  =================================================== */

  CONSTRAINT valor_positivo
    CHECK (valor >= 0)

);

ALTER TABLE jm.produtos 
ADD CONSTRAINT estoque_positivo CHECK (estoque >= 0);

CREATE INDEX IF NOT EXISTS idx_pagamentos_status
ON jm.pagamentos(status);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido
ON jm.pagamentos(pedido_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_token
ON jm.pagamentos(token_pagamento);

-- Índices para suportar a paginação e abas da UI do Admin no futuro
CREATE INDEX IF NOT EXISTS idx_produtos_ativos ON jm.produtos (id) WHERE disponivel = true;
CREATE INDEX IF NOT EXISTS idx_produtos_inativos_cronologico ON jm.produtos (desativado_em DESC) WHERE disponivel = false;