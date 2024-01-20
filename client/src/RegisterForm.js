import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  if (password !== confirmPassword) {
    alert("Passwords don't match");
    return;
  }
  try {
    const response = await axios.post('http://localhost:5001/register', { email, password });
    if (response.status === 201) {
      localStorage.setItem('userToken', response.data.token);
      window.location.href = '/home';
    } else {
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'Network Error' || error.message.includes('ERR_CONNECTION_REFUSED')) {
      alert('Cannot connect to the server. Please try again later.');
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
      <input 
        type="password" 
        placeholder="Confirm Password" 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;