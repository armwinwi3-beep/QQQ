-- ==========================================
-- 1. SETUP: Custom Types
-- ==========================================
-- Using ENUMs ensures that only these specific strings can be saved in the database.
CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'cooking', 'ready', 'completed', 'cancelled');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menus Table
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255)
);

-- Orders Table (The Queue)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_number VARCHAR(10) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table (The Bridge)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255)
);

-- ==========================================
-- 3. AUTOMATION (Optional but recommended)
-- ==========================================
-- This function and trigger automatically update the 'updated_at' column in the orders table whenever the status changes.
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 4. MOCK DATA (For testing your dashboard)
-- ==========================================

-- Insert a Customer and a Merchant
INSERT INTO users (id, name, role) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Somchai (Customer)', 'customer'),
    ('22222222-2222-2222-2222-222222222222', 'Kitchen Station 1', 'merchant');

-- Insert Menu Items
INSERT INTO menus (id, name, price, description) VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Double Cheeseburger', 120.00, 'Beef, cheese, pickles, onions'),
    ('44444444-4444-4444-4444-444444444444', 'French Fries (Large)', 60.00, 'Crispy golden fries');

-- Insert a Pending Order
INSERT INTO orders (id, queue_number, user_id, status, total_amount) VALUES 
    ('55555555-5555-5555-5555-555555555555', 'A01', '11111111-1111-1111-1111-111111111111', 'pending', 180.00);

-- Insert the Items for that Order
INSERT INTO order_items (order_id, menu_id, quantity, price_at_time, notes) VALUES 
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 1, 120.00, 'No pickles'),
    ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 1, 60.00, NULL);