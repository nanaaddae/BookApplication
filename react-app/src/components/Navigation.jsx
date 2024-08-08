import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const Navigation = () => {
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = async () => {
    try {
      const csrfToken = getCSRFToken();
      await axios.post(
        'http://localhost:8000/api/logout/', // Ensure this matches your Django logout URL
        {},
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
      // Optionally handle error state here
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Book Tracker
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                Search Books
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/wishlist">
                Wishlist
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/readlist">
                Read List
              </Link>
            </li>
          </ul>
          <button className="btn btn-danger ms-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
