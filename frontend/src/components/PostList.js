import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Comments from './Comments';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const userId = localStorage.getItem('userId'); 
  console.log("Local Storage userId:", userId);


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
      // Optymistyczna aktualizacja stanu
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: Array.isArray(post.likes)
                  ? post.likes.includes(userId)
                    ? post.likes.filter(id => id !== userId) // Remove like
                    : [...post.likes, userId]               // Add like
                  : [userId] // Jeśli likes jest null, dodaj pierwszy like
              }
            : post
        )
      );
  
      // Wysyłanie żądania do backendu
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/posts/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Synchronizacja stanu z odpowiedzią backendu
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, likes: response.data.likes }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  


  return (
    <div>
      <h2>Posts</h2>
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

          <p>Likes: {post.likes?.length || 0}</p>
          <button onClick={() => handleLike(post._id)}>
            {Array.isArray(post.likes) && post.likes.includes(userId) ? 'Unlike' : 'Like'}
          </button>
          
          <Comments postId={post._id} />
        </div>
      ))}
    </div>
  );
};

export default PostList;
