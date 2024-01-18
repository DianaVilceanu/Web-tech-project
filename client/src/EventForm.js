import React, { useState } from 'react';
import axios from 'axios';

function EventForm() {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/createEvent', { name: eventName, date: eventDate });
            console.log(response.data); // Handle the response as needed
        } catch (error) {
            console.error('Error creating event:', error);
            // Handle errors (e.g., display error message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={eventName} 
                onChange={(e) => setEventName(e.target.value)} 
                placeholder="Event Name" 
                required 
            />
            <input 
                type="date" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                required 
            />
            <button type="submit">Create Event</button>
        </form>
    );
}

export default EventForm;
