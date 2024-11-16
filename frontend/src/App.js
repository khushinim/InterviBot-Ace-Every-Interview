import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import Header from './components/Header';
import Profile from './components/Profile';
import ReadyForInterviewPage from './components/ReadyForInterviewPage'; // Import new component
import AiInterview from './components/AiInterview';
import { jwtDecode } from 'jwt-decode'; // Ensure you have jwt-decode installed

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isInterviewReady, setIsInterviewReady] = useState(false); // Track if user is ready for the interview

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');

    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        handleLogout();
      } else {
        setIsAuthenticated(true);
        setUserName(name || '');
      }
    }
  }, []);

  const handleSignIn = (credentials) => {
    setIsAuthenticated(true);
    setUserName(credentials.name);
    localStorage.setItem('token', credentials.token);
    localStorage.setItem('userName', credentials.name);

    setTimeout(() => {
      handleLogout();
    }, 3 * 60 * 60 * 1000); // Logout after 3 hours

    window.location.href = '/home';
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  const isProfilePage = window.location.pathname === '/profile';
  const isReadyForInterviewPage = window.location.pathname === '/ready-for-interview'; // Check if on "Get Ready" page
  const isAiInterviewPage = window.location.pathname === '/ai-interview'; 

  const handleReadyForInterview = () => {
    setIsInterviewReady(true);
    window.location.href = '/interview'; // Redirect to Interview page
  };

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