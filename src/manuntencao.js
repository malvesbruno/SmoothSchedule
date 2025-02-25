import React, { useState, useEffect } from "react";
import iconBlack from './assets/imgs/icon_orange.png';
import { useNavigate } from "react-router-dom";
import { login } from "./database";
import { getDocIdByItemId } from "./database";
import Cookies from "js-cookie";

const ManutencaoPage = ({cookiesAllowed}) => {
  const navigate = useNavigate();

    useEffect(() => {
        document.title = "Planos";
      }, []);

  return (
    <>
      <div className="body">
        <div className="side1form">
          <h1>Estamos passando por manutenções 😢</h1>
          <h2>Retorne em breve 😁</h2>
        </div>
      </div>
    </>
  );
};

export default ManutencaoPage;
