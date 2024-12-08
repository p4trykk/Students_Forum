import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/${postId}`);
        setComments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Could not load comments.');
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/comments/create',
        { content: newComment, postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Could not add comment.');
    }
  };
  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Comments</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {comments.map((comment) => (
          <li key={comment._id}>
            <strong>{comment.author.username}</strong>: {comment.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        ></textarea>
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
};

export default Comments;
