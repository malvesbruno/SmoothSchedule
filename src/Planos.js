import React, { useState, useEffect } from "react";
import iconBlack from './assets/imgs/icon_orange.png';
import { useNavigate } from "react-router-dom";
import { login } from "./database";
import { getDocIdByItemId } from "./database";
import Cookies from "js-cookie";
import { deleteCurrentUserAndDoc } from "./database";

const PlanosPage = () => {
  const navigate = useNavigate();

    useEffect(() => {
        document.title = "Planos";
      }, []);

  return (
    <>
      <div className="body">
        <div className="side1form">
          <h1>Seu periodo de teste acabou 😢</h1>
          <h2>Não deixe seus clientes esperando, entre em contato conosco 😁</h2>
          <div className="socialMedias">
            <a style={{height: "4em", width: "4em", borderRadius: "100%", border: "none", backgroundColor: "#141414"}} href="https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=malvesbruno0@gmail.com"><i class="fa-solid fa-envelope fa-2xl" style={{color: "#ebb42c"}}></i></a>
            <a style={{height: "4em", width: "4em", borderRadius: "100%", border: "none", backgroundColor: "#141414"}} href="https://api.whatsapp.com/send/?phone=%2B5511968179509&text&type=phone_number&app_absent=0"><i class="fa-brands fa-whatsapp fa-2xl" style={{color: "#ebb42c"}}></i></a>
            <a style={{height: "4em", width: "4em", borderRadius: "100%", border: "none", backgroundColor: "#141414"}} href="https://www.instagram.com/malvesbruno/"><i class="fa-brands fa-instagram fa-2xl" style={{color: "#ebb42c"}}></i></a>
          </div>
        </div>
        <div className="side2form">
          <img src={iconBlack} alt="Ícone" className="icon" />
          <h1>Não pretende continuar conosco? 💔</h1>
          <button style={{background: "#6e0a11"}} onClick={async() => {
            await deleteCurrentUserAndDoc()
            navigate('/')
          }}>Deletar conta</button>
        </div>
      </div>
    </>
  );
};

export default PlanosPage;
