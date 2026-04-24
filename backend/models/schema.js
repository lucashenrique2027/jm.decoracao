import { pgSchema, serial, text, numeric, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const jm = pgSchema('jm');

export const statusPedidoEnum = jm.enum('status_pedido', ['pendente', 'confirmado', 'rejeitado', 'entregue']);

export const userRoleEnum = jm.enum('user_role', ['colaborador', 'admin', 'superadmin']);


// TESTE
export const teste = jm.table("teste", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
});

export const admin = jm.table('admin', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  role: userRoleEnum('role').notNull().default('colaborador'),
  cpfCnpj: text('cpf_cnpj'),
  enderecoFiscal: text('endereco_fiscal'),
  criadoEm: timestamp('criado_em').defaultNow(),
});

// CLIENTES 
export const clientes = jm.table('clientes', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  telefone: text('telefone').notNull(),
  cep: text('cep').notNull(),
  endereco: text('endereco').notNull(),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').notNull().default('SP'),
  criadoEm: timestamp('criado_em').defaultNow(),
});

// PRODUTOS 
export const produtos = jm.table('produtos', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  categoria: text('categoria').notNull(),
  preco: numeric('preco', { precision: 10, scale: 2 }).notNull().default('0'),
  imagemUpload: text('imagem_upload'),
  disponivel: boolean('disponivel').default(true),
  estoque: integer('estoque').default(0),
  criadoEm: timestamp('criado_em').defaultNow(),
});

// ENTREGA
export const zonasEntrega = jm.table('zonas_entrega', {
  id: serial('id').primaryKey(),
  cidade: text('cidade').notNull(),
  bairro: text('bairro'),
  cepPrefixo: text('cep_prefixo').notNull(),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em').defaultNow(),
});

// PEDIDOS
export const pedidos = jm.table('pedidos', {
  id: serial('id').primaryKey(),
  clienteId: integer('cliente_id').references(() => clientes.id),
  status: statusPedidoEnum('status').notNull().default('pendente'),
  observacaoEntrega: text('observacao_entrega'),
  total: numeric('total', { precision: 10, scale: 2 }),
  criadoEm: timestamp('criado_em').defaultNow(),
});

// ITENS DO PEDIDO
export const pedidoItens = jm.table('pedido_itens', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id').references(() => pedidos.id),
  produtoId: integer('produto_id').references(() => produtos.id),
  quantidade: integer('quantidade').notNull().default(1),
  precoUnitario: numeric('preco_unitario', { precision: 10, scale: 2 }).notNull(),
});