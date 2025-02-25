import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { get_info } from "./database";
import MapEmbed from "./map";
import default_img from "./assets/imgs/mountain.jpg";
import { addAgendamento } from "./database";
import Cookies from "js-cookie"
import CheckTrialClient from "./verficaTesteClient";


const VerificarAgendamentos = () => {
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
  const [emailForm, setEmailForm] = useState("");
  const [agendamentos, setAgendamentos] = useState('')
  const [agendamentos_user, setAgendamentos_user] = useState('')
  const [openPopUp, setopenPopUp] = useState(false)
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState(null);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState(null);
   const [dataForm, setDataForm] = useState("");
    const [horaForm, setHoraForm] = useState("");
    const [erroDia, setErrodia] = useState(false)
      const [erroHora, setErroHora] = useState(false)
      const [erro, setErro] = useState(false)
      const [messageHoraError, setMessageHoraError] = useState("")
      const [messageDiaError, setMessageDiaError] = useState("")
      const [popUpMessage, setPopUpMessage] = useState(false)
      const [loading, setLoading] = useState(true)
      const [pago, setPago] = useState(false)
      const [dataBaseTeste, setDatabaseTeste] = useState('')

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
          let cookies = (Cookies.get("userCookiesAllowed") == "true" || localStorage.getItem("userCookiesAllowed"))
          if (cookies){
            let email = Cookies.get("userEmail")
            email ? setEmailForm(email) : console.log("Nenhum email")
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
      setMessageHoraError(`Horário fora do intervalo de funcionamento: ${horaSelecionada}`)
      return false;
  }

  // Verifica se o horário selecionado está dentro do intervalo de almoço
  if (horarioAlmoco) {
      const almocoInicio = converterParaMinutos(horarioAlmoco[0]);
      const almocoFim = converterParaMinutos(horarioAlmoco[1]);

      if (horaSelecionadaMinutos >= almocoInicio && horaSelecionadaMinutos <= almocoFim) {
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
              setMessageHoraError(`Horário já agendado para esta data e horário... Tente selecionar horários após das ${agendamento.final} ou selecionar outra data`)
              return false;
          }
      }
  }

  return true;
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
        setPago(data.pago? data.pago : false)
        setDatabaseTeste(data.inicio_teste)

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


  function formatarData(data) {
    // Divide a string da data em ano, mês e dia
    const [ano, mes, dia] = data.split('-');

    // Cria um objeto Date (mes - 1 porque os meses em JavaScript são indexados de 0 a 11)
    const dataObj = new Date(ano, mes - 1, dia);

    // Extrai o dia, mês e ano (apenas os dois últimos dígitos)
    const diaFormatado = String(dataObj.getDate()).padStart(2, '0'); // Garante dois dígitos
    const mesFormatado = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês é indexado de 0 a 11
    const anoFormatado = String(dataObj.getFullYear()).slice(-2); // Pega os dois últimos dígitos do ano

    // Retorna a data no formato DD/MM/YY
    return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
}
 
  

  const handleClosePopUp = () => {
    setopenPopUp(false); // Fecha o pop-up
    setAgendamentoParaCancelar(null); // Limpa o índice armazenado
  };
  
  const handleSearch = () => {
    const user_agenda = []
    agendamentos.map((el) => {
        if (el.email === emailForm){
            user_agenda.push(el)
        }
    })
    setAgendamentos_user(user_agenda)
  }

  const handleClick = () => {
    setOpen(!open);
    setAgendamentoParaEditar(null); // Limpa o índice do agendamento
    setDataForm(""); // Limpa o campo de data
    setHoraForm(""); // Limpa o campo de hora
  };

  const handleCancelarAgendamento = async (index) => {
    if (index === null || index === undefined) return; // Verifica se o índice é válido
  
    // Cria uma cópia da lista de agendamentos
    const novaListaAgendamentos = [...agendamentos];
  
    // Remove o agendamento da lista
    novaListaAgendamentos.splice(index, 1);
  
    // Atualiza o estado com a nova lista
    setAgendamentos(novaListaAgendamentos);
  
    // Atualiza o banco de dados
    const agendamento_request_json = JSON.stringify(novaListaAgendamentos);
    await addAgendamento(doc, agendamento_request_json);
  
    // Atualiza a lista de agendamentos do usuário
    const user_agenda = novaListaAgendamentos.filter((el) => el.email === emailForm);
    setAgendamentos_user(user_agenda);
  

  };

  const handleRemarcarAgendamento = async (e, index) => {
    e.preventDefault();
  
    // Verifica se o índice é válido
    if (index === null || index === undefined) {
      alert("Erro ao identificar o agendamento para remarcação.");
      return;
    }
  
    // Validação dos campos obrigatórios
    if (!dataForm || !horaForm) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
  
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
  
    // Obtém os detalhes dos serviços do agendamento selecionado
    const detalhesServicos = agendamentos[index].servicos;
  
    // Calcula o horário final
    const final = calcularHorarioFinal(horaForm, detalhesServicos);
  
    // Verifica se o horário está disponível
    if (!verificarHorarioDisponivel(dataForm, horaForm, diaDaSemana, agendamentos, final)) {
      setErro(true);
      setErroHora(true);
      return;
    }
  
    // Cria uma cópia da lista de agendamentos
    const novaListaAgendamentos = [...agendamentos];
  
    // Atualiza o agendamento selecionado com a nova data e hora
    novaListaAgendamentos[index] = {
      ...novaListaAgendamentos[index], // Mantém os outros dados do agendamento
      data: dataForm,
      hora: horaForm,
      final: final,
    };
  
    // Atualiza o estado com a nova lista
    setAgendamentos(novaListaAgendamentos);
  
    // Atualiza o banco de dados
    const agendamento_request_json = JSON.stringify(novaListaAgendamentos);
    await addAgendamento(doc, agendamento_request_json);
  
    // Atualiza a lista de agendamentos do usuário
    const user_agenda = novaListaAgendamentos.filter((el) => el.email === emailForm);
    setAgendamentos_user(user_agenda);
  
    // Fecha o formulário de edição
    setPopUpMessage(true)
    setOpen(false);
  
    console.log("Agendamento remarcado com sucesso!");
  };

  if (!loading){
  return (
    <>
    {pago? null : <CheckTrialClient  databaseTeste={dataBaseTeste}></CheckTrialClient>}
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
          <img className="pp primary_color secundary_color_pp" src={ppimg} />
          <h1>{name}</h1>
          <h2>{categoria}</h2>
          {popUpMessage ? (
            <div className="form_user popUp" style={{ backgroundColor: primaryColor }}>
              <div className="closeTap">
                <button style={{ backgroundColor: thirdColor }} onClick={() => {setPopUpMessage(false)}} type="button">
                  <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                </button>
              </div>
              <div className="message">
                <h1>Agendamento remarcado com sucesso</h1>
                <button style={{ backgroundColor: thirdColor, color: secondaryColor }} onClick={() => {setPopUpMessage(false)}} type="button">
                    ok
                  </button>
              </div>
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
                    <h1>Cancelar Agendamento?</h1>
                    <button
                        style={{ backgroundColor: "#8c2922", color: secondaryColor, marginBlock: "0.4em", marginTop: "1em" }}
                        onClick={() => {
                        handleCancelarAgendamento(agendamentoParaCancelar); // Passa o índice para a função
                        setopenPopUp(false); // Fecha o pop-up
                        }}
                        type="button"
                    >
                        Cancelar
                    </button>
                    <button
                        style={{ backgroundColor: thirdColor, color: secondaryColor, marginBlock: "0.4em", marginBottom: "1em" }}
                        onClick={handleClosePopUp}
                        type="button"
                    >
                        Voltar
                    </button>
                    </div>
                </div>
                ) : null}
            {open ? (
                <div className="form_user primary_color" style={{ backgroundColor: primaryColor }}>
                    <div className="closeTap">
                    <button style={{ backgroundColor: thirdColor }} onClick={handleClick} type="button">
                        <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                    </button>
                    </div>
                    <form onSubmit={(e) => handleRemarcarAgendamento(e, agendamentoParaEditar)}>
                    <div className="form_area">
                        <h1>Escolha a data e hora da remarcação</h1>
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
                        {erro && erroDia ? <h2 style={{ color: "red", textAlign: "center", marginInline: "1em" }}>{messageDiaError}</h2> : <></>}
                        <h1>Hora</h1>
                        <input
                        type="time"
                        style={{ borderColor: thirdColor }}
                        value={horaForm}
                        onChange={(e) => setHoraForm(e.target.value)}
                        required
                        />
                        {erro && erroHora ? <h2 style={{ color: "red", textAlign: "center", marginInline: "1em" }}>{messageHoraError}</h2> : <></>}
                        <button style={{ backgroundColor: thirdColor, color: secondaryColor }} type="submit">
                        Remarcar
                        </button>
                    </div>
                    </form>
                </div>
                ) : null}
          <h1 style={{marginTop: "2em"}}>Digite seu Email</h1>
          <h2>Para verificar seus agendamentos</h2>
          <input type="text" style={{ borderColor: thirdColor }} value={emailForm} onChange={(e) => {setEmailForm(e.target.value)}}></input>
          <button style={{ backgroundColor: thirdColor, color: secondaryColor, borderColor: secondaryColor, border: "2px solid", marginTop: "0.5em" }}
          onClick={handleSearch}
          >
            buscar
          </button>
          {agendamentos_user? <><table>
            <thead>
            <tr>
                <th style={{ backgroundColor: primaryColor }} className="third_color" colSpan={5}>Seus Agendamentos</th>
            </tr>
              <tr>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Dia</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Horário</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Hora de término</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Remarcar</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Cancelar</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos_user.length > 0 ? (
                agendamentos_user.map((agendados, index) => (
                  <tr key={index}>
                    <td data-label="Dia">{formatarData(agendados.data)}</td>
                    <td data-label="Horário">{agendados.hora}</td>
                    <td data-label="Término">{agendados.final}</td>
                    <td data-label="Remarcar"><button onClick={() => {
                        setAgendamentoParaEditar(index)
                        setOpen(true)
                        }}><i class="fa-solid fa-pen-to-square fa-xl" style={{color: secondaryColor}}></i></button></td>
                    <td data-label="Cancelar"><button style={{backgroundColor: "#8c2922"}} onClick={() => {
      setAgendamentoParaCancelar(index); // Armazena o índice do agendamento
      setopenPopUp(true); // Abre o pop-up
    }}><i class="fa-solid fa-ban fa-xl" style={{color: secondaryColor}}></i></button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{paddingBlock: '0.5em'}}>Nenhum serviço disponível</td>
                </tr>
              )}
            </tbody>
          </table></> : <></>}
        
          <div ref={elementoAlvoRef}></div>
        </div>
      </div>
    </>
  );
} else {
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

export default VerificarAgendamentos;