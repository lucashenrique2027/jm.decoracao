const API_URL = "http://localhost:8080/api/admin";

export const listarProdutosAdmin = async () => {
  const response = await fetch(`${API_URL}/produtos`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};

export const buscarProduto = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.id)         params.append('id', filtros.id);
  if (filtros.nome)       params.append('nome', filtros.nome);
  if (filtros.descricao)  params.append('descricao', filtros.descricao);
  if (filtros.categoria)  params.append('categoria', filtros.categoria);
  if (filtros.preco)      params.append('preco', filtros.preco);
  if (filtros.disponivel !== undefined) params.append('disponivel', filtros.disponivel);

  const response = await fetch(`${API_URL}/produtos/buscar?${params.toString()}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};

export const cadastrarProduto = async (dadosProduto, imagemFile) => {
  const formData = new FormData();

  formData.append('nome', dadosProduto.nome);
  formData.append('descricao', dadosProduto.descricao || '');
  formData.append('categoria', dadosProduto.categoria);
  formData.append('preco', dadosProduto.preco);
  formData.append('estoque', dadosProduto.estoque || 0);
  formData.append('disponivel', dadosProduto.disponivel ?? true);
  formData.append('imagem', imagemFile);

  const response = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};

export const atualizarProduto = async (id, campos) => {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(campos)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};


export const atualizarImagemProduto = async (id, imagemFile) => {
  const formData = new FormData();
  formData.append('imagem', imagemFile);

  const response = await fetch(`${API_URL}/produtos/${id}/imagem`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};

export const deletarProduto = async (id) => {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};