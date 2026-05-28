# Infraestrutura de Software JM

## Fundamentos e Padrões do Projeto

A seguir estão as informações a respeito da arquitetura do projeto, que segue padrões particulares de dependência, funcionalidades e requisitos específicos. Esta arquitetura cresceu conforme o projeto também crescia.

---

### Padrão de Diretórios

O ponto de entrada do projeto são os dois arquivos na raiz:
├── docker-compose.upload.yml
└── docker-compose.yaml

Cada serviço que precisa de uma imagem personalizada utiliza um Dockerfile que segue o padrão arquitetural abaixo:
├── /docker
│
├── docker-compose.upload.yml
└── docker-compose.yaml

Em `/docker` são listados diretórios com os nomes de cada serviço:
├── docker
│   ├── migrator-images
│   ├── nginx
│   ├── node
│   ├── postgres
│   └── vite
│
├── docker-compose.upload.yml
└── docker-compose.yaml

Cada diretório de serviço é único e contém arquivos auxiliares para o Dockerfile, como configurações, `nginx.conf` personalizados, `package.json` e `init.sql`.

---

### Contêineres

Durante a construção da aplicação, cada Dockerfile copia os diretórios da raiz correspondentes à sua função:

- A API copia o diretório `/backend` para seu contêiner.
- O Vite copia tudo que há em `/frontend`.
- O migrador utiliza `/infra` e `/uploads` com seus códigos e imagens.
- `/scripts` é utilizado para configurações do MinIO.

Com estas informações, construímos toda a estrutura de pastas da primeira camada:

### Visão Final
├── backend
├── docker
│   ├── migrator-images
│   ├── nginx
│   ├── node
│   ├── postgres
│   └── vite
├── docs
├── frontend
├── infra
├── scripts
├── uploads
├── .env
├── README.md
├── docker-compose.upload.yml
└── docker-compose.yaml

---

### Backend

Aqui contém tudo que a API precisa. Na raiz de `/backend` está o `server.js`, o núcleo operacional da API — utiliza o Express para criar o servidor e importa todos os roteadores que contêm os endpoints.

**/routes** — contém todos os arquivos responsáveis pelos endpoints da aplicação. Cada arquivo `.js` representa uma entidade, como Admin, Produtos e Clientes. Cada entidade possui todos os endpoints necessários para contemplar as operações e consultas relacionadas ao seu domínio.

**/controller** — contém todas as funções, operações e consultas no banco que os endpoints de `/routes` utilizam. Este mapeamento permite alta escalabilidade e organização.

**/middlewares** — possui autenticadores de cookie, pré-variáveis de imagens do Multer e outros. É o mediador entre os endpoints de `/routes` e as operações de `/controller`.

**/models** — possui a definição das tabelas para o ORM utilizar e a conexão com o ORM para consultas no banco.

**/src** — contém configurações de serviços, pacotes e dependências do Node.js ou serviços externos, como:
- Mercado Pago API
- Configurações e templates de páginas PDF para relatórios

### Visão Final
backend
├── controller
├── middlewares
├── models
├── routes
└── src
├── config
├── mercadoPago
├── pdf
│   └── templates
├── qrcode
└── services

---

### Frontend

Esta é a aplicação web que exibe páginas, painéis e vitrines de produtos para o usuário interagir com uma interface amigável.

A primeira camada de `/frontend` é:
├── frontend
├── public
├── src
└── styles

**/styles** — contém estilos globais como fontes e variáveis CSS para uso em qualquer página.

Em `/src` a estrutura é organizada da seguinte forma:

**/pages** — contém todas as páginas completas da aplicação.

**/services** — contém todos os fetches centralizados por entidade em arquivos separados.

**/components** — contém componentes reutilizáveis importados pelas páginas.

**/admin** — página dedicada ao painel administrativo.

**/context** — contém os contextos do React, como carrinho de compras e cards de mensagens e alertas.

### Visão Final
├── frontend
│   ├── public
│   ├── src
│   │   ├── admin
│   │   │   ├── dashboard
│   │   │   ├── login
│   │   │   └── modules
│   │   ├── cadastro
│   │   ├── components
│   │   │   ├── carrinho
│   │   │   ├── Footer
│   │   │   ├── Header
│   │   │   ├── PedidoSelected
│   │   │   ├── ProdutoDetalhes
│   │   │   ├── rotaPriveAdmin
│   │   │   ├── rotaPriveCliente
│   │   │   ├── subHeader
│   │   │   └── Vitrine
│   │   ├── context
│   │   ├── pages
│   │   │   ├── Home
│   │   │   ├── Login
│   │   │   ├── Pagamento
│   │   │   ├── Perfil
│   │   │   └── Sobre
│   │   └── services
│   └── styles