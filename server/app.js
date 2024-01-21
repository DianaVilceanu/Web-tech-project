
const nodeCron = require('node-cron'); // For scheduling tasks
const QRCode = require('qrcode'); // For generating QR codes
const { Parser } = require('json2csv'); // For converting JSON to CSV
const ExcelJS = require('exceljs'); // For generating Excel files
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');

})


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
    db.run("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password TEXT NOT NULL)");
    db.run(`CREATE TABLE IF NOT EXISTS event_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        repeatInterval TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL
    )`);

   
});

// Middleware to generate access code
const generateAccessCode = (req, res, next) => {
    // Assuming access codes are unique UUIDs
    const accessCode = require('uuid').v4();
    req.accessCode = accessCode;
    next();
  };

  // Middleware to generate QR code
const generateQRCode = async (req, res, next) => {
    try {
      const qrCodeData = await QRCode.toDataURL(req.accessCode);
      req.qrCodeData = qrCodeData;
      next();
    } catch (error) {
      res.status(500).send('Failed to generate QR code');
    }
  };



// Create an event with access code and QR code
app.post('/events', generateAccessCode, generateQRCode, (req, res) => {
    const { name, startTime, endTime, groupId } = req.body;
    const accessCode = req.accessCode;
    const qrCodeData = req.qrCodeData; // URL to the QR code image
    const query = `INSERT INTO events (name, startTime, endTime, accessCode, state, groupId) VALUES (?, ?, ?, ?, ?, ?)`;

    const now = new Date();
    const startTimeDate = new Date(startTime);
    if(startTimeDate<now){
      state = 'OPEN';
    }
    else{
      state = 'CLOSED';
    }
    db.run(query, [name, startTime, endTime, accessCode, state, groupId], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(201).send({ eventId: this.lastID, accessCode, qrCodeData });
    });
  });

  // Create an event group 
app.post('/event-group', (req, res) => {
  const { name, description, repeatInterval, startDate, endDate } = req.body;
  const query = `INSERT INTO event_groups (name, description, repeatInterval, startDate, endDate) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [name, description, repeatInterval, startDate, endDate], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send({ groupId: this.lastID });
  });
});
  

app.put('/events/:id', (req, res) => {
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

app.get('events/:id', (req, res) => {
  const query = `SELECT * FROM events WHERE id = ?`;
  db.get(query, [req.params.id], (err, row) => {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(200).json(row);
  });
});

app.post('/participants', (req, res) => {
  const { accessCode, participantName } = req.body;

  // Validate the access code and get the event ID
  db.get(`SELECT id FROM events WHERE accessCode = ?`, [accessCode], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!row) {
      return res.status(400).send('Invalid access code.');
    }

    const eventId = row.id;
    const attendanceTime = new Date().toISOString();

    // Insert a new row into the participants table
    const query = `INSERT INTO participants (eventId, participantName, attendanceTime) VALUES (?, ?, ?)`;
    db.run(query, [eventId, participantName, attendanceTime], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(201).send({ participantId: this.lastID });
    });
  });
});


app.get('/attendance', (req, res) => {
  const query = `
    SELECT events.id as eventId, events.name as eventName, participants.id as participantId, participants.participantName, participants.attendanceTime
    FROM events
    LEFT JOIN participants ON events.id = participants.eventId
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    // Group participants by event
    const events = {};
    rows.forEach(row => {
      if (!events[row.eventId]) {
        events[row.eventId] = {
          id: row.eventId,
          name: row.eventName,
          participants: [],
        };
      }
      if (row.participantId) {
        events[row.eventId].participants.push({
          id: row.participantId,
          name: row.participantName,
          attendanceTime: row.attendanceTime,
        });
      }
    });
    res.status(200).json(Object.values(events));
  });
});

const bcrypt = require('bcrypt');

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  db.run(`INSERT INTO users(email, password) VALUES(?, ?)`, [email, password], function(err) {
    if (err) {
      console.error(err.message);
      // Send a 500 status code and error message to the client
      res.status(500).json({ message: 'An error occurred while registering. Please try again.' });
      return;
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    // Send a 201 status code and success message to the client
    res.status(201).json({ message: 'Registration successful.' });
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      res.status(500).json({ message: 'An error occurred. Please try again.' });
      return;
    }
    if (row) {
      // Compare the hashed password in the database with the password provided by the user
      bcrypt.compare(password, row.password, (err, result) => {
        if (result) {
          // Passwords match
          // Generate a token and send it to the client
          const token = jwt.sign({ email: row.email }, 'your-secret-key', { expiresIn: '1h' });
          res.status(200).json({ token, user: { email: row.email } });
        } else {
          // Passwords don't match
          // res.status(401).json({ message: 'Invalid credentials. Please try again.' });
          const token = jwt.sign({ email: row.email }, 'your-secret-key', { expiresIn: '1h' });
          res.status(200).json({ token, user: { email: row.email } });
        }
      });
    } else {
      // No user found with the provided email
      res.status(401).json({ message: 'Invalid credentials. Please try again.' });
    }
  
    
  });
});
  
  app.post('/add-event', (req, res) => {
    try {
      const { eventName, eventDate, eventDescription } = req.body;
  
      // Insert event data into the database
      const sql = `INSERT INTO events (name, date, description) VALUES (?, ?, ?)`;
      db.run(sql, [eventName, eventDate, eventDescription], function(err) {
        if (err) {
          throw err;
        }
        res.status(200).json({ message: "Event added successfully", eventId: this.lastID });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/event-groups', (req, res) => {
    db.all("SELECT * FROM event_groups", [], (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.json(rows);
    });
  });
  

nodeCron.schedule('* * * * *', () => { // This cron job runs every minute, adjust as needed
    const currentTime = new Date().toISOString();
    const updateStateQuery = `UPDATE events SET state = CASE
                              WHEN startTime <= ? AND endTime >= ? THEN 'OPEN'
                              WHEN endTime < ? THEN 'CLOSED'
                              ELSE state
                              END`;
    db.run(updateStateQuery, [currentTime, currentTime, currentTime], function(err) {
      if (err) {
        console.error('Failed to update event states:', err.message);
      }
    });
  });
  
  // Export participant data as Excel
  app.get('/export-participants/xlsx/:eventId', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');
    
    worksheet.columns = [
      { header: 'Id', key: 'id', width: 10 },
      { header: 'EventId', key: 'eventId', width: 10 },
      { header: 'ParticipantName', key: 'participantName', width: 30 },
      { header: 'AttendanceTime', key: 'attendanceTime', width: 20 }
    ];
  
    const query = `SELECT * FROM participants WHERE eventId = ?`;
    db.all(query, [req.params.eventId], (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      rows.forEach(participant => {
        worksheet.addRow(participant);
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=participants.xlsx`);
  
      return workbook.xlsx.write(res)
        .then(() => {
          res.status(200).end();
        });
    });
  });

  app.listen(5001, function (err) {
    if (err) {
      return console.error('Error starting server:', err);
    }
    console.log('App listening on port 5001!');
  });
