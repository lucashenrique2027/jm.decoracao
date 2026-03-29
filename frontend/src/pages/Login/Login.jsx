import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./style.css"; 

export default function Login() {
  const [modal, setModal] = useState("escolha");
  const [verSenha, setVerSenha] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  };

  return (
    <>
      <Header />

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="w-100 px-3" style={{ maxWidth: "550px" }}>
          
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5 text-center">
              
              {/* --- TELA DE ESCOLHA INICIAL --- */}
              {modal === "escolha" && (
                <div>
                  <h3 className="mb-2 fw-bold">Acesse sua Conta</h3>
                  <p className="text-muted mb-4 small">Seja bem-vindo à JM Decorações! É um prazer ter você aqui.</p>
                  
                  <div className="d-grid gap-3">
                    <button className="btn btn-primary btn-lg fw-bold py-3" onClick={() => setModal("login")}>
                      Fazer Login
                    </button>
                    <button className="btn btn-outline-primary btn-lg fw-bold py-3" onClick={() => setModal("cadastro")}>
                      Novo Cadastro
                    </button>
                  </div>
                </div>
              )}

              {/* --- TELA DE LOGIN --- */}
              {modal === "login" && (
                <div>
                  <h3 className="mb-4 fw-bold">Login</h3>
                  <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                      <label className="form-label fw-semibold text-secondary small">E-mail</label>
                      <input type="email" className="form-control form-control-lg" placeholder="seu@email.com" required />
                      <div className="invalid-feedback">Por favor, insira um e-mail válido.</div>
                    </div>
                    
                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold text-secondary small">Senha</label>
                      <div className="input-group">
                        <input 
                          type={verSenha ? "text" : "password"} 
                          className="form-control form-control-lg input-senha" 
                          placeholder="Sua senha" 
                          required 
                        />
                        <button className="btn btn-olho" type="button" onClick={() => setVerSenha(!verSenha)}>
                          <i className={verSenha ? "bi bi-eye-slash fs-5" : "bi bi-eye fs-5"}></i>
                        </button>
                      </div>
                      <div className="form-text text-muted small mt-1">Insira sua senha de acesso cadastrada.</div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-100 mb-3 fw-bold py-3">ENTRAR</button>
                  </form>
                  <button className="btn btn-link text-decoration-none w-100 text-muted small" onClick={() => setModal("escolha")}>← Voltar</button>
                </div>
              )}

              {/* --- TELA DE CADASTRO --- */}
              {modal === "cadastro" && (
                <div>
                  <h3 className="mb-4 fw-bold">Criar Cadastro</h3>
                  <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                      <label className="form-label fw-semibold text-secondary small">Nome Completo</label>
                      <input type="text" className="form-control" placeholder="Seu nome completo" required />
                    </div>

                    <div className="mb-3 text-start">
                      <label className="form-label fw-semibold text-secondary small">E-mail</label>
                      <input type="email" className="form-control" placeholder="exemplo@email.com" required />
                    </div>

                    <div className="row g-2 mb-3 text-start">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Criar Senha</label>
                        <div className="input-group">
                          <input 
                            type={verSenha ? "text" : "password"} 
                            className="form-control input-senha" 
                            placeholder="Mín. 6 caracteres"
                            required 
                            minLength="6" 
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Confirmar</label>
                        <div className="input-group">
                          <input 
                            type={verSenha ? "text" : "password"} 
                            className="form-control input-senha" 
                            placeholder="Repita a senha"
                            required 
                          />
                          <button className="btn btn-olho" type="button" onClick={() => setVerSenha(!verSenha)}>
                            <i className={verSenha ? "bi bi-eye-slash fs-5" : "bi bi-eye fs-5"}></i>
                          </button>
                        </div>
                      </div>
                      {/* TEXTO DE ORIENTAÇÃO NO CADASTRO */}
                      <div className="form-text text-muted small mt-1">Dica: Use pelo menos 6 caracteres para sua segurança.</div>
                    </div>

                    <div className="row g-2 mb-3 text-start">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">CPF</label>
                        <input type="text" className="form-control" placeholder="000.000.000-00" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">CEP</label>
                        <input type="text" className="form-control" placeholder="00000-000" required />
                      </div>
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold text-secondary small">Endereço Completo</label>
                      <input type="text" className="form-control" placeholder="Rua, número, bairro" required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-100 mb-3 fw-bold py-3">FINALIZAR CADASTRO</button>
                  </form>
                  <button className="btn btn-link text-decoration-none w-100 text-muted small" onClick={() => setModal("escolha")}>← Voltar</button>
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
