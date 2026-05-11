# MedExpress Upgrade Plan: Inventory Sync & Notifications

This document outlines the required implementation steps to add professional features to the MedExpress Pharmacy System. It is intended to be used as a prompt/guide for Codex or other AI coding assistants.

## 1. Inventory Sync (نظام مزامنة المخازن)

**Objective:** When a customer places an order successfully, the system must automatically deduct the purchased quantities from the database inventory to prevent overselling.

**Target File:** `server/index.js`
**Target Route:** `POST /api/orders`

**Implementation Steps:**
1. Identify the exact column representing stock in the database (usually `Quantity`, `Balance`, or managed in a separate `ItemBalances` table).
2. Inside the `POST /api/orders` route, after successfully inserting the order into the `Orders` and `OrderItems` tables, loop through the `req.body.items` array.
3. For each item, execute an `UPDATE` query to reduce the stock.
4. **SQL Query Concept:**
   ```javascript
   await pool.request()
     .input('medicineId', item.medicine.id)
     .input('quantity', item.quantity)
     .query(`
       UPDATE Items 
       SET Quantity = Quantity - @quantity 
       WHERE ID = @medicineId AND Quantity >= @quantity
     `);
   ```
5. **Frontend/API Update:** Update the `GET /api/medicines` route to dynamically return `'in-stock'` or `'out-of-stock'` based on the new stock column value.

---

## 2. Notification System (نظام الإشعارات للمدير)

**Objective:** Notify the pharmacy admin instantly when a new order is placed to ensure fast processing and delivery.

**Target File:** `server/index.js`
**Dependencies:** Requires installing `nodemailer` (for Email) or using `axios` (for WhatsApp APIs).

**Implementation Steps:**

### Option A: Email Notification (Nodemailer)
1. Install dependency: `npm install nodemailer` in the `server` directory.
2. Add environment variables to `server/.env`: `ADMIN_EMAIL`, `EMAIL_USER`, `EMAIL_PASS`.
3. Create a transporter configuration using standard SMTP (e.g., Gmail).
4. Inside `POST /api/orders`, asynchronously send an email containing the Order details (ID, Customer Name, Phone, Address, Total Amount).

### Option B: WhatsApp Notification (Using a Provider like UltraMsg / Green-API)
1. Add API credentials to `server/.env` (e.g., `WHATSAPP_API_URL`, `WHATSAPP_TOKEN`, `ADMIN_WHATSAPP_NUMBER`).
2. Create a helper function `sendWhatsAppAlert(orderData)` using `fetch` or `axios`.
3. Format a neat Arabic message:
   ```text
   🚨 أوردر جديد في MedExpress!
   - رقم الطلب: #{orderId}
   - العميل: {customerName}
   - الهاتف: {customerPhone}
   - العنوان: {address}
   - الإجمالي: {totalAmount} EGP
   
   يرجى مراجعة لوحة التحكم للتفاصيل.
   ```
4. Call this function without `await` at the end of the `POST /api/orders` block so it doesn't block the API response to the user.

---
**Important Note for Codex:** 
Please analyze the current `server/index.js` database queries first to confirm table and column names before executing the `UPDATE` statements. Ensure that all database requests inside the loop use proper error handling to avoid partial order failures.
