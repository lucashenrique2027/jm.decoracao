const API_URL = "http://localhost:8080/api/admin";

export const listarCategorias = async () => {
  const response = await fetch(`${API_URL}/categorias`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao carregar categorias');
  return response.json();
};

export const criarCategoria = async (nome) => {
  const response = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nome })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || 'Erro ao criar categoria');
  }
  return response.json();
};

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
  if (filtros.categoriaId)  params.append('categoriaId', filtros.categoriaId);
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
  formData.append('categoriaId', Number(dadosProduto.categoriaId));
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

export const atualizarProduto = async (id, campos, imagemFile = null) => {
  const formData = new FormData();
  
  Object.keys(campos).forEach(key => {
    if (campos[key] !== undefined) formData.append(key, campos[key]);
  });
  if (imagemFile) formData.append('imagem', imagemFile);

  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData 
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