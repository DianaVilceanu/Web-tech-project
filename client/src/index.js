// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Your global styles
import App from './App'; // Importing App which uses EventForm

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
