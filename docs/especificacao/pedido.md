# 🛒 Domínio: Pedidos

> Fluxo de Geração de Pedido e Pagamento (versão simplificada)

---

## 📌 Visão Geral

Este fluxo descreve, em alto nível, como um **pedido** é gerado, como seu **pagamento** é controlado e confirmado, e como o **estoque** se mantém consistente durante todo o processo.

O fluxo é dividido em **4 partes**:

1. Geração do Pedido e Pagamento
2. Confirmação de Pagamento
3. Controle de Estoque
4. Regras de Consistência

---

## 1️⃣ Geração do Pedido e Pagamento

> O sistema primeiro verifica se tudo está correto antes de criar qualquer pedido.

### ✅ Validações Iniciais

Antes de gerar o pedido, o sistema confere:

- Se o **cliente** existe
- Se o **carrinho** existe
- Se o carrinho **tem itens**
- Se já existe um **pedido pendente** (para evitar duplicidade)
- Se a **loja está configurada** corretamente

> ⚠️ Se algo estiver errado, o processo é **interrompido**.

---

### 🧮 Cálculos

Em seguida, o sistema calcula:

- Endereço de entrega
- Valor do frete
- Valor dos produtos
- Valor total do pedido

---

### 🔑 Preparação do Pagamento

Antes de salvar o pedido, o sistema prepara:

- Um **código único** para o pagamento
- Um **QR Code** para pagamento via Pix

---

### 🗄️ Criação do Pedido

O sistema cria o pedido com:

- Dados do cliente
- Endereço de entrega
- Valores calculados
- Status inicial como **`pendente`**

---

### 📦 Itens do Pedido

Os produtos do carrinho são **copiados** para o pedido.

---

### 💳 Registro do Pagamento

O sistema registra o pagamento com:

- Ligação com o pedido
- Código do pagamento
- Status **`aguardando pagamento`**
- QR Code gerado

---

### 🏁 Finalização

Depois disso:

- O carrinho é **apagado**
- O pedido fica registrado como **único estado ativo**

> ✅ Se tudo der certo, o processo é concluído.
>
> ❌ Se ocorrer erro em qualquer parte:
> - Nada é salvo parcialmente
> - O sistema **desfaz tudo automaticamente**

---

## 2️⃣ Confirmação de Pagamento

### 📥 Recebimento da Confirmação

Quando o sistema de pagamento envia a confirmação:

- O sistema **responde imediatamente**
- **Não bloqueia** o processamento

---

### ✅ Verificação do Pagamento

O sistema confere se o pagamento **realmente foi aprovado**.

> Somente pagamentos **aprovados** seguem adiante.

---

### 🔁 Evitar Duplicidade

O sistema garante que:

- O **mesmo pagamento** não seja processado duas vezes

---

### 🔄 Confirmação

Quando o pagamento é válido:

- O pagamento é marcado como **`pago`**
- A data do pagamento é registrada
- O pedido é marcado como **`confirmado`**

---

## 3️⃣ Controle de Estoque

> O estoque **não** é alterado no momento do pagamento.
>
> Ele só é ajustado quando o pedido é **rejeitado**.

Quando isso acontece:

- Os produtos do pedido são **recuperados**
- O estoque **volta ao valor anterior**

---

## 4️⃣ Regras de Consistência

| # | Regra |
|---|---|
| 1 | Um pedido **não pode ser duplicado**. |
| 2 | Um pedido **não pode ser confirmado** sem pagamento. |
| 3 | Um pedido **não pode ser entregue** sem confirmação prévia. |
| 4 | Alterações são feitas de forma **segura e completa**. |

---