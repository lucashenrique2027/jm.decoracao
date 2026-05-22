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

-- ─── ADMIN ────────────────────────────────────────────────
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

-- ─── ZONAS DE ENTREGA ─────────────────────────────────────
INSERT INTO jm.zonas_entrega (cidade, cep_prefixo, ativo) VALUES
  ('Atibaia', '12940', true),
  ('Atibaia', '12941', true),
  ('Atibaia', '12942', true),
  ('Atibaia', '12943', true),
  ('Atibaia', '12944', true),
  ('Atibaia', '12945', true)
ON CONFLICT DO NOTHING;

-- ─── SINCRONIZA SEQUENCES ─────────────────────────────────
SELECT setval('jm.pedidos_id_seq',       (SELECT MAX(id) FROM jm.pedidos));
SELECT setval('jm.produtos_id_seq',      (SELECT MAX(id) FROM jm.produtos));
SELECT setval('jm.clientes_id_seq',      (SELECT MAX(id) FROM jm.clientes));
SELECT setval('jm.categorias_id_seq',    (SELECT MAX(id) FROM jm.categorias));
SELECT setval('jm.zonas_entrega_id_seq', (SELECT MAX(id) FROM jm.zonas_entrega));