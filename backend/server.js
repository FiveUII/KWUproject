const express = require('express');
const cors = require('cors');
const { query, initDb, pool } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dynamic Discounting Calculation logic based on expiry_time
function calculateDynamicPrice(row) {
  const now = new Date();
  const expiry = new Date(row.expiry_time);
  const diffMs = expiry - now;
  const diffHrs = diffMs / (1000 * 60 * 60);

  let finalDiscountPrice = row.discount_price;
  let extraDiscountPct = 0;

  if (diffHrs <= 0) {
    // Already expired
    return {
      finalDiscountPrice: row.discount_price,
      extraDiscountPct: 0,
      hoursRemaining: 0,
      isExpired: true
    };
  } else if (diffHrs < 6) {
    extraDiscountPct = 50;
    finalDiscountPrice = Math.round(row.discount_price * 0.5);
  } else if (diffHrs < 12) {
    extraDiscountPct = 25;
    finalDiscountPrice = Math.round(row.discount_price * 0.75);
  } else if (diffHrs <= 24) {
    extraDiscountPct = 10;
    finalDiscountPrice = Math.round(row.discount_price * 0.9);
  }

  return {
    finalDiscountPrice,
    extraDiscountPct,
    hoursRemaining: diffHrs,
    isExpired: false
  };
}

// Database-to-Frontend field mapper
function mapListing(row) {
  if (!row) return null;
  const dynamic = calculateDynamicPrice(row);
  return {
    id: row.id,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    title: row.title,
    description: row.description,
    originalPrice: row.original_price,
    discountPrice: dynamic.finalDiscountPrice,    // calculated dynamic discount price
    baseDiscountPrice: row.discount_price,        // original static set discount price
    extraDiscountPct: dynamic.extraDiscountPct,
    hoursRemaining: dynamic.hoursRemaining,
    isExpired: dynamic.isExpired,
    quantity: row.quantity,
    maxQuantity: row.max_quantity,
    pickupTime: row.pickup_time,
    expiryTime: row.expiry_time,
    category: row.category,
    image: row.image,
    active: row.active && !dynamic.isExpired     // auto-deactivate expired items
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    merchantId: row.merchant_id,
    customerId: row.customer_id,
    foodTitle: row.food_title,
    merchantName: row.merchant_name,
    quantity: row.quantity,
    totalPrice: row.total_price,
    pickupTime: row.pickup_time,
    status: row.status,
    date: row.date,
    co2Saved: row.co2_saved,
    cashSaved: row.cash_saved
  };
}

// API Routes

// 1. GET /api/merchants (Get list of all merchants for selector)
app.get('/api/merchants', async (req, res) => {
  try {
    const result = await query('SELECT * FROM merchants ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching merchants:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/listings
app.get('/api/listings', async (req, res) => {
  const { merchantId } = req.query;
  try {
    let queryStr = 'SELECT * FROM listings';
    let params = [];
    if (merchantId) {
      queryStr += ' WHERE merchant_id = $1';
      params.push(merchantId);
    }
    queryStr += ' ORDER BY id DESC';
    const result = await query(queryStr, params);
    res.json(result.rows.map(mapListing));
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST /api/listings
app.post('/api/listings', async (req, res) => {
  const {
    id,
    merchantId,
    title,
    description,
    originalPrice,
    discountPrice,
    quantity,
    maxQuantity,
    pickupTime,
    expiryTime,
    category,
    image,
    active,
  } = req.body;

  try {
    // Get merchant name from DB for integrity
    const merchantRes = await query('SELECT name FROM merchants WHERE id = $1', [merchantId]);
    if (merchantRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid merchantId' });
    }
    const merchantName = merchantRes.rows[0].name;

    const result = await query(
      `INSERT INTO listings (id, merchant_id, merchant_name, title, description, original_price, discount_price, quantity, max_quantity, pickup_time, expiry_time, category, image, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        id,
        merchantId,
        merchantName,
        title,
        description,
        originalPrice,
        discountPrice,
        quantity,
        maxQuantity,
        pickupTime,
        new Date(expiryTime),
        category,
        image,
        active !== undefined ? active : true,
      ]
    );
    res.status(201).json(mapListing(result.rows[0]));
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. PUT /api/listings/:id/toggle
app.put('/api/listings/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const result = await query(
      'UPDATE listings SET active = $1 WHERE id = $2 RETURNING *',
      [active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(mapListing(result.rows[0]));
  } catch (err) {
    console.error('Error toggling listing:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. DELETE /api/listings/:id
app.delete('/api/listings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted', deletedListing: mapListing(result.rows[0]) });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. GET /api/orders
app.get('/api/orders', async (req, res) => {
  const { merchantId, customerId } = req.query;
  try {
    let queryStr = 'SELECT * FROM orders';
    let params = [];
    let conditions = [];

    if (merchantId) {
      conditions.push('merchant_id = $' + (params.length + 1));
      params.push(merchantId);
    }
    if (customerId) {
      conditions.push('customer_id = $' + (params.length + 1));
      params.push(customerId);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    queryStr += ' ORDER BY id DESC';

    const result = await query(queryStr, params);
    res.json(result.rows.map(mapOrder));
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. POST /api/orders (Checkout Transactional)
app.post('/api/orders', async (req, res) => {
  const {
    id,
    listingId,
    customerId,
    quantity,
    totalPrice,
    pickupTime,
    status,
    date,
    co2Saved,
    cashSaved,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get listing details and lock row
    const listingRes = await client.query(
      'SELECT quantity, merchant_id, merchant_name, title, expiry_time FROM listings WHERE id = $1 FOR UPDATE',
      [listingId]
    );

    if (listingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingRes.rows[0];
    
    // Check if expired
    if (new Date(listing.expiry_time) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Makanan ini sudah kedaluwarsa!' });
    }

    if (listing.quantity < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Stok tidak mencukupi!' });
    }

    // Deduct stock
    await client.query(
      'UPDATE listings SET quantity = quantity - $1 WHERE id = $2',
      [quantity, listingId]
    );

    // Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (id, listing_id, merchant_id, customer_id, food_title, merchant_name, quantity, total_price, pickup_time, status, date, co2_saved, cash_saved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        listingId,
        listing.merchant_id,
        customerId || 'cust-1',
        listing.title,
        listing.merchant_name,
        quantity,
        totalPrice,
        pickupTime,
        status || 'pending',
        date,
        co2Saved,
        cashSaved,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json(mapOrder(orderRes.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during checkout transaction:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 8. PUT /api/orders/:id/claim
app.put('/api/orders/:id/claim', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      "UPDATE orders SET status = 'claimed' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(mapOrder(result.rows[0]));
  } catch (err) {
    console.error('Error claiming order:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 9. PUT /api/orders/:id/cancel
app.put('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      'SELECT listing_id, quantity, status FROM orders WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Cannot cancel order with status: ${order.status}` });
    }

    // Set order status to cancelled
    const updateRes = await client.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [id]
    );

    // Restore stock to listing
    await client.query(
      'UPDATE listings SET quantity = quantity + $1 WHERE id = $2',
      [order.quantity, order.listing_id]
    );

    await client.query('COMMIT');
    res.json(mapOrder(updateRes.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 10. GET /api/savings (Calculate savings stats dynamically)
app.get('/api/savings', async (req, res) => {
  const { customerId, merchantId } = req.query;
  try {
    if (customerId) {
      const result = await query(
        `SELECT 
           COALESCE(SUM(CASE WHEN status != 'cancelled' THEN quantity * 10 ELSE 0 END), 0)::integer AS customer_coins,
           COALESCE(SUM(CASE WHEN status != 'cancelled' THEN co2_saved ELSE 0.0 END), 0.0)::real AS customer_co2,
           COALESCE(SUM(CASE WHEN status != 'cancelled' THEN cash_saved ELSE 0 END), 0)::integer AS customer_cash_saved
         FROM orders
         WHERE customer_id = $1`,
        [customerId]
      );
      const row = result.rows[0];
      res.json({
        customerCoins: row.customer_coins,
        customerCO2: row.customer_co2,
        customerCashSaved: row.customer_cash_saved
      });
    } else if (merchantId) {
      const result = await query(
        `SELECT 
           COALESCE(SUM(quantity), 0)::integer AS merchant_sales,
           COALESCE(SUM(total_price), 0)::integer AS merchant_revenue,
           COALESCE(SUM(co2_saved), 0.0)::real AS merchant_co2
         FROM orders
         WHERE merchant_id = $1 AND status = 'claimed'`,
        [merchantId]
      );
      const row = result.rows[0];
      res.json({
        merchantSales: row.merchant_sales,
        merchantRevenue: row.merchant_revenue,
        merchantCO2: row.merchant_co2
      });
    } else {
      res.status(400).json({ error: 'Missing customerId or merchantId query parameters' });
    }
  } catch (err) {
    console.error('Error fetching savings metrics:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 11. GET /api/analytics/merchant/:merchantId (Finance & analytics reports)
app.get('/api/analytics/merchant/:merchantId', async (req, res) => {
  const { merchantId } = req.params;
  try {
    // A. Daily revenue over the last 7 days (group by date suffix)
    const revResult = await query(
      `SELECT 
         RIGHT(date, 10) AS date_label, 
         SUM(total_price)::integer AS revenue
       FROM orders
       WHERE merchant_id = $1 AND status = 'claimed'
       GROUP BY date_label
       ORDER BY MIN(date) ASC`,
      [merchantId]
    );

    // B. Category breakdown of sales (join on listings)
    const catResult = await query(
      `SELECT 
         l.category, 
         SUM(o.quantity)::integer AS quantity
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       WHERE o.merchant_id = $1 AND o.status = 'claimed'
       GROUP BY l.category`,
      [merchantId]
    );

    // C. Success rate (order status breakdown)
    const statusResult = await query(
      `SELECT 
         status, 
         COUNT(*)::integer AS count
       FROM orders
       WHERE merchant_id = $1
       GROUP BY status`,
      [merchantId]
    );

    res.json({
      dailyRevenue: revResult.rows,
      categoryBreakdown: catResult.rows,
      statusBreakdown: statusResult.rows
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server and initialize DB
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database, shutting down...', err);
  process.exit(1);
});
