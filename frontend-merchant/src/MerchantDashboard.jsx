import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// ⚠️ เปลี่ยน URL ตรงนี้เป็นของ Render เมื่อคุณเตรียม Deploy จริง 
// เช่น const socket = io('https://your-backend.onrender.com', { autoConnect: false });
const BACKEND_URL = 'http://localhost:3001';
const socket = io(BACKEND_URL, { autoConnect: false });

export default function MerchantDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // แยกกลุ่มออเดอร์อัตโนมัติ
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');

  useEffect(() => {
    // 1. ดึงข้อมูลออเดอร์ค้างเก่าจาก Database ตอนเปิดหน้าเว็บครั้งแรก
    const fetchOrders = async () => {
      try {
        // (ในแอปจริง ต้องยิง API ไปที่ Backend เช่น fetch(`${BACKEND_URL}/api/orders`))
        // ตอนนี้เราใส่ข้อมูลจำลองไว้ให้หน้าเว็บทำงานได้ก่อน
        setOrders([
          { id: '1', queue_number: 'A01', status: 'pending', items: '1x Burger, 1x Fries' },
          { id: '2', queue_number: 'A02', status: 'cooking', items: '2x Burger' }
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();

    // 2. เชื่อมต่อ Socket.io เพื่อรอรับออเดอร์ใหม่ๆ
    socket.connect();
    socket.emit('join_merchant_dashboard');

    const handleNewOrder = (newOrder) => {
      setOrders(prev => [...prev, newOrder]);
      // ใส่เสียงแจ้งเตือนเวลามีออเดอร์เข้าได้ที่นี่
    };

    socket.on('new_order', handleNewOrder);

    // 3. ปิดการเชื่อมต่อเมื่อปิดหน้าเว็บ
    return () => {
      socket.off('new_order', handleNewOrder);
      socket.disconnect();
    };
  }, []);

  // ฟังก์ชันเปลี่ยนสถานะเป็น "กำลังทำ"
  const markAsCooking = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'cooking' } : o
    ));
    // ต้องส่งข้อมูลไปบอก Backend ด้วย: socket.emit('update_order_status', { orderId, status: 'cooking' })
  };

  // ฟังก์ชันเปลี่ยนสถานะเป็น "เสร็จแล้ว"
  const markAsReady = (orderId) => {
    // ลบออกจากหน้าจอห้องครัว เพราะอาหารเสร็จแล้ว
    setOrders(prev => prev.filter(o => o.id !== orderId));
    // ส่งข้อมูลไปบอก Backend และฝั่งลูกค้า: socket.emit('update_order_status', { orderId, status: 'ready' })
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Kitchen...</div>;

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      
      {/* คอลัมน์ซ้าย: ออเดอร์เข้าใหม่ (Pending) */}
      <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        <h2 style={{ color: '#e74c3c' }}>🔴 ออเดอร์ใหม่ ({pendingOrders.length})</h2>
        
        {pendingOrders.map(order => (
          <div key={order.id} style={ticketStyle}>
            <h3 style={{ margin: '0 0 10px 0' }}>คิว: {order.queue_number}</h3>
            <p>{order.items}</p>
            <button 
              onClick={() => markAsCooking(order.id)}
              style={{ ...buttonStyle, backgroundColor: '#f39c12' }}
            >
              👨‍🍳 เริ่มทำอาหาร
            </button>
          </div>
        ))}
        {pendingOrders.length === 0 && <p style={{ color: '#7f8c8d' }}>ยังไม่มีออเดอร์ใหม่...</p>}
      </div>

      {/* คอลัมน์ขวา: กำลังทำ (Cooking) */}
      <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        <h2 style={{ color: '#f39c12' }}>🍳 กำลังทำ ({cookingOrders.length})</h2>
        
        {cookingOrders.map(order => (
          <div key={order.id} style={ticketStyle}>
            <h3 style={{ margin: '0 0 10px 0' }}>คิว: {order.queue_number}</h3>
            <p>{order.items}</p>
            <button 
              onClick={() => markAsReady(order.id)}
              style={{ ...buttonStyle, backgroundColor: '#2ecc71' }}
            >
              ✅ อาหารเสร็จแล้ว
            </button>
          </div>
        ))}
        {cookingOrders.length === 0 && <p style={{ color: '#7f8c8d' }}>ยังไม่มีคิวที่กำลังทำ...</p>}
      </div>

    </div>
  );
}

// สไตล์ CSS ตกแต่งปุ่มและกล่องออเดอร์ (เพื่อให้สวยงามเบื้องต้น)
const ticketStyle = {
  backgroundColor: 'white',
  padding: '15px',
  marginBottom: '15px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  borderLeft: '5px solid #2c3e50'
};

const buttonStyle = {
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  width: '100%',
  marginTop: '10px'
};