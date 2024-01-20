import React, { useState } from 'react';
import axios from 'axios';

const ParticipantForm = () => {
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // The endpoint and method for confirming attendance would depend on your backend API
      await axios.post('http://localhost:5000/confirm-attendance', { accessCode });
      setMessage('Attendance confirmed. Thank you!');
    } catch (error) {
      setMessage('Error confirming attendance. Please try again.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Confirm Attendance</h2>
      <label>
        Access Code:
        <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
      </label>
      <button type="submit">Confirm</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ParticipantForm;
