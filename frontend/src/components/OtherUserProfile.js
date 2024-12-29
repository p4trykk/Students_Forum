import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OtherUserProfile = () => {
  const { userId } = useParams(); 
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
          setUser(response.data);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Could not load user profile.');
        }
      };

    fetchUserProfile();
  }, [userId]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>{user.username}'s Profile</h2>
      <img
        src={user.avatar ? `http://localhost:5000/uploads/${user.avatar}` : 'http://localhost:5000/uploads/def_icon.jpg'}
        alt="Avatar"
        style={{ width: '100px', borderRadius: '50%' }}
      />
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Bio:</strong> {user.bio || 'No bio available'}</p>
      <p><strong>Posts:</strong> {user.postCount}</p>
      <p><strong>Comments:</strong> {user.commentCount}</p>
      <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      <h3>Odznaczenia</h3>
      {user.badges && user.badges.length > 0 ? (
        <ul>
          {user.badges.map((badge, index) => (
            <li key={index}>{badge}</li>
          ))}
        </ul>
      ) : (
        <p>No badges earned yet.</p>
      )}
    </div>
  );
};

export default OtherUserProfile;
