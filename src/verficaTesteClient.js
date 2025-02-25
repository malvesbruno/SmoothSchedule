import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { get_info } from "./database";

const CheckTrialClient = ({databaseTeste}) => {
  const navigate = useNavigate();
  const { doc } = useParams()
  



  useEffect(() => {
    console.log(databaseTeste)
    if (databaseTeste) {
      const startDate = new Date(databaseTeste);
      const currentDate = new Date();
      const timeDiff = currentDate - startDate; // Diferença em milissegundos
      const daysPassed = timeDiff / (1000 * 60 * 60 * 24); // Converte para dias

      if (daysPassed > 30) {
        navigate(`/${doc}/manutencao`); // Redireciona para a página de upgrade
      }
    } else {
      // Caso não exista a data de início, crie uma nova
      const newTrialStartDate = new Date().toISOString();
      Cookies.set("trial_start_date", newTrialStartDate, { expires: 365 });
    }
  }, [navigate]);

  return null; // Este componente não renderiza nada
};

export default CheckTrialClient;