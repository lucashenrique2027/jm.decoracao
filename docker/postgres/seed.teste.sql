-- ─── CATEGORIAS ───────────────────────────────────────────
INSERT INTO jm.categorias (nome) 
VALUES 
    ('Decoração'), 
    ('Cozinha'), 
    ('Iluminação')
ON CONFLICT (nome) DO NOTHING;

-- ─── PRODUTOS ─────────────────────────────────────────────
INSERT INTO jm.produtos 
    (nome, descricao, preco_varejo, preco_atacado, quantidade_minima_atacado, imagem_upload, categoria_id, estoque)
VALUES 
('Vaso Girassol', 'Vaso Girassol amarelo decorativo feito de cerâmica.', 89.90, 75.50, 6, 'vaso-girasol.jpeg', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 10),
('Vaso Design Geométrico', 'Vaso de design geométrico moderno.', 120.00, NULL, NULL, 'vaso-design-geometrico.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 8),
('Vaso Coloriquadra', 'Vaso decorativo colorido.', 95.00, 80.00, 10, 'vaso-coloriquadra.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 15),
('Garrafa Decorativa', 'Garrafa decorativa em vidro para ambientes.', 110.00, NULL, NULL, 'garrafa.jpeg', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 6),
('Pote com Flores Gravadas', 'Pote de vidro com delicadas flores gravadas.', 130.00, 110.00, 6, 'Pote de vidro com flores gravadas.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 7),
('Vaso Moderno', 'Vaso moderno em vidro para decoração de interiores.', 145.00, NULL, NULL, 'vaso Image 1 de set. de 2025, 14_01_22.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 6),
('Vaso Design D', 'Vaso com design exclusivo em vidro artesanal.', 160.00, 135.00, 5, 'vaso-D Image 9 de set. de 2025, 18_12_38.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 5),
('Jogo Suqueira + 6 Copos', 'Jogo de suqueira com seis copos de vidro.', 150.00, 125.00, 4, '6-copos-suqueira.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 5),
('Pote Sustentável T', 'Pote sustentável para armazenamento.', 45.00, 35.00, 12, 'pote-sustentavel.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 20),
('Taça de Cristal Premium', 'Taça de cristal premium elegante.', 200.00, NULL, NULL, 'taça-cristal.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 12),
('Copo de Cristal Gracioso', 'Copo de cristal com detalhes graciosos e elegantes.', 75.00, 60.00, 12, 'Copo de Cristal em Detalhes Graciosos.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 10),
('Copo Artesanal', 'Copo artesanal em vidro com design exclusivo.', 65.00, NULL, NULL, 'copo-Image 9 de jul. de 2025, 20_37_00.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 8),
('Suqueira Artesanal', 'Suqueira artesanal em vidro com tampa.', 135.00, 115.00, 3, 'suqueira-20191216_074040.jpg', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 9),
('Lustre Artesanal Premium', 'Lustre artesanal em vidro com acabamento premium.', 350.00, 290.00, 2, 'lustre 1 ChatGPT Image 13 de ago. de 2025, 20_52_54.png', (SELECT id FROM jm.categorias WHERE nome = 'Iluminação'), 4),
('Lustre em Vidro', 'Lustre clássico em vidro para ambientes sofisticados.', 280.00, NULL, NULL, 'lustre.jpg', (SELECT id FROM jm.categorias WHERE nome = 'Iluminação'), 5)
ON CONFLICT DO NOTHING;

-- ─── CLIENTES ─────────────────────────────────────────────
INSERT INTO jm.clientes (nome, email, senha_hash, telefone, cep, endereco, bairro, cidade, estado)
VALUES
('Carlos Eduardo Silva', 'carlos.silva@gmail.com', '$2b$10$GnJgQUUy8Wr/XkgAgUVOnuIIWkC3fTgbwEPXXvU3v074CH79pfiJG', '(15) 99876-1234', '18010-000', 'Rua das Flores, 123', 'Centro', 'Sorocaba', 'SP'),
('Mariana Oliveira Santos', 'mariana.oliveira@hotmail.com', '$2b$10$kYFIYqf4RuTLADqd.KnT9.KvE9aR37O6BmkobCxQDPGfHZdhdbE/.', '(11) 98765-4321', '01020-000', 'Av. Paulista, 1500', 'Bela Vista', 'São Paulo', 'SP'),
('João Pedro Almeida', 'joao.almeida@yahoo.com', '$2b$10$Gb.sWYmh9rOIHEy1y8bI8.CDX43QJyWwiLGE45AO7WOJ.S1KnH472', '(19) 99123-5678', '13015-000', 'Rua Barão de Jaguara, 89', 'Centro', 'Campinas', 'SP'),
('Fernanda Costa Ribeiro', 'fernanda.ribeiro@gmail.com', '$2b$10$GW81Kpa.E4aClQ6RoK1lQeUZVdBbixawVXDpd9TQIDnWM13qENP.W', '(21) 98877-6655', '20040-000', 'Rua do Ouvidor, 45', 'Centro', 'Rio de Janeiro', 'RJ'),
('Lucas Martins Souza', 'lucas.souza@gmail.com', '$2b$10$OKbVzRhdSI1wPf1WxwFPdOHVqkw5UuVkFjvuRpJuxEJYGVbIraOAy', '(31) 99711-2233', '30130-000', 'Av. Afonso Pena, 700', 'Centro', 'Belo Horizonte', 'MG'),
('Patrícia Gomes Fernandes', 'patricia.gomes@outlook.com', '$2b$10$EC99k1x7xCXGLZ51w9kOoOR/e3ZcyHeJlSFFDzIuP0PZZs5WRSyfO', '(41) 99655-8899', '80010-000', 'Rua XV de Novembro, 320', 'Centro', 'Curitiba', 'PR'),
('Rafael Henrique Lopes', 'rafael.lopes@gmail.com', '$2b$10$epoqsi9rsbXg1pAl9aeOb.limQ/i/RjFzeG.aDbQaIP6rCJoSaDMW', '(51) 99144-5566', '90010-000', 'Av. Borges de Medeiros, 210', 'Centro Histórico', 'Porto Alegre', 'RS'),
('Juliana Teixeira Rocha', 'juliana.rocha@gmail.com', '$2b$10$5dxNC.6l0ibiARBnV9etU.KfXl76Y8G1pZCUbVgz4AjPV/kWKTxUW', '(71) 99222-3344', '40020-000', 'Av. Sete de Setembro, 980', 'Dois de Julho', 'Salvador', 'BA'),
('Bruno Carvalho Nunes', 'bruno.nunes@gmail.com', '$2b$10$QcFeBpYLcU3xAOdP53jQ3OmhSAmFIWZspAbvXDg5cC1YuCknQ7mqq', '(61) 99333-4455', '70040-010', 'Esplanada dos Ministérios, Bloco A', 'Zona Cívico-Administrativa', 'Brasília', 'DF'),
('Camila Barbosa Freitas', 'camila.freitas@gmail.com', '$2b$10$DvWXyHtZlB4.V3iUXKdla.rcpw/CyA8bNsC14wv5SxrKSBT3wd0Ty', '(85) 99444-5566', '60060-000', 'Av. Beira Mar, 150', 'Meireles', 'Fortaleza', 'CE')
ON CONFLICT (email) DO NOTHING;

-- ─── PEDIDOS (unificado) ──────────────────────────────────
INSERT INTO jm.pedidos (id, cliente_id, status, subtotal, frete, total, observacao_entrega, nome_recebedor, telefone_entrega, cep_entrega, endereco_entrega, bairro_entrega, cidade_entrega, estado_entrega)
VALUES
  (1,  1, 'entregue',   179.80, 0.00, 179.80, 'Entregue no prazo.',                      'Carlos Eduardo Silva',    '(15) 99876-1234', '18010-000', 'Rua das Flores, 123',               'Centro',                   'Sorocaba',       'SP'),
  (2,  2, 'pendente',   200.00, 0.00, 200.00, 'Aguardando cliente finalizar.',            'Mariana Oliveira Santos', '(11) 98765-4321', '01020-000', 'Av. Paulista, 1500',                'Bela Vista',               'São Paulo',      'SP'),
  (3,  3, 'confirmado', 415.00, 0.00, 415.00, 'Pagamento aprovado, separar estoque.',     'João Pedro Almeida',      '(19) 99123-5678', '13015-000', 'Rua Barão de Jaguara, 89',          'Centro',                   'Campinas',       'SP'),
  (4,  4, 'confirmado', 135.00, 0.00, 135.00, 'Tocar interfone 45.',                      'Fernanda Costa Ribeiro',  '(21) 98877-6655', '20040-000', 'Rua do Ouvidor, 45',                'Centro',                   'Rio de Janeiro', 'RJ'),
  (5,  5, 'pendente',    65.00, 0.00,  65.00, NULL,                                       'Lucas Martins Souza',     '(31) 99711-2233', '30130-000', 'Av. Afonso Pena, 700',              'Centro',                   'Belo Horizonte', 'MG'),
  (6,  1, 'pendente',   225.00, 0.00, 225.00, 'Cliente elogiou os copos personalizados.', 'Carlos Eduardo Silva',    '(15) 99876-1234', '18010-000', 'Rua das Flores, 123',               'Centro',                   'Sorocaba',       'SP'),
  (7,  2, 'confirmado', 150.00, 0.00, 150.00, 'Entrega agendada para sexta-feira.',       'Mariana Oliveira Santos', '(11) 98765-4321', '01020-000', 'Av. Paulista, 1500',                'Bela Vista',               'São Paulo',      'SP'),
  (8,  3, 'entregue',   390.00, 0.00, 390.00, 'Pedido corporativo.',                      'João Pedro Almeida',      '(19) 99123-5678', '13015-000', 'Rua Barão de Jaguara, 89',          'Centro',                   'Campinas',       'SP'),
  (9,  1, 'confirmado', 130.00, 0.00, 130.00, NULL,                                       'Carlos Eduardo Silva',    '(15) 99876-1234', '18010-000', 'Rua das Flores, 123',               'Centro',                   'Sorocaba',       'SP'),
  (10, 4, 'entregue',   520.00, 0.00, 520.00, 'Cliente pediu embalagem especial.',        'Fernanda Costa Ribeiro',  '(21) 98877-6655', '20040-000', 'Rua do Ouvidor, 45',                'Centro',                   'Rio de Janeiro', 'RJ'),
  (11, 5, 'confirmado',  95.00, 0.00,  95.00, NULL,                                       'Lucas Martins Souza',     '(31) 99711-2233', '30130-000', 'Av. Afonso Pena, 700',              'Centro',                   'Belo Horizonte', 'MG'),
  (12, 6, 'entregue',   180.00, 0.00, 180.00, NULL,                                       'Patrícia Gomes Fernandes','(41) 99655-8899', '80010-000', 'Rua XV de Novembro, 320',           'Centro',                   'Curitiba',       'PR'),
  (13, 7, 'confirmado', 310.00, 0.00, 310.00, 'Cliente recorrente.',                      'Rafael Henrique Lopes',   '(51) 99144-5566', '90010-000', 'Av. Borges de Medeiros, 210',       'Centro Histórico',         'Porto Alegre',   'RS'),
  (14, 8, 'entregue',   450.00, 0.00, 450.00, NULL,                                       'Juliana Teixeira Rocha',  '(71) 99222-3344', '40020-000', 'Av. Sete de Setembro, 980',         'Dois de Julho',            'Salvador',       'BA'),
  (15, 9, 'confirmado', 160.00, 0.00, 160.00, NULL,                                       'Bruno Carvalho Nunes',    '(61) 99333-4455', '70040-010', 'Esplanada dos Ministérios, Bloco A','Zona Cívico-Administrativa','Brasília',        'DF'),
  (16,10, 'entregue',   270.00, 0.00, 270.00, 'Entregar após 18h.',                       'Camila Barbosa Freitas',  '(85) 99444-5566', '60060-000', 'Av. Beira Mar, 150',                'Meireles',                 'Fortaleza',      'CE'),
  (17, 3, 'entregue',   600.00, 0.00, 600.00, 'Pedido grande para evento.',               'João Pedro Almeida',      '(19) 99123-5678', '13015-000', 'Rua Barão de Jaguara, 89',          'Centro',                   'Campinas',       'SP'),
  (18, 2, 'rejeitado',  145.00, 0.00, 145.00, NULL,                                       'Mariana Oliveira Santos', '(11) 98765-4321', '01020-000', 'Av. Paulista, 1500',                'Bela Vista',               'São Paulo',      'SP'),
  (19, 4, 'entregue',   210.00, 0.00, 210.00, NULL,                                       'Fernanda Costa Ribeiro',  '(21) 98877-6655', '20040-000', 'Rua do Ouvidor, 45',                'Centro',                   'Rio de Janeiro', 'RJ'),
  (20, 5, 'confirmado', 120.00, 0.00, 120.00, NULL,                                       'Lucas Martins Souza',     '(31) 99711-2233', '30130-000', 'Av. Afonso Pena, 700',              'Centro',                   'Belo Horizonte', 'MG'),
  (21, 6, 'entregue',   340.00, 0.00, 340.00, 'Cliente gostou da linha premium.',         'Patrícia Gomes Fernandes','(41) 99655-8899', '80010-000', 'Rua XV de Novembro, 320',           'Centro',                   'Curitiba',       'PR'),
  (22, 7, 'confirmado', 190.00, 0.00, 190.00, NULL,                                       'Rafael Henrique Lopes',   '(51) 99144-5566', '90010-000', 'Av. Borges de Medeiros, 210',       'Centro Histórico',         'Porto Alegre',   'RS'),
  (23, 8, 'entregue',   410.00, 0.00, 410.00, NULL,                                       'Juliana Teixeira Rocha',  '(71) 99222-3344', '40020-000', 'Av. Sete de Setembro, 980',         'Dois de Julho',            'Salvador',       'BA'),
  (24, 9, 'confirmado', 155.00, 0.00, 155.00, NULL,                                       'Bruno Carvalho Nunes',    '(61) 99333-4455', '70040-010', 'Esplanada dos Ministérios, Bloco A','Zona Cívico-Administrativa','Brasília',        'DF'),
  (25,10, 'entregue',   720.00, 0.00, 720.00, 'Maior compra do mês.',                     'Camila Barbosa Freitas',  '(85) 99444-5566', '60060-000', 'Av. Beira Mar, 150',                'Meireles',                 'Fortaleza',      'CE')
ON CONFLICT (id) DO NOTHING;

-- ─── PEDIDO ITENS ─────────────────────────────────────────
INSERT INTO jm.pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
VALUES
(1, 11, 2, 75.00), (1, 9,  1, 45.00),
(3, 14, 1, 350.00),(3, 12, 1, 65.00),
(4, 13, 1, 135.00),
(5, 12, 1, 65.00),
(6, 11, 3, 75.00),
(7, 8,  1, 150.00),
(8, 11, 4, 75.00), (8, 12, 1, 65.00), (8, 9, 1, 45.00),
(9, 5,  1, 130.00),
(10, 14, 1, 350.00),(10, 1, 1, 89.90),
(11, 12, 1, 65.00),(11, 9, 1, 45.00),
(12, 11, 2, 75.00),
(13, 3,  2, 95.00),(13, 11, 1, 75.00),
(14, 15, 1, 280.00),(14, 5, 1, 130.00),
(15, 1,  1, 89.90),(15, 9, 1, 45.00),
(16, 13, 2, 135.00),
(17, 14, 1, 350.00),(17, 15, 1, 280.00),
(18, 11, 1, 75.00),(18, 12, 1, 65.00),
(19, 2,  1, 120.00),(19, 9, 2, 45.00),
(20, 12, 1, 65.00),(20, 9, 1, 45.00),
(21, 14, 1, 350.00),
(22, 11, 2, 75.00),
(23, 3,  2, 95.00),(23, 11, 2, 75.00),
(24, 5,  1, 130.00),
(25, 14, 1, 350.00),(25, 15, 1, 280.00),(25, 11, 1, 75.00)
ON CONFLICT DO NOTHING;

-- ─── ZONAS DE ENTREGA ─────────────────────────────────────
INSERT INTO jm.zonas_entrega (cidade, cep_prefixo, ativo) VALUES
  ('Atibaia', '12940', true),
  ('Atibaia', '12941', true),
  ('Atibaia', '12942', true),
  ('Atibaia', '12943', true),
  ('Atibaia', '12944', true),
  ('Atibaia', '12945', true)
ON CONFLICT DO NOTHING;

INSERT INTO jm.loja (nome, cep, endereco, numero, bairro, cidade, estado)
VALUES (
  'JM Decoracao',
  '12952-560',
  'Estr. Mun. Jucá Sanches',
  '1050',
  'Boa Vista',
  'Atibaia',
  'SP'
);

INSERT INTO jm.admin (nome, email, senha_hash, role)
VALUES (
  'Admin',
  'admin@gmail.com',
  '$2b$10$zaYuOY0BSpY9c6N7Oiytsuwo/RoRuBAdjJmSOrbtNwMu.783owQJy',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ─── SINCRONIZA SEQUENCES ─────────────────────────────────
SELECT setval('jm.pedidos_id_seq',       (SELECT MAX(id) FROM jm.pedidos));
SELECT setval('jm.produtos_id_seq',      (SELECT MAX(id) FROM jm.produtos));
SELECT setval('jm.clientes_id_seq',      (SELECT MAX(id) FROM jm.clientes));
SELECT setval('jm.categorias_id_seq',    (SELECT MAX(id) FROM jm.categorias));
SELECT setval('jm.zonas_entrega_id_seq', (SELECT MAX(id) FROM jm.zonas_entrega));