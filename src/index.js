import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import "./index.css";
import "./mediaQuerys.css"
import iconBlack from "./assets/imgs/icon_black_frase.png";
import SignUpPage from "./signUp";
import LogInPage from "./logIn";
import FormInfo from "./formInfo";
import FormAgendamento from "./form_agendamento";
import FormService from "./form_service";
import LastEditions from "./lastEditions";
import LandingPage from "./landingPage";
import VerificarAgendamentos from "./verificarAgendamento";
import AdminPage from "./adminPage";
import EditInfo from "./editInfo";
import { getDocByAuthUid, isAuthenticated } from "./database";
import reportWebVitals from "./reportWebVitals";
import EditAgendamento from "./edit_agendamento";
import EditService from "./edit_service_data";
import EditLastEditions from "./edit_last_editions";
import Cookies from "js-cookie";
import PlanosPage from "./Planos";
import ManutencaoPage from "./manuntencao";

// Componente da página inicial
const Home = () => {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [cookiesAllowed, setCookiesAllowed] = useState(false)
  const [openPopUp, SetOpenPopUp] = useState(true)

  useEffect(() => {
    Cookies.set("cookiesAllowed", "true", {expires:  new Date(9999, 11, 31)})
    localStorage.setItem('cookiesAllowed', "true")
  }, [cookiesAllowed])

  useEffect(() => {
    let cookies = (Cookies.get("cookiesAllowed") == "true" || localStorage.getItem('cookiesAllowed') == "true")
    if (cookies){
      setCookiesAllowed(true);
      SetOpenPopUp(false)
    }
  })

  useEffect(() => {
    document.title = "SmoothScheduler";
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isUserAuthenticated = await isAuthenticated();
  
        if (isUserAuthenticated) {
          const data = await getDocByAuthUid();
  
          if (data.user && data.doc) {
            navigate(`/${data.user}/${data.doc}/admin`);
          } else {
            throw new Error("Campos 'user' ou 'doc' não encontrados no documento.");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        navigate("/login"); // Redireciona em caso de erro
      } finally {
        setLoadingAuth(false); // Finaliza o estado de carregamento
      }
    };
  
    checkAuth();
  }, [navigate]);

  const AllowCookies = () => {
    setCookiesAllowed(true)
    SetOpenPopUp(false)
  }

  return (
    <div className="body">
      {openPopUp?
      <div className="PopUpMessage">
        <p>Olá esse site usa cookies para melhor funcionamento</p>
        <button onClick={AllowCookies}>Aceitar cookies</button>
        <button onClick={() => {SetOpenPopUp(false)}}>Recusar cookies</button>
      </div>
: null}
      <div className="side1">
        <img src={iconBlack} alt="Ícone" className="icon" />
        <ul>
          <li>- Agendamentos automáticos e sem complicações</li>
          <li>- Lembretes automáticos por Email para nunca mais perder um compromisso</li>
        </ul>
      </div>
      <div className="side2">
        <h1>Entre e simplifique seus agendamentos com elegância</h1>
        <div className="card">
          <button onClick={() => 
            {
              navigate("/signup")
              }
              }>SignUp</button>
          <button className="login" onClick={() => 
            {
              navigate("/login")
            }
            }>
            LogIn
          </button>
        </div>
      </div>
    </div>
  );
};

// Configuração das rotas
const App = () => {
  const [cookiesAllowed, setCookiesAllowed] = useState(false)
  
  useEffect(() => {
    let cookies = (Cookies.get("cookiesAllowed") == "true" || localStorage.getItem('cookiesAllowed') == "true")
    if (cookies){
      setCookiesAllowed(true);
    }
  })


  return(
  <ParallaxProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:doc/planos" element={<PlanosPage/>} />
        <Route path="/:doc/manutencao" element={<ManutencaoPage/>} />
        <Route path="/signup" element={<SignUpPage cookiesAllowed={cookiesAllowed} />} />
        <Route path="/login" element={<LogInPage cookiesAllowed={cookiesAllowed} />} />
        <Route path="/:userId/basic-data" element={<FormInfo />} />
        <Route path="/:userId/:doc/schedule-data" element={<FormAgendamento />} />
        <Route path="/:userId/:doc/service-data" element={<FormService />} />
        <Route path="/:userId/:doc/last-editions" element={<LastEditions />} />
        <Route path="/:userId/:doc/admin" element={<AdminPage />} />
        <Route path="/:userId/:doc/edit-info" element={<EditInfo />} />
        <Route path="/:userId/:doc/edit-schedule-data" element={<EditAgendamento />} />
        <Route path="/:userId/:doc/edit-service-data" element={<EditService />} />
        <Route path="/:userId/:doc/edit-last-editions" element={<EditLastEditions />} />
        <Route path="/:doc" element={<LandingPage />} />
        <Route path="/:doc/agendamentos" element={<VerificarAgendamentos />} />
      </Routes>
    </HashRouter>
  </ParallaxProvider>
)};

// Renderização da aplicação
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Medição de desempenho (opcional)
reportWebVitals();
