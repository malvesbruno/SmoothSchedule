import React, { useState, useRef, useEffect } from "react";
import default_img from "./assets/imgs/solucao.png";
import logo from "./assets/imgs/icon_black.png";
import { useNavigate, useLocation } from "react-router-dom";
import { uploadImage, addCompanyBasic } from "./database";
import { useParams } from "react-router-dom";
import { isAuthenticated } from "./database";

const FileInputImage = ({ onImageUpload }) => {
  const [image, setImage] = useState(default_img);
  const [loadingAuth, setLoadingAuth] = useState(true)
  const navigate = useNavigate()

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
      document.title = 'Informações';
    }, [])
  
    if (loadingAuth) {
      return <div>Carregando...</div>; // Tela de carregamento enquanto verifica autenticação
    }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result);
          if (onImageUpload) onImageUpload(file); // Envia o arquivo diretamente
        }
      };
      reader.readAsDataURL(file); // Apenas para pré-visualização
    }
  };
  

  return (
    <div style={{ textAlign: "center" }}>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />
      <label htmlFor="fileInput" style={{ position: "relative", display: "inline-block" }} tabIndex="0">
        <img
          src={image || default_img}
          alt="Selecionar Imagem"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderRadius: "100%",
            cursor: "pointer",
            border: "2px solid #ebb42c",
            background: "#ebb42c",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: "5px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            fontSize: "12px",
            padding: "3px 6px",
            borderRadius: "5px",
          }}
        >
          Alterar
        </span>
      </label>
    </div>
  );
};

const DropdownMenu = ({ selectedCategory, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (item) => {
    onSelect(item); // Atualiza diretamente o estado pai
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="menu_dropdown_place" ref={menuRef}>
      <button onClick={toggleDropdown} type="button" className={`dropdownMenu ${isOpen ? "open" : ""}`}>
        {selectedCategory || "Selecione uma opção"}
      </button>

      {isOpen && (
        <div className="dropdownMenuItens">
          <div className="py-2">
            {[
              "Tatuador", "Cabeleireiro", "Barbeiro", "Manicures/Pedicures", "Mecânicos",
              "Personal Trainers", "Massagistas", "Designers de Sobrancelhas", "Dentistas",
              "Fotógrafos", "Consultores de Beleza (maquiadores, etc.)", "Técnicos de Informática",
              "Professores Particulares", "Nutricionistas", "Veterinários", "Decoradores de Eventos",
              "Artistas (pintores, escultores, etc.)", "Confeiteiros", "Consultores Financeiros",
              "Terapeutas Holísticos (Reiki, Yoga, etc.)", "Outro"
            ].map((item) => (
              <p
                key={item}
                onClick={() => handleSelect(item)}
                className={`item_dropdown ${selectedCategory === item ? "bg-blue-200" : ""}`}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const FormInfo = () => {
  const [categoria, setCategoria] = useState("");
  const [company, setCompany] = useState("");
  const [img, setImg] = useState(default_img);
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [face, setFace] = useState("");
  const [tel, setTel] = useState("");
  const [instagram, setInsta] = useState("");
  const [telegram, setTelegram] = useState("");
  const [url, setUrl] = useState("");
  const { userId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const handleImageUpload = (imageUrl) => {
    setImg(imageUrl);  // Atualiza o estado com a URL da imagem carregada
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("User ID:", userId);
  
    try {
      let url_res = img; // Se não houver upload, manter a imagem original
      try {
        url_res = await uploadImage(userId, img);
      } catch (e) {
        console.log("Erro no upload da imagem:", e);
      }
      
      const docId = await addCompanyBasic(userId, company, url_res, desc, categoria, loc, face, whatsapp, telegram, instagram, tel);
      navigate(`/${userId}/${docId}/schedule-data`);
    } catch (e) {
      console.error("Erro ao adicionar empresa:", e);
    }
  };
  

  return (
    <div className="form_info">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" style={{ width: "20%" }} />
        <h1>Nome da Empresa</h1>
        <input type="text" id="name" required  value={company} onChange={(e) => setCompany(e.target.value)} />
        <h1>Sua Logo:</h1>
        <FileInputImage onImageUpload={handleImageUpload} />
        <h1>Descrição:</h1>
        <textarea
          name="Descricao"
          cols="40"
          rows="5"
          maxLength={200}
          id="descricao"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <h1>Categoria:</h1>
        <DropdownMenu selectedCategory={categoria} onSelect={setCategoria} />
        <h1>Localização:</h1>
        <input type="text" id="loc" value={loc} required onChange={(e) => setLoc(e.target.value)} />
        <h1>Formas de Contato:</h1>
        <p className="input_social"><i className="fa-brands fa-facebook fa-2xl" style={{ color: "#ebb42c" }}></i>
          <input type="text" placeholder="(opcional)" id="facebook" value={face} onChange={(e) => setFace(e.target.value)} />
        </p>
        <p className="input_social"><i className="fa-brands fa-whatsapp fa-2xl" style={{ color: "#ebb42c" }}></i>
          <input type="text" placeholder="(opcional)" id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </p>
        <p className="input_social"><i className="fa-solid fa-phone fa-2xl" style={{ color: "#ebb42c" }}></i>
          <input type="text" placeholder="(opcional)" id="phone" value={tel} onChange={(e) => setTel(e.target.value)} />
        </p>
        <p className="input_social"><i className="fa-brands fa-instagram fa-2xl" style={{ color: "#ebb42c" }}></i>
          <input type="text" placeholder="(opcional)" id="instagram" value={instagram} onChange={(e) => setInsta(e.target.value)} />
        </p>
        <p className="input_social"><i className="fa-brands fa-telegram fa-2xl" style={{ color: "#ebb42c" }}></i>
          <input type="text" placeholder="(opcional)" id="telegram" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        </p>
        <button type="submit">next</button>
      </form>
    </div>
  );
};

export default FormInfo;
