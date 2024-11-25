import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import Header from './components/Header';
import Profile from './components/Profile';
import ReadyForInterviewPage from './components/ReadyForInterviewPage'; // Import new component
import AiInterview from './components/AiInterview';
import { jwtDecode } from 'jwt-decode'; // Ensure you have jwt-decode installed
import axios from 'axios';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isInterviewReady, setIsInterviewReady] = useState(false); // Track if user is ready for the interview

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          handleLogout();
        } else {
          setIsAuthenticated(true);
          setUserName(name || '');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    }
  }, []);

  const handleSignIn = async (credentials) => {
    try {
      // Perform API call to authenticate user
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, name } = response.data;

      setIsAuthenticated(true);
      setUserName(name);
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name);

      setTimeout(() => {
        handleLogout();
      }, 3 * 60 * 60 * 1000); // Logout after 3 hours

      window.location.href = '/home';
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  const handleReadyForInterview = async () => {
    try {
      // Perform API call to check if the interview setup is complete
      const response = await axios.get('http://localhost:5000/api/interview/ready');
      if (response.data.success) {
        setIsInterviewReady(true);
        window.location.href = '/interview'; // Redirect to Interview page
      } else {
        alert('Ensure you pass all readiness checks before proceeding.');
      }
    } catch (error) {
      console.error('Error checking interview readiness:', error);
      alert('Failed to prepare for the interview.');
    }
  };

  // Determine the current page based on URL path
  const isProfilePage = window.location.pathname === '/profile';
  const isReadyForInterviewPage = window.location.pathname === '/ready-for-interview';
  const isAiInterviewPage = window.location.pathname === '/ai-interview';

  return (
    <div>
      <Header 
        isAuthenticated={isAuthenticated} 
        userName={userName} 
        onLogout={handleLogout} 
      />
      
      {isAuthenticated ? (
        isProfilePage ? (
          <Profile />
        ) : isReadyForInterviewPage ? (
          <ReadyForInterviewPage onReadyForInterview={handleReadyForInterview} />
        ) : isAiInterviewPage ? (
          <AiInterview /> // Render AiInterview when on the /ai-interview page
        ) : (
          <HomePage />
        )
      ) : (
        <AuthPage onSignIn={handleSignIn} />
      )}
    </div>
  );
};

export default App;