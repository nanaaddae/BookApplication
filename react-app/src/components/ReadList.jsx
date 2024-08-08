import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie
import { useNavigate } from 'react-router-dom';

const ReadList = () => {
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReadList = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/readlist', {
          withCredentials: true, // Include cookies for session-based authentication
        });
        setReadBooks(response.data.books); // Ensure this matches the structure of your returned data
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Unauthorized, redirect to login
          navigate('/login');
        } else {
          setError('Failed to fetch read list');
          console.error('Error fetching read list:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReadList();
  }, [navigate]);

  const getCSRFToken = () => {
    return Cookies.get('csrftoken');
  };

 const removeFromReadList = async (bookId) => {
  const csrfToken = getCSRFToken(); // Get CSRF token

  try {
    const response = await axios.post(
      'http://localhost:8000/api/remove-from-readlist/',
      { book_id: bookId },
      {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    if (response.data.success) {
      setReadBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      setSuccessMessage('Book successfully removed from Read List!');
      setError('');
    } else {
      setError('Failed to remove book from Read List.');
      setSuccessMessage('');
    }
  } catch (error) {
    console.error('Error removing book from Read List:', error.response ? error.response.data : error.message);
    setError('Failed to remove book from Read List.');
    setSuccessMessage('');
  }
};

  if (loading) return <div>Loading read list...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2>My Read Books</h2>
          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}
          {readBooks.length === 0 ? (
            <p>No books in your read list yet.</p>
          ) : (
            <div className="card">
              <div className="card-body">
                <ul className="list-group">
                  {readBooks.map(book => (
                    <li key={book.id} className="list-group-item d-flex align-items-center">
                      <img
                        src={book.cover_url}
                        alt={`${book.title} cover`}
                        className="img-thumbnail me-3"
                        style={{ width: '128px', height: '193px' }}
                      />
                      <div className="flex-grow-1">
                        <strong>{book.title}</strong> by {book.author}
                        {book.first_publish_year && <span> (Published: {book.first_publish_year})</span>}
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeFromReadList(book.id)}
                      >
                        Remove from Read List
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadList;
