import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachment, setAttachment] = useState(null);
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
    if (!token) {
      setError('You must be logged in to comment.');
      return;
    }

    const formData = new FormData();
    formData.append('content', newComment);
    formData.append('postId', postId);
    if (attachment) formData.append('attachment', attachment);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/comments/create',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([...comments, response.data.comment]);
      setNewComment('');
      setAttachment(null);
    } catch (err) {
      console.error('Error while adding comment:', err.response?.data || err.message);
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
          <li key={comment._id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
            <img
              src={`http://localhost:5000/uploads/${comment.author.avatar || 'def_icon.jpg'}`}
              alt={`${comment.author.username}'s avatar`}
              style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'http://localhost:5000/uploads/def_icon.jpg';
              }}
            />
            <div>
              <strong>{comment.author.username}</strong>
              :{' '}
              {/* Renderowanie zawartości komentarza jako HTML */}
              <span
                dangerouslySetInnerHTML={{ __html: comment.content }}
                style={{ whiteSpace: 'pre-wrap' }}
              />
              {comment.attachment && (
                <div>
                  <a
                    href={`http://localhost:5000/uploads/${comment.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddComment} encType="multipart/form-data">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        ></textarea>
        <div>
          <label>Attachment:</label>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
            accept=".jpg,.jpeg,.png,.pdf,.txt"
          />
        </div>
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
};

export default Comments;
