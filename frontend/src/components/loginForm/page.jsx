import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMensagem } from "../../context/MensagemContext.jsx";
import { loginCliente } from "../../services/cliente.js";

export default function LoginForm({ setTela }) {
  const { mostrarMensagem } = useMensagem();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [errosLogin, setErrosLogin] = useState({});

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

  return (
    <form onSubmit={handleEntrar}>
      <div className="login-form-group">
        <label className="login-label">E-mail</label>
        <div className={`login-input-wrapper ${errosLogin.geral ? 'erro' : ''}`}>
          <span className="login-input-icon"><i className="bi bi-envelope"></i></span>
          <input type="email" className="login-input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>

      <div className="login-form-group">
        <label className="login-label">Senha</label>
        <div className={`login-input-wrapper ${errosLogin.geral ? 'erro' : ''}`}>
          <span className="login-input-icon"><i className="bi bi-lock"></i></span>
          <input type={verSenha ? "text" : "password"} className="login-input" placeholder="••••••" value={senha} onChange={e => setSenha(e.target.value)} required />
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
  );
}