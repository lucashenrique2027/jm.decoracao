INSERT INTO jm.categorias (nome) 
VALUES 
    ('Decoração'), 
    ('Cozinha'), 
    ('Iluminação')
ON CONFLICT (nome) DO NOTHING;

-- ─── INSERIR PRODUTOS COM LÓGICA DE ATACADO/VAREJO ──────────
-- ─── INSERIR PRODUTOS COM LÓGICA DE ATACADO/VAREJO ──────────
INSERT INTO jm.produtos 
    (nome, descricao, preco_varejo, preco_atacado, quantidade_minima_atacado, imagem_upload, categoria_id, estoque)
VALUES 

-- PRODUTOS DECORAÇÃO
('Vaso Girassol', 'Vaso Girassol amarelo decorativo feito de cerâmica.', 89.90, 75.50, 6, 'vaso-girasol.jpeg', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 10),

('Vaso Design Geométrico', 'Vaso de design geométrico moderno.', 120.00, NULL, NULL, 'vaso-design-geometrico.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 8),

('Vaso Coloriquadra', 'Vaso decorativo colorido.', 95.00, 80.00, 10, 'vaso-coloriquadra.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 15),

('Garrafa Decorativa', 'Garrafa decorativa em vidro para ambientes.', 110.00, NULL, NULL, 'garrafa.jpeg', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 6),

('Pote com Flores Gravadas', 'Pote de vidro com delicadas flores gravadas.', 130.00, 110.00, 6, 'Pote de vidro com flores gravadas.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 7),

('Vaso Moderno', 'Vaso moderno em vidro para decoração de interiores.', 145.00, NULL, NULL, 'vaso Image 1 de set. de 2025, 14_01_22.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 6),

('Vaso Design D', 'Vaso com design exclusivo em vidro artesanal.', 160.00, 135.00, 5, 'vaso-D Image 9 de set. de 2025, 18_12_38.png', (SELECT id FROM jm.categorias WHERE nome = 'Decoração'), 5),

-- PRODUTOS COZINHA
('Jogo Suqueira + 6 Copos', 'Jogo de suqueira com seis copos de vidro.', 150.00, 125.00, 4, '6-copos-suqueira.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 5),

('Pote Sustentável T', 'Pote sustentável para armazenamento.', 45.00, 35.00, 12, 'pote-sustentavel.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 20),

('Taça de Cristal Premium', 'Taça de cristal premium elegante.', 200.00, NULL, NULL, 'taça-cristal.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 12),

('Copo de Cristal Gracioso', 'Copo de cristal com detalhes graciosos e elegantes.', 75.00, 60.00, 12, 'Copo de Cristal em Detalhes Graciosos.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 10),

('Copo Artesanal', 'Copo artesanal em vidro com design exclusivo.', 65.00, NULL, NULL, 'copo-Image 9 de jul. de 2025, 20_37_00.png', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 8),

('Suqueira Artesanal', 'Suqueira artesanal em vidro com tampa.', 135.00, 115.00, 3, 'suqueira-20191216_074040.jpg', (SELECT id FROM jm.categorias WHERE nome = 'Cozinha'), 9),

-- PRODUTOS ILUMINAÇÃO
('Lustre Artesanal Premium', 'Lustre artesanal em vidro com acabamento premium.', 350.00, 290.00, 2, 'lustre 1 ChatGPT Image 13 de ago. de 2025, 20_52_54.png', (SELECT id FROM jm.categorias WHERE nome = 'Iluminação'), 4),

('Lustre em Vidro', 'Lustre clássico em vidro para ambientes sofisticados.', 280.00, NULL, NULL, 'lustre.jpg', (SELECT id FROM jm.categorias WHERE nome = 'Iluminação'), 5);


INSERT INTO jm.admin (nome, email, senha_hash, role, cpf_cnpj, endereco_fiscal)
VALUES (
    'Admin',
    'admin@gmail.com',
    '$2b$10$zaYuOY0BSpY9c6N7Oiytsuwo/RoRuBAdjJmSOrbtNwMu.783owQJy',
    'admin',
    '12345678911',
    '12345678'
) ON CONFLICT (email) DO NOTHING;
/*senha123*/

-- ─── 4. CLIENTES ────────────────────────────────────────
INSERT INTO jm.clientes (nome, email, senha_hash, telefone, cep, endereco, bairro, cidade, estado)
VALUES
('Carlos Eduardo Silva', 'carlos.silva@gmail.com', '$2b$10$Uq9OfSVDm0p45LItRTBhwukrDt9dVRr483j/zMHjA9FSqy/0Oxv5S', '(15) 99876-1234', '18010-000', 'Rua das Flores, 123', 'Centro', 'Sorocaba', 'SP'),
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

INSERT INTO jm.pedidos (id, cliente_id, status, total, observacao_entrega)
VALUES
  (1, 1, 'entregue', 179.80, 'Entregue no prazo.'),
  (2, 2, 'pendente', 200.00, 'Aguardando cliente finalizar.'),
  (3, 3, 'confirmado', 415.00, 'Pagamento aprovado, separar estoque.'),
  (4, 4, 'confirmado', 135.00, 'Tocar interfone 45.'),
  (5, 5, 'pendente', 65.00, NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── ZONAS INICIAIS (Atibaia) ───────────────────────────
-- Lista exata será confirmada com o cliente
INSERT INTO jm.zonas_entrega (cidade, cep_prefixo, ativo) VALUES
  ('Atibaia', '12940', true),
  ('Atibaia', '12941', true),
  ('Atibaia', '12942', true),
  ('Atibaia', '12943', true),
  ('Atibaia', '12944', true),
  ('Atibaia', '12945', true);