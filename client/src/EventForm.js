import React, { useState } from 'react';
import axios from 'axios';

function EventForm() {
  // State for form data
  const [formData, setFormData] = useState({
    name: '', // Initial value for 'name'
    startTime: '', // Initial value for 'startTime'
    endTime: '', // Initial value for 'endTime'
    groupId: '', // Initial value for 'groupId'
  });
  // State for form validation errors
  const [errors, setErrors] = useState({});
  const [qrCodeData, setQrCodeData] = useState(null);

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
          // Save the QR code data in the state
          setQrCodeData(response.data.qrCodeData);
        })
        .catch(error => {
          console.error(error.response.data);
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
            name="name" // Changed from "eventName"
            value={formData.name} // Changed from "formData.eventName"
            onChange={handleChange}
          />
          {errors.eventName && <div className="error">{errors.eventName}</div>}
        </div>

        <div>
          <label>Start Time</label>
            <input
            type="datetime-local"
            name="startTime" // No change
            value={formData.startTime}
            onChange={handleChange}
          />
          {errors.startTime && <div className="error">{errors.startTime}</div>}
        </div>

        <div>
          <label>End Time</label>
                    <input
            type="datetime-local"
            name="endTime" // No change
            value={formData.endTime}
            onChange={handleChange}
          />
          {errors.endTime && <div className="error">{errors.endTime}</div>}
        </div>
          
        <label>Group id</label>
        <input
          type="text"
          name="groupId" // Add this field
          value={formData.groupId} // Add this field
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
         {/* Display the QR code */}
    {qrCodeData && <img src={qrCodeData} alt="QR Code" />}
      </form>
    </div>
  );
}

export default EventForm;
