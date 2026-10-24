# FarmConnect PostgreSQL / Supabase Relational Database Schema Architecture

This document defines the complete relational database schema for the **FarmConnect PWA** ecosystem, designed for deployment on **PostgreSQL / Supabase** with Row-Level Security (RLS) policies.

---

## 1. Core Users & Role Tables

### `users`
Primary identity table linked to `auth.users` in Supabase.
```sql
CREATE TYPE user_role_enum AS ENUM ('farmer', 'consumer', 'worker', 'delivery', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'farmer',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    aadhaar_masked VARCHAR(12),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `farmers`
Extended profile for registered farmers.
```sql
CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(150),
    total_land_acres NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
    soil_type VARCHAR(60),
    primary_water_source VARCHAR(60),
    pattadar_passbook_no VARCHAR(50),
    survey_number VARCHAR(50),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Andhra Pradesh',
    gps_latitude NUMERIC(10, 8),
    gps_longitude NUMERIC(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `consumers`
Profile for retail buyers, restaurants, and wholesalers.
```sql
CREATE TABLE consumers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_type VARCHAR(50) DEFAULT 'retail', -- 'retail', 'wholesaler', 'restaurant'
    gstin VARCHAR(15),
    preferred_delivery_address_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `workers`
Profile for agricultural daily-wage laborers and skilled harvest teams.
```sql
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL, -- ['Paddy Harvesting', 'Chili Plucking', 'Tractor Driver']
    daily_wage_rate NUMERIC(8, 2) NOT NULL,
    work_district VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 1,
    team_size INT DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    rating_avg NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `delivery_partners`
Fleet partners (Bolero, Auto, Lorry, Bike).
```sql
CREATE TABLE delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL, -- 'Bike', 'Auto', 'Bolero', 'Mini Truck', 'Lorry'
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    driving_license_no VARCHAR(30) NOT NULL,
    max_payload_kg NUMERIC(8, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_gps_lat NUMERIC(10, 8),
    current_gps_lng NUMERIC(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Produce Marketplace & Catalog

### `categories`
Product classification (Vegetables, Grains, Fruits, Spices, Dairy).
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) UNIQUE NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    icon_name VARCHAR(50),
    image_url TEXT
);
```

### `products`
Direct produce listings submitted by farmers.
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    stock_quantity_kg NUMERIC(10, 2) NOT NULL,
    minimum_order_kg NUMERIC(8, 2) DEFAULT 1.0,
    grade VARCHAR(50) DEFAULT 'Grade A',
    is_organic BOOLEAN DEFAULT FALSE,
    harvest_date DATE NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Orders, Payments & Delivery

### `orders`
```sql
CREATE TYPE order_status_enum AS ENUM ('Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES users(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    delivery_partner_id UUID REFERENCES delivery_partners(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    status order_status_enum NOT NULL DEFAULT 'Pending',
    shipping_address TEXT NOT NULL,
    gps_lat NUMERIC(10, 8),
    gps_lng NUMERIC(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `order_items`
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_kg NUMERIC(8, 2) NOT NULL,
    unit_price_per_kg NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);
```

### `payments`
```sql
CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id),
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'UPI', 'CARD', 'NETBANKING', 'COD'
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMPTZ,
    receipt_pdf_url TEXT
);
```

---

## 4. Labor Jobs & Equipment Rentals

### `jobs`
Farm worker recruitment posts.
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    job_title VARCHAR(150) NOT NULL,
    activity_type VARCHAR(80) NOT NULL, -- 'Harvesting', 'Weeding', 'Spraying'
    workers_needed INT NOT NULL,
    daily_wage NUMERIC(8, 2) NOT NULL,
    start_date DATE NOT NULL,
    duration_days INT DEFAULT 1,
    location_address TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN'
);
```

### `job_applications`
```sql
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'APPLIED', -- 'APPLIED', 'ACCEPTED', 'REJECTED'
    applied_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `equipment`
Tractors, harvesters, seeders, and drones for rent.
```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL, -- 'Tractor', 'Harvester', 'Droner'
    hourly_rate NUMERIC(8, 2),
    daily_rate NUMERIC(8, 2) NOT NULL,
    location_district VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE
);
```

### `equipment_rentals`
```sql
CREATE TABLE equipment_rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    renter_user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'BOOKED'
);
```

---

## 5. Livestock Marketplace

### `livestock`
Cattle, buffaloes, sheep, and poultry sales.
```sql
CREATE TABLE livestock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Cow', 'Buffalo', 'Goat', 'Poultry'
    breed VARCHAR(80) NOT NULL,
    age_months INT NOT NULL,
    milk_yield_liters_per_day NUMERIC(5, 2),
    price NUMERIC(10, 2) NOT NULL,
    vaccination_status VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_sold BOOLEAN DEFAULT FALSE
);
```

---

## 6. AI Intelligence & Telemetry Data

### `disease_reports`
Vision AI leaf scan records.
```sql
CREATE TABLE disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    crop_name VARCHAR(100) NOT NULL,
    diagnosed_disease VARCHAR(150) NOT NULL,
    confidence_percentage NUMERIC(5, 2) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `market_predictions`
7-day ML price trend predictions.
```sql
CREATE TABLE market_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) NOT NULL,
    mandi_name VARCHAR(120) NOT NULL,
    modal_price NUMERIC(8, 2) NOT NULL,
    predicted_price_7d NUMERIC(8, 2) NOT NULL,
    advisory_action VARCHAR(50) NOT NULL, -- 'SELL_NOW', 'HOLD'
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `weather`
Hyperlocal weather station telemetry.
```sql
CREATE TABLE weather (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district VARCHAR(100) NOT NULL,
    temperature_c NUMERIC(4, 1) NOT NULL,
    humidity_percent INT NOT NULL,
    rain_probability_percent INT NOT NULL,
    soil_moisture_percent INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Notifications, Schemes, Articles & Carts

### `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `government_schemes`
```sql
CREATE TABLE government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    financial_benefit TEXT NOT NULL,
    short_description TEXT NOT NULL,
    official_portal_url TEXT NOT NULL
);
```

### `knowledge_articles`
```sql
CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    read_time VARCHAR(20) NOT NULL,
    author VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT NOT NULL
);
```

### `chat_history` & `voice_history`
```sql
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    sender VARCHAR(10) NOT NULL, -- 'user', 'ai'
    message TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `cart` & `wishlist` & `addresses` & `reviews`
```sql
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_kg NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    worker_id UUID REFERENCES workers(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
