import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const BookSearch = () => {
const [searchQuery, setSearchQuery] = useState('');
const [allSearchResults, setAllSearchResults] = useState({});
const [searchResults, setSearchResults] = useState([]);
const [error, setError] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [totalResults, setTotalResults] = useState(0);
const [modalIsOpen, setModalIsOpen] = useState(false);
const [selectedBook, setSelectedBook] = useState(null);
const [listType, setListType] = useState('');
const [loading, setLoading] = useState(false); // Add loading state
const resultsPerPage = 10;
const [successMessage, setSuccessMessage] = useState('');


const customStyles = {
content: {
top: '50%',
left: '50%',
right: 'auto',
bottom: 'auto',
marginRight: '-50%',
transform: 'translate(-50%, -50%)',
width: '400px', // Adjust the width as desired
maxWidth: '90%', // Ensure the modal doesn't exceed 90% of the viewport width
},
};

Modal.setAppElement('#root'); // Set the app root element for accessibility

const handleSearch = async (e, page = currentPage) => {
if (e) {
e.preventDefault();
setAllSearchResults({});
setCurrentPage(1);

}
setError('');
setLoading(true); // Set loading to true when search starts

  if (allSearchResults[page]) {
      setSearchResults(allSearchResults[page]);
      setLoading(false);
      return;
    }



try {
const response = await axios.get('http://localhost:8000/search', {
params: {
query: searchQuery,
page: page,
per_page: resultsPerPage,
},
});

if (response.data && response.data.books) {
const books = response.data.books.map((book) => {
const coverUrl = book.cover_i
? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
: 'https://via.placeholder.com/128x193.png?text=No+Cover';
return { ...book, coverUrl };
});

setAllSearchResults(prev => ({...prev, [page]: books}));
setSearchResults(books);
setTotalResults(response.data.total_count);
} else {
setError('Unexpected data format received from the server.');
console.error('Unexpected data format:', response.data);
}
} catch (error) {
setError('An error occurred while searching for books.');
console.error('Error searching for books:', error);
} finally {
setLoading(false); // Set loading to false when search ends
}
};

const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (allSearchResults[pageNumber]) {
      setSearchResults(allSearchResults[pageNumber]);
    } else {
      handleSearch(null, pageNumber);
    }
  };
const openModal = (book, type) => {
setSelectedBook(book);
setListType(type);
setModalIsOpen(true);
};

const closeModal = () => {
setModalIsOpen(false);
setSelectedBook(null);
setListType('');
};

const addToList = async () => {
  try {
    const bookData = {
      title: selectedBook.title,
      author: selectedBook.author_name ? selectedBook.author_name[0] : 'Unknown Author',
      first_publish_year: selectedBook.first_publish_year,
      cover_url: selectedBook.cover_i
        ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`
        : 'https://via.placeholder.com/128x193.png?text=No+Cover',
      list_type: listType
    };

    const response = await axios.post(
      'http://localhost:8000/api/add-book/',
      bookData,
      { withCredentials: true }
    );

    console.log(response.data);
    closeModal();
    setSuccessMessage(`Book successfully added to ${listType}!`);
    setError(''); // Clear any existing error
  } catch (error) {
    console.error(`Error adding book to ${listType}:`, error.response ? error.response.data : error.message);
    setError(`Failed to add book to the ${listType}. Please try again.`);
    setSuccessMessage(''); // Clear any existing success message
  }
};

return (
<div className="container mt-5">
<div className="row justify-content-center">
<div className="col-md-8">
<form onSubmit={handleSearch} className="mb-4">
<div className="input-group">
<input
type="text"
className="form-control"
placeholder="Search for books"
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
/>
<button type="submit" className="btn btn-primary">
Search
</button>
</div>
</form>

{error && <div className="alert alert-danger" role="alert">{error}</div>}
{loading && <div className="alert alert-info" role="alert">Searching...</div>} {/* Display loading message */}

{searchResults.length > 0 && !loading && (
<div className="card">
<div className="card-body">
<h5 className="card-title">Search Results</h5>
<ul className="list-group">
{searchResults
.slice(
(currentPage - 1) * resultsPerPage,
currentPage * resultsPerPage
)
.map((book, index) => (
<li key={index} className="list-group-item d-flex align-items-center">
<img
src={book.coverUrl}
alt={book.title}
className="img-thumbnail me-3"
style={{ width: '128px', height: '193px' }}
/>
<div className="flex-grow-1">
<strong>{book.title}</strong> by {book.author_name?.join(', ') || 'Unknown Author'}
{book.first_publish_year && <span> (Published: {book.first_publish_year})</span>}
</div>
<div>
<button
className="btn btn-primary btn-sm me-2"
onClick={() => openModal(book, 'wishlist')}
>
Add to Wishlist
</button>
<button
className="btn btn-secondary btn-sm"
onClick={() => openModal(book, 'readlist')}
>
Add to Read List
</button>
</div>
</li>
))}
</ul>

{/* Pagination */}
<nav aria-label="Search results pagination">
<ul className="pagination justify-content-center mt-3">
{Array.from({ length: Math.ceil(totalResults / resultsPerPage) }, (_, index) => (
<li key={index} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
<button className="page-link" onClick={() => handlePageChange(index + 1)}>
{index + 1}
</button>
</li>
))}
</ul>
</nav>
</div>
</div>
)}
</div>
</div>

<Modal
isOpen={modalIsOpen}
onRequestClose={closeModal}
contentLabel="Add to List"
ariaHideApp={false}
style={customStyles}
>
<h2>Add to {listType}</h2>
<p>Are you sure you want to add "{selectedBook?.title}" to your {listType}?</p>
<div>
<button className="btn btn-primary me-2" onClick={addToList}>
Yes
</button>
<button className="btn btn-secondary" onClick={closeModal}>
No
</button>
</div>
</Modal>
</div>
);
};

export default BookSearch;

