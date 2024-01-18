// App.js
import React from 'react';
import EventForm from './EventForm';
import './App.css'; // Assuming you have styling in App.css

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can add a header here */}
        <h1>Attendance Monitoring System</h1>
      </header>
      <main>
        <EventForm />
        {/* Other components will also go here */}
      </main>
    </div>
  );
}

export default App;

