import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMensagem } from "../../context/MensagemContext.jsx";
import { cadastrarCliente } from "../../services/cliente.js";
import { useCep } from "../../hooks/useCep.js";

import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import logoJm from "../../../public/logo.jpeg";

export default function RegisterForm() {
  const { mostrarMensagem } = useMensagem();
  const { buscarCep } = useCep();
  const navigate = useNavigate();

  const [errosCad, setErrosCad] = useState({});
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [verSenhaCad, setVerSenhaCad] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [cad, setCad] = useState({
    nome: "", email: "", telefone: "", cep: "", numero: "", 
    endereco: "", bairro: "", cidade: "", estado: "",
    senha: "", confirmarSenha: ""
  });

  const handleCepChange = async (e) => {
    const valor = e.target.value;
    setCad(prev => ({ ...prev, cep: valor }));
    const dados = await buscarCep(valor);
    if (dados) {
      setCad(prev => ({ ...prev, endereco: dados.logradouro || "", bairro: dados.bairro || "", cidade: dados.localidade || "", estado: dados.uf || "" }));
      setErrosCad(prev => ({ ...prev, cep: undefined }));
    } else if (valor.replace(/\D/g, "").length === 8) {
      setErrosCad(prev => ({ ...prev, cep: "CEP não encontrado" }));
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (cad.senha !== cad.confirmarSenha) return setErrosCad({ confirmarSenha: "As senhas não coincidem" });
    if (!aceitouTermos) return setErrosCad({ termos: "Você precisa aceitar os termos" });
    try {
      setErrosCad({});
      await cadastrarCliente(cad);
      navigate("/verificar-email");
    } catch (error) {
      if (error.code === '23505' || (error.message && error.message.includes('email'))) {
        setErrosCad({ email: 'Este email já está cadastrado.' });
      } else {
        mostrarMensagem(error.message || 'Erro ao cadastrar.', 'erro');
      }
    }
  };

  const fc = (k) => (e) => setCad(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <>
    <Header />
    <div className="login-bg">
      <div className="login-card-wrapper">
        <div className="login-card">

                <div className="login-header">
              <img src={logoJm} alt="Logo JM" className="login-logo" />
              <h3 className="login-titulo">Acesse sua conta</h3>
              <p className="login-subtitulo">Informe seus dados para entrar</p>
            </div>

    <form onSubmit={handleCadastro}>
      <div className="login-grid">
        <div className="login-form-group login-full-width">
          <label className="login-label">Nome Completo</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-person"></i></span>
            <input type="text" className="login-input" placeholder="Seu nome" value={cad.nome} onChange={fc("nome")} required />
          </div>
        </div>

        <div className="login-form-group">
          <label className="login-label">E-mail</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-envelope"></i></span>
            <input type="email" className="login-input" placeholder="seu@email.com" value={cad.email} onChange={fc("email")} required />
          </div>
        </div>

        <div className="login-form-group">
          <label className="login-label">Telefone</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-telephone"></i></span>
            <input type="tel" className="login-input" placeholder="(00) 00000-0000" value={cad.telefone} onChange={fc("telefone")} required />
          </div>
        </div>

        <div className="login-form-group">
          <label className="login-label">CEP</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-geo-alt"></i></span>
            <input type="text" className="login-input" placeholder="00000-000" value={cad.cep} onChange={handleCepChange} required />
          </div>
          {errosCad.cep && <span className="login-error-msg">{errosCad.cep}</span>}
        </div>

        <div className="login-form-group">
          <label className="login-label">Cidade/UF</label>
          <div className="login-input-wrapper" style={{ background: '#f3f4f6' }}>
            <span className="login-input-icon"><i className="bi bi-building"></i></span>
            <input type="text" className="login-input" value={`${cad.cidade}${cad.estado ? ' - ' + cad.estado : ''}`} readOnly />
          </div>
        </div>

        <div className="login-form-group login-full-width">
          <label className="login-label">Endereço</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-house"></i></span>
            <input type="text" className="login-input" placeholder="Rua, número, bairro" value={`${cad.endereco}${cad.bairro ? ', ' + cad.bairro : ''}`} readOnly />
          </div>
        </div>

        <div className="login-form-group">
          <label className="login-label">Número</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-house-door"></i></span>
            <input type="text" className="login-input" placeholder="123" value={cad.numero} onChange={fc("numero")} />
          </div>
        </div>

        <div className="login-form-group">
          <label className="login-label">Senha</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-lock"></i></span>
            <input type={verSenhaCad ? "text" : "password"} className="login-input" placeholder="••••••" value={cad.senha} onChange={fc("senha")} required />
            <button type="button" className="login-btn-eye" onClick={() => setVerSenhaCad(!verSenhaCad)}>
              <i className={`bi ${verSenhaCad ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
        </div>

        <div className="login-form-group">
          <label className="login-label">Confirmar Senha</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><i className="bi bi-shield-check"></i></span>
            <input type={verConfirmar ? "text" : "password"} className="login-input" placeholder="••••••" value={cad.confirmarSenha} onChange={fc("confirmarSenha")} required />
            <button type="button" className="login-btn-eye" onClick={() => setVerConfirmar(!verConfirmar)}>
              <i className={`bi ${verConfirmar ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
          {errosCad.confirmarSenha && <span className="login-error-msg">{errosCad.confirmarSenha}</span>}
        </div>
      </div>

      <div className="mb-3">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="termos" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} />
          <label className="form-check-label small text-muted" htmlFor="termos">
            Aceito os <Link to="/termos" className="text-success">Termos e Condições</Link>
          </label>
        </div>
        {errosCad.termos && <span className="login-error-msg">{errosCad.termos}</span>}
      </div>

      <button type="submit" className="login-btn-primary mb-3">
        Criar Conta <i className="bi bi-person-check"></i>
      </button>

      <div className="text-center">
        <button type="button" className="login-btn-link" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Voltar
        </button>
      </div>
    </form>

        </div>
      </div>
    </div>
</>
  );
}    