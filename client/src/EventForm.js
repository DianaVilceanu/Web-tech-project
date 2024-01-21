import React, { useState } from 'react';
import axios from 'axios';

function EventForm() {
  // State for form data
  const [formData, setFormData] = useState({
    eventName: '',
    startTime: '',
    endTime: '',
    accessCode: '',
    state: ''
  });

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // ... existing functions

  const validateForm = () => {
    let isValid = true;
    // Check if all required fields are filled
    Object.values(formData).forEach(value => {
      if (!value) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      // If the form is valid, set isFormSubmitted to true
      setIsFormSubmitted(true);
      // Make a POST request to the '/events' endpoint with the form data
      axios.post('http://localhost:5001/events', formData)
        .then(response => {
          // Handle the response from the server
          console.log(response.data);
        })
        .catch(error => {
          // Handle the error
          console.error(error);
        });
    } else {
      // Handle the case where the form is not valid
      alert("Please fill in all the fields.");
    }
  };
  
  return (
    <div className="App">
      {/* ... other component JSX */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Event Name</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
          />
          {errors.eventName && <div className="error">{errors.eventName}</div>}
        </div>

        <div>
          <label>Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
          />
          {errors.startTime && <div className="error">{errors.startTime}</div>}
        </div>

        <div>
          <label>End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
          />
          {errors.endTime && <div className="error">{errors.endTime}</div>}
        </div>

        <div>
          <label>Access Code</label>
          <input
            type="text"
            name="accessCode"
            value={formData.accessCode}
            onChange={handleChange}
          />
          {errors.accessCode && <div className="error">{errors.accessCode}</div>}
        </div>

        <div>
          <label>State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
          >
            <option value="">Select State</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
          {errors.state && <div className="error">{errors.state}</div>}
        </div>

        <button type="submit">Submit</button>
      </form>
      {/* ... other component JSX */}
    </div>
  );
}

export default EventForm;
