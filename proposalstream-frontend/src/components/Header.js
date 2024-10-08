// src/components/Header.js

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import navLinks from '../utils/navLinks'; // Import the centralized navLinks
import { FaUserCircle } from 'react-icons/fa'; // Import profile icon from react-icons
import './Header.css'; // Import the CSS file for styling
import { useAuth } from '../CombinedAuthContext'; // Updated import

function Header() {
  // Access the unified authentication context
  const { user, authProvider, logout, login } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const handleToggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger')
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFilteredLinks = () => {
    if (!user) return [];

    return navLinks.filter((link) => {
      // Check if any of the user's roles are included in the link's roles
      const hasRole = user.roles.some((role) => link.roles.includes(role));
      
      // Exclude specific links from the main navigation
      const excludeLinks = ['Upload Contract Template', 'Add Property'];

      return hasRole && !excludeLinks.includes(link.name);
    });
  };

  const getDropdownLinks = () => {
    if (!user) return [];

    // Include admin-specific links or other dynamic links as needed
    return navLinks.filter((link) => {
      const hasRole = user.roles.some((role) => link.roles.includes(role));
      const includeLinks = ['Admin Panel', 'Settings']; // Example additional links
      return hasRole && includeLinks.includes(link.name);
    });
  };

  const handleLogin = (provider) => {
    console.log(`Initiating login via ${provider}`);
    login(provider);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            YourApp
          </Link>
          <button
            className="hamburger"
            onClick={handleToggleMenu}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          <ul
            className={`nav-links ${isMenuOpen ? 'open' : ''}`}
            ref={menuRef}
          >
            {getFilteredLinks().map((link) => (
              <li key={link.path}>
                <Link to={link.path} onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Actions */}
        <div className="nav-right">
          {user ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button
                className="profile-button"
                onClick={handleProfileClick}
                aria-label="User profile"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <FaUserCircle size={30} />
              </button>
              {isDropdownOpen && (
                <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                  {/* Dynamically add dropdown links */}
                  {getDropdownLinks().map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} onClick={() => setIsDropdownOpen(false)}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="logout-button"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <ul className="nav-user">
              <li>
                <button
                  onClick={() => handleLogin('proposalStream')}
                  className="login-button"
                >
                  Login with ProposalStream
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLogin('microsoftProvider')}
                  className="login-button"
                >
                  Login with Microsoft
                </button>
              </li>
              {/* If you have email/password login, you can add another button here */}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;