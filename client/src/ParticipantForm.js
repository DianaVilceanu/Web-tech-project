import React, { useState } from 'react';
import axios from 'axios';

const ParticipantForm = () => {
  const [accessCode, setAccessCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5001/participants', { accessCode, participantName });
      setMessage('Attendance confirmed. Thank you!');
    } catch (error) {
      setMessage('Error confirming attendance. Please try again.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2> Confirm Attendance </h2>
      <label>
        Name: 
        <div>
        <input type="text" value={participantName} onChange={(e) => setParticipantName(e.target.value)} />
        </div>
      </label>
      <label>
        Access Code: 
        <div>
        <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
        </div>
      </label>
      
      <button type="submit">Confirm</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ParticipantForm;