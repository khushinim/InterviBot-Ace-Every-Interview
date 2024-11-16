import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';

const AiInterview = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [aiAvatarUrl, setAiAvatarUrl] = useState('');
  const [webcamData, setWebcamData] = useState(null);
  const [speechData, setSpeechData] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState(''); // Emotion state

  const webcamRef = useRef(null);

  // Function to capture image from webcam
  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot(); // Capture image from webcam
    
    // Send captured image to backend for emotion detection
    const response = await fetch('http://localhost:5001/detect-emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageSrc.split(',')[1] }), // Send base64 image data
    });
    
    const result = await response.json();
    setDetectedEmotion(result.emotion); // Set the detected emotion in state
  };

  useEffect(() => {
    // Fetch jobTitle and jobDescription from localStorage
    const savedJobTitle = localStorage.getItem('jobTitle');
    const savedJobDescription = localStorage.getItem('jobDescription');

    if (savedJobTitle && savedJobDescription) {
      setJobTitle(savedJobTitle);
      setJobDescription(savedJobDescription);
      generateInterviewQuestions(savedJobTitle, savedJobDescription);
    }

    const generateQuestions = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:5000/generate-questions', {
          jobTitle: jobTitle,
          jobDescription: jobDescription,
        });
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error generating questions:', error);
      }
    };

    // Fetch AI Avatar image
    const fetchAiAvatar = async () => {
      try {
        const response = await fetch('https://randomuser.me/api/');
        const data = await response.json();
        setAiAvatarUrl(data.results[0].picture.large);
      } catch (error) {
        console.error('Error fetching AI avatar:', error);
      }
    };

    fetchAiAvatar();

    // Start the timer
    const id = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
    }, 1000);
    setIntervalId(id);

    return () => clearInterval(id); // Cleanup timer interval on unmount
  }, []);

  const generateInterviewQuestions = (title, description) => {
    // Simulate an AI-driven question generation based on job title and description
    const generatedQuestions = [
      `What are the main responsibilities of a ${title}?`,
      `How do you prioritize tasks as a ${title}?`,
      `Can you describe a challenging project related to ${title} you've worked on?`
    ];
    setQuestions(generatedQuestions);
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
  };

  // Capture webcam image
  const captureWebcamImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setWebcamData(imageSrc);
      sendImageToBackend(imageSrc);
    }
  };

  // Send image to backend for face analysis
  const sendImageToBackend = async (imageSrc) => {
    try {
      const response = await axios.post('http://localhost:5000/analyze-face', { image: imageSrc });
      console.log('Emotion:', response.data.emotion);
    } catch (error) {
      console.error('Error sending image to backend:', error);
    }
  };

  // Send speech data to backend for analysis
  const sendTextToBackend = async (text) => {
    try {
      const response = await axios.post('http://localhost:5000/analyze-speech', { text });
      console.log('Speech Feedback:', response.data.feedback);
    } catch (error) {
      console.error('Error sending speech to backend:', error);
    }
  };

  // Stop timer when leaving the page
  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Format timer time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #E0D7FF, #F8E3DF)',
    padding: '20px',
    flexDirection: 'column',
    gap: '20px',
  };

  const videoContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: '20px',
  };

  const videoBoxStyle = {
    position: 'relative',
    width: '100%',
    height: '84%',
    maxWidth: '500px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ddd',
  };

  const aiAvatarStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const userWebcamStyle = {
    width: '100%',
    height: '100%',
  };

  const timerStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '10px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.2s',
    outline: 'none',
  };

  const muteButtonStyle = {
    ...buttonStyle,
    backgroundColor: isMuted ? '#e74c3c' : '#3498db',
    color: '#fff',
  };

  const cameraButtonStyle = {
    ...buttonStyle,
    backgroundColor: isCameraOff ? '#e74c3c' : '#3498db',
    color: '#fff',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>AI Interview</h2>
      <div style={videoContainerStyle}>
        <div style={videoBoxStyle}>
          {aiAvatarUrl ? (
            <img src={aiAvatarUrl} alt="AI Avatar" style={aiAvatarStyle} />
          ) : (
            <p>Loading AI avatar...</p>
          )}
        </div>
        <div style={videoBoxStyle}>
          <Webcam
            audio={!isMuted}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: isCameraOff ? 'environment' : 'user',
            }}
            style={userWebcamStyle}
            ref={webcamRef}
          />
          <div style={timerStyle}>{formatTime(timer)}</div>
        </div>
      </div>

      {/* Display the detected emotion */}
      {detectedEmotion && (
        <div style={{ fontSize: '24px', fontWeight: '500', color: '#333', marginTop: '20px' }}>
          Detected Emotion: <span style={{ fontWeight: 'bold', fontSize: '28px', color: '#FF6347' }}>{detectedEmotion}</span>
        </div>
      )}

      <div style={buttonContainerStyle}>
        <button style={muteButtonStyle} onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button style={cameraButtonStyle} onClick={toggleCamera}>
          {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>
      </div>
      <button style={buttonStyle} onClick={captureImage}>Capture Image for Emotion</button>
    </div>
  );
};

export default AiInterview;
