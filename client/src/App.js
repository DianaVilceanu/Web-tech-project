import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from './Loginform';
import RegisterForm from './RegisterForm';
import EventForm from './EventForm';
import EventGroupForm from './EventGroupForm';
import ParticipantForm from './ParticipantForm';
import AttendanceDashboard from './AttendanceDashboard';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Assuming you have styling in App.css

function App() {

  const [eventGroups, setEventGroups] = useState([]);

  useEffect(() => {
    const fetchEventGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5001');
        setEventGroups(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEventGroups();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Attendance Monitoring System</h1>
      </header>
      <main>
        <Router>
          <Routes>
          <Route path="api/admin/event-group" element={<EventGroupForm />} />
          <Route path="api/admin/event" element={<EventForm />} />
          <Route path="api/admin/dashboard" element={<AttendanceDashboard />} />
          <Route path="api/participant" element={<ParticipantForm />} />
          <Route path="/api/login" element={<LoginForm />} />
          <Route path="api/register" element={<RegisterForm />} />
        </Routes>
          <Link to="api/login">
            <button>Login</button>
          </Link>
          <Link to="api/register">
            <button>Register</button>
          </Link>
        </Router>
      </main>
    </div>
  );
}

export default App;