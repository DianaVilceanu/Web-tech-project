// app.js
const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./attendance.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the attendance database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        accessCode TEXT NOT NULL,
        state TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        participantName TEXT NOT NULL,
        attendanceTime TEXT NOT NULL,
        FOREIGN KEY (eventId) REFERENCES events (id)
    )`);
});

app.post('/api/events', (req, res) => {
  const { name, startTime, endTime, accessCode, state } = req.body;
  const query = `INSERT INTO events (name, startTime, endTime, accessCode, state) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [name, startTime, endTime, accessCode, state], function(err) {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(201).send({ eventId: this.lastID });
  });
});

app.put('/api/events/:id', (req, res) => {
  const { name, startTime, endTime, accessCode, state } = req.body;
  const query = `UPDATE events SET name = ?, startTime = ?, endTime = ?, accessCode = ?, state = ? WHERE id = ?`;
  db.run(query, [name, startTime, endTime, accessCode, state, req.params.id], function(err) {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(200).send({ updatedId: this.changes });
  });
});

app.get('/api/events/:id', (req, res) => {
  const query = `SELECT * FROM events WHERE id = ?`;
  db.get(query, [req.params.id], (err, row) => {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(200).json(row);
  });
});
app.post('/api/attendance', (req, res) => {
  const { eventId, participantName, attendanceTime } = req.body;
  const query = `INSERT INTO participants (eventId, participantName, attendanceTime) VALUES (?, ?, ?)`;
  db.run(query, [eventId, participantName, attendanceTime], function(err) {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(201).send({ participantId: this.lastID });
  });
});

app.get('/api/attendance/:eventId', (req, res) => {
  const query = `SELECT * FROM participants WHERE eventId = ?`;
  db.all(query, [req.params.eventId], (err, rows) => {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(200).json(rows);
  });
});

