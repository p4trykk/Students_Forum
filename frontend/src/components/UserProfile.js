import React, { useState, useEffect } from 'react';
import axios from 'axios';


const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [updatedData, setUpdatedData] = useState({ username: '', email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view your profile');
          return; 
        }
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        if (error.response) {
          // Backend error
          setError(`Error fetching user profile: ${error.response.data.message}`);
        } else {
          // Network or other issues
          setError('There was an error fetching the profile. Please try again.');
        }
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
        
      // Dodaj inne dane użytkownika
      if (avatar) formData.append('avatar', avatar);
      if (updatedData.username) formData.append('username', updatedData.username);
      if (updatedData.email) formData.append('email', updatedData.email);
      if (updatedData.password && updatedData.password.trim() !== '') {
        formData.append('password', updatedData.password);
      }
      
  
      // Wyślij żądanie do serwera
      const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile updated successfully');
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };
  if (error) {
    return <div>{error}</div>;
  }
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Profile</h2>
      {!isEditing ? (
        <div>
          <div>
            <img
              src={user.avatar ? `http://localhost:5000${user.avatar}` : 'http://localhost:5000/uploads/def_icon.jpg'}
              alt="Avatar"
              style={{ width: '100px', borderRadius: '50%' }}
            />
          </div>
          <div>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Bio:</strong> {user.bio || 'No bio available'}</p>
            <div>
              <p><strong>Posts:</strong> {user.postCount}</p>
              <p><strong>Comments:</strong> {user.commentCount}</p>
              <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3>Odznaczenia</h3>
              {user.badges && user.badges.length > 0 ? (
                <ul>
                  {user.badges.map((badge, index) => (
                    <li key={index} style={{ fontSize: '14px', color: '#FFD700' }}>
                      {badge}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No badges earned yet.</p>
              )}
            </div>
          </div>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <div>
          <div>
            <img
              src={`http://localhost:5000${user.avatar}`}
              alt="Avatar"
              style={{ width: '100px', borderRadius: '50%' }}
            />
            <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />
          </div>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={updatedData.username || user.username}
              onChange={(e) => setUpdatedData({ ...updatedData, username: e.target.value })}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={updatedData.email || user.email}
              onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter new password"
              onChange={(e) => setUpdatedData({ ...updatedData, password: e.target.value })}
            />
          </div>
          <button onClick={handleUpdate}>Update Profile</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
