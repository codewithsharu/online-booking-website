import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api';

function Home() {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setPhone(data.phone);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getUser();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="container welcome-box">
      <h1>Welcome {phone}!</h1>
      <p>You are successfully logged in to the appointment booking system</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Home;
