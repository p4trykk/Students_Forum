import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import CreatePost from './components/CreatePost';
import Login from './components/Login';
import PostList from './components/PostList';
import EditPost from './components/EditPost';
import Register from './components/Register';
import TagList from './components/TagList';
import FullPost from './components/FullPost';
import UserProfile from './components/UserProfile';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') !== null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const expirationTime = JSON.parse(atob(token.split('.')[1])).exp * 1000;
      const currentTime = Date.now();

      if (currentTime >= expirationTime) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } else {
        const timeout = setTimeout(() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }, expirationTime - currentTime);

        return () => clearTimeout(timeout);
      }
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <div>
        <h1>Students Forum</h1>
        <nav>
          <Link to="/posts">Posts</Link>
          <Link to="/tags">Tags</Link>
          <Link to="/profile"><button>Profile</button></Link>
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : null}
        </nav>
        <Routes>
          {/* Domyślna trasa dla niezalogowanego użytkownika */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/posts" replace /> : <Navigate to="/login" replace />
            }
          />
          {/* Strony logowania i rejestracji */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          {/* Strony dostępne tylko dla zalogowanych użytkowników */}
          <Route
            path="/posts"
            element={isLoggedIn ? <PostList /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/create-post"
            element={isLoggedIn ? <CreatePost /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/edit/:postId"
            element={isLoggedIn ? <EditPost /> : <Navigate to="/login" replace />}
          />
          <Route path="/tags" element={isLoggedIn ? <TagList /> : <Navigate to="/login" replace />} />
          <Route path="/posts/:postId" element={<FullPost />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
