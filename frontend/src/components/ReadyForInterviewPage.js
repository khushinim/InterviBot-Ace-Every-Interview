import React, { useState, useRef, useEffect } from 'react';

const ReadyForInterview = () => {
  const [browserCheck, setBrowserCheck] = useState(null);
  const [webcamCheck, setWebcamCheck] = useState(null);
  const [microphoneCheck, setMicrophoneCheck] = useState(null);
  const [internetCheck, setInternetCheck] = useState(null);
  const [locationCheck, setLocationCheck] = useState(null);
  const [screenCheck, setScreenCheck] = useState(null);
  const [pictureCheck, setPictureCheck] = useState(null);
  const [allChecksPassed, setAllChecksPassed] = useState(false);
  const videoRef = useRef(null);  // For webcam video feed
  const canvasRef = useRef(null);  // For capturing picture from video
  const [capturedImage, setCapturedImage] = useState(null); // To store the captured image
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');


  useEffect(() => {
    // Retrieve job title and description from localStorage
    const savedJobTitle = localStorage.getItem('jobTitle');
    const savedJobDescription = localStorage.getItem('jobDescription');

    if (savedJobTitle && savedJobDescription) {
      setJobTitle(savedJobTitle);
      setJobDescription(savedJobDescription);
    }
  }, []);

  const handleStartInterview = () => {
    // After the system check is passed, redirect to the AI Interview page
    window.location.href = '/ai-interview'; // This will redirect the user
  };

  const performChecks = async () => {
    setBrowserCheck(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (browserCheck) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setWebcamCheck(true);
        setMicrophoneCheck(true);
      } catch (error) {
        setWebcamCheck(false);
        setMicrophoneCheck(false);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

      if (webcamCheck && microphoneCheck) {
        setInternetCheck(true);
      } else {
        setInternetCheck(false);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (internetCheck) {
        navigator.geolocation.getCurrentPosition(
          () => setLocationCheck(true),
          () => setLocationCheck(false)
        );
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (locationCheck && !screenCheck) { // Only prompt for screen share once
        try {
          await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenCheck(true);
        } catch (error) {
          setScreenCheck(false);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      if (screenCheck) {
        setPictureCheck(true);
      } else {
        setPictureCheck(false);
      }
    }
  };

  useEffect(() => {
    performChecks();
  }, [browserCheck, webcamCheck, microphoneCheck, internetCheck, locationCheck, screenCheck]);

  useEffect(() => {
    // Check if all the requirements are met
    if (
      browserCheck &&
      webcamCheck &&
      microphoneCheck &&
      internetCheck &&
      locationCheck &&
      screenCheck
    ) {
      setAllChecksPassed(true);
    } else {
      setAllChecksPassed(false);
    }
  }, [browserCheck, webcamCheck, microphoneCheck, internetCheck, locationCheck, screenCheck]);

  // const captureImage = () => {
  //   const canvas = canvasRef.current;
  //   const video = videoRef.current;

  //   // Set the canvas size to the video size
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;

  //   // Draw the video frame onto the canvas
  //   const ctx = canvas.getContext('2d');
  //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //   // Get the image data from the canvas and update the state
  //   const imageData = canvas.toDataURL('image/png');
  //   setCapturedImage(imageData);
  //   setPictureCheck(true); // Indicate that the picture is taken
  // };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '100px' }}>
      <div
        style={{
          padding: '10px',
          width: '260px',
          height: '457px',
          borderRadius: '6px',
          boxShadow: '0 3px 6px 0 rgba(173, 173, 173, 0.2)',
          border: 'solid 1px #ffd2b4',
          backgroundColor: '#FFDFD3',
          margin: '20px',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#262626', marginTop: '16px', marginBottom: '24px' }}>
          Requirements Check
        </div>
        <CheckItem label="Browser compatibility" isChecked={browserCheck} errorMessage="Your browser seems incompatible." />
        <CheckItem label="Webcam" isChecked={webcamCheck} />
        <CheckItem label="Microphone Check" isChecked={microphoneCheck} />
        <CheckItem label="Internet Check" isChecked={internetCheck} />
        <CheckItem label="Location Check" isChecked={locationCheck} />
        <div id="screencheckdiv" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img
            style={{ width: '12px' }}
            src={screenCheck ? 'https://rp.merittracpariksha.com/sdk/images/correct.png' : ''}
          />
          <label className="prerequisite-label">Screen check</label>
        </div>
        {/*<CheckItem label="Take Picture" isChecked={pictureCheck} />*/}
        <div style={{ textAlign: 'center' }}>
        {allChecksPassed && (
        <div>
          <p style={{ marginTop: '35px', marginBottom: '10px', fontSize: '15px', fontWeight: 'bold', color: '#0760BF' }}>All the best for the Interview!!!</p>
          <button
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '15px 15px',
              fontSize: '16px',
              borderRadius: '20px',
              cursor: 'pointer',
              marginTop: '10px',
              borderColor: 'transparent',
            }}
            onClick={handleStartInterview}>
            Start Interview
          </button>
        </div>
        )}
      </div>
      </div>
      

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '100px' }}>
        {/* Browser Check */}
        <div style={{ textAlign: 'center' }}>
          {browserCheck === true ? (
            <>
              <h2 style={{ color: 'green' }}>Browser is compatible!</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/correct.png"
                alt="Green tick"
                style={{ width: '50px', height: '50px' }}
              />
            </>
          ) : browserCheck === false ? (
            <>
              <h2 style={{ color: 'red' }}>Not Great!</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/criss-cross.png"
                alt="Red cross"
                style={{ width: '100px', height: '100px' }} // Big red cross
              />
            </>
          ) : (
            <p>Checking Browser...</p>
          )}
        </div>

        {/* Webcam Check */}
        <div style={{ textAlign: 'center' }}>
          {webcamCheck === true ? (
            <>
              <h2 style={{ color: 'green' }}>Webcam Working, Great!</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/correct.png"
                alt="Green tick"
                style={{ width: '50px', height: '50px' }}
              />
            </>
          ) : webcamCheck === false ? (
            <>
              <h2 style={{ color: 'red' }}>Seems like your Webcam is not working. Please allow access from Browser settings and retry.</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/criss-cross.png"
                alt="Red cross"
                style={{ width: '100px', height: '100px' }} // Big red cross
              />
            </>
          ) : (
            <p>Checking Webcam...</p>
          )}
        </div>

        {/* Microphone Check */}
        <div style={{ textAlign: 'center' }}>
          {microphoneCheck === true ? (
            <>
              <h2 style={{ color: 'green' }}>Microphone Working, Great!</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/correct.png"
                alt="Green tick"
                style={{ width: '50px', height: '50px' }}
              />
            </>
          ) : microphoneCheck === false ? (
            <>
              <h2 style={{ color: 'red' }}>Seems like your Microphone is not working. Please allow access from Browser settings and retry.</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/criss-cross.png"
                alt="Red cross"
                style={{ width: '100px', height: '100px' }} // Big red cross
              />
            </>
          ) : (
            <p>Checking Microphone...</p>
          )}
        </div>

        {/* Internet Check */}
        <div style={{ textAlign: 'center' }}>
          {internetCheck === true ? (
            <>
              <h2 style={{ color: 'green' }}>Internet Connection, Great!</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/correct.png"
                alt="Green tick"
                style={{ width: '50px', height: '50px' }}
              />
            </>
          ) : internetCheck === false ? (
            <>
              <h2 style={{ color: 'red' }}>Please check your internet connection.</h2>
              <img
                src="https://rp.merittracpariksha.com/sdk/images/criss-cross.png"
                alt="Red cross"
                style={{ width: '100px', height: '100px' }} // Big red cross
              />
            </>
          ) : (
            <p>Checking Internet...</p>
          )}
           
    {/* Display webcam video feed and capture button */}
    {/* {pictureCheck === true && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>Take Picture of Your Face</h3>
          <video ref={videoRef} autoPlay width="400" height="300" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={captureImage}>Capture Image</button>

          {capturedImage && (
            <div>
              <h4>Your Captured Picture:</h4>
              <img src={capturedImage} alt="Captured" width="200" />
            </div>
          )}
        </div>
      )} */}
    </div>
    {/* Location Check */}
  <div style={{ textAlign: 'center' }}>
    {locationCheck === true ? (
      <>
        <h2 style={{ color: 'green' }}>Location Access, Great!</h2>
        <img
          src="https://rp.merittracpariksha.com/sdk/images/correct.png"
          alt="Green tick"
          style={{ width: '50px', height: '50px' }}
        />
      </>
    ) : locationCheck === false ? (
      <>
        <h2 style={{ color: 'red' }}>Location permission denied.</h2>
        <img
          src="https://rp.merittracpariksha.com/sdk/images/criss-cross.png"
          alt="Red cross"
          style={{ width: '100px', height: '100px' }} // Big red cross
        />
      </>
    ) : (
      <p>Checking Location...</p>
    )}
        </div>
      </div>
    </div>
  );
};

const CheckItem = ({ label, isChecked, errorMessage }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <img
      style={{ width: '12px' }}
      src={isChecked ? 'https://rp.merittracpariksha.com/sdk/images/correct.png' : 'https://rp.merittracpariksha.com/sdk/images/criss-cross.png'}
      alt={isChecked ? 'correct' : 'incorrect'}
    />
    <label className="prerequisite-label">{label}</label>
    {!isChecked && errorMessage && (
      <span style={{ color: 'red', marginLeft: '10px' }}>{errorMessage}</span>
    )}
  </div>
);

export default ReadyForInterview;
