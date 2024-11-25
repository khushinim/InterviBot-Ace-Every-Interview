import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';

const AiInterview = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [aiAvatarUrl, setAiAvatarUrl] = useState('https://raw.githubusercontent.com/khushinim/InterviBot-Ace-Every-Interview/main/avatarimg.png');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [faceDetectionError, setFaceDetectionError] = useState(''); // New state for error message
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experience, setExperience] = useState('');
  const webcamRef = useRef(null);

  useEffect(() => {
    // Start timer
    const interval = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Capture image and detect emotion at regular intervals
  const captureEmotion = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      try {
        const response = await axios.post('http://localhost:5001/detect-emotion', {
          image: imageSrc.split(',')[1],
        });

        if (response.data.emotion) {
          setDetectedEmotion(response.data.emotion);
          setFaceDetectionError(''); // Clear error message if emotion is detected
        } else {
          setDetectedEmotion('');
          setFaceDetectionError('No face detected in the image'); // Set error message
        }
      } catch (error) {
        console.error('Error detecting emotion:', error);
        setFaceDetectionError('Error detecting emotion'); // Handle any errors
      }
    }
  };

  // Call captureEmotion every 1 second
  useEffect(() => {
    const emotionInterval = setInterval(() => {
      captureEmotion();
    }, 1000); // Adjust the interval for real-time detection

    return () => clearInterval(emotionInterval); // Cleanup on unmount
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    // Get job details from localStorage
    const savedJobTitle = localStorage.getItem('jobTitle');
    const savedJobDescription = localStorage.getItem('jobDescription');
    const savedExperience = localStorage.getItem('experience');

    setJobTitle(savedJobTitle);
    setJobDescription(savedJobDescription);
    setExperience(savedExperience);

    // Call the API to generate interview questions based on job details
    const generateQuestions = async () => {
      try {
        const response = await axios.post('http://localhost:5000/interview/generate-question', {
          jobTitle: savedJobTitle,
          jobDescription: savedJobDescription,
          experience: savedExperience,
        });
        setQuestions([response.data.question]); // Save the question to state
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQuestions();
  }, []);

  const handleAnswerSubmit = () => {
    setUserAnswer('');
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Function to make the avatar speak the current question
  const speakQuestion = () => {
    if (!currentQuestion) return;

    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === 'Google UK English Male'); // Example of selecting a voice
    utterance.pitch = 1; // Set pitch (0 to 2)
    utterance.rate = 1; // Set rate (0.1 to 10)
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentQuestion && !loading) {
      speakQuestion();
    }
  }, [currentQuestion, loading]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>AI Interview</h2>
      <div style={styles.videoContainer}>
        <div style={styles.videoBox}>
          <img src={aiAvatarUrl} alt="AI Avatar" style={styles.avatar} />
        </div>
        <div style={styles.videoBox}>
          <Webcam
            audio={!isMuted}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: isCameraOff ? 'environment' : 'user',
            }}
            style={styles.webcam}
            ref={webcamRef}
          />
          <div style={styles.timer}>{formatTime(timer)}</div>
        </div>
      </div>
      {detectedEmotion && (
        <div style={styles.emotion}>
          Detected Emotion: <span style={styles.emotionHighlight}>{detectedEmotion}</span>
        </div>
      )}
      {faceDetectionError && (
        <div style={styles.faceDetectionMessage}>{faceDetectionError}</div>
      )}
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button style={styles.button} onClick={() => setIsCameraOff(!isCameraOff)}>
          {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>
      </div>
      <div>
        {/* Display Avatar and Question */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <p>{currentQuestion}</p>
          </div>
        </div>
        {/* User Input for Answer */}
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
          style={{ padding: '8px', fontSize: '1em', width: '100%' }}
        />

        {/* Submit Button */}
        <button
          onClick={handleAnswerSubmit}
          disabled={!userAnswer}
          style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#4447AF', color: 'white', borderRadius: '10px', marginTop: '10px' }}
        >
          Next Question
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, #E0D7FF, #F8E3DF)',
    height: '100vh',
  },
  heading: { fontSize: '28px', fontWeight: '600', color: '#333' },
  videoContainer: { display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' },
  videoBox: {
    position: 'relative',
    width: '300px',
    height: '300px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ddd',
  },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  webcam: { width: '100%', height: '100%' },
  timer: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '14px',
  },
  emotion: { fontSize: '24px', fontWeight: '500', color: '#333' },
  emotionHighlight: { fontWeight: 'bold', fontSize: '28px', color: '#FF6347' },
  faceDetectionMessage: { fontSize: '24px', fontWeight: '500', color: '#FF6347' }, // Style for error message
  buttonContainer: { display: 'flex', gap: '10px' },
  button: {
    padding: '10px 15px',
    cursor: 'pointer',
    backgroundColor: '#4447AF',
    color: 'white',
    borderRadius: '10px',
  },
};

export default AiInterview;
