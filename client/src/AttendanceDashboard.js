import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExportParticipantsButton from './ExportParticipantsButton'; // Import the component

const AttendanceDashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5001/attendance`)
      .then(response => {
        setEvents(response.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {events.map(event => (
        <div key={event.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <h2>{event.name} (ID: {event.id})</h2>
          <h3>Participants:</h3>
          <ul>
            {event.participants.map(participant => (
              <li key={participant.id}>{participant.name} - {participant.attendanceTime}</li>
            ))}
          </ul>
          <ExportParticipantsButton eventId={event.id} format='xlsx' /> {/* Add the export button */}
        </div>
      ))}
    </div>
  );
};

export default AttendanceDashboard;