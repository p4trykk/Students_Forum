import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Rankings = () => {
  const [globalRankings, setGlobalRankings] = useState([]);
  const [monthlyRankings, setMonthlyRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem('token');
        const globalResponse = await axios.get('http://localhost:5000/api/rankings/global', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const monthlyResponse = await axios.get('http://localhost:5000/api/rankings/monthly', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setGlobalRankings(globalResponse.data);
        setMonthlyRankings(monthlyResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError('Failed to load rankings.');
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) return <p>Loading rankings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Rankings</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        {/* Kolumna globalnych rankingów */}
        <div style={{ flex: 1 }}>
          <h3>Global Rankings</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {globalRankings.map((user, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                <img
                  src={`http://localhost:5000/uploads/${user.avatar || 'def_icon.jpg'}`}
                  alt="Avatar"
                  style={{ width: '40px', borderRadius: '50%', marginRight: '10px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'http://localhost:5000/uploads/def_icon.jpg';
                  }}
                />
                <span>
                  <strong>{user.username}</strong> - {user.commentCount} comments
                </span>
              </li>
            ))}
          </ul>
        </div>
  
        {/* Kolumna miesięcznych rankingów */}
        <div style={{ flex: 1 }}>
          <h3>Monthly Rankings</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {monthlyRankings.map((user, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                <img
                  src={`http://localhost:5000/uploads/${user.avatar || 'def_icon.jpg'}`}
                  alt={user.username}
                  style={{ width: '40px', borderRadius: '50%', marginRight: '10px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'http://localhost:5000/uploads/def_icon.jpg';
                  }}
                />
                <span>
                  <strong>{user.username}</strong> - {user.commentCount} comments
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
  
};

export default Rankings;
