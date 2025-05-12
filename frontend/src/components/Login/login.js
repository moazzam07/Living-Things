import React, { useState } from 'react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import './login.css'
import '../../App.css'
import { useAuth } from '../../authProvider';

const BASE_URL = "http://127.0.0.1:8000/api";

const Login = () => {
  const { login } = useAuth();
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate();
  
  function formSubmitHandler(e) {
    e.preventDefault();
    axios.post(`${BASE_URL}/login`, {
      username: user,
      password: password
    })
      .then((res) => {
        console.log(res.data);
        login(user, res.data.access, res.data.refresh)
        navigate('/')  
      })
      .catch((err) => {
        alert(err.response.data.detail);
      });
  }

  return (
    <div className='loginPage'>
      <div className='center'>
        <h1>
          Welcome to Task Manager
        </h1>
      </div>
      <form className='center' onSubmit={formSubmitHandler}>
        <input 
          type='text'
          placeholder='Enter Username'
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
        />
        <input 
          type='password'
          placeholder='Enter Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type='submit'>
          Login
        </button>
      </form>
      <div className='center mt-5'>
        <span>Not having an account? </span>
        <Link to="/register">Create Account</Link>
      </div>
    </div>
  );
}

export default Login;