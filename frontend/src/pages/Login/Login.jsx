import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../../public/logo.jpeg";

import { loginCliente } from '../../services/cliente.js';
import { cadastrarCliente } from '../../services/cadastraCliente.js';

export default function Login() {
  const [tela, setTela]               = useState("escolha");
  const [email, setEmail]             = useState("");
  const [senha, setSenha]             = useState("");
  const [verSenha, setVerSenha]       = useState(false);
  const [verSenhaCad, setVerSenhaCad] = useState(false);
  const [errosLogin, setErrosLogin]   = useState({});
  const [errosCad, setErrosCad]       = useState({});
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Campos do cadastro
  const [cad, setCad] = useState({
    nome: "", email: "", telefone: "", cep: "", senha: "",confirmarSenha:""
  });
  

  const navigate = useNavigate();

  // ── Validação do Login ──────────────────────────────────────────────────────
  const validarLogin = () => {
    const erros = {};
    if (!email)                         erros.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) erros.email = "E-mail inválido";
    if (!senha)                         erros.senha = "Senha é obrigatória";
    return erros;
  };

 const handleEntrar = async (e) => {
  e.preventDefault();
  const erros = validarLogin();
  if (Object.keys(erros).length > 0) {
    setErrosLogin(erros);
    return;
  }
  setErrosLogin({});

  try {
    const dados = await loginCliente(email, senha);
    navigate('/');
  } catch (error) {
    setErrosLogin({ senha: 'Email ou senha inválidos' });
  }
};


const validarCadastro = () => {
  const erros = {};
  
    if (!cad.nome)                            erros.nome     = "Nome é obrigatório";
    if (!cad.email)                           erros.email    = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(cad.email)) erros.email   = "E-mail inválido";
    if (!cad.telefone)                        erros.telefone = "Telefone é obrigatório";
    if (!cad.cep)                             erros.cep      = "CEP é obrigatório";
    if (cad.senha !== cad.confirmarSenha) erros.confirmarSenha = "As senhas não coincidem";
    else if (cad.cep.replace(/\D/g, "").length !== 8) erros.cep = "CEP inválido";
    if (!cad.senha)                           erros.senha    = "Senha é obrigatória";
    else if (cad.senha.length < 6)            erros.senha    = "Senha deve ter pelo menos 6 caracteres";

  if (!aceitouTermos) {
    erros.termos = "Você precisa aceitar os termos para continuar";
  }

  return erros;
};

  const handleCadastro = async (e) => {
    e.preventDefault();
    const erros = validarCadastro();
    if (Object.keys(erros).length > 0) {
      setErrosCad(erros);
      return;
    }
    try{
      setErrosCad({});
      const resultado = await cadastrarCliente(cad );
      navigate("/");
    }catch(error){
      setErrosCad({ email: 'Erro ao cadastrar. Tente novamente.' });
    }
  };


  const fc = (k) => (e) => setCad(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <>
      <Header />

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="w-100 px-3" style={{ maxWidth: 460 }}>
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5 text-center">

              {/* Logo */}
              <img
                src={logoJm}
                alt="Logo JM"
                className="rounded-circle mx-auto mb-3"
                style={{ width: 70, height: 70, objectFit: "cover" }}
              />

              {/* ── TELA DE ESCOLHA ── */}
              {tela === "escolha" && (
                <div>
                  <h3 className="fw-bold mb-1">Bem-vindo!</h3>
                  <p className="text-muted small mb-4">Seja bem-vindo à JM Decorações</p>
                  <div className="d-grid gap-3">
                    <button className="btn btn-success btn-lg fw-bold py-3" onClick={() => setTela("login")}>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Fazer Login
                    </button>
                    <button className="btn btn-outline-success btn-lg fw-bold py-3" onClick={() => setTela("cadastro")}>
                      <i className="bi bi-person-plus me-2"></i>Novo Cadastro
                    </button>
                  </div>
                  <div className="mt-4">
                    <Link to="/" className="text-muted small text-decoration-none">
                      <i className="bi bi-arrow-left me-1"></i>Voltar para a Loja
                    </Link>
                  </div>
                  <div className="mt-4 text-center">
  <Link 
    to="/authAdmin" 
    className="text-danger fw-bold text-decoration-none fs-5"
  >
    Área do Administrador
  </Link>
</div>
                </div>
              )}

              {/* ── TELA DE LOGIN ── */}
              {tela === "login" && (
                <div>
                  <h3 className="fw-bold mb-4">Login</h3>
                  <form onSubmit={handleEntrar} noValidate>

                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold">E-mail</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                        <input
                          type="email"
                          className={`form-control ${errosLogin.email ? "is-invalid" : ""}`}
                          placeholder="seu@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                        {errosLogin.email && (
                          <div className="invalid-feedback">{errosLogin.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 text-start">
  <label className="form-label small fw-semibold">Senha</label>
  <div className="input-group">
    <span className="input-group-text"><i className="bi bi-lock"></i></span>
    
    <div className="position-relative flex-grow-1">
      <input
        type={verSenha ? "text" : "password"}
        className={`form-control ${errosLogin.senha ? "is-invalid" : ""}`}
        placeholder="••••••"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        style={{ paddingRight: '40px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      />
      
      <span 
        className="position-absolute top-50 end-0 translate-middle-y me-3" 
        style={{ cursor: 'pointer', zIndex: 10 }}
        onClick={() => setVerSenha(p => !p)}
      >
        <i className={`bi ${verSenha ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
      </span>
    </div>

    {errosLogin.senha && (
      <div className="invalid-feedback d-block">{errosLogin.senha}</div>
    )}
  </div>

  <div className="text-end mt-1">
    <Link to="/recuperar-senha" style={{ fontSize: '0.85rem', color: '#198754', textDecoration: 'none' }}>
      Esqueceu a senha?
    </Link>
  </div>
</div>

                    <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Entrar
                    </button>
                  </form>

                  <button className="btn btn-link text-muted text-decoration-none w-100" onClick={() => { setTela("escolha"); setErrosLogin({}); }}>
                    <i className="bi bi-arrow-left me-1"></i>Voltar
                  </button>
                </div>
              )}

              {/* ── TELA DE CADASTRO ── */}
              {tela === "cadastro" && (
                <div>
                  <h3 className="fw-bold mb-4">Novo Cadastro</h3>
                  <form onSubmit={handleCadastro} noValidate>
                    

                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold">Nome</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                        <input
                          type="text"
                          className={`form-control ${errosCad.nome ? "is-invalid" : ""}`}
                          placeholder="Seu nome completo"
                          value={cad.nome}
                          onChange={fc("nome")}
                        />
                        {errosCad.nome && <div className="invalid-feedback">{errosCad.nome}</div>}
                      </div>
                    </div>

                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold">E-mail</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                        <input
                          type="email"
                          className={`form-control ${errosCad.email ? "is-invalid" : ""}`}
                          placeholder="seu@email.com"
                          value={cad.email}
                          onChange={fc("email")}
                        />
                        {errosCad.email && <div className="invalid-feedback">{errosCad.email}</div>}
                      </div>
                    </div>

                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold">Telefone</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                        <input
                          type="tel"
                          className={`form-control ${errosCad.telefone ? "is-invalid" : ""}`}
                          placeholder="(11) 99999-9999"
                          value={cad.telefone}
                          onChange={fc("telefone")}
                        />
                        {errosCad.telefone && <div className="invalid-feedback">{errosCad.telefone}</div>}
                      </div>
                    </div>

                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold">CEP</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                        <input
                          type="text"
                          className={`form-control ${errosCad.cep ? "is-invalid" : ""}`}
                          placeholder="00000-000"
                          maxLength={9}
                          value={cad.cep}
                          onChange={fc("cep")}
                        />
                        {errosCad.cep && <div className="invalid-feedback">{errosCad.cep}</div>}
                      </div>
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label small fw-semibold">Senha</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                        <input
                          type={verSenhaCad ? "text" : "password"}
                          className={`form-control ${errosCad.senha ? "is-invalid" : ""}`}
                          placeholder="••••••"
                          value={cad.senha}
                          onChange={fc("senha")}
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setVerSenhaCad(p => !p)}>
                          <i className={`bi ${verSenhaCad ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                        {errosCad.senha && <div className="invalid-feedback">{errosCad.senha}</div>}
                      </div>
                    </div>
                    <div className="mb-4 text-start">
        <div className="form-check">
          <input 
            className={`form-check-input ${errosCad.termos ? "is-invalid" : ""}`} 
            type="checkbox" 
            id="checkTermos"
            checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)}
          />
          <label className="form-check-label small text-muted" htmlFor="checkTermos">
            Eu li e aceito os <Link to="/termos" className="text-success fw-bold text-decoration-none">Termos de Uso</Link> e a <Link to="/privacidade" className="text-success fw-bold text-decoration-none">Política de Privacidade</Link>.
          </label>
          {errosCad.termos && (
            <div className="invalid-feedback d-block">{errosCad.termos}</div>
          )}
        </div>
      </div>

                    <div className="mb-4 text-start">
                        <label className="form-label small fw-semibold">Confirmar Senha</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                          <input
                            type={verSenhaCad ? "text" : "password"}
                            className={`form-control ${errosCad.confirmarSenha ? "is-invalid" : ""}`}
                            placeholder="••••••"
                            value={cad.confirmarSenha}
                            onChange={fc("confirmarSenha")}
                          />
                          {errosCad.confirmarSenha && <div className="invalid-feedback">{errosCad.confirmarSenha}</div>}
                        </div>
                      </div>
                    <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3">
                      <i className="bi bi-person-check me-2"></i>Cadastrar
                    </button>
                  </form>

                  <button className="btn btn-link text-muted text-decoration-none w-100" onClick={() => { setTela("escolha"); setErrosCad({}); }}>
                    <i className="bi bi-arrow-left me-1"></i>Voltar
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}