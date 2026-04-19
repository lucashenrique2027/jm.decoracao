INSERT INTO jm.produtos (nome, descricao, preco, imagem_upload, categoria, disponivel, estoque)
VALUES 
('Vaso Girassol', 'Vaso Girassol amarelo decorativo feito de cerâmica.', 89.90, 'vaso-girasol.jpeg', 'Decoração', true, 10),
('Jogo Suqueira + 6 Copos', 'Jogo de suqueira com seis copos de vidro.', 150.00, '6-copos-suqueira.png', 'Cozinha', true, 5),
('Pote Sustentável T', 'Pote sustentável para armazenamento.', 45.00, 'pote-sustentavel.png', 'Cozinha', true, 20),
('Vaso Design Geométrico', 'Vaso de design geométrico moderno.', 120.00, 'vaso-design-geometrico.png', 'Decoração', true, 8),
('Taça de Cristal Premium', 'Taça de cristal premium elegante.', 200.00, 'taça-cristal.png', 'Cozinha', true, 12),
('Vaso Coloriquadra', 'Vaso decorativo colorido.', 95.00, 'vaso-coloriquadra.png', 'Decoração', true, 15);

INSERT INTO jm.admin (nome,email,senha_hash,role,cpf_cnpj,endereco_fiscal)
VALUES (
    'Admin',
    'example@gmail.com',
    '$2b$10$xwT/CzqMVA.uPaVa9ifnjuMV0n7NnjSwTq8atSay50WpzHe2dCWSi',
    'admin',
    '12345678911',
    '12345678'
);