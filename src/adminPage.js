import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { get_info } from "./database";
import MapEmbed from "./map";
import default_img from "./assets/imgs/mountain.jpg";
import { addAgendamento } from "./database";
import { useNavigate } from "react-router-dom";
import sendEmail from "./email";
import { isAuthenticated } from "./database";
import { logout } from "./database";
import CheckTrial from "./verficaTeste";

const AdminPage = () => {
  const [open, setOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [secondaryColor, setSecundaryColor] = useState("#141414");
  const [thirdColor, setThirdColor] = useState("#ebb42c");
  const { doc } = useParams();
  const { userId } = useParams()
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
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentos_user, setAgendamentos_user] = useState('')
  const [openPopUp, setopenPopUp] = useState(false)
  const [openPopUpFinished, setOpenPopUpFinished] = useState(false)
  const [openPopUpReagendamento, setOpenPopUpReagendamento] = useState(false)
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
      const [message, setMessage] = useState('')
      const [openLogOut, setOpenLogOut] = useState(false)
      const [marcasTodos, setMarcarTodos] = useState(false)
      const [loading, setLoading] = useState(true)
      const navigate = useNavigate()
      const [loadingAuth, setLoadingAuth] = useState(true)
      const [dataBaseTeste, setDatabaseTeste] = useState('')
      const [pago, setPago] = useState(false)

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
    
    

      const enviarEmails = (data, enviarParaTodos) => {
        const url = getDesiredUrl();
        const link = url + '/agendamentos';
        if (enviarParaTodos) {
          // Filtra os agendamentos pela data fornecida
          const agendamentosFiltrados = agendamentos.filter((item) => item.data === data);
      
          if (agendamentosFiltrados.length === 0) {
            console.log('Nenhum agendamento encontrado para a data fornecida.');
            return;
          }
      
          // Envia e-mails para todos os agendamentos filtrados
          agendamentosFiltrados.forEach((agendamento) => {
            sendEmail(
              agendamento.email,
              agendamento.nome,
              message, // Mensagem personalizada
              name,    // Nome da empresa
              link     // Link para remarcar
            );
            handleCancelarAgendamento(agendamentos.indexOf(agendamento))

          });
        } else {
          // Envia e-mail apenas para o agendamento salvo em "agendamentoParaEditar"
          if (!agendamentos[agendamentoParaEditar] || !agendamentos[agendamentoParaEditar].email) {
            console.error('Agendamento inválido ou sem e-mail.');
            return;
          }
      
          sendEmail(
            agendamentos[agendamentoParaEditar].email,
            agendamentos[agendamentoParaEditar].nome,
            message, // Mensagem personalizada
            name,    // Nome da empresa
            link     // Link para remarcar
          );
          handleCancelarAgendamento(agendamentoParaEditar)
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
        setDatabaseTeste(data.inicio_teste)
        setPago(data.pago ? data.pago : false)


        setLoading(false)

      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        setLoading(false)
      }
    };
    fetchData();
  }, [doc]);

  useEffect(() => {
    document.title = `${name} admin`;
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
  
    console.log("Agendamento cancelado com sucesso!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("URL copiada para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar a URL: ", err);
        alert("Erro ao copiar a URL.");
      });
  };

  const getDesiredUrl = () => {
    const protocol = window.location.protocol; // "http:" ou "https:"
    const host = window.location.host; // "localhost:3000"
    return `${protocol}//${host}/#/${doc}/`;
  };

  const handleCopyUrl = () => {
    const url = getDesiredUrl();
    copyToClipboard(url);
  };

  const ordenarAgendamentos = (agendamentos) => {
    return agendamentos.sort((a, b) => {
      const dataA = new Date(`${a.data}T${a.hora}`);
      const dataB = new Date(`${b.data}T${b.hora}`);
      return dataA - dataB;
    });
  };

  const handleTodosMarcados = () => {
    setMarcarTodos(!marcasTodos)
  }

  const handleLogOut = async() => {
    await logout(); // Passa o índice para a função
    handleLogOutPopUp()
    navigate('/')
  }

  const handleLogOutPopUp = () => {
    setOpenLogOut(!openLogOut)
  }

  if (!loading){
  return (
    <>
    {pago? null :  <CheckTrial databaseTeste={dataBaseTeste}></CheckTrial>}
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
          <h2>Admin Page</h2>
          <h1 style={{marginTop: "2em"}}>Compartilhe sua página</h1>
          <button style={{ backgroundColor: thirdColor, color: secondaryColor, borderColor: secondaryColor, border: "2px solid", marginTop: "0.5em" }}
          onClick={handleCopyUrl}
          >
            Copiar Url
          </button>
          <button style={{ backgroundColor: thirdColor, color: secondaryColor, borderColor: secondaryColor, border: "2px solid", marginTop: "0.5em" }}
          onClick={() => {navigate(`/${doc}`)}}
          >
            Ir para página
          </button>
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
                {openPopUpFinished ? (
                <div className="form_user popUp" style={{ backgroundColor: primaryColor }}>
                    <div className="closeTap">
                    <button style={{ backgroundColor: thirdColor }} onClick={() => {setOpenPopUpFinished(false)}} type="button">
                        <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                    </button>
                    </div>
                    <div className="message">
                    <h1>Concluir Agendamento?</h1>
                    <button
                        style={{ backgroundColor: "#008000", color: secondaryColor, marginBlock: "0.4em", marginTop: "1em" }}
                        onClick={() => {
                        handleCancelarAgendamento(agendamentoParaCancelar); // Passa o índice para a função
                        setOpenPopUpFinished(false); // Fecha o pop-up
                        }}
                        type="button"
                    >
                        Concluir
                    </button>
                    <button
                        style={{ backgroundColor: thirdColor, color: secondaryColor, marginBlock: "0.4em", marginBottom: "1em" }}
                        onClick={() => {setOpenPopUpFinished(false)}}
                        type="button"
                    >
                        Voltar
                    </button>
                    </div>
                </div>
                ) : null}

              {openLogOut ? (
                <div className="form_user popUp" style={{ backgroundColor: primaryColor }}>
                    <div className="closeTap">
                    <button style={{ backgroundColor: thirdColor }} onClick={handleLogOutPopUp} type="button">
                        <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                    </button>
                    </div>
                    <div className="message">
                    <h1>Fazer logOut?</h1>
                    <button
                        style={{ backgroundColor: "#8c2922", color: secondaryColor, marginBlock: "0.4em", marginTop: "1em" }}
                        onClick={handleLogOut}
                        type="button"
                    >
                        LogOut
                    </button>
                    <button
                        style={{ backgroundColor: thirdColor, color: secondaryColor, marginBlock: "0.4em", marginBottom: "1em" }}
                        onClick={handleLogOutPopUp}
                        type="button"
                    >
                        Voltar
                    </button>
                    </div>
                </div>
                ) : null}


                {openPopUpReagendamento ? (
                <div className="form_user popUp" style={{ backgroundColor: primaryColor }}>
                    <div className="closeTap">
                    <button style={{ backgroundColor: thirdColor }} onClick={() => {setOpenPopUpReagendamento(false)}} type="button">
                        <i className="fa-solid fa-xmark fa-xl" style={{ color: secondaryColor }}></i>
                    </button>
                    </div>
                    <div className="message">
                      <h1>Reagendar</h1>
                    <h2>Mensagem de Reagendamento</h2>
                    <textarea style={{borderColor: secondaryColor, backgroundColor: primaryColor, color: secondaryColor, marginTop: "0.3em"}}
                    name="Message"
                    cols="40"
                    rows="5"
                    maxLength={200}
                    id="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}></textarea>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        id="mandarTodos"
                        value={marcasTodos}
                        onChange={handleTodosMarcados}
                      />
                      <span className="checkmark" style={{ borderColor: secondaryColor }}></span>
                      <p style={{width: "50%", textAlign: "center", marginLeft: "20%"}}>Reagendar todos do dia {formatarData(agendamentos[agendamentoParaEditar].data)}</p>
                    </label>
                    <button
                        style={{ backgroundColor: "#008000", color: secondaryColor, marginBlock: "0.4em", marginTop: "1em" }}
                        onClick={() => {
                        enviarEmails(agendamentos[agendamentoParaEditar].data, marcasTodos)
                        setOpenPopUpReagendamento(false); // Fecha o pop-up
                        }}
                        type="button"
                    >
                        Concluir
                    </button>
                    <button
                        style={{ backgroundColor: thirdColor, color: secondaryColor, marginBlock: "0.4em", marginBottom: "1em" }}
                        onClick={() => {setOpenPopUpReagendamento(false)}}
                        type="button"
                    >
                        Voltar
                    </button>
                    </div>
                </div>
                ) : null}
                <h1>Próximos Agendamentos</h1>
          {agendamentos? <><table style={{overflowX: "auto"}}>
            <thead>
            <tr>
                <th style={{ backgroundColor: primaryColor }} className="third_color" colSpan={8}>Agendamentos Próximos</th>
            </tr>
              <tr>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Nome</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Número</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Dia</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Horário</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Término</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Concluído</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Remarcar</th>
                <th style={{ backgroundColor: thirdColor }} className="third_color">Cancelar</th>
              </tr>
            </thead>
            <tbody>
              {ordenarAgendamentos(agendamentos).length > 0 ? (
                ordenarAgendamentos(agendamentos).map((agendados, index) => (
                  <tr key={index}>
                    <td data-label="Nome">{agendados.nome}</td>
                    <td data-label="Numero">{agendados.numero}</td>
                    <td data-label="Dia">{formatarData(agendados.data)}</td>
                    <td data-label="Horario">{agendados.hora}</td>
                    <td data-label="Término">{agendados.final}</td>
                    <td data-label="Concluído"><button style={{backgroundColor: "#008000"}} onClick={() => {
      setAgendamentoParaCancelar(index); // Armazena o índice do agendamento
      setOpenPopUpFinished(true); // Abre o pop-up
    }}> <i class="fa-solid fa-square-check fa-xl" style={{color: secondaryColor}}></i></button></td>
                    <td data-label="Remarcar"><button onClick={() => {
                        setAgendamentoParaEditar(index)
                        setOpenPopUpReagendamento(true)
                        }}><i class="fa-solid fa-envelope fa-xl" style={{color: secondaryColor}}></i></button></td>
                    <td data-label="Cancelar"><button style={{backgroundColor: "#8c2922"}} onClick={() => {
      setAgendamentoParaCancelar(index); // Armazena o índice do agendamento
      setopenPopUp(true); // Abre o pop-up
    }}><i class="fa-solid fa-ban fa-xl" style={{color: secondaryColor}}></i></button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{paddingBlock: '0.5em'}}>Nenhum serviço disponível</td>
                </tr>
              )}
            </tbody>
          </table></> : <></>}
          <button style={{ backgroundColor: primaryColor, color: secondaryColor, borderColor: secondaryColor, border: "2px solid", marginTop: "0.5em" }}
        onClick={()=>{navigate(`/${userId}/${doc}/edit-info`)}}>Editar perfil</button>
        <button style={{ backgroundColor: "#8c2922", color: secondaryColor, borderColor: secondaryColor, border: "2px solid", marginTop: "4em", marginBottom: "1em" }}
        onClick={handleLogOutPopUp}>LogOut</button>
          <div ref={elementoAlvoRef}></div>
        </div>
      </div>
    </>
  );} else if (loading || loadingAuth){
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

export default AdminPage;