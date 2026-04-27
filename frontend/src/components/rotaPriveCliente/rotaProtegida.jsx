import { useEffect,useState } from "react";
import { validarSessao } from "../../services/authCliente.js";
import { Navigate, Outlet } from "react-router-dom";

export default function RotaProtegida(){

    const [status,setStatus] = useState('verificando');

    useEffect(()=>{
        validarSessao().then(({autenticado}) => {
            setStatus(autenticado ? 'autorizado': 'negado');
        });
    },[]);

    if (status === "verificando") return null;
    if (status === "negado") return <Navigate to="/login" replace />;
    return <Outlet />;

};