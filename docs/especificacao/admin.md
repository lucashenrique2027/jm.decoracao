# 📚 Documentação do Sistema

## 🛡️ Domínio: Administração

### 📌 Visão Geral

O domínio de **Administração** concentra as funcionalidades destinadas à gestão operacional do sistema, incluindo autenticação de administradores, gerenciamento de produtos e categorias, consulta de clientes e geração de relatórios analíticos e financeiros.

---

### 🔄 Fluxo Funcional

- O sistema permite **autenticação de administradores** através de credenciais específicas.
- O administrador pode acessar o **painel administrativo** mediante autenticação válida.
- O sistema permite **gerenciamento completo de produtos**, incluindo:
  - Criação
  - Atualização
  - Remoção
  - Atualização de imagens
- O sistema permite **gerenciamento de categorias**, incluindo criação e remoção.
- O administrador pode **consultar todos os clientes** cadastrados no sistema.
- O sistema permite **consulta de produtos** com filtros por categoria e busca textual.
- O sistema disponibiliza **relatórios operacionais e financeiros** baseados em dados consolidados:
  - Faturamento
  - Produtos mais vendidos
  - Categorias mais vendidas
- O sistema permite **exportação de relatórios em PDF**, incluindo relatórios individuais de pedidos.

---

### ⚙️ Capacidades do Domínio

| Categoria | Capacidade |
|---|---|
| **Autenticação** | Autenticar administrador |
| **Painel** | Acessar painel administrativo |
| **Clientes** | Listar clientes |
| **Produtos** | Listar produtos |
| | Buscar produtos |
| | Buscar produto por ID |
| | Buscar produtos por categoria |
| | Criar produto |
| | Atualizar produto |
| | Atualizar imagem de produto |
| | Deletar produto |
| **Categorias** | Listar categorias |
| | Criar categoria |
| | Deletar categoria |
| **Relatórios** | Gerar relatório de faturamento |
| | Gerar relatório de produtos mais vendidos |
| | Gerar relatório de categorias mais vendidas |
| | Exportar relatórios em PDF |
| | Exportar pedido em PDF |

---

### 📏 Regras de Negócio

1. ✅ O acesso ao domínio é **restrito a usuários com permissão de administrador**.
2. ✅ Todas as operações administrativas **exigem autenticação válida**.
3. ✅ Operações de modificação (**criação, atualização e remoção**) são restritas a administradores.
4. ✅ Relatórios são baseados **exclusivamente em dados consolidados** do sistema.
5. ✅ A geração de relatórios **não altera dados persistidos**.
6. ✅ O sistema garante **separação entre dados operacionais e dados analíticos**.

---