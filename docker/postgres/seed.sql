INSERT INTO jm.produtos (nome, descricao, preco, imagem_upload, categoria, disponivel, estoque)
VALUES 
('Vaso Girassol', 'Vaso Girassol amarelo decorativo feito de cerâmica.', 89.90, 'vaso-girasol.jpeg', 'Decoração', true, 10),
('Jogo Suqueira + 6 Copos', 'Jogo de suqueira com seis copos de vidro.', 150.00, '6-copos-suqueira.png', 'Cozinha', true, 5),
('Pote Sustentável T', 'Pote sustentável para armazenamento.', 45.00, 'pote-sustentavel.png', 'Cozinha', true, 20),
('Vaso Design Geométrico', 'Vaso de design geométrico moderno.', 120.00, 'vaso-design-geometrico.png', 'Decoração', true, 8),
('Taça de Cristal Premium', 'Taça de cristal premium elegante.', 200.00, 'taça-cristal.png', 'Cozinha', true, 12),
('Vaso Coloriquadra', 'Vaso decorativo colorido.', 95.00, 'vaso-coloriquadra.png', 'Decoração', true, 15),
('Copo de Cristal Gracioso', 'Copo de cristal com detalhes graciosos e elegantes.', 75.00, 'Copo de Cristal em Detalhes Graciosos.png', 'Cozinha', true, 10),
('Copo Artesanal', 'Copo artesanal em vidro com design exclusivo.', 65.00, 'copo-Image 9 de jul. de 2025, 20_37_00.png', 'Cozinha', true, 8),
('Garrafa Decorativa', 'Garrafa decorativa em vidro para ambientes.', 110.00, 'garrafa.jpeg', 'Decoração', true, 6),
('Lustre Artesanal Premium', 'Lustre artesanal em vidro com acabamento premium.', 350.00, 'lustre 1 ChatGPT Image 13 de ago. de 2025, 20_52_54.png', 'Iluminação', true, 4),
('Lustre em Vidro', 'Lustre clássico em vidro para ambientes sofisticados.', 280.00, 'lustre.jpg', 'Iluminação', true, 5),
('Pote com Flores Gravadas', 'Pote de vidro com delicadas flores gravadas.', 130.00, 'Pote de vidro com flores gravadas.png', 'Decoração', true, 7),
('Suqueira Artesanal', 'Suqueira artesanal em vidro com tampa.', 135.00, 'suqueira-20191216_074040.jpg', 'Cozinha', true, 9),
('Vaso Moderno', 'Vaso moderno em vidro para decoração de interiores.', 145.00, 'vaso Image 1 de set. de 2025, 14_01_22.png', 'Decoração', true, 6),
('Vaso Design D', 'Vaso com design exclusivo em vidro artesanal.', 160.00, 'vaso-D Image 9 de set. de 2025, 18_12_38.png', 'Decoração', true, 5);

INSERT INTO jm.admin (nome,email,senha_hash,role,cpf_cnpj,endereco_fiscal)
VALUES (
    'Admin',
    'example@gmail.com',
    '$2b$10$zaYuOY0BSpY9c6N7Oiytsuwo/RoRuBAdjJmSOrbtNwMu.783owQJy',/*senha123*/
    'admin',
    '12345678911',
    '12345678'
);