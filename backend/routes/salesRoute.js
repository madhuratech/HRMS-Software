const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all sales enquiries
router.get("/enquiries", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                se.*,
                e.name as assigned_name
            FROM sales_enquiries se
            LEFT JOIN employees e ON se.assigned_to = e.id
            ORDER BY se.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch enquiries" });
    }
});

// Create sales enquiry
router.post("/enquiries", async (req, res) => {
    try {
        const { customer_name, contact_email, contact_phone, enquiry_details, status, assigned_to } = req.body;
        const [result] = await db.query(`
            INSERT INTO sales_enquiries (customer_name, contact_email, contact_phone, enquiry_details, status, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [customer_name, contact_email, contact_phone, enquiry_details, status || 'new', assigned_to]);
        res.json({ id: result.insertId, message: "Enquiry created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create enquiry" });
    }
});

// Get sales entries
router.get("/entries", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                se.*,
                enq.customer_name
            FROM sales_entries se
            LEFT JOIN sales_enquiries enq ON se.enquiry_id = enq.id
            ORDER BY se.sale_date DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch entries" });
    }
});

// Create sales entry
router.post("/entries", async (req, res) => {
    try {
        const { enquiry_id, amount, sale_date, notes } = req.body;
        const [result] = await db.query(`
            INSERT INTO sales_entries (enquiry_id, amount, sale_date, notes)
            VALUES (?, ?, ?, ?)
        `, [enquiry_id, amount, sale_date, notes]);
        res.json({ id: result.insertId, message: "Sales entry created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create entry" });
    }
});

// Get follow-ups
router.get("/followups", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                sf.*,
                enq.customer_name
            FROM sales_followups sf
            LEFT JOIN sales_enquiries enq ON sf.enquiry_id = enq.id
            ORDER BY sf.followup_date ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch followups" });
    }
});

module.exports = router;
