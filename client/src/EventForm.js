import React, { useState } from 'react';
import axios from 'axios';

function EventForm() {
    // Add state for new fields
const [startTime, setStartTime] = useState('');
const [endTime, setEndTime] = useState('');
const [eventState, setEventState] = useState('');
const [eventName, setEventName] = useState('');
const [eventDate, setEventDate] = useState('');

    // Update handleSubmit
const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = {
        name: eventName, 
        date: eventDate,
        startTime, 
        endTime, 
        state: eventState
    };
    try {
        const response = await axios.post('/events', eventData);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
};

// Update your form

    return (
        <form onSubmit={handleSubmit}>
            {/* Existing Inputs for eventName and eventDate */}
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            <select value={eventState} onChange={(e) => setEventState(e.target.value)} required>
                <option value="">Select State</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
            </select>
            <button type="submit">Create Event</button>
        </form>
    );
}






export default EventForm;
