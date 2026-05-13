import PDFDocument from 'pdfkit';
import { faturamentoTemplate } from './templates/faturamentoTemplate.js';

/* =========================================================
   HELPER — pipe direto na res (sem buffer)
========================================================= */

const iniciarPdf = (res, filename) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${filename}`);

  doc.pipe(res);

  return doc;
};

/* =========================================================
   FATURAMENTO
========================================================= */

export const gerarPdfFaturamento = (res, dados, periodo) => {
  const doc = iniciarPdf(res, 'faturamento.pdf');
  faturamentoTemplate(doc, dados, periodo);
  doc.end();
};

/* =========================================================
   PRODUTOS
========================================================= */

export const gerarPdfProdutos = (res, dados, periodo) => {
  const doc = iniciarPdf(res, 'produtos.pdf');

  doc.fontSize(20).text('Relatório de Produtos', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Período: ${periodo.inicio} até ${periodo.fim}`);
  doc.moveDown();

  dados.forEach((produto) => {
    doc.text(`Produto: ${produto.nome}`);
    doc.text(`Quantidade vendida: ${produto.quantidadeVendida}`);
    doc.text(`Faturamento: R$ ${Number(produto.faturamento).toFixed(2)}`);
    doc.moveDown();
  });

  doc.end();
};

/* =========================================================
   CATEGORIAS
========================================================= */

export const gerarPdfCategorias = (res, dados, periodo) => {
  const doc = iniciarPdf(res, 'categorias.pdf');

  doc.fontSize(20).text('Relatório por Categoria', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Período: ${periodo.inicio} até ${periodo.fim}`);
  doc.moveDown();

  dados.forEach((cat) => {
    doc.text(`Categoria: ${cat.categoria}`);
    doc.text(`Quantidade vendida: ${cat.quantidadeVendida}`);
    doc.text(`Faturamento: R$ ${Number(cat.faturamento).toFixed(2)}`);
    doc.moveDown();
  });

  doc.end();
};