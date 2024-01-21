import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Use useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
  try {
    const response = await axios.post('http://localhost:5001/login', { email, password });
    if (response.status === 200) {
      localStorage.setItem('userToken', response.data.token);
      window.location.href = '/api/admin/event';
    } else {
      alert('Login failed. Please try again.');
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if(error.response.status === 401){
        alert('Invalid credentials. Register or try again.');
      } else {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      </div>
      <div>
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
