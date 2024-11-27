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
    const negations = ['don\'t', 'no', 'never', 'not', 'without'];
    const containsNegation = negations.some(negation => answer.toLowerCase().includes(negation));
  
    let toneFeedback = 'Tone Analysis: ';
    
    if (containsNegation && result.compound > 0) {
      toneFeedback += 'Your tone includes negations but is overall positive. Aim for more constructive phrasing.';
    } else if (result.compound >= 0.6) {
      toneFeedback += 'Your tone is very positive and engaging.';
    } else if (result.compound >= 0.2) {
      toneFeedback += 'Your tone is moderately positive. Consider adding more enthusiasm.';
    } else if (result.compound <= -0.4) {
      toneFeedback += 'Your tone is quite negative. Avoid negative language and try to reframe answers positively.';
    } else if (result.compound < 0) {
      toneFeedback += 'Your tone is slightly negative. Aim for more optimistic phrasing.';
    } else {
      toneFeedback += 'Your tone is neutral. Adding positivity can make your response more impactful.';
    }
  
    return toneFeedback;
  };
  

  const analyzePaceAndClarity = (text) => {
    const fillerWords = ['um', 'ah', 'like', 'you know'];
    const fillerWordPattern = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const fillerWordCount = (text.match(fillerWordPattern) || []).length;
  
    const wordCount = text.split(/\s+/).length;
    let feedback = `Pace and Clarity: Your answer has ${wordCount} words. `;
  
    if (fillerWordCount > 3) {
      feedback += `You used ${fillerWordCount} filler words. Aim to reduce these for clearer responses. `;
    }
  
    if (wordCount < 60) {
      feedback += 'Your response is too short. Elaborate to provide more details. ';
    } else if (wordCount > 120) {
      feedback += 'Your response is a bit lengthy. Aim for concise, impactful answers. ';
    } else {
      feedback += 'Your response length is well-balanced. ';
    }
  
    return feedback;
  };
  
  const analyzeAudio = async (audioBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    // Volume Analysis
    const channelData = audioBuffer.getChannelData(0);
    const rms = Math.sqrt(channelData.reduce((sum, value) => sum + value * value, 0) / channelData.length);
    const volumeFeedback = rms > 0.03 ? "Your volume is clear." : "Your volume is too low. Speak louder.";
  
    // Speech Pace Analysis
    const duration = audioBuffer.duration; // duration in seconds
    const wordCount = (await transcribeAudio(audioBlob)).split(/\s+/).length;
    const wordsPerMinute = (wordCount / duration) * 60;
  
    let paceFeedback = '';
    if (wordsPerMinute > 160) {
      paceFeedback = 'You are speaking too fast. Try to slow down for clarity.';
    } else if (wordsPerMinute < 100) {
      paceFeedback = 'You are speaking too slowly. Increase your pace slightly.';
    } else {
      paceFeedback = 'Your speaking pace is excellent.';
    }
  
    return `${volumeFeedback} ${paceFeedback}`;
  };
  
  // Placeholder for audio transcription (replace with SpeechRecognition or a suitable API)
  const transcribeAudio = async (audioBlob) => {
    // Implement transcription logic or integrate an API like Google Cloud Speech-to-Text.
    return 'Transcribed text placeholder';
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


  // const questionsrel = [
  //   "What do you mean by cloud computing?",
  //   "What is the difference between AWS EC2 and AWS Lambda?",
  //   "What is a virtual machine (VM), and how does it differ from containers?",
  //   "Why load balancing is important in cloud computing?",

  // ];
  
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question index

  
   const handleIntroduction = () => {
    setHasIntroduced(true); 
    setIsIntroductionDone(true);
    setQuestion("Thank you for your introduction! Let's move on to the questions.");
    // Wait for 6 seconds before generating questions
    setTimeout(generateFollowUpQuestions, 6000);
    //setTimeout(() => setQuestion(questionsrel[currentQuestionIndex]), 6000);
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
  //   const nextQuestionIndex = currentQuestionIndex + 1;
  //   if (nextQuestionIndex < questionsrel.length) {
  //     setCurrentQuestionIndex(nextQuestionIndex);
  //     setQuestion(questionsrel[nextQuestionIndex]);
  //   } else {
  //     setQuestion("Thank you for completing the interview!");
  //   }
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
