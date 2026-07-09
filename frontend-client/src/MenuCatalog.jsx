import React, { useState, useEffect } from 'react';

export default function MenuCatalog({ userId, onOrderPlaced }) {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch available menus when the app loads
  useEffect(() => {
    const fetchMenus = async () => {
      // In a real app, you'd fetch this from your Node API
      // const res = await fetch('/api/menus');
      // setMenus(await res.json());
      
      // Mock data for now
      setMenus([
        { id: '333', name: 'Double Cheeseburger', price: 120 },
        { id: '444', name: 'Large Fries', price: 60 }
      ]);
    };
    fetchMenus();
  }, []);

  // 2. Add items to cart
  const addToCart = (menuItem) => {
    setCart(prev => [...prev, menuItem]);
  };

  // 3. Submit the order to the backend
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          items: cart
        })
      });

      const data = await response.json();
      
      // Pass the new order data up to the parent component 
      // so we can switch to the Order Status screen
      onOrderPlaced(data.order);
      
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="menu-container">
      <h2>Menu</h2>
      <div className="menu-grid">
        {menus.map(item => (
          <div key={item.id} className="menu-card">
            <h3>{item.name}</h3>
            <p>฿{item.price}</p>
            <button onClick={() => addToCart(item)}>Add to Order</button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Your Order (Total: ฿{total})</h3>
        <button 
          onClick={handleCheckout} 
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? 'Sending...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}