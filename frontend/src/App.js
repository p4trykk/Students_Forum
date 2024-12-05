import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreatePost from './components/CreatePost';
import Login from './components/Login'; 
import PostList from './components/PostList';
import EditPost from './components/EditPost';

const App = () => {
  // Stan logowania
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') !== null);  // Sprawdzamy, czy token jest zapisany w localStorage

  const handleLogout = () => {
    localStorage.removeItem('token'); // Usuwamy token z localStorage
    setIsLoggedIn(false); // Zmiana stanu logowania
  };

  return (
    <Router>
      <div>
        <h1>Students Forum</h1>
        <nav>
          <Link to="/create-post">Create Post</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>  // Przycisk wylogowania
          ) : (
            <Link to="/login">Login</Link>  // Link do strony logowania
          )}
        </nav>
        <Routes>
          <Route path="/create-post" element={isLoggedIn ? <CreatePost /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/edit/:postId" element={<EditPost />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />  {/* Strona logowania */}
          <Route path="/" element={<PostList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
