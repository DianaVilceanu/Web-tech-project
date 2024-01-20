
const nodeCron = require('node-cron'); // For scheduling tasks
const QRCode = require('qrcode'); // For generating QR codes
const { Parser } = require('json2csv'); // For converting JSON to CSV
const ExcelJS = require('exceljs'); // For generating Excel files

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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
    const { name, startTime, endTime, state, groupId } = req.body;
    const accessCode = req.accessCode;
    const qrCodeData = req.qrCodeData; // URL to the QR code image
    const query = `INSERT INTO events (id, name, description, repeatInterval, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, startTime, endTime, accessCode, state, groupId], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(201).send({ eventId: this.lastID, accessCode, qrCodeData });
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
app.post('/attendance', (req, res) => {
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

app.get('/attendance/:eventId', (req, res) => {
  const query = `SELECT * FROM participants WHERE eventId = ?`;
  db.all(query, [req.params.eventId], (err, rows) => {
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      res.status(200).json(rows);
  });
});
const bcrypt = require('bcrypt');


app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    // Insert into the database
    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(sql, [email, hashedPassword], function(err) {
      if (err) {
        throw err;
      }
      res.status(200).json({ message: "User registered successfully", userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Retrieve user from database and verify password
      const sql = `SELECT * FROM users WHERE email = ?`;
      db.get(sql, [email], async (err, user) => {
        if (err) {
          throw err;
        }
        if (user && await bcrypt.compare(password, user.password)) {
          // On success, create a session or token
          res.status(200).json({ message: "Login successful", userId: user.id });
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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
  
  // Export participant data as CSV
  app.get('/export-participants/csv/:eventId', (req, res) => {
    const query = `SELECT * FROM participants WHERE eventId = ?`;
    db.all(query, [req.params.eventId], (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(rows);
      res.header('Content-Type', 'text/csv');
      res.attachment('participants.csv');
      return res.send(csv);
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

  app.listen(5001, function () {
    console.log('App listening on port 5001!');
  });
