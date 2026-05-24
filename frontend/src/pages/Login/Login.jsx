import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../../public/logo.jpeg";
import { useMensagem } from '../../context/MensagemContext.jsx';
import { loginCliente } from '../../services/cliente.js';
import { cadastrarCliente } from '../../services/cadastraCliente.js';
import "./style.css";

export default function Login() {
  const { mostrarMensagem } = useMensagem();
  const clienteLogado = JSON.parse(localStorage.getItem('clienteJM') || 'null');
  const navigate = useNavigate();

  useEffect(() => {
    if (clienteLogado) {
      navigate("/");
    }
  }, [clienteLogado, navigate]);

  const [tela, setTela]               = useState("escolha");
  const [email, setEmail]             = useState("");
  const [senha, setSenha]             = useState("");
  const [verSenha, setVerSenha]       = useState(false);
  const [errosLogin, setErrosLogin]   = useState({});
  const [errosCad, setErrosCad]       = useState({});
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [cad, setCad] = useState({
    nome: "", email: "", telefone: "", cep: "",
    endereco: "", bairro: "", cidade: "", estado: "",
    senha: "", confirmarSenha: ""
  });

  // ── API de CEP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const cepLimpo = cad.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .then(r => r.json())
      .then(data => {
        if (!data.erro) {
          setCad(prev => ({
            ...prev,
            endereco: data.logradouro || "",
            bairro:   data.bairro     || "",
            cidade:   data.localidade || "",
            estado:   data.uf         || "",
          }));
          setErrosCad(prev => ({ ...prev, cep: undefined }));
        } else {
          setErrosCad(prev => ({ ...prev, cep: "CEP não encontrado" }));
        }
      })
      .catch(() => {});
  }, [cad.cep]);

  const handleEntrar = async (e) => {
    e.preventDefault();
    setErrosLogin({});
    try {
      await loginCliente(email, senha);
      navigate('/');
    } catch (error) {
  mostrarMensagem(error.message || 'Email ou senha inválidos.', 'erro');
}
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (cad.senha !== cad.confirmarSenha) {
      setErrosCad({ confirmarSenha: "As senhas não coincidem" });
      return;
    }
    if (!aceitouTermos) {
      setErrosCad({ termos: "Você precisa aceitar os termos" });
      return;
    }
    try {
      setErrosCad({});
      await cadastrarCliente(cad);
      navigate("/perfil");
    } catch (error) {
  if (error.code === '23505' || (error.message && error.message.includes('email'))) {
    setErrosCad({ email: 'Este email já está cadastrado.' });
  } else {
    mostrarMensagem(error.message || 'Erro ao cadastrar. Tente novamente.', 'erro');
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
              <h3 className="login-titulo">
                {tela === "escolha" && "Bem-vindo!"}
                {tela === "login" && "Acesse sua conta"}
                {tela === "cadastro" && "Crie sua conta"}
              </h3>
              <p className="login-subtitulo">
                {tela === "escolha" && "Seja bem-vindo à JM Decorações"}
                {tela === "login" && "Informe seus dados para entrar"}
                {tela === "cadastro" && "Preencha os campos abaixo"}
              </p>
            </div>

            {/* ── TELA DE ESCOLHA ── */}
            {tela === "escolha" && (
              <div className="login-footer-links" style={{ gap: '16px' }}>
                <button className="login-btn-primary" onClick={() => setTela("login")}>
                  <i className="bi bi-box-arrow-in-right"></i> Fazer Login
                </button>
                <button className="login-btn-outline" onClick={() => setTela("cadastro")}>
                  <i className="bi bi-person-plus"></i> Novo Cadastro
                </button>
                <Link to="/" className="login-btn-link mt-2">
                  <i className="bi bi-arrow-left"></i> Voltar para a Loja
                </Link>
                <div className="login-admin-link text-center">
                  <Link to="/authAdmin">Área do Administrador</Link>
                </div>
              </div>
            )}

            {/* ── TELA DE LOGIN ── */}
            {tela === "login" && (
              <form onSubmit={handleEntrar}>
                <div className="login-form-group">
                  <label className="login-label">E-mail</label>
                  <div className={`login-input-wrapper ${errosLogin.geral ? 'erro' : ''}`}>
                    <span className="login-input-icon"><i className="bi bi-envelope"></i></span>
                    <input 
                      type="email" 
                      className="login-input" 
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label className="login-label">Senha</label>
                  <div className={`login-input-wrapper ${errosLogin.geral ? 'erro' : ''}`}>
                    <span className="login-input-icon"><i className="bi bi-lock"></i></span>
                    <input 
                      type={verSenha ? "text" : "password"} 
                      className="login-input" 
                      placeholder="••••••"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      required
                    />
                    <button type="button" className="login-btn-eye" onClick={() => setVerSenha(!verSenha)}>
                      <i className={`bi ${verSenha ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                  {errosLogin.geral && <span className="login-error-msg">{errosLogin.geral}</span>}
                  <div className="text-end mt-2">
                    <Link to="/recuperar-senha" style={{ fontSize: '13px', color: '#25D366', textDecoration: 'none', fontWeight: '600' }}>
                      Esqueceu a senha?
                    </Link>
                  </div>
                </div>

                <button type="submit" className="login-btn-primary mb-3">
                  Entrar <i className="bi bi-arrow-right"></i>
                </button>
                
                <div className="text-center">
                  <button type="button" className="login-btn-link" onClick={() => setTela("escolha")}>
                    <i className="bi bi-arrow-left"></i> Voltar
                  </button>
                </div>
              </form>
            )}

            {/* ── TELA DE CADASTRO ── */}
            {tela === "cadastro" && (
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
                      <input type="text" className="login-input" placeholder="00000-000" value={cad.cep} onChange={fc("cep")} required />
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
                    <label className="login-label">Senha</label>
                    <div className="login-input-wrapper">
                      <span className="login-input-icon"><i className="bi bi-lock"></i></span>
                      <input type="password" className="login-input" placeholder="••••••" value={cad.senha} onChange={fc("senha")} required />
                    </div>
                  </div>

                  <div className="login-form-group">
                    <label className="login-label">Confirmar Senha</label>
                    <div className="login-input-wrapper">
                      <span className="login-input-icon"><i className="bi bi-shield-check"></i></span>
                      <input type="password" className="login-input" placeholder="••••••" value={cad.confirmarSenha} onChange={fc("confirmarSenha")} required />
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
                  <button type="button" className="login-btn-link" onClick={() => setTela("escolha")}>
                    <i className="bi bi-arrow-left"></i> Voltar
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
