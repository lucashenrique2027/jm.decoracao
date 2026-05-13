export const faturamentoTemplate = (
  doc,
  dados,
  periodo
) => {

  /* =====================================================
     TÍTULO
  ===================================================== */

  doc
    .fontSize(20)
    .text(
      'Relatório de Faturamento',
      {
        align: 'center',
      }
    );

  doc.moveDown();

  /* =====================================================
     PERÍODO
  ===================================================== */

  doc
    .fontSize(12)
    .text(
      `Período: ${periodo.inicio} até ${periodo.fim}`
    );

  doc.moveDown();

  /* =====================================================
     LISTAGEM
  ===================================================== */

  dados.forEach((pedido) => {

    doc.text(
      `Pedido #${pedido.pedidoId}`
    );

    doc.text(
      `Cliente: ${pedido.cliente}`
    );

    doc.text(
      `Total: R$ ${pedido.total}`
    );

    doc.moveDown();
  });
};