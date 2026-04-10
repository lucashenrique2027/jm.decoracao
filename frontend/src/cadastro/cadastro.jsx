import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import logoJm from "../assets/logo.jpeg";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleCadastrar = (e) => {
    e.preventDefault();
    
    // Simulação de cadastro de cliente
    console.log("Novo cliente:", { nome, email, senha });
    alert("Conta criada com sucesso! Agora faça seu login.");
    
    // Após cadastrar, ele volta para a tela de login na MESMA ABA
    navigate("/login"); 
  };

  return (
    <>
      <Header />
      <div className="container d-flex align-items-center justify-content-center my-5">
        <div className="card shadow-lg p-4 border-0 text-center" style={{ maxWidth: "450px", width: "100%" }}>
          <img src={logoJm} alt="Logo" className="rounded-circle mx-auto mb-3 shadow-sm" style={{ width: "80px" }} />
          
          <h3 className="fw-bold mb-2">Criar Conta</h3>
          <p className="text-muted small mb-4">Cadastre-se para realizar suas compras na Arte em Vidro</p>
          
          <form onSubmit={handleCadastrar}>
            <div className="mb-3 text-start">
              <label className="form-label fw-bold small">Nome Completo</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Seu nome" 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold small">E-mail</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="exemplo@email.com" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold small">Senha</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Mínimo 6 caracteres" 
                onChange={(e) => setSenha(e.target.value)} 
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-success w-100 py-2 shadow-sm fw-bold">
              Finalizar Cadastro
            </button>
          </form>

          <div className="mt-4 border-top pt-3">
             <p className="small text-muted mb-1">Já tem uma conta?</p>
             <Link to="/login" className="text-primary fw-bold text-decoration-none">
               Voltar para o Login
             </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}