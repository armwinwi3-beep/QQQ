import React, { useState } from 'react';
import MenuCatalog from './MenuCatalog';
import OrderStatus from '../OrderStatus';
import './App.css'; 

function App() {
  // สร้าง State เพื่อเก็บข้อมูลออเดอร์ ถ้าเป็น null แปลว่ายังไม่ได้สั่ง
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // จำลองการสร้าง User ID แบบสุ่ม (ในแอปจริง ค่านี้จะได้มาตอนลูกค้า Login)
  const [userId] = useState(() => 'user_' + Math.random().toString(36).substr(2, 9));

  // ฟังก์ชันนี้จะถูกเรียกเมื่อลูกค้ากด "Confirm Order" ในหน้า MenuCatalog
  const handleOrderPlaced = (newOrderData) => {
    setCurrentOrder(newOrderData); // บันทึกข้อมูลออเดอร์ และสลับหน้าจอ
  };

  return (
    <div className="app-container" style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ backgroundColor: '#e74c3c', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1>🍔 Burger & Fries Queue</h1>
      </header>

      <main style={{ padding: '20px' }}>
        {/* สลับหน้าจออัตโนมัติตาม State */}
        {!currentOrder ? (
          <MenuCatalog userId={userId} onOrderPlaced={handleOrderPlaced} />
        ) : (
          <OrderStatus order={currentOrder} userId={userId} />
        )}
      </main>
    </div>
  );
}

export default App;