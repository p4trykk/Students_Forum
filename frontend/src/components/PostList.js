import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        </div>
      ))}
    </div>
  );
};

export default PostList;
