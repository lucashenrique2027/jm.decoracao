import { useState, useEffect } from 'react';
import { buscarDados } from '../../services/authCliente.js';
import { User, MapPin, Phone, Mail, Save, Loader2 } from 'lucide-react';
import Header from '../../components/Header/Header';
import "./perfil.css";

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState({
    id: '',
    nome: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  // 1. Carregamento inicial via HttpOnly Cookie
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const info = await buscarDados();
        setDados(info);
      } catch (error) {
        console.error("Falha ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarPerfil();
  }, []);

  // 2. Atualização dinâmica dos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
  };

  // 3. Persistência dos dados (PUT /:id)
  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch(`http://localhost:8080/api/clientes/${dados.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dados)
      });

      if (!response.ok) throw new Error("Erro ao atualizar");
      
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-loading">
        <Loader2 className="animate-spin" size={40} />
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <Header />
      
      <main className="container py-5">
        <div className="perfil-card shadow">
          <div className="perfil-header">
            <div className="avatar-placeholder">
              {dados.nome?.charAt(0).toUpperCase()}
            </div>
            <h2>Minha Conta</h2>
            <p className="text-muted">Gerencie suas informações pessoais e de entrega</p>
          </div>

          <form onSubmit={handleSalvar} className="perfil-form">
            <section className="form-section">
              <h3><User size={20} /> Dados Pessoais</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Nome Completo</label>
                  <input name="nome" value={dados.nome} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>E-mail (Login)</label>
                  <input type="email" value={dados.email} disabled className="bg-light" />
                </div>
                <div className="col-md-6">
                  <label>Telefone</label>
                  <input name="telefone" value={dados.telefone} onChange={handleChange} required />
                </div>
              </div>
            </section>

            <section className="form-section mt-4">
              <h3><MapPin size={20} /> Endereço de Entrega</h3>
              <div className="row g-3">
                <div className="col-md-3">
                  <label>CEP</label>
                  <input name="cep" value={dados.cep} onChange={handleChange} />
                </div>
                <div className="col-md-9">
                  <label>Endereço</label>
                  <input name="endereco" value={dados.endereco} onChange={handleChange} />
                </div>
                <div className="col-md-5">
                  <label>Bairro</label>
                  <input name="bairro" value={dados.bairro} onChange={handleChange} />
                </div>
                <div className="col-md-5">
                  <label>Cidade</label>
                  <input name="cidade" value={dados.cidade} onChange={handleChange} />
                </div>
                <div className="col-md-2">
                  <label>UF</label>
                  <input name="estado" value={dados.estado} onChange={handleChange} maxLength={2} />
                </div>
              </div>
            </section>

            <div className="form-actions mt-5">
              <button type="submit" className="btn-salvar" disabled={salvando}>
                {salvando ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}