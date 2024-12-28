import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [attachment, setAttachment] = useState(null); // Nowe pole na plik
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !tags) {
      setError('All fields are required!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a post.');
      return;
    }

    // Tworzenie formData do przesyłania pliku
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', JSON.stringify(tags.split(',').map((tag) => tag.trim())));
    if (attachment) formData.append('attachment', attachment);

    try {
      const response = await axios.post('http://localhost:5000/api/posts/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post creation response:', response.data);

      setTitle('');
      setContent('');
      setTags('');
      setAttachment(null);
      alert('Post created successfully!');
    } catch (err) {
      console.error('Error while creating post:', err.response?.data || err.message);
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
          <label>Attachment:</label>
          <input 
            type="file" 
            onChange={(e) => setAttachment(e.target.files[0])} 
            accept=".jpg,.jpeg,.png,.pdf,.txt" 
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
