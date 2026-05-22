function calcularPrecoFrete(faixaKm) {
  if (faixaKm === 'local')   return 10.00;
  if (faixaKm === 'regiao')  return 20.00;
  if (faixaKm === 'estado')  return 35.00;
  return 50.00;
}

export function calcularFrete(cepLoja, cepCliente) {
  if (!cepLoja || !cepCliente) {
    throw new Error("CEPs inválidos");
  }

  const prefixoLoja    = cepLoja.replace(/\D/g, "").substring(0, 5);
  const prefixoCliente = cepCliente.replace(/\D/g, "").substring(0, 5);

  console.log(`[calcularFrete] Prefixo loja: ${prefixoLoja} | Prefixo cliente: ${prefixoCliente}`);

  let faixa;

  if (prefixoCliente === prefixoLoja) {
    faixa = 'local';
  } else if (prefixoCliente.startsWith("129")) {
    faixa = 'regiao';
  } else if (
    prefixoCliente.startsWith("0") ||
    prefixoCliente.startsWith("1")
  ) {
    faixa = 'estado';
  } else {
    faixa = 'fora';
  }

  const frete = calcularPrecoFrete(faixa);

  console.log(`[calcularFrete] Faixa: ${faixa} | Frete: R$${frete}`);

  return { faixa, frete };
}