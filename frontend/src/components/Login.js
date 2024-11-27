import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,  // Przekazujemy email zamiast username
        password,
      });

      const token = response.data.token;  // Zakładając, że odpowiedź zawiera token

      if (token) {
        localStorage.setItem('token', token);  // Zapisanie tokenu w localStorage
        setIsLoggedIn(true);  // Zmiana stanu logowania w głównym komponencie
        navigate('/');  // Przekierowanie na stronę główną
      }
    } catch (error) {
      setError('Login failed, please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label> {/* Zmiana z username na email */}
          <input
            type="email"  // Typ pola to teraz 'email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
