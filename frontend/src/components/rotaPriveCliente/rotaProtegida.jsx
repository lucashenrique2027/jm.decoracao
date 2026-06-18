import { useEffect, useState } from "react";
import { validarSessao } from "../../services/cliente.js";
import { Navigate, Outlet } from "react-router-dom";

export default function RotaProtegida() {
  const [status, setStatus] = useState("verificando");

  useEffect(() => {
    validarSessao()
      .then(({ autenticado, role }) => {
        if (!autenticado) {
          setStatus("negado");
          return;
        }

        if (role === "admin") {
          window.location.href = "http://localhost:8080/admin";
          return;
        }

        if (role === "cliente") {
          setStatus("autorizado");
          return;
        }

        setStatus("negado");
      })
      .catch(() => {
        setStatus("negado");
      });
  }, []);

  if (status === "verificando") return null;
  if (status === "negado") return <Navigate to="/Autenticar/Login" replace />;

  return <Outlet />;
}