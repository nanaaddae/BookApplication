import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Update the URL to match your Django backend
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password
      }, {
        withCredentials: true // This is important for handling cookies if your Django backend uses session authentication
      });

      console.log('Login successful:', response.data);

      // Adjust this based on what your Django backend returns
      // You might not need to store anything in localStorage if using session authentication
      localStorage.setItem('user', JSON.stringify(response.data));

      // Redirect to the home page after successful login
      navigate('/home');
    } catch (err) {
      setError('Invalid credentials');
      console.error('Error logging in:', err);
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="mb-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary">Login</button>

          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;