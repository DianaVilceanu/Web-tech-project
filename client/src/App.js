// App.js
import React from 'react';
import EventForm from './EventForm';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './App.css'; // Assuming you have styling in App.css
import LoginForm from './Loginform';
import RegisterForm from './RegisterForm';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can add a header here */}
        <h1>Attendance Monitoring System</h1>
      </header>
      <main>
        { <Router>
          <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/event" element={<EventForm />} />  
        </Routes>
        
        <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </Router>
}
      </main>
        
    </div>
  );
}


export default App;



