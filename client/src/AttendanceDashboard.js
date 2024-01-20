import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceDashboard = ({ eventId }) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      axios.get(`http://localhost:5001/attendance/${eventId}`)
        .then(response => {
          setParticipants(response.data);
        })
        .catch(console.error);
    }, 5000); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [eventId]);

  return (
    <div>
      <h2>Attendance List</h2>
      <ul>
        {participants.map(participant => (
          <li key={participant.id}>{participant.participantName} - {participant.attendanceTime}</li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceDashboard;
