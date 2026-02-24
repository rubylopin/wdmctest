const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 取得公司列表
router.get('/', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] GET /api/companies - Fetching companies`);

        const companies = await db.all(`
            SELECT * FROM companies
            WHERE is_active = 1
            ORDER BY name ASC
        `);

        res.json(companies);
    } catch (error) {
        console.error('[companies] Error fetching companies:', error);
        res.status(500).json({ error: error.message });
    }
});

// 新增公司
router.post('/', async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Company name is required' });
        }

        console.log(`[${new Date().toISOString()}] POST /api/companies - Creating company: ${name}`);

        const result = await db.run(`
            INSERT INTO companies (name, code)
            VALUES (?, ?)
        `, [name, code || null]);

        res.json({
            success: true,
            id: result.lastID,
            message: 'Company created successfully'
        });
    } catch (error) {
        console.error('[companies] Error creating company:', error);

        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: '公司名稱已存在' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// 更新公司
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;

        console.log(`[${new Date().toISOString()}] PUT /api/companies/${id} - Updating company`);

        await db.run(`
            UPDATE companies SET
                name = ?,
                code = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, code, id]);

        res.json({ success: true, message: 'Company updated successfully' });
    } catch (error) {
        console.error('[companies] Error updating company:', error);
        res.status(500).json({ error: error.message });
    }
});

// 刪除公司（軟刪除）
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[${new Date().toISOString()}] DELETE /api/companies/${id} - Soft deleting company`);

        await db.run(`
            UPDATE companies SET
                is_active = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [id]);

        res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
        console.error('[companies] Error deleting company:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
