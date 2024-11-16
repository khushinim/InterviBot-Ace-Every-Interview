import React, { useState } from 'react';

const InterviewSimulationPage = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Handle error state
  const [showSystemCheck, setShowSystemCheck] = useState(false);

  const jobTitles = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Marketing Manager',
    'Project Manager', 'Web Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cloud Architect',
    'AI Engineer', 'Machine Learning Engineer', 'Business Analyst', 'Network Engineer', 'Security Engineer',
    'System Administrator', 'Full Stack Developer', 'Database Administrator', 'Quality Assurance Engineer',
    'Game Developer', 'Software Architect', 'Embedded Systems Engineer', 'Blockchain Developer',
    'Data Analyst', 'Data Engineer', 'Technical Writer', 'AI Research Scientist', 'Computer Vision Engineer',
    'Natural Language Processing Engineer', 'Cloud Solutions Architect', 'Site Reliability Engineer',
    'Cloud Developer', 'Product Designer', 'SEO Specialist', 'Digital Marketing Specialist',
    'Business Intelligence Analyst', 'Human Resources Manager', 'Content Strategist', 'Salesforce Developer',
    'Enterprise Architect', 'Cloud Operations Manager', 'Artificial Intelligence Consultant',
    'IT Support Specialist', 'Security Analyst', 'Cybersecurity Expert', 'Blockchain Consultant',
    'IoT Specialist', 'Robotics Engineer', 'Data Privacy Officer', 'Technical Support Engineer',
    'Network Administrator', 'Penetration Tester', 'Front-end Developer', 'Back-end Developer',
    'Data Visualizer', 'Agile Coach', 'Scrum Master', 'Game Designer', 'Web Security Specialist',
    'UI/UX Developer', 'Business Development Manager', 'CRM Developer', 'Cloud Systems Administrator',
    'Virtual Reality Developer', 'AI Product Manager', 'Machine Learning Researcher', 'Data Scientist - Healthcare',
    'E-commerce Manager', 'Data Analytics Consultant', 'Software Quality Engineer', 'Big Data Engineer',
    'Customer Success Manager', 'Research Engineer', 'IT Manager', 'DevSecOps Engineer', 'Compliance Officer',
    'Telecommunications Engineer', 'App Security Engineer', 'Cloud Security Specialist'
  ];

  // Handle the job title input change and filter suggestions
  const handleJobTitleChange = (e) => {
    const value = e.target.value;
    setJobTitle(value);
    if (value.length > 0) {
      const filteredSuggestions = jobTitles
        .filter((title) => title.toLowerCase().includes(value.toLowerCase()))
        .sort();
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle job title suggestion click
  const handleSuggestionClick = (title) => {
    setJobTitle(title);
    setSuggestions([]);
  };

  // Handle generating questions based on input and transition to system check
  const handleNext = () => {
    setLoading(true);
    setError('');
    
     // Save job title and description to localStorage
     localStorage.setItem('jobTitle', jobTitle);
     localStorage.setItem('jobDescription', jobDescription);
     
    // Simulate loading process
    setLoading(false);
    
    // After clicking "Next", navigate to /ready-for-interview page
    window.location.href = '/ready-for-interview'; // This will redirect the user
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: '"Bodoni Moda", serif',
        padding: '20px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          color: 'white',
          background: 'linear-gradient(135deg, #5a40b5, #f64222)',
          padding: '20px',
          borderRadius: '20px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2>Interview Simulation</h2>
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label>
            Job Title:
            <input
              type="text"
              value={jobTitle}
              onChange={handleJobTitleChange}
              style={{
                marginLeft: '10px',
                padding: '8px',
                fontSize: '1em',
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #ccc',
                outline: 'none',
              }}
              placeholder="Enter Job Title"
            />
          </label>
          {suggestions.length > 0 && (
            <ul
              style={{
                color: 'black',
                listStyleType: 'none',
                padding: 0,
                marginTop: '0',
                position: 'absolute',
                top: '100%',
                left: '2%',
                right: '0',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1,
              }}
            >
              {suggestions.map((title, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(title)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    backgroundColor: '#f8f8f8',
                    borderBottom: '1px solid #ddd',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#e0e0e0')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#f8f8f8')}
                >
                  {title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>
            Job Description:
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                marginLeft: '10px',
                padding: '8px',
                fontSize: '1em',
                width: '100%',
                height: '100px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                outline: 'none',
              }}
              placeholder="Enter Job Description"
            />
          </label>
        </div>
        <button
          onClick={handleNext}
          style={{
            padding: '10px 15px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: '"Bodoni Moda", serif',
            border: 'none',
            borderRadius: '20px',
            color: '#FFFFFF',
            backgroundColor: '#4447AF',
          }}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Next'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default InterviewSimulationPage;
