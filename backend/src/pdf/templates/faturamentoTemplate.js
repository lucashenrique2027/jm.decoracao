export const faturamentoTemplate = (
  doc,
  dados,
  periodo
) => {

  const total = dados.reduce(
    (acc, pedido) => acc + Number(pedido.total),
    0
  );

  const ticketMedio =
    dados.length > 0
      ? total / dados.length
      : 0;

  /* =====================================================
     CABEÇALHO
  ===================================================== */

  doc
    .fontSize(22)
    .text('JM Decorações', {
      align: 'center',
    });

  doc
    .fontSize(16)
    .text('Relatório de Faturamento', {
      align: 'center',
    });

  doc.moveDown(2);

  /* =====================================================
     PERÍODO
  ===================================================== */

  doc
    .fontSize(11)
    .text(
      `Período: ${periodo.inicio} até ${periodo.fim}`
    );

  doc.moveDown();

  /* =====================================================
     RESUMO
  ===================================================== */

  doc
    .fontSize(12)
    .text(`Total de pedidos: ${dados.length}`);

  doc.text(
    `Faturamento total: R$ ${total.toFixed(2)}`
  );

  doc.text(
    `Ticket médio: R$ ${ticketMedio.toFixed(2)}`
  );

  doc.moveDown(2);

  /* =====================================================
     CABEÇALHO DA TABELA
  ===================================================== */

  const inicioTabelaY = doc.y;

  doc
    .fontSize(11)
    .font('Helvetica-Bold');

  doc.text('Pedido', 50, inicioTabelaY);
  doc.text('Cliente', 130, inicioTabelaY);
  doc.text('Status', 360, inicioTabelaY);
  doc.text('Total', 470, inicioTabelaY);

  doc.moveTo(50, inicioTabelaY + 15)
     .lineTo(550, inicioTabelaY + 15)
     .stroke();

  doc.font('Helvetica');

  /* =====================================================
     LINHAS
  ===================================================== */

  let y = inicioTabelaY + 25;

  dados.forEach((pedido) => {

    doc.text(
      `#${pedido.pedidoId}`,
      50,
      y
    );

    doc.text(
      pedido.cliente,
      130,
      y,
      {
        width: 200,
      }
    );

    doc.text(
      pedido.status.toUpperCase(),
      360,
      y
    );

    doc.text(
      `R$ ${Number(pedido.total).toFixed(2)}`,
      470,
      y
    );

    y += 25;

    /* quebra simples */
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
  });

  /* =====================================================
     RODAPÉ
  ===================================================== */

  doc.moveDown(3);

  doc
    .fontSize(9)
    .fillColor('gray')
    .text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      50,
      760,
      {
        align: 'center',
      }
    );
};