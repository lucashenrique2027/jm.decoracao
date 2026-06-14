import { useEffect, useState } from "react";
import { validarSessao } from "../../services/cliente.js";
import { Navigate, Outlet } from "react-router-dom";

export default function RotaProtegida() {
    const [status, setStatus] = useState('verificando');

    useEffect(() => {
        validarSessao().then(({ autenticado, role }) => {
            if (autenticado && role === 'cliente') {
                setStatus('autorizado');
            } else {
                setStatus('negado');
            }
        }).catch(() => {
            setStatus('negado');
        });
    }, []);

    if (status === "verificando") return null;
    if (status === "negado") return <Navigate to="/login" replace />;
    
    return <Outlet />;
}