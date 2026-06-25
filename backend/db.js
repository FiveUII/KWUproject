const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'resqfood',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const query = (text, params) => pool.query(text, params);

async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Re-initializing database tables for Phase 2...');

    // Drop old tables to ensure schema migrations are clean
    await client.query('DROP TABLE IF EXISTS savings CASCADE;');
    await client.query('DROP TABLE IF EXISTS orders CASCADE;');
    await client.query('DROP TABLE IF EXISTS listings CASCADE;');
    await client.query('DROP TABLE IF EXISTS merchants CASCADE;');

    // 1. Create Merchants table
    await client.query(`
      CREATE TABLE merchants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        logo VARCHAR(255),
        co2_factor REAL DEFAULT 1.5
      );
    `);

    // 2. Create Listings table (with expiry_time and merchant_id)
    await client.query(`
      CREATE TABLE listings (
        id VARCHAR(50) PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        merchant_name VARCHAR(100) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        original_price INT NOT NULL,
        discount_price INT NOT NULL,
        quantity INT NOT NULL,
        max_quantity INT NOT NULL,
        pickup_time VARCHAR(100) NOT NULL,
        expiry_time TIMESTAMP NOT NULL,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(255),
        active BOOLEAN DEFAULT TRUE
      );
    `);

    // 3. Create Orders table (with merchant_id and customer_id)
    await client.query(`
      CREATE TABLE orders (
        id VARCHAR(50) PRIMARY KEY,
        listing_id VARCHAR(50) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id VARCHAR(50) NOT NULL,
        food_title VARCHAR(100) NOT NULL,
        merchant_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        total_price INT NOT NULL,
        pickup_time VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL, -- 'pending', 'claimed', 'cancelled'
        date VARCHAR(100) NOT NULL,
        co2_saved REAL NOT NULL,
        cash_saved INT NOT NULL
      );
    `);

    // 4. Seed Merchants
    console.log('Seeding merchants...');
    await client.query(`
      INSERT INTO merchants (id, name, address, logo)
      VALUES 
      ('merch-1', 'Sakura Sushi Dago', 'Jl. Ir. H. Juanda No. 123, Coblong, Bandung', 'assets/sushi.png'),
      ('merch-2', 'La Boulangerie French Bakery', 'Jl. Progo No. 45, Citarum, Bandung', 'assets/bakery.png'),
      ('merch-3', 'Healthy & Co Salad Bar', 'Jl. Riau No. 88, Cihapit, Bandung', 'assets/salad.png');
    `);

    // 5. Seed Mock Listings with dynamic expiry times
    console.log('Seeding mock listings...');
    await client.query(`
      INSERT INTO listings (id, merchant_id, merchant_name, title, description, original_price, discount_price, quantity, max_quantity, pickup_time, expiry_time, category, image, active)
      VALUES 
      (
        'mock-1', 
        'merch-1',
        'Sakura Sushi Dago', 
        'Premium Salmon Sushi Platter', 
        'Paket sushi segar campur (salmon nigiri, tuna maki, california roll) dibuat siang ini. Masih sangat segar dan disimpan di pendingin.', 
        95000, 
        38000, 
        3, 
        5, 
        '17:30 - 20:00 Hari Ini', 
        NOW() + INTERVAL '4 hours', -- < 6 hours (50% extra discount test!)
        'Meals', 
        'assets/sushi.png', 
        true
      ),
      (
        'mock-2', 
        'merch-2',
        'La Boulangerie French Bakery', 
        'Butter & Chocolate Croissant Pack', 
        'Isi 3 buah croissant premium (2 butter, 1 chocolate) dipanggang pagi ini. Renyah dan lezat, cocok untuk camilan malam.', 
        48000, 
        18000, 
        5, 
        8, 
        '16:00 - 18:30 Hari Ini', 
        NOW() + INTERVAL '10 hours', -- 6-12 hours (25% extra discount test!)
        'Bakery', 
        'assets/bakery.png', 
        true
      ),
      (
        'mock-3', 
        'merch-3',
        'Healthy & Co Salad Bar', 
        'Avocado Quinoa Green Salad Bowl', 
        'Mangkuk salad sehat organik lengkap dengan alpukat, tomat ceri, quinoa, dan dressing lemon vinaigrette segar. Dibuat jam 11 siang.', 
        65000, 
        26000, 
        2, 
        4, 
        '15:00 - 17:00 Hari Ini', 
        NOW() + INTERVAL '30 hours', -- > 24 hours (normal discount)
        'Meals', 
        'assets/salad.png', 
        true
      );
    `);

    // 6. Seed some mock historic orders for the financial reports!
    console.log('Seeding mock order history for analytics...');
    
    // We will insert some historic claimed orders over the past few days to populate charts.
    // Order dates will look like: "08:15 08/06/2026", "19:30 09/06/2026", "12:10 10/06/2026"
    // Since today is 11-Jun-26, these represent historical data.
    await client.query(`
      INSERT INTO orders (id, listing_id, merchant_id, customer_id, food_title, merchant_name, quantity, total_price, pickup_time, status, date, co2_saved, cash_saved)
      VALUES 
      ('FW-hist1', 'mock-1', 'merch-1', 'cust-1', 'Premium Salmon Sushi Platter', 'Sakura Sushi Dago', 2, 76000, '17:30 - 20:00 Hari Ini', 'claimed', '18:15 08/06/2026', 3.0, 114000),
      ('FW-hist2', 'mock-1', 'merch-1', 'cust-1', 'Premium Salmon Sushi Platter', 'Sakura Sushi Dago', 1, 38000, '17:30 - 20:00 Hari Ini', 'claimed', '19:40 09/06/2026', 1.5, 57000),
      ('FW-hist3', 'mock-2', 'merch-2', 'cust-1', 'Butter & Chocolate Croissant Pack', 'La Boulangerie French Bakery', 3, 54000, '16:00 - 18:30 Hari Ini', 'claimed', '17:10 09/06/2026', 4.5, 90000),
      ('FW-hist4', 'mock-2', 'merch-2', 'cust-1', 'Butter & Chocolate Croissant Pack', 'La Boulangerie French Bakery', 2, 36000, '16:00 - 18:30 Hari Ini', 'claimed', '16:45 10/06/2026', 3.0, 60000),
      ('FW-hist5', 'mock-3', 'merch-3', 'cust-1', 'Avocado Quinoa Green Salad Bowl', 'Healthy & Co Salad Bar', 2, 52000, '15:00 - 17:00 Hari Ini', 'claimed', '16:00 10/06/2026', 3.0, 78000);
    `);

    console.log('Database Phase 2 initialization completed successfully!');
  } catch (err) {
    console.error('Error during Phase 2 database initialization:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool,
  initDb,
};
