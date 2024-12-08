import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Comments from './Comments';


const FullPost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching full post:', error);
      }
    };

    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/posts/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedLikes = response.data.likes;
      setPost((prevPost) => ({ ...prevPost, likes: updatedLikes }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>Author: {post.author?.username || 'Unknown'}</small>
      <p>Tags: {post.tags.join(', ')}</p>
      <p>Likes: {post.likes.length}</p>
      <button onClick={handleLike}>
        {post.likes.includes(userId) ? 'Unlike' : 'Like'}
      </button>
      <h4>Comments:</h4>
      <Comments postId={post._id} />
    </div>
  );
};
 
export default FullPost;
