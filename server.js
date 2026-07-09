const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// --- 1. App Initialization ---
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON payloads

// const server = http.createServer(app);
// const socket = io('https://qqq-maq4.onrender.com');
// const fetchUrl = 'https://my-restaurant-api.onrender.com/api/orders';
// // // Initialize Socket.io with CORS enabled
// const allowedOrigins = [
//     'https://my-client-app.vercel.app',
//     'https://my-merchant-dashboard.vercel.app'
// ];

app.use(cors({ origin: allowedOrigins }));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PATCH']
    }
});

// --- Mock Database ---
const ordersDB = [];
let nextQueueNumber = 1;

// --- 2. Socket.io Connection & Rooms ---
io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // When a merchant opens their dashboard
    socket.on('join_merchant_dashboard', () => {
        socket.join('merchant_room');
        console.log(`👨‍🍳 Socket ${socket.id} joined merchant_room`);
    });

    // When a client opens their app (we use their unique userId as the room name)
    socket.on('join_client_room', (userId) => {
        socket.join(`client_${userId}`);
        console.log(`📱 Client ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Disconnected: ${socket.id}`);
    });
});

// --- 3. Express API Routes ---

// CLIENT: Place a new order
app.post('/api/orders', (req, res) => {
    const { userId, items } = req.body;

    // Create the order
    const newOrder = {
        orderId: `ORD-${Date.now()}`,
        queueNumber: `A${nextQueueNumber.toString().padStart(2, '0')}`,
        userId,
        items,
        status: 'pending',
        createdAt: new Date()
    };

    // Save to DB
    ordersDB.push(newOrder);
    nextQueueNumber++;

    // 🔔 REAL-TIME MAGIC: Emit only to the merchant room
    io.to('merchant_room').emit('new_order', newOrder);

    // Return success to the client who clicked "Order"
    res.status(201).json({
        message: 'Order placed successfully',
        order: newOrder
    });
});

// MERCHANT: Mark order as complete
app.patch('/api/orders/:orderId/complete', (req, res) => {
    const { orderId } = req.params;

    // Find order in DB
    const orderIndex = ordersDB.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }

    // Update status in DB
    ordersDB[orderIndex].status = 'ready';
    const updatedOrder = ordersDB[orderIndex];

    // 🔔 REAL-TIME MAGIC: Emit ONLY to the specific client's room
    io.to(`client_${updatedOrder.userId}`).emit('order_ready', updatedOrder);

    // Return success to the merchant dashboard
    res.json({
        message: 'Order marked as ready',
        order: updatedOrder
    });
});

// --- 4. Start the Server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});