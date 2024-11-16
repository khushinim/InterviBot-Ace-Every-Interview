import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import InterviewSimulationPage from './InterviewSimulationPage'; // Import the new InterviewSimulationPage

const FeatureCard = ({ title, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={flipCardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
          ...flipCardInnerStyle, 
          transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)' 
        }}>
        <div style={flipCardFrontStyle}>
          <h3>{title}</h3>
        </div>
        <div style={flipCardBackStyle}>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [startSimulation, setStartSimulation] = useState(false); // State to toggle between pages

  // Handle "Get Started" click
  const handleGetStarted = () => {
    setStartSimulation(true);
  };

  return (
    <div>
      <Header />

      {/* Show Interview Simulation page when startSimulation is true */}
      {startSimulation ? (
        <InterviewSimulationPage />
      ) : (
        // Show Home Page content until "Get Started" is clicked
        <>
          {/* Welcome Section */}
          <section 
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              marginTop: '25px',
              fontFamily: '"Bodoni Moda", serif',
            }}
          >
            <h1 style={{ fontSize: '2em', marginBottom: '10px' }}>
              Ace Every Interview with AI-Powered Practice!
            </h1>
            <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>
              Prepare for your dream job with personalized interview simulations,
              real-time feedback, and advanced analysis.
            </p>
            <button 
              style={{
                padding: '10px 15px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: '"Bodoni Moda", serif',
                border: 'none',
                borderRadius: '20px',
                color: '#FFFFFF',
              }}
              onClick={handleGetStarted} // Click event for starting the interview simulation
            >
              Get Started
            </button>
          </section>

          {/* Feature Highlights Section with Flip Cards */}
          <section 
            style={{
              padding: '20px',
              backgroundColor: '#f9f9f9',
              marginBottom: '30px',
              fontFamily: '"Bodoni Moda", serif',
              margin: '0 auto',
              maxWidth: '1100px',
              textAlign: 'center'
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>Features</h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
            }}>
              <FeatureCard title="Generate Interview Questions" description="Create tailored questions based on your chosen role and level." />
              <FeatureCard title="Real-Time Response Analysis" description="Get immediate insights on both content and delivery." />
              <FeatureCard title="Customized Feedback" description="Receive personalized feedback to refine your responses and presentation." />
              <FeatureCard title="Profile-Based Customization" description="Practice questions and scenarios specific to your career and experience." />
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

// CSS Styles for Flip Card Effect
const flipCardStyle = {
  backgroundColor: 'transparent',
  width: '200px',
  height: '270px',
  perspective: '1000px',
  margin: '10px',
};

const flipCardInnerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
};

const flipCardFrontStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  background: 'linear-gradient(135deg, #FF4B2B, #4447AF)',
  color: '#fff',
  display: 'flex',
  padding: '10px',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  fontSize: '1rem',
  fontFamily: '"Bodoni Moda", serif',
  transition: 'background 0.4s ease',
};

const flipCardBackStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  padding: '20px',
  backfaceVisibility: 'hidden',
  background: 'linear-gradient(135deg, #44AF94, #FF4B2B)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'rotateY(180deg)',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  fontSize: '1em',
  fontFamily: '"Bodoni Moda", serif',
};

export default HomePage;
