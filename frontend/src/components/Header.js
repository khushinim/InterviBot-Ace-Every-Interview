import React from 'react';
import './Header.css'; // Ensure your styles are correct

const Header = ({ isAuthenticated, name, onLogout }) => {
  // Redirect to Profile page
  const handleProfileClick = () => {
    window.location.href = '/profile';  // Assuming the Profile page is at /profile
  };

  return (
    <header className="header">
      <div className="logo">InterviBot</div>

      <nav className="nav-bar">
        <ul className="nav-links">
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      
      {/* User profile section aligned to the right */}
      <div className="user-profile">
        {isAuthenticated && <span className="user-name">{name}</span>} {/* Show user's name if authenticated */}
        <div className="profile-dropdown">
          <img 
            width="40"
            height="40"
            src="https://img.icons8.com/external-tanah-basah-glyph-tanah-basah/48/ff416c/external-user-networking-tanah-basah-glyph-tanah-basah.png"
            alt="User Profile"
            className="user-icon"
            onClick={handleProfileClick} // Make the icon clickable to go to the profile
          />
          {/* Dropdown menu, only visible when authenticated */}
          {isAuthenticated && (
            <div className="dropdown-content">
              <a onClick={handleProfileClick}>My Profile</a> {/* Profile link */}
              <a href="#" onClick={onLogout}>Logout</a> {/* Call logout function on click */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
