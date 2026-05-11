import { useEffect, useState } from "react";
import { validarSessaoAdmin } from "../../services/authAdmin";
import { Navigate, Outlet } from "react-router-dom";

export default function RotaProtegidaAdmin() {

    const [status,setStatus] = useState('verificando');

    useEffect(()=>{

        validarSessaoAdmin().then(({autenticado}) => {
            setStatus(autenticado ? 'autorizado': 'negado');
        });
    },[]);

    if (status === "verificando") return null;
    if (status === "negado") return <Navigate to="/authAdmin" replace />;
    return <Outlet />;

}