import React, { useState } from 'react';
import axios from 'axios';

const EventGroupForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repeatInterval, setRepeatInterval] = useState('none');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/event-group', {
        name,
        description,
        repeatInterval,
        startDate,
        endDate
      });
      // Handle response here, such as clearing the form or showing a success message
      console.log(response.data);
    } catch (error) {
      // Handle error here, such as showing an error message
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Event Group</h2>
      <div>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      </div>
      <div>
      <label>
        Description:
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      </div>
      <div>
      <label>
        Repeat Interval:
        <select value={repeatInterval} onChange={(e) => setRepeatInterval(e.target.value)}>
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      </div>
      <div>
      <label>
        Start Date:
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      </div>
      <div>
      <label>
        End Date:
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </label>
      </div>
      <div>
      <button type="submit">Create Group</button>
      </div>
    </form>
  );
};

export default EventGroupForm;
