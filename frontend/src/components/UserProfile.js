import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [updatedData, setUpdatedData] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Sprawdź czy avatar jest plikiem, jeśli jest, to dodaj go do FormData
      if (avatar) formData.append('avatar', avatar);
  
      // Dodaj inne dane użytkownika
      if (updatedData.username) formData.append('username', updatedData.username);
      if (updatedData.email) formData.append('email', updatedData.email);
      if (updatedData.password) formData.append('password', updatedData.password);
  
      // Wyślij żądanie do serwera
      const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile updated successfully');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };
  

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Profile</h2>
      <div>
        <img src={`http://localhost:5000/uploads/${user.avatar}`} alt="Avatar" style={{ width: '100px', borderRadius: '50%' }} />  
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
      <div>
        <p>Posts: {user.postCount}</p>
        <p>Comments: {user.commentCount}</p>
        <p>Account Created: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
};

export default UserProfile;
