const API_URL = "http://localhost:8080/api/listar";
const MINIO_URL = "http://localhost:8080/storageImages/";


export const buscarProdutos = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

    const dados = await response.json();

    return dados
      .map(produto => ({ 
        ...produto,
        img: `${MINIO_URL}${produto.imagemUpload}`,
      }))
      .sort(() => Math.random() - 0.5);

  } catch (error) {
    console.error("Erro ao listar produtos no frontend:\n", error.message);
    return [];
  }
};

export const listarCategorias = async () => {
  const response = await fetch(`${API_URL}/categorias`);
  if (!response.ok) throw new Error('Erro ao carregar categorias');
  return response.json();
};