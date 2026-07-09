import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Initialize socket connection
const socket = io('http://localhost:3001', { autoConnect: false });

export default function OrderStatus({ order, userId }) {
  const [status, setStatus] = useState(order.status); // starts as 'pending'
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Connect and join the private client room
    socket.connect();
    socket.emit('join_client_room', userId);

    // 2. Listen for the specific alert from the kitchen
    const handleOrderReady = (updatedOrder) => {
      // Ensure the alert is for THIS specific order
      if (updatedOrder.orderId === order.orderId) {
        setStatus('ready');
        setIsReady(true);
        
        // Optional: Trigger a browser notification or sound here
        // new Audio('/ding.mp3').play();
      }
    };

    socket.on('order_ready', handleOrderReady);

    // 3. Cleanup connection when the component unmounts
    return () => {
      socket.off('order_ready', handleOrderReady);
      socket.disconnect();
    };
  }, [userId, order.orderId]);

  return (
    <div className="status-container" style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Queue Number: {order.queueNumber}</h1>
      
      {!isReady ? (
        <div>
          <div className="spinner">🔄</div>
          <h2>We are preparing your food!</h2>
          <p>Current Status: <strong>{status.toUpperCase()}</strong></p>
        </div>
      ) : (
        <div style={{ color: 'green' }}>
          <h2 style={{ fontSize: '3rem' }}>🎉 IT'S READY! 🎉</h2>
          <p>Please proceed to the counter to pick up your order.</p>
        </div>
      )}
    </div>
  );
}