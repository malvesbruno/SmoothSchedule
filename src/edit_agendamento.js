import React, { useState, useRef, useEffect } from "react";
import default_img from "./assets/imgs/solucao.png";
import logo from "./assets/imgs/icon_black.png";
import { useNavigate } from "react-router-dom";
import { editAgentamentoInfo } from "./database";
import { useParams } from "react-router-dom";
import { isAuthenticated } from "./database";
import { get_info } from "./database";


const EditAgendamento = () => {
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
    const [horarios, setHorarios] = useState({});
    const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (!doc) return;
    const fetchData = async () => {
      try {
        const data = await get_info(doc);
        setDinheiro(data.dinheiro || false);
        setPix(data.pix || false);
        setCard(data.card || false);
        setHorarios(data.time_json ? JSON.parse(data.time_json) : {});
        setHoras(data.horas || "")
        setLoading(false)

      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        setLoading(false)
      }
    };
    fetchData();
  }, [doc]);

  useEffect(() => {
    if (Object.keys(horarios).length > 0) {
      setSegini(horarios.seg ? horarios.seg[0] : "");
      setSegFim(horarios.seg ? horarios.seg[1] : "");
      setTerini(horarios.ter ? horarios.ter[0] : "");
      setTerFim(horarios.ter ? horarios.ter[1] : "");
      setQuaini(horarios.qua ? horarios.qua[0] : "");
      setQuaFim(horarios.qua ? horarios.qua[1] : "");
      setQuiini(horarios.qui ? horarios.qui[0] : "");
      setQuiFim(horarios.qui ? horarios.qui[1] : "");
      setSexini(horarios.sex ? horarios.sex[0] : "");
      setSexFim(horarios.sex ? horarios.sex[1] : "");
      setSabini(horarios.sab ? horarios.sab[0] : "");
      setSabFim(horarios.sab ? horarios.sab[1] : "");
      setDomini(horarios.dom ? horarios.dom[0] : "");
      setDomFim(horarios.dom ? horarios.dom[1] : "");
      setAlmini(horarios.alm ? horarios.alm[0] : "");
      setAlmFim(horarios.alm ? horarios.alm[1] : "");
    }
  }, [horarios]);

  if (loadingAuth) {
    return <div>Carregando...</div>; // Tela de carregamento enquanto verifica autenticação
  }

  const handleSubmit = async(e) =>{
    e.preventDefault()
    console.log(pix, card, dinheiro)
    console.log(horas)
    console.log(segini, segfim)
    console.log(terini, terfim)
    console.log(quaini, quafim)
    console.log(quiini, quifim)
    console.log(sexini, sexfim)
    console.log(sabini, sabfim)
    console.log(domini, domfim)

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
  console.log(time_json)
  try{
    await editAgentamentoInfo(doc, pix, card, dinheiro, horas, time_json)
    navigate(`/${userId}/${doc}/edit-service-data`)

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
        <img src={logo} className="logo" alt="Logo" style={{ width: "20%" }} />
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
            <input type="checkbox" checked={dinheiro} onChange={() => handlechecked('dinheiro')} />
            <i className="fa-solid fa-money-bill-wave fa-2xl" style={{ color: "#ebb42c" }}></i>
            <p>Dinheiro</p>
        </label>

        <label className="time money">
        <input type="checkbox" checked={card} onChange={() => handlechecked('card')} />
            <i className="fa-solid fa-credit-card fa-2xl" style={{ color: "#ebb42c" }}></i>
            <p>Cartão</p>
        </label>

        <label className="time money">
            <input type="checkbox" checked={pix} onChange={() => handlechecked('pix')} />
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

export default EditAgendamento;
