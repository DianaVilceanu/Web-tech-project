import React from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const ExportParticipantsButton = ({ eventId, format = 'xlsx' }) => {
  const exportParticipants = () => {
    axios.get(`http://localhost:5001/export-participants/${format}/${eventId}`, {
      responseType: 'blob', // Important
    })
    .then((response) => {
      saveAs(new Blob([response.data]), `participants.${format}`);
    })
    .catch(console.error);
  };

  return (
    <button onClick={exportParticipants}>Export Participants</button>
  );
};

export default ExportParticipantsButton;