-- ─── SCHEMA ─────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS jm;
SET search_path TO jm;

-- ─── ROLES DE USUÁRIO ───────────────────────────────────
CREATE TYPE jm.user_role AS ENUM ('admin', 'colaborador', 'cliente');

-- ─── STATUS DO PEDIDO ───────────────────────────────────
CREATE TYPE jm.status_pedido AS ENUM ('pendente', 'confirmado', 'rejeitado', 'entregue');

-- ─── TESTES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.teste(
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL
);

-- ─── USUÁRIOS (admin e colaboradores) ───────────────────
CREATE TABLE IF NOT EXISTS jm.admin (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role jm.user_role NOT NULL DEFAULT 'colaborador',
  cpf_cnpj TEXT,
  endereco_fiscal TEXT,
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
  endereco TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'SP',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUTOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jm.produtos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  imagem_upload TEXT,
  categoria TEXT NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  estoque INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
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
  observacao_entrega TEXT,
  total NUMERIC(10,2),
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

-- ─── ZONAS INICIAIS (Atibaia) ───────────────────────────
-- Lista exata será confirmada com o cliente
INSERT INTO jm.zonas_entrega (cidade, cep_prefixo, ativo) VALUES
  ('Atibaia', '12940', true),
  ('Atibaia', '12941', true),
  ('Atibaia', '12942', true),
  ('Atibaia', '12943', true),
  ('Atibaia', '12944', true),
  ('Atibaia', '12945', true);