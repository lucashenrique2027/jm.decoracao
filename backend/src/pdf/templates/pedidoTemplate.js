export const pedidoTemplate = (doc, pedido) => {

  const formatReal = (val) =>
    `R$ ${Number(val).toFixed(2).replace('.', ',')}`;

  const formatData = (iso) =>
    new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const STATUS_LABEL = {
    pendente:   'PENDENTE',
    confirmado: 'CONFIRMADO',
    entregue:   'ENTREGUE',
    rejeitado:  'CANCELADO',
  };

  /* =====================================================
     CABEÇALHO
  ===================================================== */

  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('JM Decorações', { align: 'center' });

  doc
    .fontSize(14)
    .font('Helvetica')
    .text('Comprovante de Pedido', { align: 'center' });

  doc.moveDown(0.5);

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown(1);

  /* =====================================================
     INFO DO PEDIDO
  ===================================================== */

  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(`Pedido #${pedido.id}`, 50);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#555555')
    .text(`Realizado em: ${formatData(pedido.criadoEm)}`, 50);

  doc
    .text(`Status: ${STATUS_LABEL[pedido.status] ?? pedido.status.toUpperCase()}`, 50);

  if (pedido.metodoPagamento) {
    doc.text(`Pagamento: ${pedido.metodoPagamento}`, 50);
  }

  if (pedido.pagoEm) {
    doc.text(`Pago em: ${formatData(pedido.pagoEm)}`, 50);
  }

  doc.fillColor('black');
  doc.moveDown(1.5);

  /* =====================================================
     CLIENTE
  ===================================================== */

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Dados do Cliente');

  doc
    .moveTo(50, doc.y + 3)
    .lineTo(550, doc.y + 3)
    .stroke();

  doc.moveDown(0.8);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Nome:      ${pedido.cliente.nome}`);
  doc.text(`E-mail:    ${pedido.cliente.email}`);
  doc.text(`Telefone:  ${pedido.cliente.telefone}`);

  doc.moveDown(1.5);

  /* =====================================================
     ENDEREÇO DE ENTREGA
  ===================================================== */

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Endereço de Entrega');

  doc
    .moveTo(50, doc.y + 3)
    .lineTo(550, doc.y + 3)
    .stroke();

  doc.moveDown(0.8);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Recebedor: ${pedido.nomeRecebedor}`);
  doc.text(`Telefone:  ${pedido.telefoneEntrega}`);
  doc.text(
    `Endereço:  ${pedido.enderecoEntrega}, ${pedido.numeroEntrega} — ${pedido.bairroEntrega}`
  );
  doc.text(
    `Cidade:    ${pedido.cidadeEntrega} / ${pedido.estadoEntrega} — CEP ${pedido.cepEntrega}`
  );

  if (pedido.observacaoEntrega) {
    doc.text(`Observação: ${pedido.observacaoEntrega}`);
  }

  doc.moveDown(1.5);

  /* =====================================================
     ITENS — CABEÇALHO DA TABELA
  ===================================================== */

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Itens do Pedido');

  doc
    .moveTo(50, doc.y + 3)
    .lineTo(550, doc.y + 3)
    .stroke();

  doc.moveDown(0.8);

  const tY = doc.y;

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Produto',      50,  tY, { width: 230 });
  doc.text('Qtd',         290,  tY, { width: 50,  align: 'center' });
  doc.text('Unit.',       350,  tY, { width: 90,  align: 'right' });
  doc.text('Subtotal',    450,  tY, { width: 100, align: 'right' });

  doc
    .moveTo(50, tY + 16)
    .lineTo(550, tY + 16)
    .stroke();

  /* =====================================================
     ITENS — LINHAS
  ===================================================== */

  doc.font('Helvetica');

  let y = tY + 24;

  pedido.itens.forEach((item) => {
    const subtotalItem = Number(item.precoUnitario) * item.quantidade;

    doc.text(item.nomeProduto,                   50,  y, { width: 230 });
    doc.text(String(item.quantidade),           290,  y, { width: 50,  align: 'center' });
    doc.text(formatReal(item.precoUnitario),    350,  y, { width: 90,  align: 'right' });
    doc.text(formatReal(subtotalItem),          450,  y, { width: 100, align: 'right' });

    y += 22;

    if (y > 710) {
      doc.addPage();
      y = 50;
    }
  });

  /* =====================================================
     TOTAIS
  ===================================================== */

  doc
    .moveTo(350, y + 6)
    .lineTo(550, y + 6)
    .stroke();

  y += 16;

  doc.fontSize(10).font('Helvetica');
  doc.text('Subtotal:',  350, y, { width: 90,  align: 'right' });
  doc.text(formatReal(pedido.subtotal), 450, y, { width: 100, align: 'right' });

  y += 18;

  doc.text('Frete:',     350, y, { width: 90,  align: 'right' });
  doc.text(
    Number(pedido.frete) === 0 ? 'Grátis' : formatReal(pedido.frete),
    450, y, { width: 100, align: 'right' }
  );

  y += 18;

  doc.font('Helvetica-Bold');
  doc.text('Total:',     350, y, { width: 90,  align: 'right' });
  doc.text(formatReal(pedido.total), 450, y, { width: 100, align: 'right' });

  /* =====================================================
     RODAPÉ
  ===================================================== */

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('gray')
    .text(
      `Gerado em ${new Date().toLocaleString('pt-BR')} — JM Decorações`,
      50,
      760,
      { align: 'center' }
    );
};