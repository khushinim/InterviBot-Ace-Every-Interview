import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { MdVolumeOff, MdVolumeUp, MdVideocam, MdVideocamOff } from 'react-icons/md';
import { FaRegCircle, FaStopCircle } from 'react-icons/fa'; 
import { SentimentIntensityAnalyzer } from 'vader-sentiment';

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
  const recognitionRef = useRef(null);
  const [speechText, setSpeechText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [feedback, setFeedback] = useState('');
  

  //speech analysis function
  const analyzeTone = (answer) => {
    const result = SentimentIntensityAnalyzer.polarity_scores(answer);
    let toneFeedback = 'Tone Analysis: ';

    // Compound score thresholds for tone analysis
    const negations = ['don\'t', 'no', 'never', 'not', 'without'];
  const containsNegation = negations.some(negation => answer.toLowerCase().includes(negation));

  if (containsNegation && result.compound > 0) {
    // If a negation is found but the compound score is positive, adjust to negative
    toneFeedback += 'Your tone is negative. Try to frame your responses more positively, avoiding negative phrasing like "don\'t" or "not".';
  } else if (result.compound >= 0.5) {
    toneFeedback += 'Your tone is very positive and confident.';
  } else if (result.compound >= 0.2 && result.compound < 0.5) {
    toneFeedback += 'Your tone is somewhat positive.';
  } else if (result.compound <= -0.3) {
    toneFeedback += 'Your tone is negative. Try to be more positive and optimistic.';
  } else if (result.compound < -0.2 && result.compound >= -0.3) {
    toneFeedback += 'Your tone seems somewhat negative. Consider framing your answer more positively.';
  } else {
    toneFeedback += 'Your tone is neutral. Consider being more engaging.';
  }
  
    return toneFeedback;
  };

  const analyzePaceAndClarity = (text) => {
    const fillerWords = ['um', 'ah', 'like', 'you know'];
    const wordCount = text.split(' ').length;
    const fillerWordCount = fillerWords.reduce((count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);
    
    let feedback = `Pace and Clarity: Your answer has ${wordCount} words.`;
    
    if (fillerWordCount > 3) {
      feedback += ` Try to avoid using too many filler words like 'um' or 'ah'.`;
    }

    if (wordCount < 50) {
      feedback += ' Your answer seems too short. Try elaborating more.';
    } else if (wordCount > 150) {
      feedback += ' Your answer is a bit long; try to keep it concise.';
    }

    return feedback;
  };

  const analyzeAudio = async (audioBlob) => {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
    // Convert the audioBlob to an array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
  
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    // Get the raw audio data (left channel for simplicity)
    const channelData = audioBuffer.getChannelData(0);
  
    // Analyze volume (RMS - Root Mean Square)
    const rms = Math.sqrt(channelData.reduce((sum, value) => sum + value * value, 0) / channelData.length);
    const volumeFeedback = rms > 0.02 ? "Volume is good." : "Your volume seems low. Try speaking louder.";
  
    // Analyze speech pace (rate of speech)
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    const speechRate = (channelData.length / duration) / sampleRate;
    let paceFeedback = "";
  
    if (speechRate > 0.2) {
      paceFeedback = "Your pace is fast. Try to slow down.";
    } else if (speechRate < 0.1) {
      paceFeedback = "Your pace is slow. Try to speak more briskly.";
    } else {
      paceFeedback = "Your pace is optimal.";
    }
  
    // Combine feedback
    return `${volumeFeedback} ${paceFeedback}`;
  };
  

  const startRecording = () => {
    setIsRecording(true);

    // Initialize speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setSpeechText((prevText) => prevText + (finalTranscript ? " " + finalTranscript : ""));
    };

    recognition.onend = () => {
      if (!isRecording) {
        console.log("Speech recognition stopped.");
      }
    };

    recognitionRef.current = recognition; // Assign to ref
  
    try {
      recognitionRef.current.start();
      console.log("Speech recognition started.");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  
    // Start media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
    }
  };

  const stopRecording = () => {
    // Stop media recorder and save the audio blob
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.ondataavailable = (event) => {
        setAudioBlob(event.data); // Save audio blob for analysis
      };
    } else {
      console.error("Media recorder not initialized.");
    }
  
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null; // Clean up the result listener
        console.log("Speech recognition stopped.");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    } else {
      console.warn("Speech recognition not initialized.");
    }
  
    // Update recording state
    setIsRecording(false);
  };
  

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
        setDetectedEmotion('');
        setFaceDetectionError('Error detecting emotion, Face not visible.'); // Handle any errors
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
  
  
        // Immediately set the first question to introduce yourself
        setQuestion("Please introduce yourself.");
      
        setLoading(false);

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
    setHasIntroduced(true); 
    setIsIntroductionDone(true);
    setQuestion("Thank you for your introduction! Let's move on to the questions.");
    // Wait for 6 seconds before generating questions
    setTimeout(generateFollowUpQuestions, 6000);
  };

  const generateFollowUpQuestions = async () => {
    try {
      const response = await axios.post('http://localhost:5000/generate-question', {
        jobTitle, jobDescription, experience
      });

      if (response.data?.questions) {
        setQuestions(response.data.questions);
        setQuestion(response.data.questions[0]); // Display the first follow-up question
      } else {
        setQuestion("Sorry, I couldn't generate questions. Please try again.");
      }
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
      setQuestion("Error generating questions.");
    }
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

  // const startRecording = () => {
  //   setIsRecording(true);

  //   // Start media recorder
  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.start();
  //   }

  //   // Start speech recognition
  //   try {
  //     recognitionRef.current.start();
  //     console.log("Speech recognition started.");
  //   } catch (error) {
  //     console.error("Error starting speech recognition:", error);
  //   }
  // };

  // const stopRecording = () => {
  //   // Stop media recorder
  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop();
  //   }

  //   // Stop speech recognition
  //   try {
  //     recognitionRef.current.stop();
  //     recognitionRef.current.onresult = null;
  //     console.log("Speech recognition stopped.");
  //   } catch (error) {
  //     console.error("Error stopping speech recognition:", error);
  //   }

  //   // Update recording state
  //   setIsRecording(false);
  // };

  // Initialize media recorder
  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioBlob(event.data); // Store the audio blob when available
          }
        };
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
        console.log("Speech recognition stopped on component unmount.");
      } catch (error) {
        console.error("Error stopping recognition on unmount:", error);
      }
    };
  }, []);

  const handleTextChange = (e) => {
    setSpeechText(e.target.value); // Allow the user to edit the text
  };

  const handleDataAvailable = (event) => {
    const recordedAudio = event.data;
    setAudioBlob(recordedAudio); // Store the recorded audio
  };


  const handleSubmit = async () => {
    const userAnswer = speechText || answer; // Combine typed and speech-to-text answer
    console.log("User Answer: ", userAnswer);

    // Stop recording before submitting
    if (isRecording) {
      stopRecording();
    }


  if (!audioBlob) {
    console.error("No audio available for submission!");
    return; // Prevent submission if no audio is recorded
  }

  console.log("Submitting audio...");

  // Perform tone analysis
  const toneFeedback = analyzeTone(speechText);
  
  // Perform pace and clarity analysis
  const paceClarityFeedback = analyzePaceAndClarity(speechText);

  // Analyze audio
  const audioFeedback = await analyzeAudio(audioBlob);

  // Combine feedback from all analyses
  const finalFeedback = `${toneFeedback}\n${paceClarityFeedback} ${audioFeedback}`;
  
  // Set the feedback for display
  setFeedback(finalFeedback);
  
  // Clear state after submission
  setSpeechText("");
  setAnswer("");

  // Only call handleIntroduction once
  if (!hasIntroduced) {
    handleIntroduction();
  } else {
    // Continue with the other questions after introduction
    // You can call your next question generation logic here
    generateFollowUpQuestions();
  }
};

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}> {jobTitle} Interview</h2>
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
        </div>
      </div>

      {!faceDetectionError && detectedEmotion && (
        <div style={styles.emotion}>
          Detected Emotion: <span style={styles.emotionHighlight}>{detectedEmotion}</span>
        </div>
      )}

      {faceDetectionError && (
        <div style={styles.faceDetectionMessage}>{faceDetectionError}</div>
      )}

  
        {/* Display Avatar and Question */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <p style={{margin: '10px', color: 'black', fontSize: '15px'}}>{question}</p>
          </div>
        </div>

        {/* Answer input area */}
      <div style={styles.answerContainer}>
        <textarea
          placeholder="Type your answer here or record it..."
          value={isEditing ? answer : speechText} // Either typed answer or real-time speech-to-text
          onChange={handleTextChange}
          style={styles.textarea}
        />
      

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
            onClick={handleSubmit}
            disabled={!audioBlob || isRecording} // Disable until audio is recorded
            style={(!audioBlob || isRecording) ? styles.buttonDisabled : styles.button} // Conditionally apply styles
          >
            Submit Answer
          </button>
        </div>  
  
      </div>
      {/* Feedback Section */}
      {feedback && (
        <div style={styles.feedbackSection}>
          <h3 style={styles.feedbackHeading}>Feedback:</h3>
          <p style={styles.feedbackText} dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
        </div>
      )}
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
    backgroundColor: '#fcfafa',
    color: '#000',
    fontSize: '15px',
    fontWeight: 'bold',
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '50px',
    background: 'linear-gradient(162deg, rgba(245,206,215,1) 0%, rgba(255,255,255,1) 73%)',
    width: '100%',
    height: '800px',
  },
  
  heading: { fontSize: '28px', fontWeight: '600', color: '#333', margin: '15px' },

  videoContainer: { display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', },

  videoBox: {
    position: 'relative',
    width: '300px',
    height: '300px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    border: '2px solid #333',
  },

  textarea: {
    width: '100%',
    height: '80px',
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

  emotion: { fontSize: '24px', fontWeight: '200', color: 'black' },

  emotionHighlight: { fontWeight: 'bold', fontSize: '28px', color: '#f73b19' },

  faceDetectionMessage: { fontSize: '24px', fontWeight: '600', color: '#f73b19' }, // Style for error message

  buttonContainer: {
    position: 'absolute',
    bottom: '10px',
    right: '100px',
    display: 'flex',
    gap: '10px',
    zIndex: 10, },

  button: {
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: '#4447AF',
    color: 'white',
    borderRadius: '20px',
    border: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    
  },

  buttonDisabled: {
    padding: '5px 10px',
    cursor: 'not-allowed', // No pointer cursor when disabled
    backgroundColor: '#d3d3d3', // Grayed out background
    color: '#a3a3a3', // Grayed out text color
    borderRadius: '20px',
    border: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  }
};

export default AiInterview;
