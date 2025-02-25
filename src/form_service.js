import React, { useState, useEffect } from "react";
import logo from "./assets/imgs/icon_black.png";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { addServicoInfo } from "./database";
import { isAuthenticated } from "./database";


const FormService = () => {
  const [inputs, setInputs] = useState([]);
  const navigate = useNavigate();
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
    document.title = 'Serviços';
  }, [])

  if (loadingAuth) {
    return <div>Carregando...</div>; // Tela de carregamento enquanto verifica autenticação
  }

  // Função para adicionar um novo input
  const addInput = () => {
    setInputs([...inputs, { id: Date.now(), nome: "", preco: "", duracao: "" }]);
  };

  // Função para remover um input pelo ID
  const removeInput = (id) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  // Função para atualizar um campo específico do serviço
  const handleChange = (id, field, value) => {
    setInputs(inputs.map((input) => 
      input.id === id ? { ...input, [field]: value } : input
    ));
  };

  // Função para submeter o formulário corretamente
  const handleSubmit = async(event) => {
    event.preventDefault();
    console.log("Serviços cadastrados:", inputs);
    const service_json = JSON.stringify(inputs)
    console.log(service_json)
    try{
      await addServicoInfo(doc, service_json)
      navigate(`/${userId}/${doc}/last-editions`)
    } catch(e){
      console.log(e)
    }
  };

  return (
    <div className="form_info">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" style={{ width: "20%" }} />
        <h1>Serviços:</h1>

        {/* Lista de serviços cadastrados */}
        <div>
          {inputs.map((input) => (
            <div key={input.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="text"
                value={input.nome}
                onChange={(e) => handleChange(input.id, "nome", e.target.value)}
                style={{ height: "2em" }}
                placeholder="Serviço..."
              />
              <input
                type="number"
                value={input.preco}
                onChange={(e) => handleChange(input.id, "preco", e.target.value)}
                style={{ height: "2em" }}
                placeholder="Preço..."
              />
              <input
                type="number"
                value={input.duracao}
                onChange={(e) => handleChange(input.id, "duracao", e.target.value)}
                style={{ height: "2em" }}
                placeholder="Duração (min)..."
              />
              <button type="button" style={{ margin: "0.3em" }} onClick={() => removeInput(input.id)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        {/* Botão para adicionar um novo serviço */}
        <button type="button" onClick={addInput} style={{ marginBottom: "10px" }}>
          Adicionar Serviço
        </button>

        {/* Botão de submissão do formulário */}
        <button type="submit">Próximo</button>
      </form>
    </div>
  );
};

export default FormService;
