import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true;

const WishList = () => {
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  useEffect(() => {
    const fetchWishList = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/wishlist', {
          withCredentials: true,  // Include cookies for session-based authentication
        });
        setWishlistBooks(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Unauthorized, redirect to login
          navigate('/login'); // Use navigate for redirection
        } else {
          setError('Failed to fetch wishlist');
          console.error('Error fetching wishlist:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishList();
  }, [navigate]); // Include navigate in the dependency array

  const getCSRFToken = () => {
    return Cookies.get('csrftoken');
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const csrfToken = getCSRFToken();
      await axios.delete(`http://localhost:8000/api/wishlist/remove/${bookId}`, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      });
      setWishlistBooks(wishlistBooks.filter(book => book.id !== bookId));
    } catch (err) {
      setError('Failed to remove book from wishlist');
      console.error('Error removing book from wishlist:', err);
    }
  };

  const markAsRead = async (bookId) => {
    try {
      // Add the book to the read list
      const csrfToken = getCSRFToken();
      await axios.post(`http://localhost:8000/api/mark-as-read/${bookId}/`, {}, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      });
      // Remove the book from the wishlist
      await removeFromWishlist(bookId);
    } catch (err) {
      setError('Failed to mark book as read');
      console.error('Error marking book as read:', err);
    }
  };

  if (loading) return <div className="alert alert-info">Loading wishlist...</div>;
  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">My Book Wishlist</h2>
      {wishlistBooks.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Your wishlist is empty.
        </div>
      ) : (
        <ul className="list-group">
          {wishlistBooks.map(book => (
            <li key={book.id} className="list-group-item d-flex align-items-center">
              <img
                src={book.cover_url || 'https://via.placeholder.com/150'}
                alt={book.title}
                className="img-thumbnail me-3"
                style={{ width: '128px', height: '193px' }}
              />
              <div className="flex-grow-1">
                <strong>{book.title}</strong> by {book.author}
              </div>
              <div>
                <button onClick={() => markAsRead(book.id)} className="btn btn-success btn-sm me-2">
                  Mark as Read
                </button>
                <button onClick={() => removeFromWishlist(book.id)} className="btn btn-danger btn-sm">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WishList;
