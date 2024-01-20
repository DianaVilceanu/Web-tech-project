import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const api = axios.create({
  baseURL: 'http://localhost:5001',
});

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Use useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      if (response.status === 200) {
        localStorage.setItem('userToken', response.data.token);
        setUser(response.data.user);
        navigate('/home'); // Use navigate
      } else if (response.status === 401) {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        alert('Unauthorized: Invalid credentials. Please try again.');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
