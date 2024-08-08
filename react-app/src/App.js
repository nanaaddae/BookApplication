import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ReadList from './components/ReadList';
import BookSearch from './components/BookSearch';
import WishList from './components/WishList';
import HomePage from './components/HomePage';
import Navigation from './components/Navigation';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login route */}
          <Route path="/login" element={<LoginForm />} />
           <Route path="/register" element={<RegisterForm />} />

          {/* Other routes */}
          <Route
            path="/*"
            element={
              <>
                <Navigation />
                <Routes>
                  <Route path="/search" element={<BookSearch />} />
                  <Route path="/wishlist" element={<WishList />} />
                  <Route path="/readlist" element={<ReadList />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;