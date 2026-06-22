# 👤 Domínio: Clientes

> Especificação Funcional

---

## 📌 Visão Geral

O domínio de **Clientes** concentra as funcionalidades de autenticação, cadastro, verificação de identidade, recuperação de acesso e gerenciamento de dados cadastrais dos clientes do sistema.

---

## 🔑 Fluxo de Autenticação de Cliente

- O sistema permite **autenticação de clientes** via e-mail e senha.
- O sistema **valida credenciais**, comparando a senha informada com o hash armazenado.
- Após autenticação válida, o sistema **gera um token de sessão** com expiração.
- O token é **armazenado em cookie HTTP-only** para uso em requisições subsequentes.
- O sistema **bloqueia o acesso** caso o cliente não esteja ativo ou com e-mail verificado.

---

## 📝 Fluxo de Cadastro de Cliente

- O sistema permite **cadastro de novos clientes** com dados pessoais e endereço.
- A senha do cliente é **armazenada de forma criptografada** (hash).
- O cliente inicia com status **"pendente"** e e-mail **não verificado**.
- O sistema **envia um token de verificação** por e-mail após o cadastro.
- O cliente só pode **acessar o sistema** após a confirmação do e-mail.

---

## ✉️ Fluxo de Confirmação de E-mail

1. O cliente informa **e-mail e token** recebido.
2. O sistema **valida a existência** do cliente.
3. O sistema **valida a correspondência** do token.
4. O sistema **valida a expiração** do token.
5. Após validação, o cliente é **ativado** e marcado como **e-mail verificado**.
6. Tokens de verificação são **invalidados após o uso**.

---

## 🔁 Fluxo de Recuperação de Senha

- O sistema permite **solicitação de recuperação** de senha por e-mail.
- O sistema **envia um token de recuperação** ao e-mail do cliente.
- O sistema permite **redefinição de senha** mediante token válido.
- O sistema **valida expiração e autenticidade** do token.
- Após a redefinição, o token é **invalidado** e a senha é **atualizada**.

---

## 🔒 Fluxo de Alteração de Senha (Autenticado)

- O cliente **autenticado** pode alterar sua senha.
- O sistema **valida a senha atual** antes de permitir a alteração.
- A nova senha é **armazenada como hash**.
- A alteração só é permitida para o **cliente autenticado**.

---

## 🛠️ Fluxo de Consulta de Clientes (Admin)

- O sistema permite **listagem de todos os clientes** cadastrados.
- O sistema permite **consulta de cliente por ID**.
- O sistema retorna **dados cadastrais sem expor a senha**.

---

## ✏️ Fluxo de Atualização de Cliente

- O sistema permite **atualização de dados cadastrais** do cliente.
- Campos **não informados não são sobrescritos**.
- O sistema **mantém a integridade** dos dados existentes.

---

## 🗑️ Fluxo de Remoção de Cliente

- O sistema permite **exclusão de cliente por ID**.
- Após a remoção, o cliente **deixa de existir** no sistema.
- A operação **retorna confirmação** de exclusão.

---

## 🔐 Regras de Negócio (Clientes)

| # | Regra |
|---|---|
| 1 | O e-mail deve ser **único** no sistema. |
| 2 | Senhas **nunca** são armazenadas em texto puro. |
| 3 | O cliente só pode acessar dados **após autenticação válida**. |
| 4 | O cliente deve ter o **e-mail verificado** para login. |
| 5 | Tokens de verificação possuem **expiração e uso único**. |
| 6 | Tokens **inválidos ou expirados** devem ser rejeitados. |
| 7 | Apenas o **próprio cliente autenticado** pode alterar sua senha. |
| 8 | Dados sensíveis (senha hash) **nunca** são expostos em consultas. |
| 9 | Apenas **administradores** podem listar todos os clientes. |
| 10 | Um cliente **não pode acessar dados** de outro cliente. |

---