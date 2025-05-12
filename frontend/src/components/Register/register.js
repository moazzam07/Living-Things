import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './register.css'
import '../../App.css'
import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/api";

const Register = () => {
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('');

  const navigate = useNavigate();

  function formSubmitHandler(e) {
    e.preventDefault();
    
    if(confirmPassword !== password){
        setError('Passwords do not match!');
        return;
    }
    setError('');

    axios.post(`${BASE_URL}/register`, {
      username: username,
      password: password
    })
      .then((res) => {
        navigate('/login')  
      })
      .catch((err) => {
        alert(err.response.data.detail);
      });
  }

  return (
    <div className='signup'>
      <div className='center'>
        <h1>
          Sign-up your account
        </h1>
      </div>
      <form onSubmit={formSubmitHandler} className='formStyles'>
        <input 
          type='text'
          placeholder='Enter Username'
          value={username}
          className='inputStyles'
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input 
          type='password'
          placeholder='Enter Password'
          value={password}
          className='inputStyles'
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input 
          type='password'
          placeholder='Confirm Password'
          value={confirmPassword}
          className='inputStyle'
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p style={{ marginTop: '-10px', color: 'red' }}>{error}</p>}
        <button type='submit' className='buttonStyle'>
          Sign Up
        </button>
      </form>
      <div className='center mt-5'>
        <span>Already having an account? </span>
        <Link to="/login">Login here</Link>
      </div>
    </div>
  );
}

export default Register;