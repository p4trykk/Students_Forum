import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Comments from './Comments';
import Avatar from './Avatar';

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
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    //const userId = localStorage.getItem('userId');
    
    if (!token) {
      alert('You must be logged in to like a post.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedLikes = response.data.likes;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err.response?.data || err.message);
      alert('Failed to like the post. Please try again.');
    }
  };
  

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/posts/search', {
        params: {
          title: searchTerm,
          tags: searchTags,
        },
        headers: { Authorization: `Bearer ${token}` },
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

      {posts.map((post) => (
        <div key={post._id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {post.attachment && (
            <div>
              <a href={`http://localhost:5000/uploads/${post.attachment}`} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={post.author.avatar}
              alt={post.author.username}
              size={30}
              onClick={() => {
                if (post.author._id === userId) {
                  window.location.href = '/profile';
                } else {
                  window.location.href = `/profile/${post.author._id}`;
                }
              }}
              style={{ cursor: 'pointer' }}
            />
            <small style={{ marginLeft: '8px' }}>
              Author:{' '}
              <span
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                onClick={() => {
                  if (post.author._id === userId) {
                    window.location.href = '/profile';
                  } else {
                    window.location.href = `/profile/${post.author._id}`;
                  }
                }}
              >
                {post.author.username}
              </span>
            </small>
          </div>

          {post.author._id === userId && (
            <Link to={`/edit/${post._id}`}>
              <button>Edit Post</button>
            </Link>
          )}
          <Link to={`/posts/${post._id}`}>View Full Post</Link>
          <p>Tags: </p>
          {post.tags && post.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                marginRight: '5px',
                padding: '3px 8px',
                background: '#f0f0f0',
                borderRadius: '5px',
                display: 'inline-block',
              }}
            >
              {tag}
            </span>
          ))}
          <p>Likes: {post.likes.length}</p>
          <button onClick={() => handleLike(post._id)}>
            {post.likes.includes(localStorage.getItem('userId')) ? 'Unlike' : 'Like'}
          </button>
          <Comments postId={post._id} />
        </div>
      ))}
    </div>
  );
};

export default PostList;
