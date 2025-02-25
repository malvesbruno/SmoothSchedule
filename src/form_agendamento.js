import React, { useState, useRef, useEffect } from "react";
import default_img from "./assets/imgs/solucao.png";
import logo from "./assets/imgs/icon_black.png";
import { useNavigate } from "react-router-dom";
import { addAgentamentoInfo } from "./database";
import { useParams } from "react-router-dom";
import { isAuthenticated } from "./database";


const FormAgendamento = () => {
  const [segini, setSegini] = useState("");
  const [segfim, setSegFim] = useState("");
  const [terini, setTerini] = useState("");
  const [terfim, setTerFim] = useState("");
  const [quaini, setQuaini] = useState("");
  const [quafim, setQuaFim] = useState("");
  const [quiini, setQuiini] = useState("");
  const [quifim, setQuiFim] = useState("");
  const [sexini, setSexini] = useState("");
  const [sexfim, setSexFim] = useState("");
  const [sabini, setSabini] = useState("");
  const [sabfim, setSabFim] = useState("");
  const [domini, setDomini] = useState("");
  const [domfim, setDomFim] = useState("");
  const [almini, setAlmini] = useState("");
  const [almfim, setAlmFim] = useState("");
  const [horas, setHoras] = useState("")
  const [dinheiro, setDinheiro] = useState(false)
  const [pix, setPix] = useState(false)
  const [card, setCard] = useState(false)
  const navigate = useNavigate()
  const {userId} = useParams()
  const { doc } = useParams();
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isUserAuthenticated = await isAuthenticated();
        if (!isUserAuthenticated) {
          navigate("/login"); // Redireciona para a página de login
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

  useEffect(() => {
    document.title = "Agendamento";
  }, [])

  if (loadingAuth) {
    return <div>Carregando...</div>; // Tela de carregamento enquanto verifica autenticação
  }

  const handleSubmit = async(e) =>{
    e.preventDefault()

    const time = {
      'seg': [`${segini}`, `${segfim}`],
      'ter': [`${terini}`, `${terfim}`],
      'qua': [`${quaini}`, `${quafim}`],
      'qui': [`${quiini}`, `${quifim}`],
      'sex': [`${sexini}`, `${sexfim}`],
      'sab': [`${sabini}`, `${sabfim}`],
      'dom': [`${domini}`, `${domfim}`],
      'alm': [`${almini}`, `${almfim}`]  
  }

  console.table(time)
  const time_json = JSON.stringify(time)
  try{
    await addAgentamentoInfo(doc, pix, card, dinheiro, horas, time_json)
    navigate(`/${userId}/${doc}/service-data`)

  } catch(e){
    console.log(e)
  }
  
  }

  const handlechecked = async(id) =>{
    if (id == 'dinheiro'){
      setDinheiro(!dinheiro)
    } else if (id == 'pix'){
      setPix(!pix)
    } else if (id == 'card'){
      setCard(!card)
    }
  }

  const handleAllEqual = () => {
    setTerini(segini);
    setQuaini(segini);
    setQuiini(segini);
    setSexini(segini);
    setSabini(segini);
    setDomini(segini);

    setTerFim(segfim);
    setQuaFim(segfim);
    setQuiFim(segfim);
    setSexFim(segfim);
    setSabFim(segfim);
    setDomFim(segfim);
};


  return (
    <div className="form_info">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" style={{ width: "20%" }} />
        <h1>Horários:</h1>
        <div className="time-picker">
            <p>Se os dois horários esiverem vázios ou iguais, será considerado como dia de folga</p>
            <button className="btn" onClick={handleAllEqual} type="button">Adicionar o valor de segunda aos outros</button>
            <div className="time">
              <p>seg</p>
              <input type="time" id="segini" value={segini} onChange={(e) => {setSegini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="segfim" value={segfim} onChange={(e) => {setSegFim(e.target.value)}}></input>
              </div>
            <div className="time">
              <p>ter</p>
              <input type="time"  id="terini" value={terini} onChange={(e) => {setTerini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="terfim" value={terfim} onChange={(e) => {setTerFim(e.target.value)}}></input>
              </div>
            <div className="time">
              <p>qua</p>
              <input type="time"  id="quaini" value={quaini} onChange={(e) => {setQuaini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="quafim" value={quafim} onChange={(e) => {setQuaFim(e.target.value)}}></input>
              </div>
            <div className="time">
              <p>qui</p>
              <input type="time"  id="quiini" value={quiini} onChange={(e) => {setQuiini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="quifim" value={quifim} onChange={(e) => {setQuiFim(e.target.value)}}></input>
              </div>
            <div className="time">
              <p>sex</p>
              <input type="time"  id="sexini" value={sexini} onChange={(e) => {setSexini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="sexfim" value={sexfim} onChange={(e) => {setSexFim(e.target.value)}}></input>
              </div>
            <div className="time">
              <p>sab</p>
              <input type="time"  id="sabini" value={sabini} onChange={(e) => {setSabini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="sabfim" value={sabfim} onChange={(e) => {setSabFim(e.target.value)}}></input>
              </div>
            <div className="time">
              <p>dom</p>
              <input type="time"  id="domini" value={domini} onChange={(e) => {setDomini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="domfim" value={domfim} onChange={(e) => {setDomFim(e.target.value)}}></input>
              </div>
              <h2>Horário de almoço</h2>
              <div className="time">
              <p>almoço</p>
              <input type="time"  id="almini" value={almini} onChange={(e) => {setAlmini(e.target.value)}}></input>
              <p>-</p>
              <input type="time" id="almfim" value={almfim} onChange={(e) => {setAlmFim(e.target.value)}}></input>
              </div>
        </div>
        <h1>Formas de Pagamentos Aceitas:</h1>
        <div className="forma_pagamento">
        <label className="time money">
            <input type="checkbox" value={dinheiro} onChange={() => {handlechecked('dinheiro')}} />
            <i className="fa-solid fa-money-bill-wave fa-2xl" style={{ color: "#ebb42c" }}></i>
            <p>Dinheiro</p>
        </label>

        <label className="time money">
            <input type="checkbox" value={card} onChange={() => {handlechecked('card')}} />
            <i className="fa-solid fa-credit-card fa-2xl" style={{ color: "#ebb42c" }}></i>
            <p>Cartão</p>
        </label>

        <label className="time money">
            <input type="checkbox" value={pix} onChange={() => {handlechecked('pix')}} />
            <i className="fa-brands fa-pix fa-2xl" style={{ color: "#ebb42c" }}></i>
            <p>Pix</p>
        </label>
        </div>
        <h1>Politica de Cancelamento</h1>
        <p className="text">O Cancelamento poderá ser feito em até<input type="number" value={horas} placeholder="0" required onChange={(e) => {setHoras(e.target.value)}}></input> horas antes do dia agendatado</p>
        <button type="submit">next</button>
      </form>
    </div>
  );
};

export default FormAgendamento;
