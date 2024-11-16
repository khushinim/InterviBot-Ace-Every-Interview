import React from 'react';
import './Footer.css'; // Optional: add styles for your footer

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} InterviBot. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
