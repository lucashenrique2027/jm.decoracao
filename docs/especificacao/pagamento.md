# 💳 Domínio: Pagamentos

> Fluxo de Geração e Confirmação de Pagamento

---

## 📌 Visão Geral

O domínio de **Pagamentos** cobre todo o ciclo financeiro do pedido: desde a geração do pagamento no checkout, passando pela integração com o gateway externo, até a confirmação via webhook e a baixa de estoque.

O fluxo é dividido em **3 etapas principais**:

1. Geração do Pagamento (Checkout do Pedido)
2. Processamento do Pagamento (Gateway Externo)
3. Confirmação de Pagamento (Webhook)

---

## 1️⃣ Geração do Pagamento (Checkout do Pedido)

### ✅ Validação Inicial do Checkout

Antes da criação do pedido e do pagamento, o sistema valida:

- Existência do **cliente autenticado**
- Existência do **carrinho ativo**
- Existência de **itens no carrinho**
- Inexistência de **pedido já pendente** para o cliente
- Existência de **configuração da loja** (CEP base)

> ⚠️ Se qualquer validação falhar, o checkout é **interrompido**.

---

### 🧮 Cálculo do Pedido

O sistema calcula:

- **Subtotal** dos itens do carrinho
- **Frete** via serviço externo
- **Total final** do pedido

> Esses valores são derivados diretamente dos itens do carrinho e do cálculo de frete.

---

### 🔑 Geração do Pagamento (Pré-transação)

Antes da transação principal:

- É gerado um **token único de pagamento** (UUID)
- É gerado um **QR Code** (payload PIX simulado)

> O QR Code já é criado **antes** da gravação final no banco.

---

### 🗄️ Criação do Pedido e Pagamento (Transação)

Dentro de uma **transação única**:

- Pedido é criado com status **`pendente`**
- Itens do carrinho são copiados para `pedido_itens`
- Pagamento é registrado com status **`aguardando_pagamento`**
- Pagamento recebe:
  - Valor total
  - Token de pagamento
  - Método inicial (`pix_simulado`)
  - QR Code gerado
  - Expiração do pagamento

---

### 🏁 Finalização do Checkout

Após sucesso da transação:

- Carrinho é **deletado completamente** do sistema
- Pedido passa a existir **independentemente** do carrinho

---

## 2️⃣ Processamento do Pagamento (Gateway Externo)

### ✅ Validação de Sessão de Pagamento

Antes de qualquer integração externa, o sistema valida:

- Existência do **pedido**
- Pertencimento do pedido ao **cliente autenticado**
- Existência do **pagamento vinculado** ao pedido e token
- Status igual a **`aguardando_pagamento`**
- Pagamento **não expirado**

> ⚠️ Se qualquer validação falhar, o processo é **interrompido**.

---

### 🔎 Consulta de Dados do Pedido

O sistema recupera:

- Itens do pedido
- Dados do produto (nome, preço, quantidade)
- E-mail do cliente

> Esses dados são usados **apenas** para criação da cobrança externa.

---

### 💰 Geração da Cobrança

#### Mercado Pago

É criada uma cobrança do tipo **Preference** contendo:

- Lista de itens do pedido
- E-mail do comprador
- URLs de retorno (sucesso, erro, pendente)
- Referência externa do pedido
- URL de webhook

#### PIX (Mercado Pago)

É criada uma **transação PIX** contendo:

- Valor do pagamento
- Descrição do pedido
- E-mail do pagador
- Referência externa do pedido

Além disso, o sistema retorna:

- QR Code **textual**
- QR Code em **base64**

---

### 🔄 Atualização do Método de Pagamento

Após a criação da cobrança, o método de pagamento é atualizado no banco:

- `mercado_pago` ou `pix`

---

### ⚙️ Característica do Processo

- Toda comunicação com o gateway ocorre **fora** de transações do banco
- Não há **bloqueio de dados internos** durante chamadas externas

---

## 3️⃣ Confirmação de Pagamento (Webhook)

### 📥 Recebimento da Notificação

- Webhook responde **imediatamente** com `HTTP 200`
- Processamento ocorre de forma **assíncrona**

---

### ✅ Validação no Gateway

Ao receber o evento:

- O sistema consulta o pagamento no **Mercado Pago**
- Valida se o status é **`approved`**
- Apenas pagamentos **aprovados** seguem para processamento

---

### 🔁 Idempotência

A confirmação **só ocorre** se:

- O pagamento ainda estiver em **`aguardando_pagamento`**

Caso contrário:

- O evento é **ignorado**
- **Nenhuma alteração** ocorre

---

### 🔄 Processamento da Confirmação

Quando válido:

- Status do pagamento é atualizado para **`pago`**
- Data de pagamento é registrada
- Itens do pedido são recuperados
- Status do pedido é atualizado para **`confirmado`**

---

### 📦 Baixa de Estoque

Para cada item:

1. Produto é buscado no banco
2. Disponibilidade é validada
3. Estoque é verificado
4. Estoque é **reduzido** conforme a quantidade comprada

---

### 🔒 Concorrência e Consistência

O sistema garante integridade ao:

- **Bloquear** o produto durante a atualização de estoque
- **Impedir** múltiplas confirmações simultâneas
- **Evitar** inconsistência de estoque

---

### 🏁 Finalização da Transação

- Operação é confirmada com **sucesso**
- Em caso de erro, **toda a transação é revertida**

---

## ✅ Resultado Final do Sistema

| Garantia | Descrição |
|---|---|
| 🧾 Independência | O pedido nasce **independente** do pagamento |
| 🔐 Validação interna | O pagamento é validado internamente **antes** de qualquer gateway |
| 🌐 Gateway externo | O gateway **apenas** executa a cobrança externa |
| 🔁 Idempotência | O webhook confirma o pagamento de forma **idempotente** |
| 📦 Estoque seguro | O estoque **só é reduzido** após confirmação real |
| 🗑️ Limpeza | O carrinho é **destruído** no checkout |
| ⚖️ Consistência | O sistema mantém **consistência total** entre pedido, pagamento e estoque |

---