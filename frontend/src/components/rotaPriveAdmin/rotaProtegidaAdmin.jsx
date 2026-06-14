import { useEffect, useState } from "react";
import { validarSessaoAdmin } from "../../services/authAdmin.js"; 
import { Navigate, Outlet } from "react-router-dom";

export default function RotaProtegidaAdmin() {
    const [status, setStatus] = useState('verificando');

    useEffect(() => {
        validarSessaoAdmin().then((resultado) => {
            // Log do objeto recebido para verificar a estrutura
            console.log("Resposta do servidor:", resultado);

            const { autenticado, role } = resultado;
            
            if (autenticado && role === 'admin') {
                setStatus('autorizado');
            } else {
                setStatus('negado');
            }
        }).catch(() => {
            setStatus('negado');
        });
    }, []);

    if (status === "verificando") return null;
    if (status === "negado") return <Navigate to="/authAdmin" replace />;
    
    return <Outlet />;
}