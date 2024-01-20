// index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Your global styles
import App from './App'; // Importing App which uses EventForm

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);