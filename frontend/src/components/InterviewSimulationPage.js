import React, { useState } from 'react';
import { color } from 'three/webgpu';

const InterviewSimulationPage = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSuggestionClick = (title) => {
    setJobTitle(title);
    setSuggestions([]);
  };

  const handleNext = () => {
    setLoading(true);
    setError('');

    // Save job title, description, and experience to localStorage
    localStorage.setItem('jobTitle', jobTitle);
    localStorage.setItem('jobDescription', jobDescription);
    localStorage.setItem('experience', experience);

    setLoading(false);

    // Navigate to the "Ready for Interview" page
    window.location.href = '/ready-for-interview';
  };

  const isNextDisabled = !jobTitle.trim() || !jobDescription.trim() || !experience;

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
        <div style={{ marginBottom: '20px' }}>
          <label>
            Experience:
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '1em',
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #ccc',
                outline: 'none',
                color: experience === '' ? 'grey' : 'black',
              }}
            >
              <option value="">Select Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1-3 years">1-3 years</option>
              <option value="4-6 years">4-6 years</option>
              <option value="More than 6 years">More than 6 years</option>
            </select>
          </label>
        </div>
        <button
          onClick={handleNext}
          style={{
            padding: '10px 15px',
            fontSize: '0.9rem',
            cursor: isNextDisabled ? 'not-allowed' : 'pointer',
            fontFamily: '"Bodoni Moda", serif',
            border: 'none',
            borderRadius: '20px',
            color: '#FFFFFF',
            backgroundColor: isNextDisabled ? '#888' : '#4447AF',
          }}
          disabled={isNextDisabled || loading}
        >
          {loading ? 'Loading...' : 'Next'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default InterviewSimulationPage;
