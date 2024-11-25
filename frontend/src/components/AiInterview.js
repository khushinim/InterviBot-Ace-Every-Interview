import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { MdVolumeOff, MdVolumeUp, MdVideocam, MdVideocamOff } from 'react-icons/md';
import { FaRegCircle, FaStopCircle } from 'react-icons/fa'; 

const AiInterview = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [aiAvatarUrl, setAiAvatarUrl] = useState('https://raw.githubusercontent.com/khushinim/InterviBot-Ace-Every-Interview/main/avatarimg.png');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [faceDetectionError, setFaceDetectionError] = useState(''); // New state for error message
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [question, setQuestion] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isIntroductionDone, setIsIntroductionDone] = useState(false);
  const [interviewInProgress, setInterviewInProgress] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null); // Store the recorded audio
  const mediaRecorderRef = useRef(null); // Reference for media recorder
  const [isRecording, setIsRecording] = useState(false);
  const webcamRef = useRef(null);
  const [speechText, setSpeechText] = useState('');

  // Speech recognition setup (Speech-to-Text)
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript;
    setSpeechText(transcript);
  };

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
        setQuestion("Please introduce yourself.");
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQuestions();
  }, []);

  const handleUserResponse = async () => {
    // Send the audio blob for NLP processing and follow-up questions
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await axios.post('/api/generate-question', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { followUp, nextQuestion } = response.data;
      setFollowUpQuestion(followUp);
      setQuestion(nextQuestion);
      setAudioBlob(null); // Reset the audio blob
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

  const handleIntroduction = () => {
    // Start the interview after introduction is given
    setIsIntroductionDone(true);
    setQuestion("Thank you for your introduction! Let's move on to the questions.");
  };

  // Function to make the avatar speak the current question
  const speakQuestion = () => {
    if (!question) return;

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === 'Google UK English Male');
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (question && !loading) {
      speakQuestion();
    }
  }, [question, loading]);

  const startRecording = () => {
    setIsRecording(true);
    mediaRecorderRef.current.start();
    recognition.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    recognition.stop(); // Stop speech-to-text
    setIsRecording(false);
  };

  const handleDataAvailable = (event) => {
    const recordedAudio = event.data;
    setAudioBlob(recordedAudio); // Store the recorded audio
  };

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      });
    }
  }, []);

  const handleSubmit = () => {
    const userAnswer = speechText || answer; // Combine typed and speech-to-text answer
    console.log("User Answer: ", userAnswer);
    // Further processing (e.g., sending answer to backend or generating follow-up questions)
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>AI Interview</h2>
      <div style={styles.videoContainer}>
        <div style={styles.videoBox}>
          <img src={aiAvatarUrl} alt="AI Avatar" style={styles.avatar} />
        </div>
        <div style={styles.videoBox}>
          {isCameraOff ? (
            <div style={styles.cameraOff}>
              Your Camera is off
            </div>
        ) : (
          <Webcam
            audio={!isMuted}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: 'user',
            }}
            style={styles.webcam}
            ref={webcamRef}
          />
          )}
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
          <button
              style={{ ...styles.button, backgroundColor: isMuted ? '#CC1C0F' : '#129818' }}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MdVolumeOff size={24} color="white" /> : <MdVolumeUp size={24} color="white" />}
          </button>

          <button
              style={{ ...styles.button, backgroundColor: isCameraOff ? '#CC1C0F' : '#129818' }}
              onClick={() => setIsCameraOff(!isCameraOff)}
            >
              {isCameraOff ? <MdVideocamOff size={24} color="white" /> : <MdVideocam size={24} color="white" />}
          </button>
      </div>

      <div>
        {/* Display Avatar and Question */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <p>{question}</p>
          </div>
        </div>

        {/* Answer input area */}
      <div style={styles.answerContainer}>
        <textarea
          placeholder="Type your answer here..."
          value={speechText || answer} // Either typed answer or real-time speech-to-text
          onChange={(e) => setAnswer(e.target.value)}
          style={styles.textarea}
        />
      </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Record/Stop Button */}
          <div>
          {isRecording ? (
            <button onClick={stopRecording} style={{ ...styles.button, backgroundColor: '#CC1C0F' }}>
              <FaStopCircle size={24} color="white" /> Stop Recording
            </button>
          ) : (
            <button onClick={startRecording} style={{ ...styles.button, backgroundColor: '#129818' }}>
              <FaRegCircle size={24} color="white" /> Start Recording
            </button>
          )}
        </div>

          {/* Submit Button */}
          <button
            onClick= {handleSubmit}
            disabled={!audioBlob} // Disable until audio is recorded
            style={styles.button}
          >
            Submit Answer
          </button>
        </div>  
      </div>
    </div>
  );
};

const styles = {
  cameraOff: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '15px',
    fontWeight: 'bold',
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '30px',
    background: 'linear-gradient(135deg, #E0D7FF, #F8E3DF)',
    height: '100%',
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

  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    resize: 'none',
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
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
};

export default AiInterview;
