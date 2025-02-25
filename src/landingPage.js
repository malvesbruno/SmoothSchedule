import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { get_info } from "./database";
import MapEmbed from "./map";
import default_img from "./assets/imgs/mountain.jpg";
import { addAgendamento } from "./database";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CheckTrialClient from "./verficaTesteClient";


const LandingPage = () => {
  const [open, setOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [secondaryColor, setSecundaryColor] = useState("#141414");
  const [thirdColor, setThirdColor] = useState("#ebb42c");
  const { doc } = useParams();
  const [ppimg, setPPimg] = useState("");
  const [bg, setBg] = useState(default_img);
  const [name, setName] = useState("");
  const [categoria, setCategoria] = useState("");
  const [whatsapp, setWhatsapp] = useState(false);
  const [telegram, setTelegram] = useState(false);
  const [face, setface] = useState(false);
  const [insta, setInsta] = useState(false);
  const [phone, setPhone] = useState(false);
  const [map, setMap] = useState("");
  const [dinheiro, setDinheiro] = useState(false);
  const [pix, setPix] = useState(false);
  const [card, setCard] = useState(false);
  const [horarios, setHorarios] = useState({});
  const [servicos, setServicos] = useState([]);
  const elementoAlvoRef = useRef(null);
  const [servicosSelecionados, setServicosSelecionados] = useState({});
  const [nomeForm, setNomeForm] = useState("");
  const [emailForm, setEmailForm] = useState("");
  const [numForm, setNumForm] = useState('')
  const [dataForm, setDataForm] = useState("");
  const [horaForm, setHoraForm] = useState("");
  const [agendamentos, setAgendamentos] = useState('')
  const [desc, setDesc] = useState("")
  const [seg, setSeg] = useState(false)
  const [ter, setTer] = useState(false)
  const [qua, setQua] = useState(false)
  const [qui, setQui] = useState(false)
  const [sex, setSex] = useState(false)
  const [sab, setSab] = useState(false)
  const [dom, setDom] = useState(false)
  const [erroDia, setErrodia] = useState(false)
  const [erroHora, setErroHora] = useState(false)
  const [erro, setErro] = useState(false)
  const [messageHoraError, setMessageHoraError] = useState("")
  const [messageDiaError, setMessageDiaError] = useState("")
  const [openPopUp, setopenPopUp] = useState(false)
  const [loading, setLoading] = useState(true);
  const [popUpCookies, setPopUpCookies] = useState(true);
  const [cookiesAllowed, setCookiesAllowed] = useState(false)
  const [dataBaseTeste, setDatabaseTeste] = useState('')
  const [pago, setPago] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    // Define as variáveis CSS globais
    document.documentElement.style.setProperty("--scrollbar-thumb", primaryColor);
    document.documentElement.style.setProperty("--scrollbar-track", thirdColor);
  
    // Cria um estilo dinâmico para navegadores WebKit
    const style = document.createElement("style");
    style.innerHTML = `
      html {
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
      }
      html::-webkit-scrollbar {
        width: 8px;
      }
      html::-webkit-scrollbar-track {
        background: var(--scrollbar-track);
      }
      html::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 4px;
      }
      html::-webkit-scrollbar-thumb:hover {
        background: ${secondaryColor};
      }
    `;
    document.head.appendChild(style);
  
    return () => {
      document.head.removeChild(style); // Remove o estilo ao desmontar
    };
  }, [primaryColor, secondaryColor, thirdColor]);

  useEffect(()=>{
    Cookies.set('userCookiesAllowed', "true", {expires: new Date(9999, 11, 31)})
    localStorage.setItem("userCookiesAllowed", "true")
  }, [cookiesAllowed])

  useEffect(()=>{
    let cookies = (Cookies.get("userCookiesAllowed") == "true" || localStorage.getItem("userCookiesAllowed"))
    if (cookies){
      setPopUpCookies(false)
      setCookiesAllowed(true)
      let name = Cookies.get("userName")
      let email = Cookies.get("userEmail")
      let phone = Cookies.get("userPhone")
      name ? setNomeForm(name) : console.log("Nenhum nome") 
      email ? setEmailForm(email) : console.log("Nenhum email") 
      phone ? setNumForm(phone) : console.log("Nenhum telefone") 
    }
  }, [])


  const calcularHorarioFinal = (horaForm, detalhesServicos) => {
    // Converte a hora inicial para minutos desde a meia-noite
    const converterParaMinutos = (hora) => {
        const [hh, mm] = hora.split(':').map(Number);
        return hh * 60 + mm;
    };

    // Converte minutos desde a meia-noite para o formato HH:MM
    const converterParaHora = (minutos) => {
        const hh = Math.floor(minutos / 60) % 24; // Garante que o horário seja válido (0-23)
        const mm = minutos % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    // Calcula o total de minutos dos serviços
    const totalMinutosServicos = detalhesServicos.reduce((total, el) => total + parseInt(el.duracao), 0);

    // Converte a hora inicial para minutos e adiciona a duração total dos serviços
    const horaInicialMinutos = converterParaMinutos(horaForm);
    const horaFinalMinutos = horaInicialMinutos + totalMinutosServicos;

    // Converte o horário final de volta para o formato HH:MM
    const horaFinal = converterParaHora(horaFinalMinutos);

    return horaFinal;
};

const verificarHorarioDisponivel = (dataSelecionada, horaSelecionada, diaDaSemana, agendamentos, horaFinal) => {
  // Converte o dia da semana para minúsculas para garantir a correspondência
  const dia = diaDaSemana.toLowerCase().substring(0, 3); // Ex: "Segunda-feira" -> "seg"
  const horariosDia = horarios[dia]; // Horários do dia específico
  const horarioAlmoco = horarios.alm; // Horário de almoço

  // Verifica se o dia está disponível
  if (!horariosDia || horariosDia[0] === horariosDia[1]) {
      console.log("Dia indisponível:", dia);
      setMessageDiaError(`dia indisponível: ${dia}`)
      setErrodia(true)
      return false;
  }
  setErrodia(false)

  // Converte os horários para minutos desde a meia-noite para facilitar a comparação
  const converterParaMinutos = (hora) => {
      const [hh, mm] = hora.split(":").map(Number);
      return hh * 60 + mm;
  };

  const horaInicio = converterParaMinutos(horariosDia[0]);
  const horaFim = converterParaMinutos(horariosDia[1]);
  const horaSelecionadaMinutos = converterParaMinutos(horaSelecionada);
  const horaFinalMinutos = converterParaMinutos(horaFinal);

  // Verifica se o horário selecionado está fora do intervalo de funcionamento
  if (horaSelecionadaMinutos < horaInicio || horaSelecionadaMinutos > horaFim || horaFinalMinutos > horaFim) {
      console.log("Horário fora do intervalo de funcionamento:", horaSelecionada);
      setMessageHoraError(`Horário fora do intervalo de funcionamento: ${horaSelecionada}`)
      return false;
  }

  // Verifica se o horário selecionado está dentro do intervalo de almoço
  if (horarioAlmoco) {
      const almocoInicio = converterParaMinutos(horarioAlmoco[0]);
      const almocoFim = converterParaMinutos(horarioAlmoco[1]);

      if (horaSelecionadaMinutos >= almocoInicio && horaSelecionadaMinutos <= almocoFim) {
          console.log("Horário dentro do intervalo de almoço:", horaSelecionada);
          setMessageHoraError(`Horário dentro do intervalo de almoço: ${horaSelecionada}`)
          return false;
      }
  }

  // Verifica se a data e o horário selecionados coincidem com algum agendamento
  for (const agendamento of agendamentos) {
      const agendamentoData = agendamento.data; // Data do agendamento
      const agendamentoHoraInicio = converterParaMinutos(agendamento.hora);
      const agendamentoHoraFim = converterParaMinutos(agendamento.final);

      // Verifica se a data é a mesma e se há sobreposição de horários
      if (dataSelecionada === agendamentoData) {
          // Verifica se o horário selecionado se sobrepõe ao agendamento existente
          if (
              (horaSelecionadaMinutos >= agendamentoHoraInicio && horaSelecionadaMinutos < agendamentoHoraFim) || // Início dentro do agendamento
              (horaFinalMinutos > agendamentoHoraInicio && horaFinalMinutos <= agendamentoHoraFim) || // Fim dentro do agendamento
              (horaSelecionadaMinutos <= agendamentoHoraInicio && horaFinalMinutos >= agendamentoHoraFim) // Agendamento cobre todo o intervalo
          ) {
              console.log("Horário já agendado para esta data:", dataSelecionada, horaSelecionada);
              setMessageHoraError(`Horário já agendado para esta data e horário... Tente selecionar horários após das ${agendamento.final} ou selecionar outra data`)
              return false;
          }
      }
  }

  return true;
};

  const rolarParaElemento = () => {
    if (elementoAlvoRef.current) {
      elementoAlvoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  useEffect(() => {
    if (!doc) return;
    const fetchData = async () => {
      try {
        const data = await get_info(doc);
        setPrimaryColor(data.primary_color || "#ffffff");
        setSecundaryColor(data.secondary_color || "#141414");
        setThirdColor(data.third_color || "#ebb42c");
        setPPimg(data.url_image || default_img);
        setBg(data.bg_img || default_img);
        setName(data.company || "Nome não disponível");
        setCategoria(data.categoria || "Categoria não informada");
        setWhatsapp(data.whatsapp || false);
        setInsta(data.instagram || false);
        setTelegram(data.telegram || false);
        setPhone(data.telefone || false);
        setface(data.facebook || false);
        setMap(data.localizacao || "");
        setDinheiro(data.dinheiro || false);
        setPix(data.pix || false);
        setCard(data.card || false);
        setHorarios(data.time_json ? JSON.parse(data.time_json) : {});
        setServicos(data.servico_json ? JSON.parse(data.servico_json) : []);
        setAgendamentos(data.agendamentos ? JSON.parse(data.agendamentos) : [])
        setDesc(data.descricao || "")
        setDatabaseTeste(data.inicio_teste)
        setPago(data.pago? data.pago : false)

        if (horarios.seg[0] != horarios.seg[1]){
          setSeg(true)
        }
        if (horarios.ter[0] != horarios.ter[1]){
          setTer(true)
        } 
        if (horarios.qua[0] != horarios.qua[1]){
          setQua(true)
        } 
        if (horarios.qui[0] != horarios.qui[1]){
          setQui(true)
        } 
        if (horarios.sex[0] != horarios.sex[1]){
          setSex(true)
        } 
        if (horarios.sab[0] != horarios.sab[1]){
          setSab(true)
        } 
        if (horarios.dom[0] != horarios.dom[1]){
          setDom(true)
        } 
        setLoading(false)

      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        setLoading(false)
      }
    };
    fetchData();
  }, [doc]);

  useEffect(() => {
    document.title = name;
  }, [name])

  const handleClick = () => {
    if (!open) {
      rolarParaElemento();
    } else{
      setDataForm('')
      setHoraForm('')
      setServicosSelecionados({})
    }
    setOpen(!open);
  };

  const handleServicoChange = (servico) => {
    setServicosSelecionados((prev) => {
      const novoEstado = { ...prev };
      if (novoEstado[servico.nome]) {
        // Se o serviço já foi selecionado, remove-o
        delete novoEstado[servico.nome];
      } else {
        // Se o serviço não foi selecionado, adiciona-o com todos os detalhes
        novoEstado[servico.nome] = {
          preco: servico.preco,
          duracao: servico.duracao,
        };
      }
      return novoEstado;
    });
  };

 
  

  const handleAgendamento = async (e) => {
    e.preventDefault();
  
    // Validação dos campos obrigatórios
    if (!nomeForm || !dataForm || !horaForm) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    Cookies.set("userName", nomeForm, {expires:  new Date(9999, 11, 31)})
    Cookies.set("userEmail", emailForm, {expires:  new Date(9999, 11, 31)})
    Cookies.set('userPhone', numForm, {expires:  new Date(9999, 11, 31)})
  
    // Obtém a data de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split("T")[0];
  
    // Verifica se a data escolhida é anterior a hoje
    if (dataForm < hoje) {
      alert("Selecione uma data válida! O dia não pode ser anterior a hoje.");
      return;
    }
  
    // Obtém o dia da semana
    const diasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dataObj = new Date(`${dataForm}T00:00:00`);
    const diaDaSemanaNumero = dataObj.getDay();
    const diaDaSemana = diasDaSemana[diaDaSemanaNumero];

    const selecionados = Object.keys(servicosSelecionados).filter(
      (key) => servicosSelecionados[key]
    );

    const detalhesServicos = selecionados.map((nomeServico) => {
      return {
        nome: nomeServico,
        preco: servicosSelecionados[nomeServico].preco,
        duracao: servicosSelecionados[nomeServico].duracao,
      };
    });
  
    
    var final = calcularHorarioFinal(horaForm, detalhesServicos)
  
    // Verifica se o horário está disponível
    if (!verificarHorarioDisponivel(dataForm, horaForm, diaDaSemana, agendamentos, final)) {
      console.log("Horário indisponível");
      setErro(true);
      setErroHora(true);
      return;
    }
  
    // Filtra os serviços selecionados
  
    if (selecionados.length === 0) {
      alert("Selecione pelo menos um serviço!");
      return;
    }
  
    
  
    // Cria o objeto de agendamento
    const agendamento = {
      nome: nomeForm,
      email: emailForm,
      numero: numForm,
      servicos: detalhesServicos,
      data: dataForm,
      hora: horaForm,
      diaDaSemana: diaDaSemana,
      final: final,
    };
  
   
    agendamentos.push(agendamento)
    const agendamento_request_json = JSON.stringify(agendamentos)
    await addAgendamento(doc, agendamento_request_json);

    setopenPopUp(true)
    setOpen(false)
  
      setDataForm('')
      setHoraForm('')
      setServicosSelecionados({})
  };

  const handleClosePopUp = () => {
    setopenPopUp(!openPopUp)
  }

  const AllowCookies = () => {
    setCookiesAllowed(true)
    setPopUpCookies(false)
  }
  
  
  if (!loading){
  return (
    <>
    {pago? null : <CheckTrialClient databaseTeste={dataBaseTeste}></CheckTrialClient> }
      <div
        className="bg"
        id="background"
        style={{
          background: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 50%"
        }}
      ></div>
      <div className="profile third_color" style={{ backgroundColor: thirdColor }}>
        <div className="card primary_color" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
          {open ? (
            <div className="form_user primary_color" style={{ backgroundColor: primaryColor }}>
              <div className="closeTap">
                <button style={{ backgroundColor: thirdColor }} onClick={handleClick} type="button">
                  <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                </button>
              </div>
              <form onSubmit={handleAgendamento}>
                <div className="form_area">
                  <h1>Nome</h1>
                  <input
                    type="text"
                    style={{ borderColor: thirdColor }}
                    value={nomeForm}
                    onChange={(e) => setNomeForm(e.target.value)}
                    required
                  />
                  <h1>Email</h1>
                  <input
                    style={{ borderColor: thirdColor }}
                    type="email"
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    required
                  />
                  <h1>Número</h1>
                  <input
                    style={{ borderColor: thirdColor }}
                    type="tel"
                    value={numForm}
                    onChange={(e) => setNumForm(e.target.value)}
                    required
                  />
                  <h1>Serviço</h1>
                  {servicos.length > 0 ? (
                  servicos.map((servico, index) => (
                    <label key={index} className="checkbox-container">
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        id={servico.nome}
                        checked={servicosSelecionados[servico.nome] || false}
                        onChange={() => handleServicoChange(servico)} // Passando o serviço completo
                      />
                      <span className="checkmark" style={{ borderColor: secondaryColor }}></span>
                      <p>{servico.nome}</p>
                      <p>R${servico.preco}</p>
                      <p>Duração: {servico.duracao} min</p> {/* Exibindo duração */}
                    </label>
                  ))
                ) : (
                  <p>N/A</p>
                )}

                  <h1>Dia</h1>
                  <input
                    type="date"
                    style={{ borderColor: thirdColor }}
                    value={dataForm}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDataForm(e.target.value)}
                    disabled={Object.keys(horarios).length === 0}
                    required
                  />
                  {erro && erroDia ? <h2 style={{color: "red", textAlign: "center", marginInline:"1em" }}>{messageDiaError}</h2>:<></>} 
                  <h1>Hora</h1>
                  <input
                    type="time"
                    style={{ borderColor: thirdColor }}
                    value={horaForm}
                    onChange={(e) => setHoraForm(e.target.value)}
                    required
                  />
                  {erro && erroHora ? <h2 style={{color: "red", textAlign: "center", marginInline:"1em"}}>{messageHoraError}</h2>:<></>} 
                  <button style={{ backgroundColor: thirdColor, color: secondaryColor }} type="submit">
                    Marcar
                  </button>
                </div>
              </form>
            </div>
          ) : null}
          {openPopUp ? (
            <div className="form_user popUp" style={{ backgroundColor: primaryColor }}>
              <div className="closeTap">
                <button style={{ backgroundColor: thirdColor }} onClick={handleClosePopUp} type="button">
                  <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                </button>
              </div>
              <div className="message">
                <h1>Agendamento marcado com sucesso</h1>
                <button style={{ backgroundColor: thirdColor, color: secondaryColor }} onClick={handleClosePopUp} type="button">
                    ok
                  </button>
              </div>
            </div>
          ) : null}
          <img className="pp primary_color secundary_color_pp" src={ppimg} />
          <h1>{name}</h1>
          <h2>{categoria}</h2>
          {(face || whatsapp || phone || insta || telegram) && (
            <div className="socialMedias">
              {face && <a href={face}><i className="fa-brands fa-facebook fa-2xl secondary_color" style={{ color: secondaryColor }}></i></a>}
              {whatsapp && <a href={whatsapp}><i className="fa-brands fa-whatsapp fa-2xl secondary_color" style={{ color: secondaryColor }}></i></a>}
              {phone && <a href={phone}><i className="fa-solid fa-phone fa-2xl secondary_color" style={{ color: secondaryColor }}></i></a>}
              {insta && <a href={insta}><i className="fa-brands fa-instagram fa-2xl secondary_color" style={{ color: secondaryColor }}></i></a>}
              {telegram && <a href={telegram}><i className="fa-brands fa-telegram fa-2xl secondary_color" style={{ color: secondaryColor }}></i></a>}
            </div>
          )}
          {popUpCookies ? <div className="PopUpMessageUser" style={{backgroundColor: primaryColor, color: secondaryColor, boxShadow: `0px 0px 20px ${thirdColor}6f`}}>
              <p>Utilizamos cookies para facilitar seus próximos agendamentos</p>
              <button onClick={AllowCookies} style={{backgroundColor: "rgb(79, 121, 79)", padding: "0.5em", color: "#fff"}}>Aceitar cookies</button>
              <button onClick={() => {setPopUpCookies(false)}} style={{backgroundColor: "rgb(157, 8, 8)", padding: "0.5em", color: "#fff"}}>Recusar cookies</button>
          </div>:null}
          <button
            onClick={handleClick}
            style={{ backgroundColor: thirdColor, color: secondaryColor, borderColor: secondaryColor, border: "2px solid" }}
            className="secundary_color third_color"
          >
            Marque um horário
          </button>
          <button
            onClick={()=>{navigate(`/${doc}/agendamentos`)}}
            style={{ backgroundColor: thirdColor, color: secondaryColor, borderColor: secondaryColor, border: "2px solid" }}
            className="secundary_color third_color"
          >
            Verificar horários
          </button>
          <MapEmbed street={map} />
          <h1>Serviços</h1>
          <table>
            <thead>
              <tr>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Serviço</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Tempo (min)</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Preço (Média)</th>
              </tr>
            </thead>
            <tbody>
              {servicos.length > 0 ? (
                servicos.map((servico, index) => (
                  <tr key={index}>
                    <td data-label="Nome">{servico.nome}</td>
                    <td data-label="Duração(min)">{servico.duracao}</td>
                    <td data-label="Preço">R${servico.preco}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">Nenhum serviço disponível</td>
                </tr>
              )}
            </tbody>
          </table>
          <h2>Aceitamos:</h2>
          {(dinheiro || card || pix) && (
            <div className="socialMedias">
              {dinheiro && <i className="fa-solid fa-money-bill-wave fa-2xl secondary_color" style={{ color: secondaryColor }}></i>}
              {card && <i className="fa-solid fa-credit-card fa-2xl secondary_color" style={{ color: secondaryColor }}></i>}
              {pix && <i className="fa-brands fa-pix fa-2xl secondary_color" style={{ color: secondaryColor }}></i>}
            </div>
          )}
          <h1>Horários</h1>
          <table>
            <thead>
              <tr>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Dia</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Abertura</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Almoço</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Fechamento</th>
              </tr>
            </thead>
            <tbody>
              {horarios.seg && horarios.seg[0] !== horarios.seg[1] && (
                <tr>
                  <td data-label="Dia">Seg</td>
                  <td data-label="Abertura">{horarios.seg[0]}</td>
                  <td data-label="Almoço">{horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.seg[1]}</td>
                </tr>
              )}
              {horarios.ter && horarios.ter[0] !== horarios.ter[1] && (
                <tr>
                  <td data-label="Dia">Ter</td>
                  <td data-label="Abertura">{horarios.ter[0]}</td>
                  <td data-label="Almoço">{horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.ter[1]}</td>
                </tr>
              )}
              {horarios.qua && horarios.qua[0] !== horarios.qua[1] && (
                <tr>
                  <td data-label="Dia">Qua</td>
                  <td data-label="Abertura">{horarios.qua[0]}</td>
                  <td data-label="Almoço">{horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.qua[1]}</td>
                </tr>
              )}
              {horarios.qui && horarios.qui[0] !== horarios.qui[1] && (
                <tr>
                  <td data-label="Dia">Qui</td>
                  <td data-label="Abertura">{horarios.qui[0]}</td>
                  <td data-label="Almoço">{horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.qui[1]}</td>
                </tr>
              )}
              {horarios.sex && horarios.sex[0] !== horarios.sex[1] && (
                <tr>
                  <td data-label="Dia">Sex</td>
                  <td data-label="Abertura">{horarios.sex[0]}</td>
                  <td data-label="Almoço"> {horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.sex[1]}</td>
                </tr>
              )}
              {horarios.sab && horarios.sab[0] !== horarios.sab[1] && (
                <tr>
                  <td data-label="Dia">Sab</td>
                  <td data-label="Abertura">{horarios.sab[0]}</td>
                  <td data-label="Almoço">{horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.sab[1]}</td>
                </tr>
              )}
              {horarios.dom && horarios.dom[0] !== horarios.dom[1] && (
                <tr>
                  <td data-label="Dia">Dom</td>
                  <td data-label="Abertura">{horarios.dom[0]}</td>
                  <td data-label="Almoço">{horarios.alm ? `${horarios.alm[0]} - ${horarios.alm[1]}` : "N/A"}</td>
                  <td data-label="Fechamento">{horarios.dom[1]}</td>
                </tr>
              )}
            </tbody>
          </table>
          <h1>Mais sobre</h1>
          <p style={{marginBottom: "2em"}}>{desc}</p>
          <div ref={elementoAlvoRef}></div>
        </div>
      </div>
    </>
  );} else {
    return(
    <>
    <div
  style={{
    backgroundColor: "#141414",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Altura total da tela
    width: "100vw", // Largura total da tela
  }}
>
  <div
    className="ball"
    style={{
      height: "8em",
      width: "8em",
      backgroundColor: "transparent", // Fundo transparente para destacar o círculo interno
      borderRadius: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      animation: "spin 1s linear infinite", // Animação de rotação
    }}
  >
    <div
      className="circle"
      style={{
        height: "6em",
        width: "6em",
        backgroundColor: "transparent", // Fundo transparente
        borderRadius: "100%",
        border: "0.5em solid #ffffff", // Cor da borda
        borderLeft: "0.5em solid transparent", // Remove a borda esquerda para criar o efeito de "loading"
      }}
    ></div>
  </div>
</div>
    </>
    )
  }
};

export default LandingPage;