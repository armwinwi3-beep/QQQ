import React from 'react';
import MerchantDashboard from './MerchantDashboard';
import './App.css'; // ถ้ามีไฟล์ CSS ของตัวเอง

function App() {
  return (
    <div className="app-container" style={{ fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#2c3e50', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1>👨‍🍳 Kitchen Dashboard</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        <MerchantDashboard />
      </main>
    </div>
  );
}

export default App;