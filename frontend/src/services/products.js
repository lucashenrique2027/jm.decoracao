const API_URL = "http://localhost:8080/api/produtos/listar";
const ASSETS_PATH = "/assets/";

export const buscarProdutos = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }

    const dados = await response.json();

    return dados.map(produto => ({
      ...produto,
      img: `${ASSETS_PATH}${produto.imagemUpload}`,
    }));

  } catch (error) {
    console.error("Erro ao listar produtos no frontend:\n", error.message);
    return [];
  }
};