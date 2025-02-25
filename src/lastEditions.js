import React, { useState, useEffect } from "react";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import MapEmbed from "./map";
import { flif } from "@cloudinary/url-gen/qualifiers/format";
import default_img from "./assets/imgs/mountain.jpg";
import { uploadImage, addCostumInfo } from "./database";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "./database";



const FileInputImage = ({ onImageUpload }) => {
  const [image, setImage] = useState(default_img);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result); // Atualiza a miniatura
          if (onImageUpload) onImageUpload(reader.result); // Passa a URL para a função
        }
      };
      reader.readAsDataURL(file); // Converte para Data URL
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
          src={image}
          alt="Selecionar Imagem"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "cover",
            cursor: "pointer",
            background: "#fffff",
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



const LastEditions = () => {
  const [open, setOpen] = useState(false);
  const [open_img, setOpen_img] = useState(false)
  const [open_pcolor, setOpen_pcolor] = useState(false)
  const [open_scolor, setOpen_scolor] = useState(false)
  const [open_tcolor, setOpen_tcolor] = useState(false)
  const [img, setImg] = useState(default_img)
  const [primaryColor, setPrimaryColor] = useState("#ffffff"); // Cor inicial
  const [secondaryColor, setSecundaryColor] = useState("#141414"); // Cor inicial
  const [thirdColor, setThirdColor] = useState('#ebb42c')
  const [loadingAuth, setLoadingAuth] = useState(true)
  const {userId} = useParams()
  const { doc } = useParams();

  const navigate = useNavigate()

  useEffect(() => {
    document.querySelectorAll(".primary_color").forEach((el) => {
      el.style.backgroundColor = primaryColor;
    });
  }, [primaryColor]); 

  useEffect(() => {
    document.querySelectorAll(".third_color").forEach((el) => {
      el.style.backgroundColor = thirdColor;
    });
  }, [thirdColor]); 

  useEffect(() => {
    document.querySelectorAll("i.secondary_color").forEach((el) => {
      el.style.color = secondaryColor;
    });
  }, [secondaryColor]);

  useEffect(() => {
    document.querySelectorAll(".primary_color").forEach((el) => {
      el.style.color = secondaryColor;
    });
    document.querySelectorAll(".secundary_color").forEach((el) => {
      el.style.color = secondaryColor;
    });
    document.querySelectorAll(".secundary_color_pp").forEach((el) => {
      el.style.borderColor = secondaryColor;
    });
  }, [secondaryColor]); 

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
    document.title = 'Edição cores';
  }, [])

  if (loadingAuth) {
    return <div>Carregando...</div>; // Tela de carregamento enquanto verifica autenticação
  }


  const handleClick = () => {
    setOpen(!open);
  };

  const handleClickImg = () => {
    setOpen_img(!open_img);
  };

  const handleClickColorP = () => {
    setOpen_pcolor(!open_pcolor);
  }

  const handleChangeColorP = (event) => {
    setPrimaryColor(event.target.value);
  };

  const handleClickColorS = () => {
    setOpen_scolor(!open_scolor);
  }

  const handleChangeColorS = (event) => {
    setSecundaryColor(event.target.value);
  };

  const handleClickColorT = () => {
    setOpen_tcolor(!open_tcolor);
  }

  const handleChangeColorT = (event) => {
    setThirdColor(event.target.value);
  };

  function dataURLtoFile(dataURL, filename) {
    if (!dataURL || typeof dataURL !== 'string') {
        console.error("dataURL inválido:", dataURL);
        return null;
    }
    let arr = dataURL.split(',');
    if (arr.length < 2) {
        console.error("Formato inválido de dataURL:", dataURL);
        return null;
    }
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

  const handleFinish = async () => {
    try {
      let file;
  
      if (img === default_img) {
        // Criar um Data URL para a imagem padrão
        const response = await fetch(default_img);
        const blob = await response.blob();
        file = new File([blob], "default_upload.jpg", { type: blob.type });
      } else {
        file = dataURLtoFile(img, "upload.jpg");
      }
  
      let url_res = file; // Se não houver upload, manter a imagem original
      try {
        if (img !== default_img){
          url_res = await uploadImage(userId, file);
        }
      } catch (e) {
        console.log("Erro no upload da imagem:", e);
      }
  
      const docId = await addCostumInfo(doc, primaryColor, secondaryColor, thirdColor, url_res);
      navigate(`/${userId}/${doc}/admin`);
    } catch (e) {
      console.error("Erro ao adicionar empresa:", e);
    }
  };
  

  
  

  const handleImageUpload = (imgURL) => {
    if (imgURL) {
      setImg(imgURL);
      const bg = document.getElementById("background");
      if (bg) {
        bg.style.backgroundImage = `url(${imgURL})`;
      }
    }
  };
  

  return (
    <>  
        <div className="bg" id="background" style={{backgroundOrigin: "50% 50%"}}>
        <button className="btn_edit" onClick={handleClickImg}><i class="fa-solid fa-pen fa-2xl"></i></button>
        </div>
        <div className="profile third_color">
          <div className="card primary_color">
          <button className="btn_edit" onClick={handleClickColorS}><i class="fa-solid fa-pen fa-2xl"></i></button>
          <button className="btn_edit" onClick={handleClickColorT}><i class="fa-solid fa-pen fa-2xl"></i></button>
          <button className="btn_edit" onClick={handleClickColorP}><i class="fa-solid fa-pen fa-2xl"></i></button>
          {open ? <div className="form_user primary_color" style={{backgroundColor: primaryColor}}>
            <div className="closeTap">
              <button onClick={handleClick} style={{backgroundColor: thirdColor}}><i class="fa-solid fa-xmark fa-xl" style={{color: secondaryColor}}></i></button>
            </div>
            <div className="form_area">
              <h1>Nome</h1>
              <input style={{borderColor: secondaryColor}}></input>
              <h1>Email</h1>
              <input style={{borderColor: secondaryColor}}></input>
              <h1>Dia</h1>
              <input type="date" style={{borderColor: secondaryColor}}></input>
              <h1>Hora</h1>
              <input type="time" style={{borderColor: secondaryColor}}></input>
              <button style={{backgroundColor: thirdColor, color: secondaryColor}} onClick={handleClick}>marcar</button>
            </div>
        </div> : <></>}
        {open_img ? <div className="form_user primary_color" style={{backgroundColor: primaryColor}}>
            <div className="closeTap">
              <button onClick={handleClickImg}><i class="fa-solid fa-xmark fa-xl" style={{color: "var(--primary_color"}}></i></button>
            </div>
            <div className="form_area">
            <h1>escolha uma imagem de fundo</h1>
                <FileInputImage onImageUpload={handleImageUpload}></FileInputImage>
                <button onClick={handleClickImg} style={{backgroundColor: thirdColor, color: secondaryColor}}>Ok</button>
            </div>
        </div> : <></>}
        {open_pcolor? <div className="form_user primary_color" style={{backgroundColor: primaryColor}}>
            <div className="closeTap">
              <button onClick={handleClickColorP}><i class="fa-solid fa-xmark fa-xl" style={{color: "var(--primary_color"}}></i></button>
            </div>
            <div className="form_area">
            <h1>escolha a primeira cor</h1>
                <input type="color" className="color_picker" value={primaryColor} onChange={handleChangeColorP}></input>
                <button onClick={handleClickColorP} style={{backgroundColor: thirdColor, color: secondaryColor}}>Ok</button>
            </div>
        </div> : <></>}
        {open_scolor? <div className="form_user primary_color" style={{backgroundColor: primaryColor}}>
            <div className="closeTap">
              <button onClick={handleClickColorS} style={{backgroundColor: thirdColor, color: secondaryColor}}><i class="fa-solid fa-xmark fa-xl" style={{color: "var(--primary_color"}}></i></button>
            </div>
            <div className="form_area">
                <h1>escolha a segunda cor</h1>
                <input type="color" className="color_picker" value={secondaryColor} onChange={handleChangeColorS}></input>
                <button onClick={handleClickColorS} style={{backgroundColor: thirdColor, color: secondaryColor}}>Ok</button>
            </div>
        </div> : <></>}
        {open_tcolor? <div className="form_user primary_color" style={{backgroundColor: primaryColor}}>
            <div className="closeTap">
              <button onClick={handleClickColorT} style={{backgroundColor: thirdColor, color: secondaryColor}}><i class="fa-solid fa-xmark fa-xl" style={{color: "var(--primary_color"}}></i></button>
            </div>
            <div className="form_area">
                <h1>escolha a terceira cor</h1>
                <input type="color" className="color_picker" value={thirdColor} onChange={handleChangeColorT}></input>
                <button onClick={handleClickColorT} style={{backgroundColor: thirdColor, color: secondaryColor}}>Ok</button>
            </div>
        </div> : <></>}
        
            <img
              className="pp primary_color secundary_color_pp"
              src="https://res.cloudinary.com/dcikxq4qx/image/upload/v1739492049/user/enb5zeum4cxieopxgus6.png"
              alt="Profile"
            />
            
            <h1>SmoothScheduler</h1>
            <h2>demo</h2>
            <div className="socialMedias">
              <a><i className="fa-brands fa-facebook fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i></a>
              <a><i className="fa-brands fa-whatsapp fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i></a>
              <a><i className="fa-solid fa-phone fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i></a>
              <a><i className="fa-brands fa-instagram fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i></a>
              <a><i className="fa-brands fa-telegram fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i></a>
            </div>
            <button onClick={handleClick} className="secundary_color third_color">Marque um horário</button>
            <MapEmbed street={" Avenida Paulista, 1578, São Paulo - SP, 01310-200"} />
            <h1>Serviços</h1>
            <table>
              <thead>
                <tr>
                  <th className="third_color">Serviço</th>
                  <th className="third_color">Tempo</th>
                  <th className="third_color">Preço</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tattoo Realista</td><td>2</td><td>R$300</td></tr>
                <tr><td>Tattoo Old School</td><td>1:30</td><td>R$150</td></tr>
              </tbody>
            </table>
            <h2>Aceitamos:</h2>
            <div className="socialMedias">
              <i className="fa-solid fa-money-bill-wave fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i>
              <i className="fa-solid fa-credit-card fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i>
              <i className="fa-brands fa-pix fa-2xl secondary_color" style={{ color: "#ebb42c" }}></i>
            </div>
            <h1>Horários</h1>
            <table>
              <thead>
                <tr>
                  <th className="third_color">Dia</th>
                  <th className="third_color">Abertura</th>
                  <th className="third_color">Fechamento</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Seg</td><td>12:00</td><td>12:00</td></tr>
                <tr><td>Ter</td><td>12:00</td><td>12:00</td></tr>
                <tr><td>Qua</td><td>12:00</td><td>12:00</td></tr>
                <tr><td>Qui</td><td>12:00</td><td>12:00</td></tr>
                <tr><td>Sex</td><td>12:00</td><td>12:00</td></tr>
                <tr><td>Sab</td><td>12:00</td><td>12:00</td></tr>
                <tr><td>Dom</td><td>12:00</td><td>12:00</td></tr>
              </tbody>
            </table>
            <button className="continuar secundary_color third_color" onClick={handleFinish}>Continuar</button>
          </div>
        </div>
    </>
  );
};

export default LastEditions;
