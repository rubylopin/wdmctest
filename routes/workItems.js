const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 取得工作項目列表
router.get('/', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] GET /api/work-items - Fetching work items`);

        const workItems = await db.all(`
            SELECT * FROM work_items
            WHERE is_active = 1
            ORDER BY category ASC, name ASC
        `);

        res.json(workItems);
    } catch (error) {
        console.error('[workItems] Error fetching work items:', error);
        res.status(500).json({ error: error.message });
    }
});

// 新增工作項目
router.post('/', async (req, res) => {
    try {
        const { name, description, category } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Work item name is required' });
        }

        console.log(`[${new Date().toISOString()}] POST /api/work-items - Creating work item: ${name}`);

        const result = await db.run(`
            INSERT INTO work_items (name, description, category)
            VALUES (?, ?, ?)
        `, [name, description || null, category || null]);

        res.json({
            success: true,
            id: result.lastID,
            message: 'Work item created successfully'
        });
    } catch (error) {
        console.error('[workItems] Error creating work item:', error);

        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: '工作項目名稱已存在' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// 更新工作項目
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category } = req.body;

        console.log(`[${new Date().toISOString()}] PUT /api/work-items/${id} - Updating work item`);

        await db.run(`
            UPDATE work_items SET
                name = ?,
                description = ?,
                category = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, description, category, id]);

        res.json({ success: true, message: 'Work item updated successfully' });
    } catch (error) {
        console.error('[workItems] Error updating work item:', error);
        res.status(500).json({ error: error.message });
    }
});

// 刪除工作項目（軟刪除）
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[${new Date().toISOString()}] DELETE /api/work-items/${id} - Soft deleting work item`);

        await db.run(`
            UPDATE work_items SET
                is_active = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [id]);

        res.json({ success: true, message: 'Work item deleted successfully' });
    } catch (error) {
        console.error('[workItems] Error deleting work item:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
