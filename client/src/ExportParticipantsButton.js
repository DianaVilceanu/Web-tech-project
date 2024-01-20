const ExportParticipantsButton = ({ eventId, format }) => {
    const handleExport = async () => {
      const response = await axios.get(`http://localhost:5001/export-participants/${format}/${eventId}`, {
        responseType: 'blob' // Important for files
      });
      // Create a URL for the blob
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      // Create a link to download it
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', `participants.${format}`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.parentNode.removeChild(fileLink); // Clean up
    };
  
    return (
      <button onClick={handleExport}>Export as {format.toUpperCase()}</button>
    );
  };
  