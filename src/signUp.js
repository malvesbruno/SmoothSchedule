import React, { useState, useEffect } from "react";
import iconBlack from './assets/imgs/icon_orange.png'
import { useNavigate } from "react-router-dom";
import { signup } from "./database";
import Cookies from "js-cookie";

const SignUpPage = ({cookiesAllowed}) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState(null);
  const [senha, setSenha] = useState(null)

  useEffect(() => {
    document.title = "SignUp";
  }, []);

  const handleSubmit = async(e) => {
        e.preventDefault()
        try{
          const id = await signup(email, senha)
          if(id && cookiesAllowed){
            Cookies.set("password", senha, {expires: 60})
            Cookies.set("email", email, {expires: 60})
          }
          if (id){
            const teste = new Date().toISOString()
            Cookies.set("teste", teste, { expires: 365 })
          }
          navigate(`/${id}/basic-data`)
        } catch(e){
          console.log(e)
        }
  }

  return (
    <>
        <div className="body">
          <div className="side1form">
            <form onSubmit={handleSubmit}>
              <h1>Email</h1>
              <input type="email"
              id="email"
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}></input>
              <h1>Password</h1>
              <input type="password"
              id="senha"
              value={senha}
              onChange={(e) => {setSenha(e.target.value)}}></input>
              <button type="submit">Sign Up</button>
            </form>
          </div>
          <div className="side2form">
          <img src={iconBlack} alt="Ícone" className="icon" />
          <h1>Não é sua primeira vez aqui? Faça LogIn</h1>
          <button onClick={() => {navigate('/logIn')}}>LogIn</button>
          </div>
        </div>
      </>
  );
};

export default SignUpPage; // Certifique-se de exportar o componente