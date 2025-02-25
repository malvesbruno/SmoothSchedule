import React, { useState, useEffect } from "react";
import iconBlack from './assets/imgs/icon_orange.png';
import { useNavigate } from "react-router-dom";
import { login } from "./database";
import { getDocIdByItemId } from "./database";
import Cookies from "js-cookie";

const LogInPage = ({cookiesAllowed}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Inicializando com uma string vazia
  const [password, setPassword] = useState(""); // Inicializando com uma string vazia
  const [error, setError] = useState(""); // Para capturar erros de login

  console.log(cookiesAllowed)

  useEffect(() => {
    document.title = "LogIn";
  }, []);

  useEffect(() => {
    const autoLogin = async () => {
      if (cookiesAllowed) {
        const savedEmail = Cookies.get('email');
        const savedPassword = Cookies.get('password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          try {
            const id = await login(savedEmail, savedPassword);
            const doc = await getDocIdByItemId(id);
            if(id && doc)
            navigate(`/${id}/${doc}/admin`);
          } catch (e) {
            setError(e.message);
          }
        }
      }
    };
    autoLogin();
  }, [cookiesAllowed, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const id = await login(email, password);
      if(id){
        Cookies.set('email', email, {expires: 60})
        Cookies.set('password', password, {expires: 60})
      }
      const doc = await getDocIdByItemId(id);
      navigate(`/${id}/${doc}/admin`); // Redireciona após login bem-sucedido
    } catch (error) {
      setError(error.message); // Exibe mensagem de erro
    }
  };

  return (
    <>
      <div className="body">
        <div className="side1form">
          <form onSubmit={handleLogin}>
            <h1>Email</h1>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <h1>Password</h1>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">LogIn</button>
          </form>
          {error && <p>{error}</p>} {/* Exibe erro se houver */}
        </div>
        <div className="side2form">
          <img src={iconBlack} alt="Ícone" className="icon" />
          <h1>Sua primeira vez aqui? Faça SignUp</h1>
          <button onClick={() => {navigate('/signup')}}>SignUp</button>
        </div>
      </div>
    </>
  );
};

export default LogInPage;
