import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emotes, setEmotes] = useState({});

  // Ładowanie emotek z backendu
  useEffect(() => {
    const fetchEmotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/emotes');
        const emotesMap = response.data.reduce((map, emote) => {
          map[emote.code] = emote.url;
          return map;
        }, {});
        setEmotes(emotesMap);
      } catch (err) {
        console.error('Error fetching emotes:', err);
      }
    };

    fetchEmotes();
  }, []);

  // Zamiana nazw emotek na obrazki
  const replaceEmotes = useCallback(
    (content) => {
      const regex = new RegExp(`\\b(${Object.keys(emotes).join('|')})\\b`, 'g');
      return content.replace(regex, (match) => {
        const emoteUrl = emotes[match];
        return emoteUrl
          ? `<img src="${emoteUrl}" alt="${match}" title="${match}" style="width: 28px; height: 28px;" />`
          : match;
      });
    },
    [emotes]
  );

  // Pobieranie komentarzy
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/${postId}`);
        const updatedComments = response.data.map((comment) => ({
          ...comment,
          processedContent: replaceEmotes(comment.content),
        }));
        setComments(updatedComments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Could not load comments.');
        setLoading(false);
      }
    };
  
    fetchComments();
  }, [postId, replaceEmotes]);


  // Dodanie komentarza
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
      const addedComment = {
        ...response.data.comment,
        processedContent: replaceEmotes(response.data.comment.content),
      };
      setComments([...comments, addedComment]);
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
            <strong>{comment.author.username}</strong>:{' '}
            <span
              dangerouslySetInnerHTML={{ __html: comment.processedContent }}
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
