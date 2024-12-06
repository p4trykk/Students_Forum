import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Comments from './Comments';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const userId = localStorage.getItem('userId'); 
  console.log("Local Storage userId:", userId);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTags, setSearchTags] = useState('');


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPosts(response.data);
        console.log("Fetched posts:", response.data);

      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/posts/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedLikes = response.data.likes; // Backend zwraca zaktualizowaną tablicę likes
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/posts/search', {
        params: { 
          title: searchTerm, 
          tags: searchTags 
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };
  
  

  return (
    <div>
      <h2>Posts</h2>
      <div>
        <input 
          type="text" 
          placeholder="Search by title" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Search by tags (comma-separated)" 
          value={searchTags} 
          onChange={(e) => setSearchTags(e.target.value)} 
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {posts.map(post => (
        <div key={post._id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>Author: {post.author.username}</small>
          
          {post.author._id === userId && (
            <Link to={`/edit/${post._id}`}>
              <button>Edit Post</button>
            </Link>
          )}
          <p>Tags: {post.tags.join(', ')}</p>
          <p>Likes: {post.likes.length}</p>
          <button onClick={() => handleLike(post._id)}>
            {post.likes.includes(userId) ? 'Unlike' : 'Like'}
          </button>      
          <Comments postId={post._id} />
        </div>
      ))}
    </div>
  );
};

export default PostList;
