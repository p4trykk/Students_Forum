import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Comments from './Comments';
import Avatar from './Avatar';


const TagList = () => {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/posts/tags', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleTagClick = async (tag) => {
    setSelectedTag(tag);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/posts/tags/${tag}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
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
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div>
      <h2>Tags</h2>
      <ul>
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <button onClick={() => handleTagClick(tag)}>
              {tag} ({count})
            </button>
          </li>
        ))}
      </ul>

      {selectedTag && (
        <div>
          <h3>Posts tagged with "{selectedTag}"</h3>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={post.author.avatar} alt={post.author.username} size={30} />
                  <small style={{ marginLeft: '8px' }}>Author: {post.author.username}</small>
                </div>
                <p>Tags: {post.tags.join(', ')}</p>
                <p>Likes: {post.likes.length}</p>
                <button onClick={() => handleLike(post._id)}>
                  {post.likes.includes(userId) ? 'Unlike' : 'Like'}
                </button>
                <Link to={`/posts/${post._id}`}>View Full Post</Link>

                <div>
                  {/* <h5>Comments:</h5>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment._id} style={{ marginLeft: '20px', marginTop: '5px' }}>
                        <strong>{comment.author.username || 'Unknown'}:</strong> {comment.content}
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )} */}
                  <Comments postId={post._id} />
                </div>
              </div>
            ))
          ) : (
            <p>No posts found for this tag.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TagList;
