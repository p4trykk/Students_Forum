import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token');  
  if (!token) {
    console.error('Token is missing');
    }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !tags) {
      setError('All fields are required!');
      return;
    }

    const postData = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim())  
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/api/posts/create',
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }
      );

      setTitle('');
      setContent('');
      setTags('');
      alert('Post created successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Tags (comma separated):</label>
          <input 
            type="text" 
            value={tags}
            onChange={(e) => setTags(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreatePost;
