const express = require('express');
const QRCode = require('qrcode');
const app = express();

app.use(express.json()); // for parsing application/json

// Temporary storage (Replace with database in production)
let events = [];

// Get all events
app.get('/events', (req, res) => {
    res.json(events);
});

// Create an event
app.post('/events', (req, res) => {
    const newEvent = {
        name: req.body.name,
        date: req.body.date,
        state: 'CLOSED',
        attendees: []
    };
    events.push(newEvent);
    res.json({ message: 'Event created', event: newEvent });
});

// Generate QR code for an event
app.get('/eventQRCode', (req, res) => {
    const eventCode = req.query.eventCode;
    QRCode.toDataURL(eventCode, function (err, url) {
        if (err) res.status(500).send("Error generating QR code");
        else res.json({ qrCode: url });
    });
});

// Mark attendance
app.post('/attendance', (req, res) => {
    const { eventName, participantName } = req.body;
    const event = events.find(e => e.name === eventName);
    if (event && event.state === 'OPEN') {
        event.attendees.push({ name: participantName, time: new Date() });
        res.json({ message: 'Attendance marked' });
    } else {
        res.status(400).send('Event not found or not open');
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
